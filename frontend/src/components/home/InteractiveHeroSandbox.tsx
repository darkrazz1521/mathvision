import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pen,
  Eraser,
  Trash2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Code,
  Copy,
  Check,
  Eye,
  Sliders,
  Layers,
  Camera,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { DEMO_PRESETS, DemoPreset } from '../../services/demoData';
import { renderLatexToHtml } from '../../utils/latex';
import { predictEquation } from '../../services/api';
import { PredictResponse } from '../../types/api';
import { cn } from '../../utils/cn';

interface InteractiveHeroSandboxProps {
  onOpenInStudio: (presetOrLatex: DemoPreset | string) => void;
  isBackendConnected: boolean;
}

type SandboxMode = 'canvas' | 'attention' | 'photo-split';

const STARTER_SNIPPETS = [
  { label: 'Quadratic Roots', latex: '\\frac { - b \\pm \\sqrt { b ^ { 2 } - 4 a c } } { 2 a }' },
  { label: 'Pythagoras', latex: 'a ^ { 2 } + b ^ { 2 } = c ^ { 2 }' },
  { label: 'Gaussian Integral', latex: '\\int _ { - \\infty } ^ { \\infty } e ^ { - x ^ { 2 } } d x = \\sqrt { \\pi }' },
  { label: 'Euler Identity', latex: 'e ^ { i \\pi } + 1 = 0' },
  { label: 'Kinetic Energy', latex: 'E = \\frac { 1 } { 2 } m v ^ { 2 }' },
];

