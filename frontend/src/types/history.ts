import { InputMode } from './workspace';
import { TokenMetadata, SympyVerification } from './api';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  inputMode: InputMode;
  inputPreview: string; // Base64 thumbnail
  originalLatex: string;
  currentLatex: string;
  tokens: TokenMetadata[];
  avgConfidence: number;
  latencyMs: number;
  syntaxValid: boolean;
  sympy: SympyVerification;
  preprocessedImage?: string;
  isFavorite?: boolean;
}

export type HistoryFilter = 'all' | 'canvas' | 'photo' | 'favorites';
