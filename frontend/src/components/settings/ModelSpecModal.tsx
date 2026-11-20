import React from 'react';
import { Cpu, Layers, HardDrive, Zap, CheckCircle2, Award, BarChart2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ModelSpecModal: React.FC = () => {
  const specs = [
    { label: 'Encoder Architecture', value: 'DenseNet-121 (Dense Convolutional Network)', icon: Layers },
    { label: 'Spatial Stride', value: 'Stride-8 (H/8 × W/8 feature grid downsampling)', icon: Zap },
    { label: 'Decoder Architecture', value: '3-Layer Pre-LN Transformer Decoder', icon: Cpu },
    { label: 'Model Dimension (d_model)', value: '256 dimensions', icon: HardDrive },
    { label: 'Attention Heads', value: '8 parallel cross-attention heads', icon: Zap },
    { label: 'Vocabulary Size', value: '132 atomic LaTeX tokens (CROHME23)', icon: Award },
    { label: 'Auxiliary Supervisions', value: 'Auxiliary symbol-counting head', icon: CheckCircle2 },
    { label: 'Inference Quantization', value: 'INT8 Dynamic Quantization (ONNX Runtime)', icon: HardDrive },
    { label: 'Total Model Disk Size', value: '12.82 MB (Encoder 5.49 MB + Decoder 7.33 MB)', icon: HardDrive },
    { label: 'Target Execution Provider', value: 'CPUExecutionProvider (Low-power local execution)', icon: Cpu },
  ];

  return (
    <div className="flex flex-col gap-5 p-1 text-sm text-[#F1F5F9]">
      {/* Intro Header */}
      <div className="p-4 rounded-xl bg-[#151B27] border border-[#252D3B]">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-[#8B7CFF]" />
          <h3 className="font-semibold text-sm text-[#F1F5F9]">
            DenseNetHMER Scientific Specification
          </h3>
        </div>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          MathVision utilizes a hybrid CNN-Transformer architecture optimized for Handwritten Mathematical Expression Recognition (HMER). The convolutional encoder captures fine mathematical stroke curves and subscripts, while the multi-head transformer decoder models complex non-linear 2D structural syntax.
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
            <span className="text-lg font-bold font-mono text-[#8B7CFF] mt-1 block">32.84%</span>
            <span className="text-[10px] text-[#64748B] block mt-0.5">Zero symbol error rate</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-center">
            <span className="text-[11px] text-[#94A3B8] block">≤ 1 Error Rate</span>
            <span className="text-lg font-bold font-mono text-[#38BDF8] mt-1 block">41.42%</span>
            <span className="text-[10px] text-[#64748B] block mt-0.5">At most one token error</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-center">
            <span className="text-[11px] text-[#94A3B8] block">Character Error (CER)</span>
            <span className="text-lg font-bold font-mono text-amber-400 mt-1 block">40.88%</span>
            <span className="text-[10px] text-[#64748B] block mt-0.5">Average token CER</span>
          </div>
        </div>

        <p className="text-[10px] text-[#64748B] mt-2 leading-snug">
          <strong>Benchmark Disclaimer:</strong> These metrics reflect documented validation accuracy on the CROHME 2023 evaluation dataset. They are reported research benchmark measurements, not a live performance guarantee for arbitrary user drawings.
        </p>
      </div>
    </div>
  );
};
