import os, sys, json, math
import torch
import torch.nn as nn
from torchvision.models import densenet121
import onnxruntime as ort
from onnxruntime.quantization import quantize_dynamic, QuantType

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
CKPT_PATH = os.path.join(ROOT_DIR, "checkpoints", "densenet_s8_v3_final.pth")
VOCAB_PATH = os.path.join(BASE_DIR, "vocab.json")

print(f"Loading checkpoint from: {CKPT_PATH}")
print(f"Loading vocab from: {VOCAB_PATH}")

with open(VOCAB_PATH, "r", encoding="utf-8") as f:
    vocab_data = json.load(f)
VOCAB = vocab_data["vocab"]
TOK2ID = vocab_data["tok2id"]
PAD_ID = TOK2ID["<PAD>"]

class PositionalEncoding2D(nn.Module):
    def __init__(self, d_model, max_h=32, max_w=128):
        super().__init__()
        half_d = d_model // 2
        pe_h, pe_w = torch.zeros(max_h, half_d), torch.zeros(max_w, half_d)
        pos_h = torch.arange(0, max_h).unsqueeze(1).float()
        pos_w = torch.arange(0, max_w).unsqueeze(1).float()
        div = torch.exp(torch.arange(0, half_d, 2).float() * (-math.log(10000.0) / half_d))
        pe_h[:, 0::2], pe_h[:, 1::2] = torch.sin(pos_h * div), torch.cos(pos_h * div)
        pe_w[:, 0::2], pe_w[:, 1::2] = torch.sin(pos_w * div), torch.cos(pos_w * div)
        self.register_buffer("pe_h", pe_h)
        self.register_buffer("pe_w", pe_w)

    def forward(self, x):
        _, _, H, W = x.shape
        pe = torch.cat([
            self.pe_h[:H, :].unsqueeze(1).expand(H, W, -1),
            self.pe_w[:W, :].unsqueeze(0).expand(H, W, -1)
        ], dim=-1).permute(2, 0, 1).unsqueeze(0)
        return x + pe

class MathVisionV3(nn.Module):
    def __init__(self, vocab_size=132, pad_id=0, d_model=256, nhead=8, num_layers=3, dropout=0.2):
        super().__init__()
        self.pad_id = pad_id
        backbone = densenet121(weights=None)
        backbone.features.pool0 = nn.Identity()
        self.encoder = nn.Sequential(*list(backbone.features.children())[:9])
        self.enc_proj = nn.Sequential(
            nn.Conv2d(1024, d_model, kernel_size=1),
            nn.BatchNorm2d(d_model),
            nn.ReLU(inplace=True)
        )
        self.pos_2d = PositionalEncoding2D(d_model)
        self.tok_emb = nn.Embedding(vocab_size, d_model, padding_idx=pad_id)
        self.pos_1d = nn.Parameter(torch.randn(1, 200, d_model) * 0.02)
        dec_layer = nn.TransformerDecoderLayer(
            d_model=d_model, nhead=nhead, dim_feedforward=d_model * 4,
            dropout=dropout, batch_first=True, norm_first=True
        )
        self.decoder = nn.TransformerDecoder(dec_layer, num_layers=num_layers)
        self.out_proj = nn.Linear(d_model, vocab_size)
        self.count_head = nn.Sequential(
            nn.AdaptiveAvgPool2d(1), nn.Flatten(),
            nn.Linear(d_model, d_model), nn.ReLU(inplace=True),
            nn.Linear(d_model, vocab_size), nn.ReLU(inplace=True)
        )
        self.struct_head = nn.Linear(d_model, 6)

model = MathVisionV3(len(VOCAB), PAD_ID)
model.load_state_dict(torch.load(CKPT_PATH, map_location="cpu"))
model.eval()
print("Model loaded successfully from densenet_s8_v3_final.pth!")

class EncoderWrapper(nn.Module):
    def __init__(self, m):
        super().__init__()
        self.encoder = m.encoder
        self.enc_proj = m.enc_proj
        self.pos_2d = m.pos_2d

    def forward(self, img):
        feat = self.enc_proj(self.encoder(img.repeat(1, 3, 1, 1)))
        return self.pos_2d(feat).flatten(2).transpose(1, 2)

