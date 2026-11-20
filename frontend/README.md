# MathVision — AI Mathematical Recognition Platform (HMER IDE)

MathVision is a production-grade Handwritten Mathematical Expression Recognition (HMER) scientific IDE. It bridges high-resolution digital ink capture and notebook photograph ingestion with a hybrid **DenseNet-121** convolutional encoder, **3-layer Pre-LN Transformer decoder**, **decoder cross-attention spatial grounding**, and **SymPy symbolic verification**.

---

## Architecture Overview

```
                                      +------------------------------------+
                                      |         MathVision Client          |
                                      |   (React 18, Vite, TS, KaTeX)      |
                                      +-----------------+------------------+
                                                        |
                                          HTTP POST /predict (FormData)
                                          (mode: canvas | photo, beam: 3)
                                                        |
                                                        v
                                      +------------------------------------+
                                      |       FastAPI Inference API        |
                                      |  (/health, /predict, dual preproc) |
                                      +-----------------+------------------+
                                                        |
                                       Normalized Tensor [1, 1, 96, W]
                                                        |
                                                        v
                                      +------------------------------------+
                                      |     DenseNet-121 ONNX Encoder      |
                                      |    (stride-8 feature downscale)    |
                                      +-----------------+------------------+
                                                        |
                                        Memory Map [1, 12, W/8, 256]
                                                        |
                                                        v
                                      +------------------------------------+
                                      |    3-Layer Transformer Decoder     |
                                      | (Beam Search, 132-token CROHME23)  |
                                      +-----------------+------------------+
                                                        |
                               +------------------------+------------------------+
                               |                                                 |
                               v                                                 v
                     LaTeX Token Sequence                              Cross-Attention Weights
                     & Alternative Logits                              Peak Spatial Coordinates
                               |                                                 |
                               v                                                 v
                      SymPy Symbolic CAS                               Spatial Spotlight &
                   Verification & Simplify                             Interactive Correction
```

---

## Key Features

1. **Dual Ingestion Modalities**:
   - **Digital Ink Canvas**: Smooth HTML5 Canvas with pointer/touch pressure, quadratic curve smoothing, undo/redo stacks, customizable stroke size, and grid styles (dots, lines, ruled paper, plain).
   - **Notebook Photograph Ingestion**: Drag-and-drop photo uploader with file-size & dimension inspection, shadow-removal callouts, and side-by-side original vs preprocessed preview.

2. **Live Mathematical Rendering**:
   - Immediate **KaTeX** mathematical typography for complex fractions, roots, summations, integrals, Greek letters, and matrix brackets.
   - Dual-view mode (Split / Rendered / Raw LaTeX).
   - Real-time syntax validation (balanced curly braces and delimiter checking).

3. **Cross-Attention Explainability (Signature Feature)**:
   - Normalized peak cross-attention coordinate mapping onto preprocessed feature canvas.
   - Interactive spatial spotlight with adjustable intensity, radius, reticle crosshair, and normalized `(x, y)` coordinate tags.
   - Preserves alignment across responsive container resizes.

4. **Interactive Symbol Correction System**:
   - Clickable atomic token sequence chips.
   - Direct inspection of top-3 alternative predictions emitted by Transformer beam search decoder.
   - One-click token replacement that updates LaTeX while preserving original prediction.
   - Custom LaTeX symbol replacement dialog.

5. **SymPy Verification & Simplification**:
   - Real-time algebraic verification via Python SymPy 1.13.
   - Renders simplified canonical expression side-by-side.

6. **Local Recognition History & Playground**:
   - LocalStorage persistence with search, favorites filter, JSON export/import.
   - Preloaded mathematical playground with categorized examples (Algebra, Calculus, Series, Trigonometry, Physics).

---

## Getting Started

### 1. Start the FastAPI Backend
Ensure Python 3.10+ is installed with dependencies:
```bash
uvicorn backend.main:app --reload --port 8000
```
- Health Check: `http://localhost:8000/health`
- Predict Endpoint: `http://localhost:8000/predict`

### 2. Start the Frontend IDE
From the workspace root or `frontend` directory:
```bash
# From workspace root:
npm run dev

# Or directly in frontend:
cd frontend
npm run dev
```
The application will launch on `http://localhost:5173`.

### 3. Build for Production
```bash
npm --prefix frontend run build
```

---

## Keyboard Shortcuts
| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Enter` | Recognize Equation |
| `Ctrl + Z` | Undo Canvas Stroke |
| `Ctrl + Shift + Z` / `Ctrl + Y` | Redo Canvas Stroke |
| `P` | Pen Tool |
| `E` | Eraser Tool |
| `←` / `→` | Navigate previous / next token in inspector |
| `Esc` | Dismiss modal dialog |
