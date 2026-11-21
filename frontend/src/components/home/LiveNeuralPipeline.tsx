import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Cpu,
  BrainCircuit,
  Crosshair,
  Binary,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { renderLatexToHtml } from '../../utils/latex';
import { cn } from '../../utils/cn';
import {
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  VIEWPORT_ONCE,
} from '../../utils/motion';

interface PipelineStage {
  id: string;
  num: string;
  name: string;
  technicalSub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'ink',
    num: '01',
    name: 'Raw Ink Inscription',
    technicalSub: '120Hz Bezier Trajectory / Photo',
    icon: PenTool,
    color: '#8B7CFF',
    description: 'Captures pointer curves with pressure dynamics or ingests notebook photographs with 31×31 Gaussian shadow division.',
  },
  {
    id: 'densenet',
    num: '02',
    name: 'DenseNet-121 Encoder',
    technicalSub: 'Stride-8 Feature Field (256-d)',
    icon: Cpu,
    color: '#38BDF8',
    description: 'Downsamples the image by stride 8 into a 256-channel spatial tensor, reusing features across 4 dense blocks.',
  },
  {
    id: 'transformer',
    num: '03',
    name: 'Pre-LN Transformer',
    technicalSub: '3 Layers • 8 Attention Heads',
    icon: BrainCircuit,
    color: '#34D399',
    description: 'Computes scaled dot-product cross-attention between token query states and spatial visual memory representations.',
  },
  {
    id: 'grounding',
    num: '04',
    name: 'Cross-Attention Grounding',
    technicalSub: '2D Spatial Reticles (x, y)',
    icon: Crosshair,
    color: '#F59E0B',
    description: 'Pinpoints the exact physical 2D coordinates on the input canvas responsible for generating each atomic LaTeX symbol.',
  },
  {
    id: 'beam',
    num: '05',
    name: 'Beam Search Decoding',
    technicalSub: '132-Token Space (Width = 3)',
    icon: Binary,
    color: '#EC4899',
    description: 'Explores multiple hypothesis paths over the 132-token vocabulary to prevent premature greedy decoding errors.',
  },
  {
    id: 'sympy',
    num: '06',
    name: 'SymPy & LaTeX Synthesis',
    technicalSub: 'CAS Tree + KaTeX Rendering',
    icon: ShieldCheck,
    color: '#10B981',
    description: 'Validates structural brace balance, renders KaTeX typesetting, and evaluates algebraic expression trees.',
  },
];

interface DemoEquationData {
  id: string;
  title: string;
  category: string;
  latex: string;
  simplified: string;
  tokens: { token: string; confidence: number; x: number; y: number }[];
  beamBranches: { token: string; score: number; rank: number }[];
  svgPath: string;
}

