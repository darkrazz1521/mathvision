import os
import io
import json
import base64
import time
import socket
import uuid
import cv2
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sympy.parsing.latex import parse_latex
import sympy as sp

app = FastAPI(title="MathVision HMER API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load Vocabulary & INT8 ONNX Sessions
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
VOCAB_PATH = os.path.join(BASE_DIR, "vocab.json")
if not os.path.exists(VOCAB_PATH):
    VOCAB_PATH = os.path.join(BASE_DIR, "..", "crohme23_packed", "vocab.json")
ENC_PATH   = os.path.join(BASE_DIR, "models", "encoder_int8.onnx")
DEC_PATH   = os.path.join(BASE_DIR, "models", "decoder_int8.onnx")

with open(VOCAB_PATH, "r", encoding="utf-8") as f:
    vocab_data = json.load(f)

VOCAB  = vocab_data["vocab"]
TOK2ID = vocab_data["tok2id"]
PAD_ID, SOS_ID, EOS_ID, UNK_ID = TOK2ID["<PAD>"], TOK2ID["<SOS>"], TOK2ID["<EOS>"], TOK2ID["<UNK>"]

enc_sess = ort.InferenceSession(ENC_PATH, providers=["CPUExecutionProvider"])
dec_sess = ort.InferenceSession(DEC_PATH, providers=["CPUExecutionProvider"])

# 2. Dual-Mode Image Preprocessing (Returns model tensor + displayable base64 PNG)
def preprocess_image(image_bytes: bytes, mode: str = "canvas", target_h: int = 96):
    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Invalid image file.")

    if mode == "photo":
        # Remove uneven lighting / shadows via morphological background division
        bg = cv2.GaussianBlur(img, (31, 31), 0)
        norm = cv2.divide(img, np.maximum(bg, 1), scale=255)
        # Adaptive threshold to isolate dark ink from ruled/grid lines
        bin_img = cv2.adaptiveThreshold(
            norm, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 25, 14
        )
        # Mild denoise for paper speckles
        bin_img = cv2.medianBlur(bin_img, 3)
    else:
        # Clean digital canvas: ensure white background, black ink
        if np.mean(img) < 127:
            img = 255 - img
        _, bin_img = cv2.threshold(img, 200, 255, cv2.THRESH_BINARY)

    # Tight crop around ink
    ink_coords = np.column_stack(np.where(bin_img < 200))
    if len(ink_coords) == 0:
        raise ValueError("No handwriting detected in image.")

    y_min, x_min = ink_coords.min(axis=0)
    y_max, x_max = ink_coords.max(axis=0)
    pad = 12
    y_min, x_min = max(0, y_min - pad), max(0, x_min - pad)
    y_max, x_max = min(bin_img.shape[0], y_max + pad), min(bin_img.shape[1], x_max + pad)
    cropped = bin_img[y_min:y_max, x_min:x_max]

    # Resize to fixed height=96, preserving aspect ratio, width padded to multiple of 16
    ch, cw = cropped.shape
    scale = (target_h - 12) / max(ch, 1)
    new_w = max(16, min(int(cw * scale), 768))
    resized = cv2.resize(cropped, (new_w, target_h - 12), interpolation=cv2.INTER_AREA)

    padded_w = ((new_w + 16 + 15) // 16) * 16
    canvas = np.full((target_h, padded_w), 255, dtype=np.uint8)
    canvas[6:6 + (target_h - 12), 8:8 + new_w] = resized

    # Invert & normalize to [0, 1] for DenseNet
    tensor = (1.0 - (canvas.astype(np.float32) / 255.0))[None, None, :, :]

    # Encode preprocessed canvas for frontend overlay alignment
    _, png_buf = cv2.imencode(".png", canvas)
    b64_img = "data:image/png;base64," + base64.b64encode(png_buf).decode("utf-8")
    return tensor, b64_img, target_h, padded_w

def softmax(x):
    e = np.exp(x - np.max(x))
    return e / np.sum(e)

def check_latex_syntax(tokens):
    balance = 0
    for t in tokens:
        if t == "{": balance += 1
        elif t == "}": balance -= 1
        if balance < 0: return False
    return balance == 0

def verify_with_sympy(latex_str: str):
    try:
        expr = parse_latex(latex_str)
        simplified = sp.latex(sp.simplify(expr))
        return {"valid": True, "simplified": simplified}
    except Exception:
        return {"valid": False, "simplified": None}

# 3. Beam Search with Cross-Attention & Per-Token Confidence
def decode_beam_search(memory, hp: int, wp: int, beam_width: int = 3, max_len: int = 65):
    # Each beam: (score, token_ids, token_meta_list)
    beams = [(0.0, [SOS_ID], [])]
    completed = []

    for _ in range(max_len):
        candidates = []
        for score, seq, meta in beams:
            if seq[-1] == EOS_ID:
                completed.append((score, seq, meta))
                continue

            ys = np.array([seq], dtype=np.int64)
            logits, attn = dec_sess.run(None, {"ys": ys, "memory": memory})
            probs = softmax(logits[0])
            attn_map = attn[0].reshape(hp, wp)

            # Compute normalized (x, y) center of attention peak
            peak_idx = int(np.argmax(attn_map))
            py, px = divmod(peak_idx, wp)
            norm_x = round((px + 0.5) / wp, 4)
            norm_y = round((py + 0.5) / hp, 4)

            top_ids = np.argsort(probs)[::-1][:beam_width]
            alts = [
                {"token": VOCAB[int(i)], "prob": round(float(probs[int(i)]), 4)}
                for i in top_ids if int(i) not in (PAD_ID, SOS_ID, EOS_ID)
            ]

            for tid in top_ids:
                tid = int(tid)
                p = float(probs[tid])
                new_score = score + float(np.log(max(p, 1e-9)))
                new_meta = meta + [{
                    "token": VOCAB[tid],
                    "confidence": round(p, 4),
                    "x": norm_x,
                    "y": norm_y,
                    "alternatives": alts[:3],
                }]
                candidates.append((new_score, seq + [tid], new_meta))

        if not candidates:
            break
        # Length-normalized sorting
        candidates.sort(key=lambda x: x[0] / (len(x[1]) ** 0.7), reverse=True)
        beams = candidates[:beam_width]
        if all(b[1][-1] == EOS_ID for b in beams):
            completed.extend(beams)
            break

    all_cands = completed if completed else beams
    all_cands.sort(key=lambda x: x[0] / (len(x[1]) ** 0.7), reverse=True)
    _, best_seq, best_meta = all_cands[0]

    # Strip <EOS> from output
    clean_meta = [m for tid, m in zip(best_seq[1:], best_meta) if tid not in (PAD_ID, SOS_ID, EOS_ID)]
    tokens = [m["token"] for m in clean_meta]
    latex_str = " ".join(tokens)
    return latex_str, clean_meta

# 4. API Endpoints
@app.get("/health")
def health():
    return {"status": "ok", "vocab_size": len(VOCAB)}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    mode: str = Form("canvas"),
    beam_width: int = Form(3),
):
    t0 = time.time()
    try:
        image_bytes = await file.read()
        tensor, b64_img, h, w = preprocess_image(image_bytes, mode=mode)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    memory = enc_sess.run(None, {"img": tensor})[0]
    hp, wp = h // 8, w // 8  # Stride-8 DenseNet feature grid

    latex_str, token_meta = decode_beam_search(memory, hp, wp, beam_width=beam_width)
    tokens = [m["token"] for m in token_meta]
    syntax_ok = check_latex_syntax(tokens)
    sympy_info = verify_with_sympy(latex_str) if syntax_ok else {"valid": False, "simplified": None}

    avg_conf = round(float(np.mean([m["confidence"] for m in token_meta])), 4) if token_meta else 0.0

    return {
        "latex": latex_str,
        "tokens": token_meta,
        "avg_confidence": avg_conf,
        "syntax_valid": syntax_ok,
        "sympy": sympy_info,
        "preprocessed_image": b64_img,
        "latency_ms": round((time.time() - t0) * 1000, 1),
    }

# 5. Mobile Phone Camera QR Sync Endpoints
ACTIVE_SESSIONS = {}

def cleanup_stale_sessions():
    now = time.time()
    stale_keys = [k for k, v in ACTIVE_SESSIONS.items() if now - v.get("timestamp", 0) > 900]
    for k in stale_keys:
        ACTIVE_SESSIONS.pop(k, None)

def get_all_ips():
    ips = []
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        routed = s.getsockname()[0]
        s.close()
        if routed and not routed.startswith("127."):
            ips.append(routed)
    except Exception:
        pass

    try:
        _, _, host_ips = socket.gethostbyname_ex(socket.gethostname())
        for ip in host_ips:
            if ip not in ips and not ip.startswith("127."):
                ips.append(ip)
    except Exception:
        pass

    return ips

def get_lan_ip():
    ips = get_all_ips()
    return ips[0] if ips else "127.0.0.1"

@app.get("/system/network-info")
def network_info():
    ips = get_all_ips()
    primary = ips[0] if ips else "127.0.0.1"
    return {
        "lan_ip": primary,
        "available_ips": ips,
        "hostname": socket.gethostname(),
        "timestamp": time.time(),
    }

@app.post("/session/create")
def create_session():
    cleanup_stale_sessions()
    session_id = uuid.uuid4().hex[:8]
    ACTIVE_SESSIONS[session_id] = {
        "has_image": False,
        "image_b64": None,
        "filename": None,
        "timestamp": time.time(),
    }
    return {"session_id": session_id, "created_at": time.time()}

@app.post("/session/{session_id}/upload")
async def upload_to_session(session_id: str, file: UploadFile = File(...)):
    cleanup_stale_sessions()
    if session_id not in ACTIVE_SESSIONS:
        ACTIVE_SESSIONS[session_id] = {
            "has_image": False,
            "image_b64": None,
            "filename": None,
            "timestamp": time.time(),
        }

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image uploaded.")

    content_type = file.content_type or "image/jpeg"
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{content_type};base64,{b64}"

    ACTIVE_SESSIONS[session_id] = {
        "has_image": True,
        "image_b64": data_url,
        "filename": file.filename or "phone_capture.jpg",
        "timestamp": time.time(),
    }
    return {"status": "ok", "session_id": session_id, "size": len(image_bytes)}

@app.get("/session/{session_id}/status")
def get_session_status(session_id: str):
    cleanup_stale_sessions()
    session = ACTIVE_SESSIONS.get(session_id)
    if not session:
        return {"has_image": False, "image_b64": None, "session_found": False}
    return {
        "has_image": session.get("has_image", False),
        "image_b64": session.get("image_b64"),
        "filename": session.get("filename"),
        "session_found": True,
    }

@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    ACTIVE_SESSIONS.pop(session_id, None)
    return {"status": "cleared"}