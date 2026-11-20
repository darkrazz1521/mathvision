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
from fastapi.responses import HTMLResponse
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
        # Invert to binary ink (ink = 255 - bin_img)
        ink = 255 - bin_img

        # Remove horizontal ruled notebook lines using morphological opening with a wide horizontal kernel
        h_kernel_len = max(40, img.shape[1] // 10)
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (h_kernel_len, 1))
        h_lines = cv2.morphologyEx(ink, cv2.MORPH_OPEN, h_kernel)
        ink = cv2.subtract(ink, h_lines)

        # Remove vertical margin lines using morphological opening with a tall vertical kernel
        v_kernel_len = max(40, img.shape[0] // 8)
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, v_kernel_len))
        v_lines = cv2.morphologyEx(ink, cv2.MORPH_OPEN, v_kernel)
        ink = cv2.subtract(ink, v_lines)

        # Filter tiny paper noise specks using connectedComponentsWithStats (drop components with area < 15 px)
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(ink, connectivity=8)
        cleaned_ink = np.zeros_like(ink)
        for label_idx in range(1, num_labels):
            area = stats[label_idx, cv2.CC_STAT_AREA]
            if area >= 15:
                cleaned_ink[labels == label_idx] = 255
        ink = cleaned_ink

        # Restore white-background/black-ink (255 - ink)
        bin_img = 255 - ink
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

    ink_density = float(np.mean(cropped < 200))

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
    return tensor, b64_img, target_h, padded_w, ink_density

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

        # Early-Stop Fix: Stop as soon as beam_width beams hit <EOS>
        if len(completed) >= beam_width:
            break

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
    top_cands = all_cands[:beam_width]

    # Top-k Reranking with LaTeX syntax & SymPy validation bonus
    reranked = []
    for score, seq, meta in top_cands:
        norm_score = score / (len(seq) ** 0.7)
        cand_meta = [m for tid, m in zip(seq[1:], meta) if tid not in (PAD_ID, SOS_ID, EOS_ID)]
        cand_tokens = [m["token"] for m in cand_meta]
        cand_latex = " ".join(cand_tokens)

        bonus = 0.0
        if check_latex_syntax(cand_tokens):
            bonus += 0.15
            sympy_res = verify_with_sympy(cand_latex)
            if sympy_res.get("valid", False):
                bonus += 0.10

        reranked.append((norm_score + bonus, seq, meta, cand_latex, cand_meta))

    reranked.sort(key=lambda x: x[0], reverse=True)
    _, best_seq, best_meta, latex_str, clean_meta = reranked[0]
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
        tensor, b64_img, h, w, ink_density = preprocess_image(image_bytes, mode=mode)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    memory = enc_sess.run(None, {"img": tensor})[0]
    hp, wp = h // 8, w // 8  # Stride-8 DenseNet feature grid

    latex_str, token_meta = decode_beam_search(memory, hp, wp, beam_width=beam_width)
    tokens = [m["token"] for m in token_meta]
    syntax_ok = check_latex_syntax(tokens)
    sympy_info = verify_with_sympy(latex_str) if syntax_ok else {"valid": False, "simplified": None}

    avg_conf = round(float(np.mean([m["confidence"] for m in token_meta])), 4) if token_meta else 0.0

    # OOD / Non-Math Scribble Guard
    STRUCTURAL_TOKENS = {"{", "}", "(", ")", "\\left", "\\right"}
    content_metas = [m for m in token_meta if m["token"] not in STRUCTURAL_TOKENS]
    if content_metas:
        content_confidences = [m["confidence"] for m in content_metas]
        content_confidence = round(float(np.mean(content_confidences)), 4)
        low_conf_ratio = round(float(np.mean([1.0 if c < 0.50 else 0.0 for c in content_confidences])), 4)
    else:
        content_confidence = avg_conf
        low_conf_ratio = 0.0

    is_ood = bool(content_confidence < 0.55 or low_conf_ratio > 0.35 or ink_density > 0.45)
    warning = (
        "Low confidence — input may not be a valid mathematical expression."
        if is_ood else None
    )

    return {
        "latex": latex_str,
        "tokens": token_meta,
        "avg_confidence": avg_conf,
        "content_confidence": content_confidence,
        "is_ood": is_ood,
        "warning": warning,
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


@app.get("/capture", response_class=HTMLResponse)
def mobile_capture_page(session: str = ""):
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>MathVision Camera Sync</title>
  <style>
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }}
    body {{
      background-color: #090B10;
      color: #F1F5F9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 16px;
    }}
    .container {{
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }}
    .header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #10141D;
      border: 1px solid #252D3B;
      border-radius: 16px;
    }}
    .logo-group {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .logo-icon {{
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #8B7CFF, #38BDF8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      color: #090B10;
    }}
    .title {{
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }}
    .badge {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38BDF8;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-family: monospace;
      font-weight: 600;
    }}
    .card {{
      background: #10141D;
      border: 1px solid #252D3B;
      border-radius: 20px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }}
    .icon-circle {{
      width: 64px;
      height: 64px;
      background: rgba(139, 124, 255, 0.12);
      border: 1px solid rgba(139, 124, 255, 0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 16px;
    }}
    h1 {{
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }}
    p.desc {{
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.5;
      margin-bottom: 24px;
    }}
    .btn {{
      width: 100%;
      padding: 14px 20px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }}
    .btn-primary {{
      background: linear-gradient(135deg, #8B7CFF, #6D5BFA);
      color: white;
      box-shadow: 0 4px 15px rgba(139, 124, 255, 0.35);
    }}
    .btn-secondary {{
      background: #151B27;
      color: #CBD5E1;
      border: 1px solid #252D3B;
      margin-top: 10px;
    }}
    .btn:active {{
      transform: scale(0.98);
    }}
    .preview-box {{
      width: 100%;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #252D3B;
      margin-bottom: 16px;
      background: #000;
      display: none;
    }}
    .preview-box img {{
      width: 100%;
      max-height: 280px;
      object-fit: contain;
      display: block;
    }}
    .success-box {{
      display: none;
      background: rgba(52, 211, 153, 0.1);
      border: 1px solid rgba(52, 211, 153, 0.3);
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      color: #34D399;
      width: 100%;
    }}
    .error-box {{
      display: none;
      background: rgba(251, 113, 133, 0.1);
      border: 1px solid rgba(251, 113, 133, 0.3);
      color: #FB7185;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 12px;
      margin-top: 12px;
      width: 100%;
    }}
    .tip-box {{
      background: #151B27;
      border: 1px solid #252D3B;
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 12px;
      color: #94A3B8;
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: left;
    }}
    .tip-box div {{
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-group">
        <div class="logo-icon">&sum;</div>
        <div>
          <div class="title">MathVision</div>
          <div style="font-size: 10px; color: #94A3B8;">Camera Sync v2.0</div>
        </div>
      </div>
      <div class="badge" id="sessionBadge">Session: {session[:8] if session else "Ready"}</div>
    </div>

    <div class="card" id="mainCard">
      <div id="initialState">
        <div class="icon-circle">&#128247;</div>
        <h1>Take Photo of Equation</h1>
        <p class="desc">Point your phone camera straight at the handwritten mathematical expression in your notebook.</p>

        <input type="file" id="cameraInput" accept="image/*" capture="environment" style="display: none;">
        <input type="file" id="fileInput" accept="image/*" style="display: none;">

        <button class="btn btn-primary" onclick="document.getElementById('cameraInput').click()">
          &#128248; Open Camera (Snap)
        </button>
        <button class="btn btn-secondary" onclick="document.getElementById('fileInput').click()">
          &#128193; Choose from Gallery
        </button>
      </div>

      <div id="previewState" style="display: none; width: 100%;">
        <div class="preview-box" id="previewContainer">
          <img id="previewImg" src="" alt="Preview">
        </div>
        <button class="btn btn-primary" id="uploadBtn" onclick="uploadPhoto()">
          &#128640; Send to MathVision Desktop
        </button>
        <button class="btn btn-secondary" onclick="retakePhoto()">
          &#8634; Retake Photo
        </button>
      </div>

      <div id="successState" class="success-box">
        <div style="font-size: 36px; margin-bottom: 8px;">&#10004;</div>
        <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 6px; color: #F1F5F9;">Sent to Desktop!</h2>
        <p style="font-size: 13px; color: #94A3B8; margin-bottom: 16px;">
          Your photo has been transferred to your MathVision workspace and is being recognized.
        </p>
        <button class="btn btn-secondary" onclick="retakePhoto()">
          &#128247; Snap Another Equation
        </button>
      </div>

      <div class="error-box" id="errorBox"></div>
    </div>

    <div class="tip-box">
      <div style="font-weight: 600; color: #CBD5E1; margin-bottom: 2px;">Tips for best recognition:</div>
      <div><span>&#10003;</span> Hold phone parallel to avoid angled perspective</div>
      <div><span>&#10003;</span> Ensure sufficient lighting with no heavy hand shadows</div>
      <div><span>&#10003;</span> Ruled and grid notebook papers are supported</div>
    </div>
  </div>

  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || "{session}";
    let selectedFile = null;

    const cameraInput = document.getElementById('cameraInput');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');
    const initialState = document.getElementById('initialState');
    const previewState = document.getElementById('previewState');
    const successState = document.getElementById('successState');
    const errorBox = document.getElementById('errorBox');
    const uploadBtn = document.getElementById('uploadBtn');

    function handleFile(file) {{
      if (!file) return;
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = function(e) {{
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
        initialState.style.display = 'none';
        successState.style.display = 'none';
        previewState.style.display = 'block';
        errorBox.style.display = 'none';
      }};
      reader.readAsDataURL(file);
    }}

    cameraInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    function retakePhoto() {{
      selectedFile = null;
      cameraInput.value = '';
      fileInput.value = '';
      initialState.style.display = 'block';
      previewState.style.display = 'none';
      successState.style.display = 'none';
      errorBox.style.display = 'none';
    }}

    async function uploadPhoto() {{
      if (!selectedFile) return;
      if (!sessionId) {{
        showError('No active session ID provided in link.');
        return;
      }}

      uploadBtn.disabled = true;
      uploadBtn.innerHTML = '&#9203; Uploading to Desktop...';

      const formData = new FormData();
      formData.append('file', selectedFile);

      try {{
        const res = await fetch('/session/' + encodeURIComponent(sessionId) + '/upload', {{
          method: 'POST',
          body: formData,
        }});

        if (res.ok) {{
          previewState.style.display = 'none';
          successState.style.display = 'block';
        }} else {{
          const data = await res.json().catch(() => ({{}}));
          showError(data.detail || 'Failed to upload photo. Please try again.');
          uploadBtn.disabled = false;
          uploadBtn.innerHTML = '&#128640; Send to MathVision Desktop';
        }}
      }} catch (err) {{
        showError('Network error connecting to MathVision server.');
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '&#128640; Send to MathVision Desktop';
      }}
    }}

    function showError(msg) {{
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
    }}
  </script>
</body>
</html>
"""
    return HTMLResponse(content=html_content)