const EQUATIONS: DemoEquationData[] = [
  {
    id: 'gaussian',
    title: 'Gaussian Integral',
    category: 'Calculus',
    latex: '\\int _ { - \\infty } ^ { \\infty } e ^ { - x ^ { 2 } } d x = \\sqrt { \\pi }',
    simplified: '\\sqrt{\\pi}',
    tokens: [
      { token: '\\int', confidence: 99.4, x: 18, y: 50 },
      { token: '_', confidence: 98.1, x: 26, y: 72 },
      { token: '{-\\infty}', confidence: 96.7, x: 28, y: 80 },
      { token: '^', confidence: 98.4, x: 28, y: 22 },
      { token: '{\\infty}', confidence: 97.2, x: 30, y: 14 },
      { token: 'e', confidence: 99.6, x: 42, y: 50 },
      { token: '^', confidence: 99.1, x: 48, y: 38 },
      { token: '{-x^2}', confidence: 98.3, x: 54, y: 30 },
      { token: 'd', confidence: 99.5, x: 68, y: 50 },
      { token: 'x', confidence: 99.7, x: 74, y: 50 },
      { token: '=', confidence: 99.9, x: 82, y: 50 },
      { token: '\\sqrt{\\pi}', confidence: 98.8, x: 92, y: 50 },
    ],
    beamBranches: [
      { token: '\\int', score: 99.4, rank: 1 },
      { token: 'e', score: 99.6, rank: 2 },
      { token: '\\sqrt{\\cdot}', score: 98.8, rank: 3 },
      { token: '\\infty', score: 97.2, rank: 4 },
    ],
    svgPath:
      'M 25 15 C 22 25, 20 45, 22 70 C 24 85, 28 88, 30 85 M 18 80 L 32 80 M 38 48 C 36 38, 48 38, 48 48 C 48 58, 36 62, 50 62 M 60 32 L 66 22 M 72 20 C 72 20, 78 18, 76 26 C 74 32, 68 34, 76 34 M 90 35 L 90 62 M 84 48 C 84 40, 96 40, 96 48 L 96 62 M 106 42 L 118 62 M 118 42 L 106 62 M 130 48 L 146 48 M 130 56 L 146 56 M 158 52 L 164 62 L 172 35 L 198 35 M 178 52 C 178 44, 188 44, 188 52 L 188 62',
  },
  {
    id: 'einstein',
    title: 'Mass-Energy Equivalence',
    category: 'Relativity',
    latex: 'E = m c ^ { 2 }',
    simplified: 'c^{2} m',
    tokens: [
      { token: 'E', confidence: 99.8, x: 20, y: 50 },
      { token: '=', confidence: 99.9, x: 40, y: 50 },
      { token: 'm', confidence: 99.4, x: 60, y: 50 },
      { token: 'c', confidence: 98.9, x: 76, y: 50 },
      { token: '^', confidence: 99.2, x: 84, y: 36 },
      { token: '{2}', confidence: 99.7, x: 90, y: 28 },
    ],
    beamBranches: [
      { token: 'E', score: 99.8, rank: 1 },
      { token: '=', score: 99.9, rank: 2 },
      { token: 'm', score: 99.4, rank: 3 },
      { token: 'c', score: 98.9, rank: 4 },
    ],
    svgPath:
      'M 25 30 L 45 30 M 25 30 L 25 70 L 45 70 M 25 50 L 40 50 M 60 46 L 80 46 M 60 56 L 80 56 M 95 65 L 95 48 C 95 40, 105 40, 105 48 L 105 65 M 105 48 C 105 40, 115 40, 115 48 L 115 65 M 130 55 C 130 42, 145 42, 145 52 M 155 35 C 155 25, 168 25, 168 35 C 168 45, 155 50, 170 50',
  },
  {
    id: 'quadratic',
    title: 'Quadratic Formula',
    category: 'Algebra',
    latex: 'x = \\frac { - b \\pm \\sqrt { b ^ { 2 } - 4 a c } } { 2 a }',
    simplified: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    tokens: [
      { token: 'x', confidence: 99.8, x: 12, y: 50 },
      { token: '=', confidence: 99.9, x: 24, y: 50 },
      { token: '\\frac', confidence: 99.5, x: 60, y: 50 },
      { token: '-b', confidence: 98.7, x: 38, y: 32 },
      { token: '\\pm', confidence: 98.9, x: 48, y: 32 },
      { token: '\\sqrt', confidence: 99.1, x: 68, y: 32 },
      { token: 'b^2-4ac', confidence: 97.4, x: 80, y: 32 },
      { token: '2a', confidence: 99.3, x: 60, y: 72 },
    ],
    beamBranches: [
      { token: '\\frac', score: 99.5, rank: 1 },
      { token: '\\sqrt{\\cdot}', score: 99.1, rank: 2 },
      { token: '\\pm', score: 98.9, rank: 3 },
      { token: 'x', score: 99.8, rank: 4 },
    ],
    svgPath:
      'M 15 42 L 28 62 M 28 42 L 15 62 M 38 48 L 52 48 M 38 56 L 52 56 M 60 50 L 175 50 M 68 35 L 78 35 M 84 25 L 84 42 M 84 32 C 84 26, 94 26, 94 32 C 94 42, 84 42, 84 42 M 102 30 L 114 30 M 108 24 L 108 36 M 102 38 L 114 38 M 122 36 L 126 44 L 134 20 L 170 20 M 140 28 C 140 24, 148 24, 148 28 C 148 35, 140 38, 150 38 M 154 22 L 158 18 M 105 72 C 105 64, 115 64, 115 72 C 115 80, 105 84, 118 84 M 128 76 C 128 68, 138 68, 138 76 L 138 84',
  },
];

interface LiveNeuralPipelineProps {
  onOpenWorkspaceWithEquation?: (latex: string) => void;
}

