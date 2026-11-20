import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Cpu,
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
  Layers,
} from 'lucide-react';
import { renderLatexToHtml } from '../../utils/latex';
import { cn } from '../../utils/cn';

interface JourneyStep {
  id: string;
  number: number;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  color: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 'ink',
    number: 1,
    title: 'Digital Ink & Stroke Geometry',
    shortDesc: 'Captures pen trajectory or extracts handwritten ink from notebook photo.',
    icon: PenTool,
    tag: 'Input Acquisition',
    color: '#8B7CFF',
  },
  {
    id: 'densenet',
    number: 2,
    title: 'DenseNet-121 Feature Maps',
    shortDesc: 'Stride-8 CNN extracts 256-dim multi-scale visual features and spatial grids.',
    icon: Cpu,
    tag: 'Feature Extraction',
    color: '#38BDF8',
  },
  {
    id: 'attention',
    number: 3,
    title: 'Cross-Attention Grounding',
    shortDesc: 'Transformer decoder heads compute 2D spatial attention coordinates per symbol.',
    icon: Crosshair,
    tag: 'Spatial Alignment',
    color: '#34D399',
  },
  {
    id: 'beam',
    number: 4,
    title: 'Beam Search Token Decoding',
    shortDesc: 'Greedy & beam width-3 exploration over 132 atomic LaTeX vocabulary tokens.',
    icon: Binary,
    tag: 'Sequence Prediction',
    color: '#F59E0B',
  },
  {
    id: 'sympy',
    number: 5,
    title: 'SymPy & KaTeX Verification',
    shortDesc: 'Computer Algebra System parses expression tree and renders verified LaTeX.',
    icon: ShieldCheck,
    tag: 'Algebraic Verification',
    color: '#10B981',
  },
];

interface DemoEquation {
  id: string;
  name: string;
  category: string;
  latex: string;
  simplified: string;
  tokens: { token: string; confidence: number; x: number; y: number }[];
  beamCandidates: { token: string; prob: number }[];
  handwrittenSvgPath: string;
}

