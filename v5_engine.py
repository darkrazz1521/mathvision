import math
import time
import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

torch.set_num_threads(2)  # Render CPU par RAM & thread contention kam rakhne ke liye


class Bottleneck(nn.Module):
    def __init__(self, in_ch, growth_rate, dropout=0.0):
        super().__init__()
        inter_ch = 4 * growth_rate
        self.bn1 = nn.BatchNorm2d(in_ch)
        self.conv1 = nn.Conv2d(in_ch, inter_ch, kernel_size=1, bias=False)
        self.bn2 = nn.BatchNorm2d(inter_ch)
        self.conv2 = nn.Conv2d(inter_ch, growth_rate, kernel_size=3, padding=1, bias=False)
        self.drop = nn.Identity()

    def forward(self, x):
        out = self.conv1(F.relu(self.bn1(x), inplace=True))
        out = self.drop(self.conv2(F.relu(self.bn2(out), inplace=True)))
        return torch.cat([x, out], dim=1)


class Transition(nn.Module):
    def __init__(self, in_ch, out_ch, pool=True):
        super().__init__()
        self.bn = nn.BatchNorm2d(in_ch)
        self.conv = nn.Conv2d(in_ch, out_ch, kernel_size=1, bias=False)
        self.pool = nn.AvgPool2d(2, 2) if pool else nn.Identity()

    def forward(self, x):
        return self.pool(self.conv(F.relu(self.bn(x), inplace=True)))


