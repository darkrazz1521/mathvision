import { HealthResponse, PredictRequestOptions, PredictResponse } from '../types/api';

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const STORAGE_API_KEY = 'mathvision_api_base_url';

export function getApiBaseUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_API_KEY);
    return saved || DEFAULT_API_BASE;
  } catch {
    return DEFAULT_API_BASE;
  }
}

export function setApiBaseUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_API_KEY, url.trim().replace(/\/+$/, ''));
  } catch (e) {
    console.error('Failed to save API base URL:', e);
  }
}

/**
 * Checks connection health to the FastAPI backend
 */
export async function checkApiHealth(
  baseUrl: string = getApiBaseUrl()
): Promise<{ ok: boolean; vocabSize?: number; error?: string; latencyMs?: number }> {
  const t0 = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - t0);

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}`, latencyMs };
    }

    const data: HealthResponse = await res.json();
    return { ok: data.status === 'ok', vocabSize: data.vocab_size, latencyMs };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - t0);
    const msg = err instanceof Error ? err.message : 'Connection failed';
    return { ok: false, error: msg, latencyMs };
  }
}

/**
 * Predicts mathematical expression using the FastAPI backend /predict endpoint
 */
export async function predictEquation(
  options: PredictRequestOptions,
  signal?: AbortSignal
): Promise<PredictResponse> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();

  const filename = options.file instanceof File ? options.file.name : 'expression.png';
  formData.append('file', options.file, filename);
  formData.append('mode', options.mode);
  formData.append('beam_width', (options.beam_width || 3).toString());

  const controller = new AbortController();
  const internalTimeout = setTimeout(() => controller.abort(), 35000);

  // Link external signal if provided
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const res = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(internalTimeout);

    if (!res.ok) {
      let detail = `Error ${res.status}`;
      try {
        const errorJson = await res.json();
        detail = errorJson.detail || detail;
      } catch {
        // use default detail
      }
      throw new Error(detail);
    }

    const data: PredictResponse = await res.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(internalTimeout);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Recognition request timed out. Please try again.');
      }
      throw err;
    }
    throw new Error('An unexpected network error occurred while communicating with backend.');
  }
}

/**
 * Fetch LAN IP info from backend for seamless mobile QR connectivity
 */
export async function getNetworkInfo(): Promise<{ lan_ip: string; available_ips?: string[]; hostname: string } | null> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/system/network-info`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a mobile sync session for phone camera uploads
 */
export async function createMobileSession(): Promise<{ session_id: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/session/create`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
    // Fallback: generate local session id if backend unavailable
    return { session_id: Math.random().toString(36).substring(2, 10) };
  } catch {
    return { session_id: Math.random().toString(36).substring(2, 10) };
  }
}

/**
 * Check if the mobile phone has uploaded a photo to the session
 */
export async function checkMobileSessionStatus(
  sessionId: string
): Promise<{ has_image: boolean; image_b64: string | null; filename: string | null }> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/session/${sessionId}/status`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
    return { has_image: false, image_b64: null, filename: null };
  } catch {
    return { has_image: false, image_b64: null, filename: null };
  }
}

/**
 * Upload photo taken on mobile phone to the active session
 */
export async function uploadMobilePhoto(
  sessionId: string,
  file: File | Blob,
  filename: string = 'phone_capture.jpg'
): Promise<{ ok: boolean; error?: string }> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', file, filename);

  try {
    const res = await fetch(`${baseUrl}/session/${sessionId}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      return { ok: true };
    }
    const errData = await res.json().catch(() => ({}));
    return { ok: false, error: errData.detail || 'Upload failed' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { ok: false, error: msg };
  }
}