export const InteractiveHeroSandbox: React.FC<InteractiveHeroSandboxProps> = ({
  onOpenInStudio,
  isBackendConnected,
}) => {
  const [mode, setMode] = useState<SandboxMode>('canvas');

  // --- Mode 1: Live Drawing Canvas State ---
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [canvasPrediction, setCanvasPrediction] = useState<PredictResponse | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);

  // --- Mode 2: Attention Scrubber State ---
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [activeTokenIdx, setActiveTokenIdx] = useState(4); // default on \pm
  const activePreset = DEMO_PRESETS[selectedPresetIndex] || DEMO_PRESETS[0];

  // --- Mode 3: Photo Split Slider State ---
  const [splitPos, setSplitPos] = useState(52); // percentage
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Initialize mini canvas
  const initCanvas = useCallback(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Fill clean mathematical canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw subtle mathematical grid dots
    ctx.fillStyle = 'rgba(21, 27, 39, 0.08)';
    const spacing = 16;
    for (let x = spacing; x < rect.width; x += spacing) {
      for (let y = spacing; y < rect.height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  useEffect(() => {
    if (mode === 'canvas') {
      // Small timeout to allow element layout measurement
      const t = setTimeout(initCanvas, 50);
      return () => clearTimeout(t);
    }
  }, [mode, initCanvas]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'pen' ? 3.5 : 20;
    ctx.strokeStyle = tool === 'pen' ? '#090B10' : '#FFFFFF';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    initCanvas();
    setHasDrawn(false);
    setCanvasPrediction(null);
  };

  // Recognize canvas drawing using live API or smart demo fallback
  const handleRecognizeMiniCanvas = async () => {
    const canvas = miniCanvasRef.current;
    if (!canvas || !hasDrawn) return;

    setIsRecognizing(true);
    const d0 = performance.now();

    try {
      if (isBackendConnected) {
        // Create PNG blob and send to FastAPI
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png')
        );
        if (blob) {
          const res = await predictEquation({ file: blob, mode: 'canvas', beam_width: 3 });
          setCanvasPrediction(res);
          setIsRecognizing(false);
          return;
        }
      }

      // Offline / Fast preview mode fallback
      setTimeout(() => {
        const fallback = DEMO_PRESETS[0].response;
        setCanvasPrediction({
          ...fallback,
          latency_ms: Math.round(performance.now() - d0),
        });
        setIsRecognizing(false);
      }, 650);
    } catch (e) {
      console.error('Canvas recognition failed:', e);
      setIsRecognizing(false);
    }
  };

  // Load a starter snippet into canvas simulation
  const handleSelectSnippet = (snippet: { label: string; latex: string }) => {
    const matchingPreset = DEMO_PRESETS.find((p) => p.latex === snippet.latex) || DEMO_PRESETS[0];
    setCanvasPrediction(matchingPreset.response);
    setHasDrawn(true);
  };

  const handleCopy = (latexStr: string) => {
    navigator.clipboard.writeText(latexStr);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  // Mode 3: Split drag handling
  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(10, Math.min(90, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  // Render LaTeX for currently active token in Mode 2
  const activeToken = activePreset.response.tokens[activeTokenIdx] || activePreset.response.tokens[0];
  const { html: renderedPresetMath } = renderLatexToHtml(activePreset.latex, true);
  const { html: renderedCanvasMath } = canvasPrediction
    ? renderLatexToHtml(canvasPrediction.latex, true)
    : { html: '' };
  const { html: renderedQuadraticMath } = renderLatexToHtml('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', true);

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-[#10141D]/90 border border-[#252D3B] shadow-2xl backdrop-blur-2xl overflow-hidden relative">
      {/* Decorative Top Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#8B7CFF] via-[#38BDF8] to-[#34D399]" />

      {/* Header with Mode Switcher */}
      <div className="p-4 sm:p-6 border-b border-[#252D3B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">
              Interactive Mathematical Intelligence Sandbox
            </h3>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Test real-time handwriting recognition, token spatial attention, and shadow division
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-[#090B10] border border-[#252D3B] self-start sm:self-auto">
          <button
            onClick={() => setMode('canvas')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5',
              mode === 'canvas'
                ? 'bg-[#8B7CFF] text-white shadow-md font-semibold'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Live Draw</span>
          </button>

          <button
            onClick={() => setMode('attention')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5',
              mode === 'attention'
                ? 'bg-[#38BDF8] text-[#090B10] shadow-md font-semibold'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Attention Grounding</span>
          </button>

          <button
            onClick={() => setMode('photo-split')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5',
              mode === 'photo-split'
                ? 'bg-[#34D399] text-[#090B10] shadow-md font-semibold'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Paper Filter</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Content Body */}
      <div className="p-4 sm:p-6 min-h-[380px]">
        {/* ======================================================== */}
        {/* MODE 1: LIVE FREEHAND DRAWING CANVAS                     */}
        {/* ======================================================== */}
        {mode === 'canvas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Drawing Area (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Canvas Controls Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setTool('pen')}
                    className={cn(
                      'p-2 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1',
                      tool === 'pen'
                        ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF]/50'
                        : 'bg-[#151B27] text-[#94A3B8] border-[#252D3B] hover:text-[#F1F5F9]'
                    )}
                    title="Pen Tool"
                  >
                    <Pen className="w-3.5 h-3.5" />
                    <span>Pen</span>
                  </button>
                  <button
                    onClick={() => setTool('eraser')}
                    className={cn(
                      'p-2 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1',
                      tool === 'eraser'
                        ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF]/50'
                        : 'bg-[#151B27] text-[#94A3B8] border-[#252D3B] hover:text-[#F1F5F9]'
                    )}
                    title="Eraser Tool"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Eraser</span>
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="p-2 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-rose-400 bg-[#151B27] border border-[#252D3B] transition-colors"
                    title="Clear Canvas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[11px] text-[#94A3B8] font-mono hidden sm:inline">
                  Draw with mouse or stylus
                </span>
              </div>

              {/* HTML5 Canvas Drawing Surface */}
              <div className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden border-2 border-[#252D3B] shadow-inner bg-white cursor-crosshair">
                <canvas
                  ref={miniCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full block touch-none"
                />

                {!hasDrawn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
                    <Pen className="w-6 h-6 mb-1 opacity-40 animate-bounce" />
                    <span className="text-xs font-medium opacity-60">
                      Write any equation here (e.g. 3² + 4² = 5²)
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Preset Starters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[11px] text-[#94A3B8] shrink-0 mr-1">Or load template:</span>
                {STARTER_SNIPPETS.map((snip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSnippet(snip)}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[#151B27] border border-[#252D3B] text-[#94A3B8] hover:text-[#38BDF8] hover:border-[#38BDF8]/40 shrink-0 transition-colors"
                  >
                    {snip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Recognition Results (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-[#090B10] border border-[#252D3B]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#252D3B] mb-3">
                  <span className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8B7CFF]" />
                    AI Recognition Result
                  </span>
                  {canvasPrediction && (
                    <Badge variant="success" size="sm">
                      {(canvasPrediction.avg_confidence * 100).toFixed(1)}% Conf
                    </Badge>
                  )}
                </div>

                {/* Rendered Equation Box */}
                <div className="min-h-[100px] flex items-center justify-center p-3 rounded-xl bg-[#10141D] border border-[#252D3B]/70 overflow-x-auto">
                  {canvasPrediction ? (
                    <div
                      className="font-math text-[#F1F5F9] text-lg text-center"
                      dangerouslySetInnerHTML={{ __html: renderedCanvasMath }}
                    />
                  ) : (
                    <div className="text-center text-[#64748B] text-xs">
                      Draw an equation on the left and tap Recognize
                    </div>
                  )}
                </div>

                {/* Raw LaTeX Display & Copy */}
                {canvasPrediction && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#151B27] border border-[#252D3B] flex items-center justify-between text-xs">
                    <code className="text-[11px] font-mono text-[#38BDF8] truncate max-w-[200px]">
                      {canvasPrediction.latex}
                    </code>
                    <button
                      onClick={() => handleCopy(canvasPrediction.latex)}
                      className="p-1 rounded text-[#94A3B8] hover:text-white transition-colors"
                      title="Copy LaTeX"
                    >
                      {copiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRecognizeMiniCanvas}
                  disabled={!hasDrawn || isRecognizing}
                  icon={isRecognizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                >
                  {isRecognizing ? 'Processing Tensor...' : 'Recognize Equation'}
                </Button>

                {canvasPrediction && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenInStudio(canvasPrediction.latex)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Open in Full Studio IDE
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: ATTENTION GROUNDING RETICLE SCRUBBER             */}
        {/* ======================================================== */}
        {mode === 'attention' && (
          <div className="flex flex-col gap-6">
            {/* Expression Selector Header */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#252D3B]">
              <span className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wider shrink-0 mr-1">
                Select Formula:
              </span>
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetIndex(idx);
                    setActiveTokenIdx(0);
                  }}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border shrink-0',
                    selectedPresetIndex === idx
                      ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/50 font-semibold'
                      : 'bg-[#151B27] text-[#94A3B8] border-[#252D3B] hover:text-[#F1F5F9]'
                  )}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Rendered Equation with Clickable Token Scrubbers */}
            <div className="p-4 rounded-2xl bg-[#090B10] border border-[#252D3B] flex flex-col items-center">
              <span className="text-[11px] text-[#94A3B8] font-mono mb-2">
                Click any recognized token below to inspect its spatial attention reticle:
              </span>

              {/* Clickable Token Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-2xl py-2">
                {activePreset.response.tokens.map((tok, idx) => {
                  const isSelected = idx === activeTokenIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveTokenIdx(idx)}
                      className={cn(
                        'px-2.5 py-1 text-xs font-mono rounded-lg transition-all border',
                        isSelected
                          ? 'bg-[#8B7CFF] text-white border-[#8B7CFF] font-bold shadow-glow-accent scale-105'
                          : 'bg-[#151B27] text-[#94A3B8] border-[#252D3B] hover:border-[#8B7CFF]/50 hover:text-white'
                      )}
                    >
                      <span>{tok.token}</span>
                      <span className="text-[9px] opacity-75 ml-1">
                        {(tok.confidence * 100).toFixed(0)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cross-Attention Spatial Spotlight Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Feature Grid Visualizer with Moving Reticle (7 cols) */}
              <div className="md:col-span-7 p-4 rounded-2xl bg-[#090B10] border border-[#252D3B] flex flex-col items-center">
                <div className="flex items-center justify-between w-full text-xs text-[#94A3B8] mb-2 font-mono">
                  <span>Input Feature Canvas (H=96, W=padded)</span>
                  <span className="text-[#38BDF8]">
                    Reticle: x={(activeToken.x * 100).toFixed(1)}%, y={(activeToken.y * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="relative w-full max-w-lg rounded-xl overflow-hidden border border-[#252D3B] bg-white shadow-md">
                  <img
                    src={activePreset.response.preprocessed_image}
                    alt="Preprocessed feature map"
                    className="w-full h-auto block select-none"
                  />

                  {/* Dynamic Attention Reticle */}
                  <motion.div
                    animate={{
                      left: `${activeToken.x * 100}%`,
                      top: `${activeToken.y * 100}%`,
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    {/* Glowing circular spotlight ring */}
                    <div className="w-10 h-10 rounded-full border-2 border-[#8B7CFF] bg-[#8B7CFF]/20 shadow-[0_0_15px_#8B7CFF] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </div>
                    {/* Crosshair ticks */}
                    <div className="absolute top-1/2 -left-2 w-2 h-0.5 bg-[#8B7CFF]" />
                    <div className="absolute top-1/2 -right-2 w-2 h-0.5 bg-[#8B7CFF]" />
                    <div className="absolute -top-2 left-1/2 w-0.5 h-2 bg-[#8B7CFF]" />
                    <div className="absolute -bottom-2 left-1/2 w-0.5 h-2 bg-[#8B7CFF]" />
                  </motion.div>
                </div>
              </div>

              {/* Token Inspector & Alternatives (5 cols) */}
              <div className="md:col-span-5 p-4 rounded-2xl bg-[#151B27] border border-[#252D3B] flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#94A3B8]">Inspected Token:</span>
                    <Badge variant="accent" size="sm">
                      Symbol #{activeTokenIdx + 1}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090B10] border border-[#252D3B] flex items-center justify-between mb-3">
                    <code className="text-lg font-mono font-bold text-[#8B7CFF]">
                      {activeToken.token}
                    </code>
                    <span className="text-xs font-mono text-[#34D399]">
                      {(activeToken.confidence * 100).toFixed(1)}% Confidence
                    </span>
                  </div>

                  {/* Beam Search Alternatives */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#94A3B8] font-semibold block uppercase">
                      Top-3 Beam Search Alternatives:
                    </span>
                    {activeToken.alternatives && activeToken.alternatives.length > 0 ? (
                      activeToken.alternatives.map((alt, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#090B10] border border-[#252D3B] text-xs font-mono"
                        >
                          <span className="text-[#F1F5F9] font-bold">{alt.token}</span>
                          <span className="text-[#94A3B8]">{(((alt.prob ?? alt.confidence ?? 0)) * 100).toFixed(1)}%</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#64748B] italic">No high-probability alternatives</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#252D3B]">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => onOpenInStudio(activePreset)}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Open with Explainability in Studio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 3: PHOTO BINARIZATION COMPARISON SLIDER             */}
        {/* ======================================================== */}
        {mode === 'photo-split' && (
          <div className="flex flex-col items-center">
            <div className="max-w-xl text-center mb-4">
              <span className="text-xs text-[#34D399] font-mono font-semibold">
                Morphological Background Division & Adaptive Binarization
              </span>
              <p className="text-xs text-[#94A3B8] mt-1">
                Drag the slider below to compare raw notebook camera photography (with blue ruled lines and uneven shadows) against MathVision's binarized ink stroke extraction.
              </p>
            </div>

            {/* Split Comparison Container */}
            <div
              ref={splitContainerRef}
              onMouseMove={handleSplitMouseMove}
              onMouseDown={() => setIsDraggingSplit(true)}
              onMouseUp={() => setIsDraggingSplit(false)}
              onMouseLeave={() => setIsDraggingSplit(false)}
              className="relative w-full max-w-2xl h-64 rounded-2xl overflow-hidden border-2 border-[#252D3B] shadow-2xl cursor-ew-resize select-none"
            >
              {/* Right Side: Clean Binarized Model Input */}
              <div className="absolute inset-0 bg-[#FFFFFF] flex items-center justify-center p-4">
                <div className="text-center max-w-full overflow-hidden px-4">
                  <div
                    className="font-math text-2xl sm:text-3xl md:text-4xl text-[#090B10] font-bold tracking-normal"
                    dangerouslySetInnerHTML={{ __html: renderedQuadraticMath }}
                  />
                  <span className="absolute bottom-3 right-3 text-[11px] font-mono px-2 py-0.5 rounded bg-black/80 text-[#34D399]">
                    After: Isolated Ink (DenseNet-Ready)
                  </span>
                </div>
              </div>

              {/* Left Side: Raw Notebook Photo with Ruled Lines & Shadows */}
              <div
                style={{ width: `${splitPos}%` }}
                className="absolute inset-y-0 left-0 bg-[#E2E8F0] overflow-hidden border-r-2 border-[#8B7CFF] shadow-[4px_0_15px_rgba(0,0,0,0.4)]"
              >
                {/* Simulated ruled paper background & shadow gradient */}
                <div className="absolute inset-0 canvas-ruled-paper opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/15 via-transparent to-slate-900/25 pointer-events-none" />

                <div className="w-[640px] max-w-none h-full flex items-center justify-start pl-8 relative">
                  <div
                    className="font-math text-2xl sm:text-3xl md:text-4xl text-[#1E293B] font-bold tracking-normal opacity-90 filter blur-[0.3px]"
                    dangerouslySetInnerHTML={{ __html: renderedQuadraticMath }}
                  />
                  <span className="absolute bottom-3 left-3 text-[11px] font-mono px-2 py-0.5 rounded bg-black/80 text-amber-300">
                    Before: Notebook Photo (Shadows & Ruled Lines)
                  </span>
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div
                style={{ left: `${splitPos}%` }}
                className="absolute top-0 bottom-0 -translate-x-1/2 w-8 flex items-center justify-center pointer-events-none"
              >
                <div className="w-7 h-7 rounded-full bg-[#8B7CFF] text-[#090B10] flex items-center justify-center shadow-lg border-2 border-white">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Explanatory Technical Pill Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-4">
              <div className="p-2.5 rounded-xl bg-[#090B10] border border-[#252D3B] text-center">
                <span className="text-[11px] text-[#8B7CFF] font-semibold block">Gaussian Blur (31x31)</span>
                <span className="text-[10px] text-[#94A3B8]">Estimates uneven background illumination</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#090B10] border border-[#252D3B] text-center">
                <span className="text-[11px] text-[#38BDF8] font-semibold block">cv2.divide() Division</span>
                <span className="text-[10px] text-[#94A3B8]">Cancels shadows and paper yellowness</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#090B10] border border-[#252D3B] text-center">
                <span className="text-[11px] text-[#34D399] font-semibold block">Adaptive Threshold</span>
                <span className="text-[10px] text-[#94A3B8]">Isolates dark ink from faint blue rules</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
