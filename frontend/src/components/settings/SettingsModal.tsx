import React, { useState } from 'react';
import { getApiBaseUrl, setApiBaseUrl, checkApiHealth } from '../../services/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { Server, CheckCircle2, XCircle, Sliders, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SettingsModalProps {
  beamWidth: number;
  onBeamWidthChange: (w: number) => void;
  isBackendConnected: boolean;
  onRefreshConnection: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  beamWidth,
  onBeamWidthChange,
  isBackendConnected,
  onRefreshConnection,
}) => {
  const { success, error } = useToast();
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    tested: boolean;
    ok: boolean;
    vocabSize?: number;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setApiBaseUrl(apiUrl);
    const res = await checkApiHealth(apiUrl);
    setIsTesting(false);
    setHealthStatus({
      tested: true,
      ok: res.ok,
      vocabSize: res.vocabSize,
      latencyMs: res.latencyMs,
      error: res.error,
    });

    if (res.ok) {
      success('Connected to Backend', `FastAPI backend active (vocab: ${res.vocabSize} tokens, latency: ${res.latencyMs}ms)`);
      onRefreshConnection();
    } else {
      error('Backend Unreachable', res.error || 'Could not connect to FastAPI server.');
    }
  };

  return (
    <div className="flex flex-col gap-5 p-1 text-sm text-[#F1F5F9]">
      {/* Backend API Connection Section */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#151B27] border border-[#252D3B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#8B7CFF]" />
            <span className="font-semibold text-xs uppercase tracking-wider text-[#94A3B8]">
              FastAPI Inference Server
            </span>
          </div>

          <Badge variant={isBackendConnected ? 'success' : 'warning'} dot size="sm">
            {isBackendConnected ? 'Connected' : 'Offline / Standalone'}
          </Badge>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#94A3B8]">Backend API Base URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="flex-1 bg-[#090B10] border border-[#252D3B] rounded-lg px-3 py-1.5 text-xs text-[#F1F5F9] font-mono focus:border-[#8B7CFF] focus:outline-none"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={handleTestConnection}
              isLoading={isTesting}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Test
            </Button>
          </div>
        </div>

        {healthStatus && healthStatus.tested && (
          <div
            className={cn(
              'p-2.5 rounded-lg border text-xs flex items-center justify-between',
              healthStatus.ok
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            )}
          >
            <div className="flex items-center gap-2">
              {healthStatus.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" />
              )}
              <span>
                {healthStatus.ok
                  ? `Health Check OK — Vocab: ${healthStatus.vocabSize} atomic tokens`
                  : `Connection Failed: ${healthStatus.error}`}
              </span>
            </div>
            {healthStatus.latencyMs !== undefined && (
              <span className="font-mono text-[11px]">{healthStatus.latencyMs} ms</span>
            )}
          </div>
        )}
      </div>

      {/* Inference Beam Search Configuration */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#151B27] border border-[#252D3B]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#38BDF8]" />
          <span className="font-semibold text-xs uppercase tracking-wider text-[#94A3B8]">
            Beam Search Decoding Parameters
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#F1F5F9]">Beam Width (k)</label>
            <span className="font-mono text-xs text-[#8B7CFF] font-semibold">{beamWidth}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={beamWidth}
            onChange={(e) => onBeamWidthChange(parseInt(e.target.value, 10))}
            className="accent-[#8B7CFF] cursor-pointer w-full"
          />
          <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
            <span>1 (Greedy / Fastest)</span>
            <span>3 (Standard Default)</span>
            <span>5 (Deepest Search)</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1 leading-snug">
            Passed as the <code className="text-[#8B7CFF]">beam_width</code> form field to the FastAPI{' '}
            <code className="text-[#8B7CFF]">/predict</code> endpoint.
          </p>
        </div>
      </div>

      {/* Model Spec Summary Box */}
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#090B10] border border-[#252D3B] text-xs text-[#94A3B8]">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#F1F5F9]">Deployed Architecture:</span>
          <span className="font-mono text-[#8B7CFF]">DenseNet-121 + 3L-Trans</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#F1F5F9]">Inference Engine:</span>
          <span className="font-mono text-[#38BDF8]">ONNX Runtime CPU INT8</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#F1F5F9]">Combined Footprint:</span>
          <span className="font-mono text-emerald-400">12.82 MB</span>
        </div>
      </div>
    </div>
  );
};