class DecoderWithAttnWrapper(nn.Module):
    def __init__(self, m):
        super().__init__()
        self.tok_emb = m.tok_emb
        self.pos_1d = m.pos_1d
        self.layers = m.decoder.layers
        self.out_proj = m.out_proj

    def forward(self, ys, memory):
        T = ys.size(1)
        x = self.tok_emb(ys) + self.pos_1d[:, :T, :]
        tgt_mask = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)
        attn_weights = None

        for i, layer in enumerate(self.layers):
            sa_out, _ = layer.self_attn(
                layer.norm1(x), layer.norm1(x), layer.norm1(x),
                attn_mask=tgt_mask, need_weights=False
            )
            x = x + sa_out
            need_w = (i == len(self.layers) - 1)
            ca_out, w = layer.multihead_attn(
                layer.norm2(x), memory, memory,
                need_weights=need_w, average_attn_weights=True
            )
            x = x + ca_out
            if need_w:
                attn_weights = w[:, -1, :]
            x = x + layer.linear2(layer.activation(layer.linear1(layer.norm3(x))))

        next_logits = self.out_proj(x[:, -1, :])
        return next_logits, attn_weights

enc_wrapper = EncoderWrapper(model).eval()
dec_wrapper = DecoderWithAttnWrapper(model).eval()

out_models_dir = os.path.join(BASE_DIR, "models")
os.makedirs(out_models_dir, exist_ok=True)

enc_fp32 = os.path.join(out_models_dir, "encoder_fp32_temp.onnx")
dec_fp32 = os.path.join(out_models_dir, "decoder_fp32_temp.onnx")
enc_int8 = os.path.join(out_models_dir, "encoder_int8.onnx")
dec_int8 = os.path.join(out_models_dir, "decoder_int8.onnx")

dummy_img = torch.randn(1, 1, 96, 256)
dummy_mem = torch.randn(1, 12 * 32, 256)
dummy_ys = torch.tensor([[1, 5, 10]], dtype=torch.long)

print("Exporting Encoder ONNX...")
torch.onnx.export(
    enc_wrapper, (dummy_img,), enc_fp32,
    input_names=["img"], output_names=["memory"],
    dynamic_axes={"img": {3: "width"}, "memory": {1: "seq_len"}},
    opset_version=14, dynamo=False
)

print("Exporting Decoder ONNX (with Cross-Attention grounding)...")
torch.onnx.export(
    dec_wrapper, (dummy_ys, dummy_mem), dec_fp32,
    input_names=["ys", "memory"], output_names=["next_logits", "cross_attn"],
    dynamic_axes={
        "ys": {1: "tgt_len"},
        "memory": {1: "src_len"},
        "cross_attn": {1: "src_len"}
    },
    opset_version=14, dynamo=False
)

print("Quantizing to INT8...")
quantize_dynamic(enc_fp32, enc_int8, weight_type=QuantType.QUInt8)
quantize_dynamic(dec_fp32, dec_int8, weight_type=QuantType.QUInt8)

# Clean up temporary FP32 exports to save disk space
if os.path.exists(enc_fp32): os.remove(enc_fp32)
if os.path.exists(dec_fp32): os.remove(dec_fp32)

# Remove any old .data files if they exist
for fname in ["encoder_fp32.onnx.data", "decoder_fp32.onnx.data"]:
    fpath = os.path.join(out_models_dir, fname)
    if os.path.exists(fpath):
        os.remove(fpath)

print(f"Backend Encoder INT8: {os.path.getsize(enc_int8)/1e6:.2f} MB")
print(f"Backend Decoder INT8: {os.path.getsize(dec_int8)/1e6:.2f} MB")
print(f"Total INT8 Size: {(os.path.getsize(enc_int8) + os.path.getsize(dec_int8))/1e6:.2f} MB")

# Also copy to checkpoints/ and onnx_models/ so all locations stay in sync with v3_final
import shutil
for dest_dir in [os.path.join(ROOT_DIR, "checkpoints"), os.path.join(ROOT_DIR, "onnx_models")]:
    os.makedirs(dest_dir, exist_ok=True)
    shutil.copy2(enc_int8, os.path.join(dest_dir, "encoder_int8.onnx"))
    shutil.copy2(dec_int8, os.path.join(dest_dir, "decoder_int8.onnx"))
    shutil.copy2(enc_int8, os.path.join(dest_dir, "encoder_v3_int8.onnx"))
    shutil.copy2(dec_int8, os.path.join(dest_dir, "decoder_v3_int8.onnx"))

print("Synchronized all target directories with v3_final models!")
