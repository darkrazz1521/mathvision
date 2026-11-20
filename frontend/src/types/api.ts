/**
 * Backend API Type Definitions matching FastAPI schemas in backend/main.py
 */

export interface HealthResponse {
  status: string;
  vocab_size: number;
}

export interface TokenAlternative {
  token: string;
  prob: number;
}

export interface TokenMetadata {
  token: string;
  confidence: number;
  x: number; // normalized peak X coordinate [0.0, 1.0]
  y: number; // normalized peak Y coordinate [0.0, 1.0]
  alternatives: TokenAlternative[];
}

export interface SympyVerification {
  valid: boolean;
  simplified: string | null;
}

export interface PredictResponse {
  latex: string;
  tokens: TokenMetadata[];
  avg_confidence: number;
  content_confidence?: number;
  is_ood?: boolean;
  warning?: string | null;
  syntax_valid: boolean;
  sympy: SympyVerification;
  preprocessed_image: string; // Base64 data URL
  latency_ms: number;
}

export interface PredictRequestOptions {
  file: Blob | File;
  mode: 'canvas' | 'photo';
  beam_width?: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  isBackendOffline?: boolean;
}