class MathDenseNet(nn.Module):
    def __init__(self, growth_rate=24, num_layers=16, d_model=256):
        super().__init__()
        ch = 2 * growth_rate
        self.stem = nn.Sequential(
            nn.Conv2d(1, ch, kernel_size=7, stride=2, padding=3, bias=False),
            nn.BatchNorm2d(ch),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        self.block1 = self._make_block(ch, growth_rate, num_layers)
        ch += num_layers * growth_rate
        self.trans1 = Transition(ch, ch // 2, pool=True)
        ch = ch // 2

        self.block2 = self._make_block(ch, growth_rate, num_layers)
        ch += num_layers * growth_rate
        self.trans2 = Transition(ch, ch // 2, pool=False)
        ch = ch // 2

        self.block3 = self._make_block(ch, growth_rate, num_layers)
        ch += num_layers * growth_rate
        self.final_proj = nn.Sequential(
            nn.BatchNorm2d(ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(ch, d_model, kernel_size=1, bias=False),
            nn.BatchNorm2d(d_model),
            nn.ReLU(inplace=True),
        )

    def _make_block(self, in_ch, k, n):
        return nn.Sequential(*[Bottleneck(in_ch + i * k, k) for i in range(n)])

    def forward(self, x):
        x = self.stem(x)
        x = self.trans1(self.block1(x))
        x = self.trans2(self.block2(x))
        return self.final_proj(self.block3(x))


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


class FusionCoverageCrossAttn(nn.Module):
    def __init__(self, d_model=256, nhead=8):
        super().__init__()
        self.nhead = nhead
        self.head_dim = d_model // nhead
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.v_proj = nn.Linear(d_model, d_model)
        self.out_proj = nn.Linear(d_model, d_model)
        self.cov_conv = nn.Conv2d(nhead, nhead, kernel_size=5, padding=2, groups=nhead, bias=False)
        self.cov_proj = nn.Linear(nhead, nhead, bias=False)

    def forward(self, query, memory, Hp, Wp, mem_pad_mask=None, prev_attn=None):
        B, T, C = query.shape
        S = memory.size(1)
        q = self.q_proj(query).view(B, T, self.nhead, self.head_dim).transpose(1, 2)
        k = self.k_proj(memory).view(B, S, self.nhead, self.head_dim).transpose(1, 2)
        v = self.v_proj(memory).view(B, S, self.nhead, self.head_dim).transpose(1, 2)

        scores = torch.matmul(q, k.transpose(-2, -1)) / (self.head_dim ** 0.5)
        if mem_pad_mask is not None:
            scores = scores.masked_fill(mem_pad_mask[:, None, None, :], -1e4)

        base_attn = F.softmax(scores, dim=-1)
        cum_attn = torch.cumsum(base_attn, dim=2) - base_attn
        if prev_attn is not None:
            cum_attn = cum_attn + prev_attn

        cov_2d = cum_attn.transpose(1, 2).reshape(B * T, self.nhead, Hp, Wp)
        cov_feat = self.cov_conv(cov_2d).reshape(B, T, self.nhead, S).permute(0, 1, 3, 2)
        cov_bias = self.cov_proj(cov_feat).permute(0, 3, 1, 2)

        refined = scores - cov_bias
        if mem_pad_mask is not None:
            refined = refined.masked_fill(mem_pad_mask[:, None, None, :], -1e4)

        attn_w = F.softmax(refined, dim=-1)
        out = torch.matmul(attn_w, v).transpose(1, 2).contiguous().view(B, T, C)
        return self.out_proj(out), attn_w


class FusionCoverageDecoderLayer(nn.Module):
    def __init__(self, d_model=256, nhead=8, dim_feedforward=1024):
        super().__init__()
        self.norm1 = nn.LayerNorm(d_model)
        self.self_attn = nn.MultiheadAttention(d_model, nhead, dropout=0.0, batch_first=True)
        self.norm2 = nn.LayerNorm(d_model)
        self.cross_attn = FusionCoverageCrossAttn(d_model, nhead)
        self.norm3 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, dim_feedforward), nn.GELU(), nn.Identity(),
            nn.Linear(dim_feedforward, d_model), nn.Identity(),
        )

    def forward(self, x, memory, Hp, Wp, tgt_mask=None, tgt_pad_mask=None, mem_pad_mask=None, prev_attn=None):
        q = self.norm1(x)
        sa_out, _ = self.self_attn(q, q, q, attn_mask=tgt_mask, key_padding_mask=tgt_pad_mask, need_weights=False)
        x = x + sa_out
        ca_out, attn_w = self.cross_attn(self.norm2(x), memory, Hp, Wp, mem_pad_mask=mem_pad_mask, prev_attn=prev_attn)
        x = x + ca_out
        x = x + self.ffn(self.norm3(x))
        return x, attn_w


class MathVisionV5Infer(nn.Module):
    def __init__(self, vocab_size=132, pad_id=0, d_model=256, nhead=8, num_layers=3):
        super().__init__()
        self.pad_id = pad_id
        self.encoder = MathDenseNet(growth_rate=24, num_layers=16, d_model=d_model)
        self.pos_2d = PositionalEncoding2D(d_model, max_h=32, max_w=128)
        self.tok_emb = nn.Embedding(vocab_size, d_model, padding_idx=pad_id)
        self.dir_emb = nn.Embedding(2, d_model)
        self.pos_1d = nn.Parameter(torch.randn(1, 200, d_model) * 0.02)
        self.decoder_layers = nn.ModuleList([
            FusionCoverageDecoderLayer(d_model, nhead, d_model * 4)
            for _ in range(num_layers)
        ])
        self.dec_norm = nn.LayerNorm(d_model)
        self.out_proj = nn.Linear(d_model, vocab_size)

    def encode(self, imgs, heights, widths):
        feat_map = self.encoder(imgs)
        B, C, Hp, Wp = feat_map.shape
        memory = self.pos_2d(feat_map).flatten(2).transpose(1, 2)
        valid_h = torch.clamp((heights + 7) // 8, min=1, max=Hp)
        valid_w = torch.clamp((widths + 7) // 8, min=1, max=Wp)
        row_mask = torch.arange(Hp, device=imgs.device).unsqueeze(0) >= valid_h.unsqueeze(1)
        col_mask = torch.arange(Wp, device=imgs.device).unsqueeze(0) >= valid_w.unsqueeze(1)
        mem_pad_mask = (row_mask.unsqueeze(2) | col_mask.unsqueeze(1)).reshape(B, Hp * Wp)
        return memory, mem_pad_mask, Hp, Wp, valid_h, valid_w

    def decode(self, tgt_in, memory, Hp, Wp, mem_pad_mask=None, dir_id=0, return_attn=False):
        B, T = tgt_in.shape
        d_vec = self.dir_emb(torch.full((B, 1), dir_id, dtype=torch.long, device=tgt_in.device))
        x = self.tok_emb(tgt_in) + self.pos_1d[:, :T, :] + d_vec
        tgt_mask = torch.triu(torch.ones(T, T, device=tgt_in.device, dtype=torch.bool), diagonal=1)
        tgt_pad_mask = (tgt_in == self.pad_id)
        prev_attn = None
        for layer in self.decoder_layers:
            x, prev_attn = layer(x, memory, Hp, Wp, tgt_mask=tgt_mask, tgt_pad_mask=tgt_pad_mask, mem_pad_mask=mem_pad_mask, prev_attn=prev_attn)
        out = self.dec_norm(x)
        return (out, prev_attn) if return_attn else out


class MathVisionV5Engine:
    def __init__(self, bundle_path: str, device: str = "cpu"):
        self.device = torch.device(device)
        bundle = torch.load(bundle_path, map_location=self.device)
        self.tok2id = bundle["tok2id"]
        self.id2tok = {int(k): v for k, v in bundle["id2tok"].items()}
        self.pad_id = self.tok2id["<PAD>"]
        self.sos_id = self.tok2id["<SOS>"]
        self.eos_id = self.tok2id["<EOS>"]
        self.vocab_size = len(self.tok2id)

        self.model = MathVisionV5Infer(vocab_size=self.vocab_size, pad_id=self.pad_id).to(self.device)
        state_fp32 = {k: (v.float() if v.is_floating_point() else v) for k, v in bundle["state_dict"].items()}
        self.model.load_state_dict(state_fp32, strict=True)
        self.model.eval()

    def preprocess(self, gray_img: np.ndarray, is_photo: bool = False, base_h: int = 128, max_w: int = 512):
        """Canvas ya Notebook Photo ko tight-crop + pad + model tensor mein convert karta hai."""
        img = gray_img.copy()
        if is_photo:
            blur = cv2.GaussianBlur(img, (5, 5), 0)
            img = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 25, 12)
        else:
            # Agar dark canvas (white ink on dark bg) aaye toh auto-invert to black ink on white bg
            if np.mean(img) < 127:
                img = 255 - img

        # Tight crop around ink with 8px margin
        ink_mask = img < 220
        if np.any(ink_mask):
            ys, xs = np.where(ink_mask)
            y0, y1 = max(0, ys.min() - 8), min(img.shape[0], ys.max() + 9)
            x0, x1 = max(0, xs.min() - 8), min(img.shape[1], xs.max() + 9)
            img = img[y0:y1, x0:x1]

        h, w = img.shape
        new_w = max(16, min(max_w, int(round(w * (base_h / max(h, 1))))))
        resized = cv2.resize(img, (new_w, base_h), interpolation=cv2.INTER_AREA)

        pad_h = ((base_h + 7) // 8) * 8
        pad_w = ((new_w + 7) // 8) * 8
        tensor = torch.zeros(1, 1, pad_h, pad_w, dtype=torch.float32, device=self.device)
        tensor[0, 0, :base_h, :new_w] = torch.from_numpy(1.0 - (resized.astype(np.float32) / 255.0))
        return tensor, torch.tensor([base_h], device=self.device), torch.tensor([new_w], device=self.device)

    @torch.no_grad()
    def _beam_search(self, mem, mask, Hp, Wp, dir_id=0, beam_size=5, max_len=85):
        K = beam_size
        mem_exp = mem.expand(K, -1, -1)
        mask_exp = mask.expand(K, -1)
        seqs = torch.full((K, 1), self.sos_id, dtype=torch.long, device=self.device)
        scores = torch.full((K,), -1e9, dtype=torch.float32, device=self.device)
        scores[0] = 0.0
        fin = torch.zeros(K, dtype=torch.bool, device=self.device)

        for _ in range(max_len):
            logits = self.model.out_proj(self.model.decode(seqs, mem_exp, Hp, Wp, mask_exp, dir_id=dir_id)[:, -1, :])
            lp = F.log_softmax(logits, dim=-1)
            lp[:, self.pad_id] = -1e9
            lp[:, self.sos_id] = -1e9
            if fin.any():
                fin_lp = torch.full_like(lp, -1e9)
                fin_lp[:, self.pad_id] = 0.0
                lp = torch.where(fin.unsqueeze(-1), fin_lp, lp)

            top_s, top_i = torch.topk((scores.unsqueeze(-1) + lp).view(-1), K)
            bm_i, tk_i = top_i // self.vocab_size, top_i % self.vocab_size
            seqs = torch.cat([seqs[bm_i], tk_i.unsqueeze(-1)], dim=-1)
            fin = fin[bm_i] | (tk_i == self.eos_id)
            scores = top_s
            if fin.all():
                break

        hyps = []
        for k in range(K):
            p = [i for i in seqs[k].tolist() if i not in (self.pad_id, self.sos_id)]
            if self.eos_id in p:
                p = p[:p.index(self.eos_id)]
            hyps.append(p)
        return hyps

    @torch.no_grad()
    def _rerank_bi(self, mem, mask, Hp, Wp, cands, alpha=0.7):
        if len(cands) == 1:
            return cands[0]
        C = len(cands)
        max_l = max(len(c) for c in cands) + 1
        in_l = torch.full((C, max_l), self.pad_id, dtype=torch.long, device=self.device)
        tg_l = torch.full((C, max_l), self.pad_id, dtype=torch.long, device=self.device)
        in_r = torch.full((C, max_l), self.pad_id, dtype=torch.long, device=self.device)
        tg_r = torch.full((C, max_l), self.pad_id, dtype=torch.long, device=self.device)
        for i, c in enumerate(cands):
            L = len(c)
            in_l[i, 0] = self.sos_id; tg_l[i, L] = self.eos_id
            in_r[i, 0] = self.sos_id; tg_r[i, L] = self.eos_id
            if L > 0:
                ct = torch.tensor(c, dtype=torch.long, device=self.device)
                in_l[i, 1:1+L] = ct; tg_l[i, :L] = ct
                rct = torch.tensor(c[::-1], dtype=torch.long, device=self.device)
                in_r[i, 1:1+L] = rct; tg_r[i, :L] = rct

        mem_c, mask_c = mem.expand(C, -1, -1), mask.expand(C, -1)
        log_l = self.model.out_proj(self.model.decode(in_l, mem_c, Hp, Wp, mask_c, dir_id=0))
        log_r = self.model.out_proj(self.model.decode(in_r, mem_c, Hp, Wp, mask_c, dir_id=1))
        lp_l = F.log_softmax(log_l, dim=-1).gather(-1, tg_l.unsqueeze(-1)).squeeze(-1)
        lp_r = F.log_softmax(log_r, dim=-1).gather(-1, tg_r.unsqueeze(-1)).squeeze(-1)
        valid = (tg_l != self.pad_id).float()
        lens = valid.sum(dim=1).clamp(min=1.0)
        joint = (0.5 * (lp_l * valid).sum(dim=1) + 0.5 * (lp_r * valid).sum(dim=1)) / (lens ** alpha)
        return cands[int(joint.argmax().item())]

    @torch.no_grad()
    def predict(self, gray_img: np.ndarray, is_photo: bool = False, bidirectional: bool = True, beam_size: int = 5):
        t0 = time.perf_counter()
        tensor, hs, ws = self.preprocess(gray_img, is_photo=is_photo)
        mem, mask, Hp, Wp, valid_h, valid_w = self.model.encode(tensor, hs, ws)

        l2r_hyps = self._beam_search(mem, mask, Hp, Wp, dir_id=0, beam_size=beam_size)
        if bidirectional:
            r2l_hyps = self._beam_search(mem, mask, Hp, Wp, dir_id=1, beam_size=beam_size)
            seen, cands = set(), []
            for h in l2r_hyps + [rh[::-1] for rh in r2l_hyps]:
                k = tuple(h)
                if k not in seen:
                    seen.add(k)
                    cands.append(h)
            best_ids = self._rerank_bi(mem, mask, Hp, Wp, cands)
        else:
            best_ids = l2r_hyps[0]

        # Single teacher-forced pass for exact per-token top-3 alternatives + 2D attention grounding
        tgt_in = torch.tensor([[self.sos_id] + best_ids], dtype=torch.long, device=self.device)
        dec_out, attn_w = self.model.decode(tgt_in, mem, Hp, Wp, mask, dir_id=0, return_attn=True)
        probs = F.softmax(self.model.out_proj(dec_out[0, :len(best_ids), :]), dim=-1)  # (T, V)
        attn_2d = attn_w[0].mean(dim=0)[:len(best_ids)].view(len(best_ids), Hp, Wp)   # (T, Hp, Wp)

        vh, vw = int(valid_h.item()), int(valid_w.item())
        yy = torch.linspace(0.5 / vh, 1.0 - 0.5 / vh, vh, device=self.device).view(vh, 1)
        xx = torch.linspace(0.5 / vw, 1.0 - 0.5 / vw, vw, device=self.device).view(1, vw)

        token_details = []
        confs = []
        for idx, tid in enumerate(best_ids):
            p_vec = probs[idx]
            conf = float(p_vec[tid].item())
            confs.append(conf)
            top_vals, top_ids = torch.topk(p_vec, k=3)
            alts = [
                {"token": self.id2tok[int(i)], "confidence": round(float(v), 4)}
                for v, i in zip(top_vals.tolist(), top_ids.tolist())
            ]
            amap = attn_2d[idx, :vh, :vw]
            amap = amap / (amap.sum() + 1e-8)
            cx = float((amap * xx).sum().item())
            cy = float((amap * yy).sum().item())
            token_details.append({
                "token": self.id2tok[tid],
                "confidence": round(conf, 4),
                "x": round(max(0.04, min(0.96, cx)), 3),
                "y": round(max(0.06, min(0.94, cy)), 3),
                "alternatives": alts,
            })

        latex = " ".join(self.id2tok[i] for i in best_ids)
        return {
            "latex": latex,
            "confidence": round(sum(confs) / max(len(confs), 1), 4),
            "tokens": token_details,
            "inference_ms": round((time.perf_counter() - t0) * 1000.0, 1),
            "model_version": "MathVision-V5-BiBeam",
        }