const DEMO_EQUATIONS: DemoEquation[] = [
  {
    id: 'gaussian',
    name: 'Gaussian Integral',
    category: 'Calculus',
    latex: '\\int _ { - \\infty } ^ { \\infty } e ^ { - x ^ { 2 } } d x = \\sqrt { \\pi }',
    simplified: '\\sqrt{\\pi}',
    tokens: [
      { token: '\\int', confidence: 99.4, x: 18, y: 50 },
      { token: '_', confidence: 98.1, x: 26, y: 72 },
      { token: '{-\\infty}', confidence: 96.7, x: 28, y: 78 },
      { token: '^', confidence: 98.4, x: 28, y: 22 },
      { token: '{\\infty}', confidence: 97.2, x: 30, y: 16 },
      { token: 'e', confidence: 99.6, x: 42, y: 50 },
      { token: '^', confidence: 99.1, x: 48, y: 38 },
      { token: '{-x^2}', confidence: 98.3, x: 54, y: 32 },
      { token: 'd', confidence: 99.5, x: 68, y: 50 },
      { token: 'x', confidence: 99.7, x: 74, y: 50 },
      { token: '=', confidence: 99.9, x: 82, y: 50 },
      { token: '\\sqrt{\\pi}', confidence: 98.8, x: 92, y: 50 },
    ],
    beamCandidates: [
      { token: '\\int', prob: 99.4 },
      { token: 'e', prob: 99.6 },
      { token: '\\sqrt{\\cdot}', prob: 98.8 },
      { token: '\\infty', prob: 97.2 },
    ],
    handwrittenSvgPath:
      'M 25 15 C 22 25, 20 45, 22 70 C 24 85, 28 88, 30 85 M 18 80 L 32 80 M 38 48 C 36 38, 48 38, 48 48 C 48 58, 36 62, 50 62 M 60 32 L 66 22 M 72 20 C 72 20, 78 18, 76 26 C 74 32, 68 34, 76 34 M 90 35 L 90 62 M 84 48 C 84 40, 96 40, 96 48 L 96 62 M 106 42 L 118 62 M 118 42 L 106 62 M 130 48 L 146 48 M 130 56 L 146 56 M 158 52 L 164 62 L 172 35 L 198 35 M 178 52 C 178 44, 188 44, 188 52 L 188 62',
  },
  {
    id: 'einstein',
    name: 'Mass-Energy Equivalence',
    category: 'Relativity',
    latex: 'E = m c ^ { 2 }',
    simplified: 'c^{2} m',
    tokens: [
      { token: 'E', confidence: 99.8, x: 22, y: 50 },
      { token: '=', confidence: 99.9, x: 42, y: 50 },
      { token: 'm', confidence: 99.4, x: 60, y: 50 },
      { token: 'c', confidence: 98.9, x: 76, y: 50 },
      { token: '^', confidence: 99.2, x: 84, y: 36 },
      { token: '{2}', confidence: 99.7, x: 90, y: 30 },
    ],
    beamCandidates: [
      { token: 'E', prob: 99.8 },
      { token: '=', prob: 99.9 },
      { token: 'm', prob: 99.4 },
      { token: 'c', prob: 98.9 },
    ],
    handwrittenSvgPath:
      'M 25 30 L 45 30 M 25 30 L 25 70 L 45 70 M 25 50 L 40 50 M 60 46 L 80 46 M 60 56 L 80 56 M 95 65 L 95 48 C 95 40, 105 40, 105 48 L 105 65 M 105 48 C 105 40, 115 40, 115 48 L 115 65 M 130 55 C 130 42, 145 42, 145 52 M 155 35 C 155 25, 168 25, 168 35 C 168 45, 155 50, 170 50',
  },
  {
    id: 'quadratic',
    name: 'Quadratic Formula',
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
    beamCandidates: [
      { token: '\\frac', prob: 99.5 },
      { token: '\\sqrt{\\cdot}', prob: 99.1 },
      { token: '\\pm', prob: 98.9 },
      { token: 'x', prob: 99.8 },
    ],
    handwrittenSvgPath:
      'M 15 42 L 28 62 M 28 42 L 15 62 M 38 48 L 52 48 M 38 56 L 52 56 M 60 50 L 175 50 M 68 35 L 78 35 M 84 25 L 84 42 M 84 32 C 84 26, 94 26, 94 32 C 94 42, 84 42, 84 42 M 102 30 L 114 30 M 108 24 L 108 36 M 102 38 L 114 38 M 122 36 L 126 44 L 134 20 L 170 20 M 140 28 C 140 24, 148 24, 148 28 C 148 35, 140 38, 150 38 M 154 22 L 158 18 M 105 72 C 105 64, 115 64, 115 72 C 115 80, 105 84, 118 84 M 128 76 C 128 68, 138 68, 138 76 L 138 84',
  },
];

interface HeroTransformationJourneyProps {
  onLaunchWithEquation?: (latex: string) => void;
}

