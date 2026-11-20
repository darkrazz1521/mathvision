import { PredictResponse } from './api';

export type InputMode = 'canvas' | 'photo';
export type CanvasTool = 'pen' | 'eraser';
export type GridStyle = 'dots' | 'lines' | 'ruled' | 'none';

export type ProcessingStatus = 
  | 'idle' 
  | 'preparing' 
  | 'preprocessing' 
  | 'decoding' 
  | 'verifying' 
  | 'success' 
  | 'error';

export interface TokenEdit {
  index: number;
  originalToken: string;
  newToken: string;
  timestamp: number;
}

export interface WorkspaceState {
  inputMode: InputMode;
  processingStatus: ProcessingStatus;
  currentStepMessage: string;
  prediction: PredictResponse | null;
  editedLatex: string;
  activeTokenIndex: number | null;
  tokenEdits: TokenEdit[];
  errorMessage: string | null;
  inputImagePreview: string | null; // Data URL of canvas or uploaded photo
  
  // Explainability options
  overlayOpacity: number;
  showSpotlight: boolean;
  showCrosshair: boolean;
  showCoordinates: boolean;
  spotlightRadius: number; // in pixels
}

export interface WorkspaceActions {
  setInputMode: (mode: InputMode) => void;
  setProcessingStatus: (status: ProcessingStatus, message?: string) => void;
  setPrediction: (result: PredictResponse, imagePreview: string) => void;
  setEditedLatex: (latex: string) => void;
  setActiveTokenIndex: (index: number | null) => void;
  replaceToken: (index: number, newToken: string) => void;
  resetToOriginalPrediction: () => void;
  setErrorMessage: (msg: string | null) => void;
  clearWorkspace: () => void;
  updateExplainabilityConfig: (config: Partial<{
    overlayOpacity: number;
    showSpotlight: boolean;
    showCrosshair: boolean;
    showCoordinates: boolean;
    spotlightRadius: number;
  }>) => void;
}