export const LiveNeuralPipeline: React.FC<LiveNeuralPipelineProps> = ({
  onOpenWorkspaceWithEquation,
}) => {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [selectedEqId, setSelectedEqId] = useState('gaussian');
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredTokenIdx, setHoveredTokenIdx] = useState(0);
  const [showMorphologySplit, setShowMorphologySplit] = useState(false);

  const activeEquation =
    EQUATIONS.find((e) => e.id === selectedEqId) || EQUATIONS[0];
  const activeStage = PIPELINE_STAGES[activeStageIdx];

  // Auto-tour progression across the 6 pipeline stages
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStageIdx((prev) => (prev >= PIPELINE_STAGES.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const { html: renderedLatex } = renderLatexToHtml(activeEquation.latex, true);

  return (
    <div className="w-full max-w-7xl mx-auto my-12 relative select-none">
      {/* Dynamic ambient lighting that transitions with the stage color */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] blur-[160px] rounded-full pointer-events-none transition-colors duration-1000 -z-10"
        style={{ backgroundColor: `${activeStage.color}15` }}
      />

      {/* Top Header: Monospace tag, Equation Switcher & Auto-Play Controls */}
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#252D3B]/60"
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: activeStage.color }}
            />
            <span className="text-xs font-mono uppercase tracking-wider text-[#8B7CFF] font-bold">
              Neural Processing Timeline • Stage {activeStage.num} of 06
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-[#F1F5F9] mt-1">
            {activeStage.name}
          </h3>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            {activeStage.description}
          </p>
        </div>

        {/* Equation Switcher & Play / Pause Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Equation Selector */}
          <div className="flex items-center p-1 rounded-2xl bg-[#10141D] border border-[#252D3B]">
            {EQUATIONS.map((eq) => (
              <button
                key={eq.id}
                onClick={() => {
                  setSelectedEqId(eq.id);
                  setHoveredTokenIdx(0);
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-mono font-medium rounded-xl transition-all',
                  selectedEqId === eq.id
                    ? 'bg-[#1E2536] text-[#F1F5F9] font-bold shadow-subtle'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                )}
              >
                {eq.title}
              </button>
            ))}
          </div>

          {/* Auto-Play Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-2xl bg-[#10141D] border border-[#252D3B] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#8B7CFF]/50 transition-colors"
            title={isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-[#8B7CFF]" />
            ) : (
              <Play className="w-4 h-4 text-[#38BDF8]" />
            )}
          </button>
        </div>
      </motion.div>

      {/* 6-Stage Interconnected Stepper Scrubber */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10"
      >
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = activeStageIdx === idx;
          const isPassed = activeStageIdx > idx;

          return (
            <motion.button
              variants={staggerItemVariants}
              key={stage.id}
              onClick={() => {
                setActiveStageIdx(idx);
                setIsPlaying(false);
              }}
              className={cn(
                'flex flex-col p-4 rounded-2xl border text-left transition-all relative overflow-hidden group',
                isActive
                  ? 'bg-[#151B27] border-[#8B7CFF] shadow-glow-accent scale-[1.03]'
                  : isPassed
                  ? 'bg-[#10141D]/90 border-[#252D3B] text-[#94A3B8] hover:border-[#8B7CFF]/40'
                  : 'bg-[#10141D]/40 border-[#252D3B]/60 text-[#64748B] hover:border-[#252D3B]'
              )}
            >
              {/* Illuminated Top Progress Line */}
              {isActive && (
                <motion.div
                  layoutId="pipeline-active-indicator"
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B7CFF] via-[#38BDF8] to-[#34D399]"
                />
              )}

              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                    isActive
                      ? 'bg-[#8B7CFF] text-white'
                      : isPassed
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-[#1E2536] text-[#64748B]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#64748B]">
                  {stage.num}
                </span>
              </div>

              <span
                className={cn(
                  'text-xs font-bold truncate',
                  isActive ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
                )}
              >
                {stage.name}
              </span>
              <span className="text-[10px] text-[#64748B] truncate mt-0.5 font-mono">
                {stage.technicalSub}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Main Interactive Stage Display Viewport (Edge-to-Edge Open Stage) */}
      <div className="rounded-3xl bg-[#090B10] border border-[#252D3B] p-8 sm:p-12 relative min-h-[420px] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Subtle Scientific Coordinate Grids */}
        <div className="absolute inset-0 hero-science-grid opacity-30 pointer-events-none" />

        <AnimatePresence mode="wait">
          {/* Stage 1: Raw Handwritten Ink */}
          {activeStageIdx === 0 && (
            <motion.div
              key="stage-0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center flex-1 py-4 relative z-10 text-center"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30">
                  Input: 120Hz Stroke Dynamics
                </span>
                <button
                  onClick={() => setShowMorphologySplit(!showMorphologySplit)}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-[#1E2536] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#252D3B] transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{showMorphologySplit ? 'Hide Shadow Filter' : 'Show 31×31 Shadow Division'}</span>
                </button>
              </div>

              {/* Animated Handwritten SVG Ink Trace */}
              <div className="w-full max-w-2xl h-44 rounded-2xl bg-[#10141D] border border-[#252D3B] p-6 flex items-center justify-center relative shadow-inner">
                {showMorphologySplit && (
                  <div className="absolute inset-0 bg-amber-500/05 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <span className="text-[11px] font-mono text-amber-400 bg-[#090B10]/80 px-3 py-1 rounded-full border border-amber-500/30">
                      Gaussian Background Filter Active (Paper Grain Removed)
                    </span>
                  </div>
                )}
                <svg
                  viewBox="0 0 220 100"
                  className="w-full h-full stroke-[#F1F5F9] fill-none stroke-[2.8] stroke-linecap-round stroke-linejoin-round"
                >
                  <motion.path
                    d={activeEquation.svgPath}
                    initial={{ pathLength: 0 } as any}
                    animate={{ pathLength: 1 } as any}
                    transition={{ duration: 2.8, ease: 'easeInOut' }}
                  />
                </svg>
              </div>

              <p className="text-xs text-[#94A3B8] max-w-lg mt-6 leading-relaxed">
                Captures continuous pen coordinates $(x_t, y_t)$ and applies morphological Gaussian division to cancel shadows, ruled blue lines, and camera lens vignetting.
              </p>
            </motion.div>
          )}

          {/* Stage 2: DenseNet-121 Feature Field */}
          {activeStageIdx === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center flex-1 py-4 relative z-10 text-center"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                  Feature Tensor: (B, 256, H/8, W/8)
                </span>
                <span className="text-xs font-mono text-[#64748B]">4 Dense Blocks • 121 Layers</span>
              </div>

              {/* Convolution Feature Heatmap Matrix */}
              <div className="w-full max-w-2xl h-44 rounded-2xl bg-[#10141D] border border-[#252D3B] p-4 flex items-center justify-center relative overflow-hidden">
                {/* Horizontal scanning sweep line */}
                <motion.div
                  animate={{ x: [-280, 280] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#38BDF8] to-transparent shadow-[0_0_20px_#38BDF8] z-20 pointer-events-none"
                />

                <div className="grid grid-cols-16 gap-1 w-full h-full relative z-10">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const alpha = ((i * 23) % 100) / 100;
                    return (
                      <div
                        key={i}
                        className="rounded-sm transition-colors duration-700"
                        style={{
                          backgroundColor: `rgba(56, 189, 248, ${alpha * 0.45 + 0.05})`,
                          border: `1px solid rgba(56, 189, 248, ${alpha * 0.3})`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] max-w-lg mt-6 leading-relaxed">
                Stride-8 convolutional pooling extracts fine multi-scale stroke boundaries into dense 256-dimensional feature representations, ready for cross-attention decoding.
              </p>
            </motion.div>
          )}

          {/* Stage 3: Transformer Encoder-Decoder */}
          {activeStageIdx === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center flex-1 py-4 relative z-10 text-center"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
                  Pre-LN 3-Layer Transformer Decoder
                </span>
                <span className="text-xs font-mono text-[#64748B]">8 Scaled Dot-Product Heads</span>
              </div>

              {/* Multi-Head Attention Flow Diagram */}
              <div className="w-full max-w-2xl h-44 rounded-2xl bg-[#10141D] border border-[#252D3B] p-6 flex items-center justify-around relative">
                {['Head 1 (Limits)', 'Head 2 (Radicals)', 'Head 3 (Exponents)', 'Head 4 (Fractions)'].map(
                  (head, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center p-3 rounded-xl bg-[#090B10] border border-[#252D3B] text-center"
                    >
                      <BrainCircuit className="w-6 h-6 text-[#34D399] mb-2 animate-pulse" />
                      <span className="text-xs font-bold text-[#F1F5F9]">{head}</span>
                      <span className="text-[10px] font-mono text-[#64748B] mt-1">Cross-Attn (Q, K, V)</span>
                    </div>
                  )
                )}
              </div>

              <p className="text-xs text-[#94A3B8] max-w-lg mt-6 leading-relaxed">
                Pre-LN architecture guarantees stable gradient propagation, allowing 8 cross-attention heads to specialize simultaneously in fraction bars, exponents, and operator scopes.
              </p>
            </motion.div>
          )}

          {/* Stage 4: Cross-Attention Spatial Grounding */}
          {activeStageIdx === 3 && (
            <motion.div
              key="stage-3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center flex-1 py-4 relative z-10 text-center"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-amber-400/15 text-amber-400 border border-amber-400/30">
                  Spatial Attention Reticle Coordinates
                </span>
                <span className="text-xs font-mono text-[#64748B]">Click symbol to focus reticle</span>
              </div>

              {/* Canvas Overlay with Interactive Reticles */}
              <div className="w-full max-w-2xl h-48 rounded-2xl bg-[#10141D] border border-[#252D3B] p-6 relative flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="0 0 220 100"
                  className="w-full h-full stroke-[#64748B]/40 fill-none stroke-[2]"
                >
                  <path d={activeEquation.svgPath} />
                </svg>

                {activeEquation.tokens.map((tok, idx) => {
                  const isHovered = hoveredTokenIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setHoveredTokenIdx(idx)}
                      className={cn(
                        'absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300',
                        isHovered ? 'scale-125 z-20' : 'hover:scale-110 opacity-70 z-10'
                      )}
                      style={{ left: `${tok.x}%`, top: `${tok.y}%` }}
                    >
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border',
                          isHovered
                            ? 'bg-amber-400 text-[#090B10] border-white shadow-[0_0_15px_#F59E0B]'
                            : 'bg-[#151B27] text-amber-400 border-amber-400/50'
                        )}
                      >
                        {tok.token.slice(0, 2)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs font-mono text-amber-400">
                <span>
                  Target Symbol: <strong>{activeEquation.tokens[hoveredTokenIdx]?.token}</strong>
                </span>
                <span>•</span>
                <span>
                  Confidence: {activeEquation.tokens[hoveredTokenIdx]?.confidence}%
                </span>
              </div>
            </motion.div>
          )}

          {/* Stage 5: Beam Search Decoding */}
          {activeStageIdx === 4 && (
            <motion.div
              key="stage-4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center flex-1 py-4 relative z-10 text-center"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-pink-500/15 text-pink-400 border border-pink-500/30">
                  Length-Normalized Beam Search (Width = 3)
                </span>
                <span className="text-xs font-mono text-[#64748B]">132 Atomic Token Space</span>
              </div>

              {/* Beam Exploration Candidates */}
              <div className="w-full max-w-2xl grid grid-cols-2 gap-3">
                {activeEquation.beamBranches.map((branch, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-[#10141D] border border-[#252D3B] flex items-center justify-between shadow-subtle hover:border-pink-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#F1F5F9] bg-[#1E2536] px-2.5 py-1 rounded-lg">
                        {branch.token}
                      </span>
                      <span className="text-[11px] text-[#64748B]">Candidate {branch.rank}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[#1E2536] overflow-hidden">
                        <div
                          className="h-full bg-pink-500 rounded-full"
                          style={{ width: `${branch.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-pink-400 font-bold">
                        {branch.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#94A3B8] max-w-lg mt-6 leading-relaxed">
                Prevents premature greedy mistakes on complex nested symbols like square roots, summation bounds, and multi-term fraction denominators.
              </p>
            </motion.div>
          )}

          {/* Stage 6: SymPy & LaTeX Synthesis */}
          {activeStageIdx === 5 && (
            <motion.div
              key="stage-5"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center flex-1 py-4 relative z-10 text-center"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SymPy 1.13 CAS & KaTeX Precision Render
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Syntactically Balanced
                </span>
              </div>

              {/* KaTeX Live Precision Render Box */}
              <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#10141D] border border-[#252D3B] text-center shadow-2xl relative overflow-x-auto max-w-full">
                <div
                  className="font-math text-[#F1F5F9] text-xl sm:text-2xl md:text-3xl lg:text-4xl max-w-full overflow-x-auto py-2"
                  dangerouslySetInnerHTML={{ __html: renderedLatex }}
                />

                <div className="mt-5 pt-4 border-t border-[#252D3B]/70 flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>SymPy Canonical Simplification:</span>
                  <code className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {activeEquation.simplified}
                  </code>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => onOpenWorkspaceWithEquation?.(activeEquation.latex)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8B7CFF] text-white text-xs font-semibold hover:bg-[#7A6AE6] transition-colors shadow-glow-accent"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect in Studio Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Technical Status Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-[#252D3B]/60 text-xs text-[#64748B] relative z-10">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeStage.color }}
            />
            <span className="font-semibold text-[#94A3B8]">{activeStage.name}:</span>
            <span>{activeStage.technicalSub}</span>
          </div>

          <span className="font-mono text-[#8B7CFF] font-bold hidden sm:inline">
            Stage {activeStage.num} / 06
          </span>
        </div>
      </div>
    </div>
  );
};
