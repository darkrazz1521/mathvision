import React from 'react';
import { Loader2, CheckCircle2, Cpu, Scan, Binary, Sparkles, Layers } from 'lucide-react';
import { ProcessingStatus } from '../../types/workspace';
import { cn } from '../../utils/cn';

interface PipelineProgressProps {
  status: ProcessingStatus;
  currentMessage?: string;
  latencyMs?: number;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  status,
  currentMessage,
  latencyMs,
}) => {
  const steps = [
    { id: 'preparing', label: 'Input Ingestion', icon: Scan },
    { id: 'preprocessing', label: 'Morphological Binarization', icon: Layers },
    { id: 'features', label: 'DenseNet-121 Encoder', icon: Cpu },
    { id: 'decoding', label: 'Transformer Beam Search', icon: Binary },
    { id: 'verifying', label: 'SymPy & Syntax Verification', icon: Sparkles },
  ];

  const getStepState = (stepIndex: number) => {
    if (status === 'error') return 'error';
    if (status === 'success') return 'completed';

    const stageMap: Record<string, number> = {
      idle: -1,
      preparing: 0,
      preprocessing: 1,
      decoding: 3,
      verifying: 4,
    };

    const currentStage = stageMap[status] ?? 2;
    if (stepIndex < currentStage) return 'completed';
    if (stepIndex === currentStage) return 'active';
    return 'pending';
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#10141D] border border-[#252D3B]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#8B7CFF]" />
          Inference Pipeline
        </span>
        {latencyMs !== undefined && (
          <span className="text-xs font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
            {latencyMs.toFixed(1)} ms
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 pt-1">
        {steps.map((step, idx) => {
          const state = getStepState(idx);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center text-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300',
                  state === 'completed' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
                  state === 'active' && 'bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF] animate-pulse',
                  state === 'pending' && 'bg-[#090B10] text-[#64748B] border-[#252D3B]',
                  state === 'error' && 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                )}
              >
                {state === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : state === 'active' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#8B7CFF]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-tight line-clamp-1',
                  state === 'active' ? 'text-[#F1F5F9]' : 'text-[#64748B]'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {currentMessage && status !== 'idle' && (
        <div className="text-center text-xs text-[#94A3B8] mt-1 italic animate-pulse">
          {currentMessage}
        </div>
      )}
    </div>
  );
};
