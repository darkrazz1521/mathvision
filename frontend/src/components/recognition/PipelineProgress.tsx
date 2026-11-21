import React from 'react';
import { Loader2, CheckCircle2, Cpu, Scan, Binary, Sparkles, Layers, Minus, AlertCircle } from 'lucide-react';
import { ProcessingStatus } from '../../types/workspace';
import { cn } from '../../utils/cn';

interface PipelineProgressProps {
  status: ProcessingStatus;
  currentMessage?: string;
  latencyMs?: number;
  sympyValid?: boolean;
  syntaxValid?: boolean;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  status,
  currentMessage,
  latencyMs,
  sympyValid,
  syntaxValid,
}) => {
  const steps = [
    { id: 'preparing', label: 'Ingestion', icon: Scan },
    { id: 'preprocessing', label: 'Binarize', icon: Layers },
    { id: 'features', label: 'DenseNet', icon: Cpu },
    { id: 'decoding', label: 'Decoder', icon: Binary },
    { id: 'verifying', label: 'SymPy', icon: Sparkles },
  ];

  const getStepState = (stepIndex: number): 'completed' | 'active' | 'pending' | 'error' | 'unavailable' | 'warning' => {
    if (status === 'error') return 'error';
    if (status === 'success') {
      if (stepIndex === 4) {
        // Truthful SymPy verification state: only mark completed if SymPy parse actually succeeded
        return sympyValid ? 'completed' : 'unavailable';
      }
      if (stepIndex === 3 && syntaxValid === false) {
        return 'warning';
      }
      return 'completed';
    }

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
    <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#0D111A] border border-[#212836] select-none shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] font-semibold text-[#94A3B8] flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#8B7CFF]" />
          Inference Pipeline
        </span>
        {latencyMs !== undefined && (
          <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
            {latencyMs.toFixed(1)} ms
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5 pt-0.5">
        {steps.map((step, idx) => {
          const state = getStepState(idx);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center text-center gap-1">
              <div
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300',
                  state === 'completed' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/35',
                  state === 'active' && 'bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF] animate-pulse',
                  state === 'pending' && 'bg-[#080B11] text-[#475569] border-[#212836]',
                  state === 'unavailable' && 'bg-[#182133] text-[#64748B] border-[#2B3852]',
                  state === 'warning' && 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                  state === 'error' && 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                )}
                title={
                  state === 'unavailable'
                    ? `${step.label}: Expression not parseable in SymPy CAS (verification skipped)`
                    : step.label
                }
              >
                {state === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : state === 'active' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B7CFF]" />
                ) : state === 'unavailable' ? (
                  <Minus className="w-3.5 h-3.5" />
                ) : state === 'warning' ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
              </div>
              <span
                className={cn(
                  'text-[9px] font-mono font-medium leading-none line-clamp-1',
                  state === 'active'
                    ? 'text-[#F8FAFC]'
                    : state === 'completed'
                    ? 'text-[#CBD5E1]'
                    : state === 'unavailable'
                    ? 'text-[#64748B]'
                    : 'text-[#64748B]'
                )}
              >
                {state === 'unavailable' ? 'N/A' : step.label}
              </span>
            </div>
          );
        })}
      </div>

      {currentMessage && status !== 'idle' && (
        <div className="text-center text-[10px] text-[#94A3B8] font-mono truncate italic animate-pulse">
          {currentMessage}
        </div>
      )}
    </div>
  );
};
