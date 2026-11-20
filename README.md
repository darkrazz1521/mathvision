# MathVision — Production AI Mathematical Recognition Platform

A complete scientific computing workspace for Handwritten Mathematical Expression Recognition (HMER) powered by DenseNet-121, 3-Layer Transformer Beam Search, and SymPy Verification.

- **Backend**: FastAPI (`backend/main.py`) running INT8 ONNX models (`backend/models/`)
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + KaTeX (`frontend/`)

## Quickstart

### Backend
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