export const HeroTransformationJourney: React.FC<HeroTransformationJourneyProps> = ({
  onLaunchWithEquation,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedEqId, setSelectedEqId] = useState('gaussian');
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);

  const activeEquation =
    DEMO_EQUATIONS.find((e) => e.id === selectedEqId) || DEMO_EQUATIONS[0];

  // Auto-play timer through the 5 steps
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 4200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentStepData = JOURNEY_STEPS.find((s) => s.number === activeStep)!;
  const katexHtml = renderLatexToHtml(activeEquation.latex, true);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 relative">
      {/* Dynamic ambient background glow that shifts with active step */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] blur-[150px] rounded-full pointer-events-none transition-all duration-1000 -z-10"
        style={{
          backgroundColor: `${currentStepData.color}18`,
        }}
      />

      {/* Header bar: Title, equation tabs & auto-play toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#252D3B]/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B7CFF] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8B7CFF] font-semibold">
              Live Transformation Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] mt-1">
            From Freehand Ink to Algebraic Code
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Step through MathVision&apos;s 5-stage neural pipeline in real time.
          </p>
        </div>

        {/* Equation Tabs & Play/Pause */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Equation switcher */}
          <div className="flex items-center bg-[#090B10] p-1 rounded-xl border border-[#252D3B]">
            {DEMO_EQUATIONS.map((eq) => (
              <button
                key={eq.id}
                onClick={() => {
                  setSelectedEqId(eq.id);
                  setSelectedTokenIdx(0);
                }}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  selectedEqId === eq.id
                    ? 'bg-[#1E2536] text-[#F1F5F9] shadow-subtle'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                )}
              >
                {eq.name}
              </button>
            ))}
          </div>

          {/* Auto play toggle button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-[#090B10] border border-[#252D3B] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#8B7CFF]/40 transition-colors"
            title={isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-[#8B7CFF]" />
            ) : (
              <Play className="w-4 h-4 text-[#38BDF8]" />
            )}
          </button>
        </div>
      </div>

      {/* 5-Step Pipeline Progress Scrubber */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-6">
        {JOURNEY_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.number;
          const isPassed = activeStep > step.number;

          return (
            <button
              key={step.id}
              onClick={() => {
                setActiveStep(step.number);
                setIsPlaying(false);
              }}
              className={cn(
                'flex flex-col p-3 rounded-2xl border text-left transition-all relative overflow-hidden group',
                isActive
                  ? 'bg-[#151B27] border-[#8B7CFF] shadow-glow-accent/20 scale-[1.02]'
                  : isPassed
                  ? 'bg-[#090B10]/80 border-[#252D3B] text-[#94A3B8] hover:border-[#8B7CFF]/40'
                  : 'bg-[#090B10]/40 border-[#252D3B]/60 text-[#64748B] hover:border-[#252D3B]'
              )}
            >
              {/* Active top line */}
              {isActive && (
                <motion.div
                  layoutId="step-indicator"
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B7CFF] to-[#38BDF8]"
                />
              )}

              <div className="flex items-center justify-between mb-2">
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                    isActive
                      ? 'bg-[#8B7CFF] text-white'
                      : isPassed
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-[#1E2536] text-[#64748B]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono text-[#64748B]">
                  0{step.number}
                </span>
              </div>

              <span
                className={cn(
                  'text-xs font-semibold truncate',
                  isActive ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
                )}
              >
                {step.title.split(' ')[0]} {step.title.split(' ')[1] || ''}
              </span>
              <span className="text-[10px] text-[#64748B] truncate mt-0.5">
                {step.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Visualization Canvas Box */}
      <div className="rounded-2xl bg-[#090B10] border border-[#252D3B] p-6 relative min-h-[300px] flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Subtle coordinate grid lines */}
        <div className="absolute inset-0 hero-science-grid opacity-40 pointer-events-none" />

        {/* Content depending on active step */}
        <AnimatePresence mode="wait">
          {activeStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center flex-1 py-8 relative z-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30">
                  Raw Ink Trajectory (x, y, t)
                </span>
                <span className="text-xs text-[#64748B]">120 Hz Bezier sampling</span>
              </div>

              {/* Animated SVG Handwritten Stroke */}
              <div className="w-full max-w-lg h-28 bg-[#10141D] rounded-xl border border-[#252D3B] flex items-center justify-center p-4 relative shadow-lg">
                <svg
                  viewBox="0 0 220 100"
                  className="w-full h-full stroke-[#F1F5F9] fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round"
                >
                  <motion.path
                    d={activeEquation.handwrittenSvgPath}
                    initial={{ pathLength: 0 } as any}
                    animate={{ pathLength: 1 } as any}
                    transition={{ duration: 2.2, ease: 'easeInOut' }}
                  />
                </svg>
                {/* Floating pen tip cursor */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                  className="absolute w-3 h-3 rounded-full bg-[#8B7CFF] border-2 border-white shadow-glow-accent pointer-events-none"
                />
              </div>

              <p className="text-xs text-[#94A3B8] text-center max-w-md mt-4">
                Morphological background division removes paper grain, lighting gradients, and camera vignetting before feeding into neural encoder.
              </p>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center flex-1 py-6 relative z-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                  DenseNet-121 Stride-8 Spatial Tensor
                </span>
                <span className="text-xs text-[#64748B]">256 Feature Channels</span>
              </div>

              {/* Feature Grid Heatmap simulation */}
              <div className="w-full max-w-lg h-32 rounded-xl bg-[#10141D] border border-[#252D3B] p-3 flex items-center justify-center gap-1.5 relative overflow-hidden">
                {/* Scanning sweep line */}
                <motion.div
                  animate={{ x: [-200, 200] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#38BDF8] to-transparent shadow-[0_0_15px_#38BDF8]"
                />

                <div className="grid grid-cols-12 gap-1 w-full h-full">
                  {Array.from({ length: 48 }).map((_, i) => {
                    const intensity = ((i * 17) % 100) / 100;
                    return (
                      <div
                        key={i}
                        className="rounded-sm transition-colors duration-500"
                        style={{
                          backgroundColor: `rgba(56, 189, 248, ${intensity * 0.4 + 0.05})`,
                          border: `1px solid rgba(56, 189, 248, ${intensity * 0.3})`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] text-center max-w-md mt-4">
                Continuous feature reuse across 4 dense blocks captures fine pen tips, horizontal fraction bars, and deep exponent relationships.
              </p>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center flex-1 py-6 relative z-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
                  Cross-Attention Spatial Grounding
                </span>
                <span className="text-xs text-[#64748B]">8 Multi-Head Decoders</span>
              </div>

              {/* Spatial Attention Overlay with interactive reticles */}
              <div className="w-full max-w-lg h-36 bg-[#10141D] rounded-xl border border-[#252D3B] p-4 relative flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="0 0 220 100"
                  className="w-full h-full stroke-[#64748B]/50 fill-none stroke-[2]"
                >
                  <path d={activeEquation.handwrittenSvgPath} />
                </svg>

                {/* Grounded token reticles */}
                {activeEquation.tokens.map((tok, idx) => {
                  const isSelected = selectedTokenIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedTokenIdx(idx)}
                      className={cn(
                        'absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300',
                        isSelected ? 'scale-125 z-20' : 'hover:scale-110 opacity-70 z-10'
                      )}
                      style={{ left: `${tok.x}%`, top: `${tok.y}%` }}
                    >
                      <span
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold border',
                          isSelected
                            ? 'bg-[#34D399] text-[#090B10] border-white shadow-[0_0_12px_#34D399]'
                            : 'bg-[#151B27] text-[#34D399] border-[#34D399]/50'
                        )}
                      >
                        {tok.token.slice(0, 2)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 mt-3 text-xs font-mono text-[#34D399]">
                <span>
                  Focused Symbol: <strong>{activeEquation.tokens[selectedTokenIdx]?.token}</strong>
                </span>
                <span>•</span>
                <span>
                  Confidence: {activeEquation.tokens[selectedTokenIdx]?.confidence}%
                </span>
              </div>
            </motion.div>
          )}

          {activeStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center flex-1 py-6 relative z-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-400/15 text-amber-400 border border-amber-400/30">
                  Beam Search Decoding (Width = 3)
                </span>
                <span className="text-xs text-[#64748B]">132 Atomic Token Space</span>
              </div>

              {/* Beam Candidates List */}
              <div className="w-full max-w-lg grid grid-cols-2 gap-2.5">
                {activeEquation.beamCandidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#10141D] border border-[#252D3B] flex items-center justify-between shadow-subtle hover:border-amber-400/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#F1F5F9] bg-[#1E2536] px-2 py-0.5 rounded">
                        {cand.token}
                      </span>
                      <span className="text-[10px] text-[#64748B]">Rank {idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 rounded-full bg-[#1E2536] overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${cand.prob}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-amber-400">
                        {cand.prob}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#94A3B8] text-center max-w-md mt-4">
                Prevents premature greedy error accumulation on complex nested sub-expressions like square roots and fractions.
              </p>
            </motion.div>
          )}

          {activeStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center flex-1 py-6 relative z-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SymPy 1.13 CAS & KaTeX Live Preview
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Syntactically Valid
                </span>
              </div>

              {/* KaTeX Live Render Box */}
              <div className="w-full max-w-lg p-5 rounded-2xl bg-[#10141D] border border-[#252D3B] text-center shadow-lg relative">
                <div
                  className="font-math text-[#F1F5F9] text-xl sm:text-2xl"
                  dangerouslySetInnerHTML={{ __html: katexHtml.html }}
                />

                <div className="mt-3 pt-3 border-t border-[#252D3B]/70 flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>SymPy Canonical Simplification:</span>
                  <code className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {activeEquation.simplified}
                  </code>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => onLaunchWithEquation?.(activeEquation.latex)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B7CFF] text-white text-xs font-semibold hover:bg-[#7A6AE6] transition-colors shadow-glow-accent"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect in Studio Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info pill */}
        <div className="flex items-center justify-between pt-4 border-t border-[#252D3B]/70 text-[11px] text-[#64748B] relative z-10">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentStepData.color }}
            />
            <span className="font-medium text-[#94A3B8]">
              {currentStepData.title}:
            </span>{' '}
            <span>{currentStepData.shortDesc}</span>
          </div>

          <span className="font-mono text-[#8B7CFF] shrink-0 hidden sm:inline">
            Step {activeStep} / 5
          </span>
        </div>
      </div>
    </div>
  );
};
