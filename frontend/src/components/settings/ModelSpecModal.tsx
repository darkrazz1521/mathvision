import React from 'react';
import { Cpu, Layers, HardDrive, Zap, CheckCircle2, Award, BarChart2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ModelSpecModal: React.FC = () => {
  const specs = [
    { label: 'Active Checkpoint', value: 'mathvision_v5_deploy.pt (v5.0-Final / Ep24)', icon: Award },
    { label: 'Encoder Architecture', value: 'MathDenseNet (48 Bottleneck Layers, growth_rate=24)', icon: Layers },
    { label: 'Spatial Feature Stride', value: 'Stride-8 (H/8 × W/8 downsampled grid, d_model=256)', icon: Zap },
    { label: 'Decoder Architecture', value: '3-Layer Bidirectional Fusion Coverage Transformer', icon: Cpu },
    { label: 'Decoding Paradigm', value: 'Bidirectional Beam-5 (L2R & R2L Joint Reranking, α=0.7)', icon: Zap },
    { label: 'Attention Mechanism', value: 'Cumulative 2D Coverage Cross-Attention (5×5 depthwise conv)', icon: Zap },
    { label: 'Vocabulary Size', value: '132 atomic LaTeX & Structural Tokens (CROHME23)', icon: Award },
    { label: 'Training Supervision', value: 'PosFormer: 6-way Region + 6-way Depth + Global Count MLP', icon: CheckCircle2 },
    { label: 'Dataset Composition', value: '90,559 Samples (CROHME23 2× oversampled + TexTeller Distilled)', icon: Layers },
    { label: 'Training Engineering', value: 'PyTorch DDP on 2× Tesla T4 with zero-leak RAM trimming', icon: Zap },
    { label: 'Model Footprint', value: '6.57M Params (~13 MB FP16 / ~26 MB FP32)', icon: HardDrive },
    { label: 'Execution Runtime', value: 'FastAPI + Render CPU-Only PyTorch (torch.set_num_threads=2)', icon: Cpu },
  ];

  return (
    <div className="flex flex-col gap-5 p-1 text-sm text-[#F1F5F9]">
      {/* Intro Header */}
      <div className="p-4 rounded-xl bg-[#151B27] border border-[#252D3B]">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-[#8B7CFF]" />
          <h3 className="font-semibold text-sm text-[#F1F5F9]">
            MathVision V5 (v5.0-Final) Scientific Specification
          </h3>
        </div>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          MathVision V5 is a lightweight, CPU-deployable Handwritten Mathematical Expression Recognition (HMER) architecture trained entirely from scratch in PyTorch. Featuring a custom Stride-8 MathDenseNet encoder, 2D sinusoidal positional encodings, a 3-layer Bidirectional Fusion Coverage Transformer decoder with direction embeddings, and joint bidirectional reranking, V5 delivers state-of-the-art mathematical fidelity in a 6.57M parameter footprint optimized for Render CPU hosting.
        </p>
      </div>

      {/* Architecture Spec Grid */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
          V5 Neural Architecture Breakdown
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {specs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-[#090B10] border border-[#252D3B]"
              >
                <div className="p-1.5 rounded-lg bg-[#151B27] text-[#8B7CFF] shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] text-[#94A3B8]">{item.label}</div>
                  <div className="text-xs font-semibold text-[#F1F5F9] mt-0.5">{item.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benchmark Validation Metrics Table */}
      <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#151B27] border border-[#252D3B]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F1F5F9]">
              CROHME-23 Official Validation Benchmarks (1,702 Equations)
            </h4>
          </div>
          <Badge variant="neutral" size="sm">
            Locked Ep 24 Baseline
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          <div className="p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-center">
            <span className="text-[11px] text-[#94A3B8] block">Strict ExpRate</span>
            <span className="text-lg font-bold font-mono text-[#8B7CFF] mt-1 block">41.30%</span>
            <span className="text-[10px] text-emerald-400/90 block mt-0.5">42.48% (3-Scale TTA)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-center">
            <span className="text-[11px] text-[#94A3B8] block">Brace-Norm ExpRate</span>
            <span className="text-lg font-bold font-mono text-[#38BDF8] mt-1 block">45.12%</span>
            <span className="text-[10px] text-emerald-400/90 block mt-0.5">46.47% (3-Scale TTA)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-center">
            <span className="text-[11px] text-[#94A3B8] block">≤ 1 Error Rate</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">53.17%</span>
            <span className="text-[10px] text-emerald-400/90 block mt-0.5">53.82% (3-Scale TTA)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-center">
            <span className="text-[11px] text-[#94A3B8] block">Validation CER</span>
            <span className="text-lg font-bold font-mono text-amber-400 mt-1 block">28.46%</span>
            <span className="text-[10px] text-emerald-400/90 block mt-0.5">28.24% (3-Scale TTA)</span>
          </div>
        </div>

        <p className="text-[10px] text-[#64748B] mt-2 leading-snug">
          <strong>V5 Certified Deployment:</strong> Evaluated on CROHME-2023 official validation set under single-scale Bi-Beam-5 decoding. Incorporates length-normalized bidirectional joint reranking (α=0.7) and teacher-forced 2D cross-attention grounding extraction.
        </p>
      </div>
    </div>
  );
};
