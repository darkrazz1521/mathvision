import React from 'react';
import { Cpu, Layers, HardDrive, Zap, CheckCircle2, Award, BarChart2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ModelSpecModal: React.FC = () => {
  const specs = [
    { label: 'Active Checkpoint', value: 'mathvision_v4_final.pth (v4-Final)', icon: Award },
    { label: 'Encoder Architecture', value: 'DenseNet-121 (Dense Convolutional Network)', icon: Layers },
    { label: 'Spatial Stride', value: 'Stride-8 (H/8 × W/8 feature grid downsampling)', icon: Zap },
    { label: 'Decoder Architecture', value: '3-Layer Coverage Multi-Head Attention Decoder', icon: Cpu },
    { label: 'Model Dimension (d_model)', value: '256 dimensions', icon: HardDrive },
    { label: 'Attention Heads', value: '8 parallel cross-attention heads with 2D coverage conv', icon: Zap },
    { label: 'Vocabulary Size', value: '132 atomic LaTeX tokens (CROHME23)', icon: Award },
    { label: 'Auxiliary Supervisions', value: 'Dual-head: Symbol count + 6-class syntax head', icon: CheckCircle2 },
    { label: 'Training Augmentation', value: 'RealWorldMathAugmentor (Ruled lines, warps, shadows)', icon: Zap },
    { label: 'Inference Quantization', value: 'INT8 Dynamic Quantization (ONNX Runtime)', icon: HardDrive },
    { label: 'Total Model Disk Size', value: '8.80 MB (Encoder 5.18 MB + Decoder 3.62 MB)', icon: HardDrive },
    { label: 'Target Execution Provider', value: 'CPUExecutionProvider (Low-power local execution)', icon: Cpu },
  ];

  return (
    <div className="flex flex-col gap-5 p-1 text-sm text-[#F1F5F9]">
      {/* Intro Header */}
      <div className="p-4 rounded-xl bg-[#151B27] border border-[#252D3B]">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-[#8B7CFF]" />
          <h3 className="font-semibold text-sm text-[#F1F5F9]">
            DenseNetHMER v4-Final Scientific Specification
          </h3>
        </div>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          MathVision utilizes a hybrid CNN-Transformer v4-Final architecture optimized for Handwritten Mathematical Expression Recognition (HMER). Featuring a 9-block DenseNet-121 backbone, 2D spatial positional encodings, and a 3-layer Transformer decoder with Coverage Multi-Head Attention (5×5 kernel 2D coverage memory), v4 completely eliminates repetitive token loops, handles complex multi-tier fractions and matrices, and runs in sub-120ms on low-power CPU.
        </p>
      </div>

      {/* Architecture Spec Grid */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
          Neural Architecture Breakdown
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
              CROHME-23 Official Validation Benchmarks
            </h4>
          </div>
          <Badge variant="neutral" size="sm">
            Validation Split
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-center">
            <span className="text-[11px] text-[#94A3B8] block">Expression Rate (ExpRate)</span>
            <span className="text-lg font-bold font-mono text-[#8B7CFF] mt-1 block">34.08%</span>
            <span className="text-[10px] text-emerald-400/90 block mt-0.5">+1.30% over v3 baseline</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-center">
            <span className="text-[11px] text-[#94A3B8] block">≤ 1 Error Rate</span>
            <span className="text-lg font-bold font-mono text-[#38BDF8] mt-1 block">45.65%</span>
            <span className="text-[10px] text-emerald-400/90 block mt-0.5">+2.94% over v3 baseline</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-center">
            <span className="text-[11px] text-[#94A3B8] block">Character Error (CER)</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">31.27%</span>
            <span className="text-[10px] text-emerald-400/90 block mt-0.5">-5.10% CER reduction</span>
          </div>
        </div>

        <p className="text-[10px] text-[#64748B] mt-2 leading-snug">
          <strong>v4-Final Benchmark:</strong> Evaluated on CROHME-2023 official validation set with Coverage Multi-Head Attention. Demonstrates state-of-the-art token alignment, reduced character error rates, and robust recognition across photographed notebook papers.
        </p>
      </div>
    </div>
  );
};
