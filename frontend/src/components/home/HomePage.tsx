import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Pen,
  Camera,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Layers,
  BarChart2,
  CheckCircle2,
  Code,
  HardDrive,
  Activity,
  Server,
  BookOpen,
  Keyboard,
  ExternalLink,
  Smartphone,
  ChevronDown,
  Sliders,
  Check,
  HelpCircle,
  FileText,
  Terminal,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { DEMO_PRESETS, DemoPreset } from '../../services/demoData';
import { MathConstellation } from './MathConstellation';
import { InteractiveHeroSandbox } from './InteractiveHeroSandbox';
import { VocabularyExplorer } from './VocabularyExplorer';
import { MobileQrModal } from '../upload/MobileQrModal';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';

interface HomePageProps {
  onLaunchWorkspace: () => void;
  onLoadPreset: (preset: DemoPreset) => void;
  isBackendConnected: boolean;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
  onOpenModelSpecs: () => void;
  onOpenShortcuts: () => void;
}

const FAQS = [
  {
    q: 'How does MathVision handle messy or distorted handwriting?',
    a: 'MathVision utilizes a DenseNet-121 convolutional backbone with stride-8 downsampling. This dense feature connectivity preserves fine-grained stroke trajectories even when lines overlap or handwriting slants. The Transformer decoder then applies beam search with a width of 3 to evaluate competing token sequences.',
  },
  {
    q: 'Can it recognize real notebook photographs with shadows and ruled lines?',
    a: 'Yes. In photograph mode, MathVision performs morphological Gaussian background division (using a 31×31 kernel) to compute the ambient illumination gradient. By dividing the raw image by this background estimate and applying adaptive Gaussian thresholding, paper grain, shadows, and light blue ruled lines are canceled out before tensor normalization.',
  },
  {
    q: 'What is Cross-Attention Spatial Grounding?',
    a: 'Unlike opaque "black-box" OCR tools, MathVision captures the cross-attention weights between decoder queries and the encoder spatial grid. For every generated LaTeX token (e.g., \\int, \\sqrt, \\pm), MathVision computes the peak coordinates on the input image, allowing users to visually inspect and verify what the model was looking at.',
  },
  {
    q: 'Why is SymPy computer algebra integration important?',
    a: 'Syntactic validity only guarantees that curly braces and LaTeX tags are balanced. SymPy builds an actual Computer Algebra System (CAS) expression tree to verify mathematical consistency and generate canonically simplified forms side-by-side.',
  },
  {
    q: 'What is the footprint and latency of the model?',
    a: 'The combined encoder and decoder models are quantized to INT8 ONNX and occupy only 12.82 MB on disk. Inference runs in approximately 120 ms on standard multi-core consumer CPUs without requiring a dedicated GPU.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  onLaunchWorkspace,
  onLoadPreset,
  isBackendConnected,
  onOpenSettings,
  onOpenDocs,
  onOpenModelSpecs,
  onOpenShortcuts,
}) => {
  const { success } = useToast();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handlePhotoFromPhone = (dataUrl: string, filename: string) => {
    success('Photo Received from Phone', 'Transferring directly to studio workspace for recognition.');
    setTimeout(() => {
      onLaunchWorkspace();
    }, 800);
  };

  const handleOpenSandboxItem = (item: DemoPreset | string) => {
    if (typeof item === 'string') {
      const match = DEMO_PRESETS.find((p) => p.latex === item);
      if (match) {
        onLoadPreset(match);
      } else {
        onLaunchWorkspace();
      }
    } else {
      onLoadPreset(item);
    }
  };

  return (
    <div className="relative min-h-screen w-full color-grade-bg text-[#F1F5F9] overflow-y-auto selection:bg-[#8B7CFF]/30 selection:text-white">
      {/* 1. Background Interactive Mathematical Constellation */}
      <MathConstellation />

      {/* Floating Ambient Aura Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#8B7CFF]/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-10 w-[600px] h-[400px] bg-[#38BDF8]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[1600px] left-10 w-[550px] h-[450px] bg-[#34D399]/10 blur-[160px] rounded-full pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* 2. TOP STICKY NAVIGATION BAR                            */}
      {/* ======================================================== */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090B10]/85 border-b border-[#252D3B]/70 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-subtle">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="relative">
            <img
              src="/logo.svg"
              alt="MathVision Logo"
              className="w-8 h-8 rounded-lg shadow-glow-accent group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#34D399] border-2 border-[#090B10]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-[#F1F5F9]">
              MathVision
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/40">
              v2.0 HMER
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-[#94A3B8]">
          <a href="#interactive-sandbox" className="hover:text-[#F1F5F9] transition-colors">
            Live Sandbox
          </a>
          <a href="#architecture" className="hover:text-[#F1F5F9] transition-colors">
            Neural Pipeline
          </a>
          <a href="#explainability" className="hover:text-[#F1F5F9] transition-colors">
            Spatial Grounding
          </a>
          <a href="#benchmarks" className="hover:text-[#F1F5F9] transition-colors">
            CROHME-23 Metrics
          </a>
          <a href="#vocabulary" className="hover:text-[#F1F5F9] transition-colors">
            132-Token Vocab
          </a>
          <a href="#faq" className="hover:text-[#F1F5F9] transition-colors">
            Architecture FAQ
          </a>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* FastAPI Render Live Status Pill */}
          <button
            onClick={onOpenSettings}
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
              isBackendConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            )}
            title="FastAPI Inference Server Status (Click to configure)"
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              )}
            />
            <span>{isBackendConnected ? 'Render Online' : 'Simulation Mode'}</span>
          </button>

          {/* Quick Phone Camera QR Trigger */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151B27] border border-[#252D3B] text-xs font-medium text-[#38BDF8] hover:border-[#38BDF8]/50 hover:bg-[#1E2536] transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Scan Phone QR</span>
          </button>

          {/* Enter Studio Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onLaunchWorkspace}
            icon={<Sparkles className="w-4 h-4 text-white" />}
          >
            Enter Studio
          </Button>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 3. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center">
        {/* Subtle Pill Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151B27]/90 border border-[#8B7CFF]/40 text-[#8B7CFF] text-xs font-mono mb-6 shadow-glow-accent/30 backdrop-blur-md"
        >
          <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>DenseNet-121 Encoder • 3-Layer Pre-LN Transformer • 12.82 MB Model</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-[#F1F5F9] max-w-5xl leading-[1.08]"
        >
          Handwritten Mathematics, Converted into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B7CFF] via-[#38BDF8] to-[#34D399]">
            Living, Verified LaTeX.
          </span>
        </motion.h1>

        {/* Subhead description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-[#94A3B8] max-w-3xl leading-relaxed"
        >
          An AI-powered scientific workspace designed for researchers, engineers, and students.
          Transcribe digital handwriting and paper notebook photographs into verified LaTeX with{' '}
          <strong className="text-[#F1F5F9]">cross-attention spatial grounding</strong> and{' '}
          <strong className="text-[#F1F5F9]">SymPy algebraic verification</strong>.
        </motion.p>

        {/* Call-to-actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onLaunchWorkspace}
            className="shadow-glow-accent px-7 text-sm font-semibold"
            shortcut="Ctrl+Enter"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Studio Workspace
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => setIsQrModalOpen(true)}
            icon={<Smartphone className="w-4 h-4 text-[#38BDF8]" />}
            className="border-[#252D3B] hover:border-[#38BDF8]/50"
          >
            Scan with Phone Camera
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const el = document.getElementById('interactive-sandbox');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            icon={<BrainCircuit className="w-4 h-4 text-[#8B7CFF]" />}
          >
            Try Live Sandbox
          </Button>
        </motion.div>

        {/* Telemetry metrics strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full"
        >
          <div className="p-3.5 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] text-center shadow-subtle hover:border-[#8B7CFF]/40 transition-colors">
            <span className="text-xl font-bold font-mono text-[#8B7CFF]">12.82 MB</span>
            <span className="text-[11px] text-[#94A3B8] block mt-0.5">INT8 Footprint</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] text-center shadow-subtle hover:border-[#38BDF8]/40 transition-colors">
            <span className="text-xl font-bold font-mono text-[#38BDF8]">132 Tokens</span>
            <span className="text-[11px] text-[#94A3B8] block mt-0.5">Atomic Vocabulary</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] text-center shadow-subtle hover:border-[#34D399]/40 transition-colors">
            <span className="text-xl font-bold font-mono text-[#34D399]">~120 ms</span>
            <span className="text-[11px] text-[#94A3B8] block mt-0.5">CPU Latency</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] text-center shadow-subtle hover:border-amber-400/40 transition-colors">
            <span className="text-xl font-bold font-mono text-amber-400">CROHME-23</span>
            <span className="text-[11px] text-[#94A3B8] block mt-0.5">Benchmark Tested</span>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 4. INTERACTIVE LIVE SANDBOX COMPONENT                    */}
      {/* ======================================================== */}
      <section id="interactive-sandbox" className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center mb-8 text-center">
          <Badge variant="cyan" size="sm" dot>
            Real-Time Interactive Playground
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] mt-2 tracking-tight">
            Experience the Engine Right in Your Browser
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mt-1.5">
            Draw custom equations, inspect cross-attention spatial grounding reticles, or slide through notebook photo shadow cancellation.
          </p>
        </div>

        <InteractiveHeroSandbox
          onOpenInStudio={handleOpenSandboxItem}
          isBackendConnected={isBackendConnected}
        />
      </section>

      {/* ======================================================== */}
      {/* 5. NEURAL PIPELINE WALKTHROUGH                          */}
      {/* ======================================================== */}
      <section id="architecture" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#10141D]/90 border border-[#252D3B] shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <Badge variant="accent" size="sm">
                Tensor Processing Pipeline
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mt-2">
                Five-Stage End-to-End Recognition Architecture
              </h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenModelSpecs}
              icon={<Cpu className="w-4 h-4 text-[#8B7CFF]" />}
            >
              Technical Specification
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            {[
              {
                num: '01',
                title: 'Dual Input Ingestion',
                sub: 'Ink Vectors or Photo',
                desc: 'Captures pointer curves with pressure dynamics or uploads real-world notebook paper photographs.',
              },
              {
                num: '02',
                title: 'Morphological Division',
                sub: 'cv2.divide() Shadow Mask',
                desc: '31×31 Gaussian background estimation cancels shadows and isolates ink strokes from blue ruled lines.',
              },
              {
                num: '03',
                title: 'DenseNet-121 Encoder',
                sub: 'Stride-8 Feature Map',
                desc: 'Downsamples ink image to H/8 × W/8 feature grid, creating rich 256-dim spatial memory representations.',
              },
              {
                num: '04',
                title: 'Transformer Decoder',
                sub: 'Pre-LN 3-Layer + Beam 3',
                desc: 'Emits 132 atomic LaTeX tokens using cross-attention grounding and length-normalized beam search.',
              },
              {
                num: '05',
                title: 'SymPy CAS Verification',
                sub: 'Algebraic Parse Tree',
                desc: 'Tests syntactic brace balance, builds SymPy expression trees, and renders canonical simplified mathematics.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col p-5 rounded-2xl bg-[#090B10] border border-[#252D3B] relative group hover:border-[#8B7CFF]/50 transition-all shadow-subtle"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-extrabold text-[#8B7CFF]">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">{step.sub}</span>
                </div>
                <span className="text-xs font-bold text-[#F1F5F9] mb-1.5">
                  {step.title}
                </span>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. FOUR PILLARS / BENTO GRID FEATURES                   */}
      {/* ======================================================== */}
      <section id="explainability" className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center mb-12 text-center">
          <Badge variant="success" size="sm">
            Core Scientific Capabilities
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] mt-2">
            Engineered for Mathematical Precision
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mt-1.5">
            Bridging handwritten perceptual drawing with deep spatial attention and computer algebra systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bento Card 1: Dual Modality Ingestion */}
          <div className="p-7 rounded-3xl bg-[#10141D]/90 border border-[#252D3B] hover:border-[#8B7CFF]/50 transition-all shadow-elevated group">
            <div className="w-11 h-11 rounded-2xl bg-[#8B7CFF]/15 text-[#8B7CFF] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Pen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F1F5F9] mb-2 flex items-center justify-between">
              <span>Dual Modality Ingestion</span>
              <span className="text-xs text-[#94A3B8] font-mono">Digital Ink & Paper Photo</span>
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Seamlessly switch between high-DPI digital ink with pressure curves and real-world notebook photograph ingestion. Uses morphological Gaussian background division to isolate dark ink strokes from ruled notebook paper, ink bleed, and hand shadows.
            </p>
          </div>

          {/* Bento Card 2: DenseNet-121 + Transformer */}
          <div className="p-7 rounded-3xl bg-[#10141D]/90 border border-[#252D3B] hover:border-[#38BDF8]/50 transition-all shadow-elevated group">
            <div className="w-11 h-11 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F1F5F9] mb-2 flex items-center justify-between">
              <span>DenseNet-121 + Pre-LN Transformer</span>
              <span className="text-xs text-[#94A3B8] font-mono">Beam Search Decoding</span>
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Stride-8 convolutional encoder captures intricate 2D pen strokes into 256-dimensional feature representations. A 3-layer Pre-LN Transformer decoder with 8 cross-attention heads generates valid LaTeX sequences via length-normalized beam search.
            </p>
          </div>

          {/* Bento Card 3: Cross-Attention Spatial Grounding */}
          <div className="p-7 rounded-3xl bg-[#10141D]/90 border border-[#252D3B] hover:border-[#34D399]/50 transition-all shadow-elevated group">
            <div className="w-11 h-11 rounded-2xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F1F5F9] mb-2 flex items-center justify-between">
              <span>Cross-Attention Spatial Grounding</span>
              <span className="text-xs text-[#94A3B8] font-mono">Interactive Reticles</span>
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Every emitted LaTeX symbol is mapped back to its normalized spatial attention coordinates on the input. Inspect peak reticles, top-3 alternatives (e.g. distinguishing <code>\pm</code> from <code>+</code>), and execute one-click corrections directly in the studio.
            </p>
          </div>

          {/* Bento Card 4: SymPy Computer Algebra System */}
          <div className="p-7 rounded-3xl bg-[#10141D]/90 border border-[#252D3B] hover:border-amber-400/50 transition-all shadow-elevated group">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F1F5F9] mb-2 flex items-center justify-between">
              <span>SymPy Symbolic Verification</span>
              <span className="text-xs text-[#94A3B8] font-mono">CAS Integration</span>
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Distinguishes superficial syntax validity from deep symbolic equivalence. Integrates Python SymPy 1.13 to parse algebraic expression trees and render canonically simplified mathematical forms side-by-side with recognized LaTeX.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. CROHME BENCHMARK METRICS                              */}
      {/* ======================================================== */}
      <section id="benchmarks" className="relative z-10 max-w-5xl mx-auto px-6 py-14 text-center">
        <Badge variant="accent" size="sm">
          Empirical Validation
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] mt-2">
          CROHME-2023 Validation Metrics
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto mt-1.5 mb-8">
          Evaluated against the official competition validation splits.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-[#10141D] border border-[#252D3B] text-center shadow-subtle hover:border-[#8B7CFF]/50 transition-colors">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">
              Expression Rate (ExpRate)
            </span>
            <span className="text-4xl font-extrabold font-mono text-[#8B7CFF] block mt-2">
              32.84%
            </span>
            <span className="text-[11px] text-[#64748B] block mt-1">
              Exact match zero-error mathematical expressions
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-[#10141D] border border-[#252D3B] text-center shadow-subtle hover:border-[#38BDF8]/50 transition-colors">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">
              ≤ 1 Error Rate
            </span>
            <span className="text-4xl font-extrabold font-mono text-[#38BDF8] block mt-2">
              41.42%
            </span>
            <span className="text-[11px] text-[#64748B] block mt-1">
              At most one token correction needed
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-[#10141D] border border-[#252D3B] text-center shadow-subtle hover:border-amber-400/50 transition-colors">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">
              Character Error (CER)
            </span>
            <span className="text-4xl font-extrabold font-mono text-amber-400 block mt-2">
              40.88%
            </span>
            <span className="text-[11px] text-[#64748B] block mt-1">
              Average symbol Levenshtein edit distance
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. 132-TOKEN VOCABULARY EXPLORER                        */}
      {/* ======================================================== */}
      <section id="vocabulary" className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <VocabularyExplorer />
      </section>

      {/* ======================================================== */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (ACCORDION)               */}
      {/* ======================================================== */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center mb-10 text-center">
          <Badge variant="cyan" size="sm">
            Architecture & FAQ
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mt-1">
            Understanding the underlying model architecture, preprocessing, and deployment.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#10141D]/90 border border-[#252D3B] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-[#151B27]/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-[#F1F5F9]">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-[#8B7CFF] shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 sm:px-5 pb-5 text-xs text-[#94A3B8] leading-relaxed border-t border-[#252D3B]/50 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. PRE-FOOTER INSPIRING CTA BANNER                     */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="relative p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#10141D] via-[#151B27] to-[#10141D] border border-[#8B7CFF]/30 shadow-glow-hero overflow-hidden text-center flex flex-col items-center">
          {/* Floating Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#8B7CFF]/20 blur-[90px] rounded-full pointer-events-none" />

          <Badge variant="accent" size="sm" dot>
            Production-Ready AI Workspace
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5F9] mt-3 max-w-2xl leading-tight">
            Ready to Accelerate Your Mathematical Workflow?
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mt-3 leading-relaxed">
            Write on canvas, snap a notebook photo from your phone, or paste an equation. Watch MathVision turn ink into publication-ready LaTeX in milliseconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={onLaunchWorkspace}
              icon={<ArrowRight className="w-4 h-4" />}
              className="px-8"
            >
              Enter Studio Workspace
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setIsQrModalOpen(true)}
              icon={<Smartphone className="w-4 h-4 text-[#38BDF8]" />}
            >
              Scan Phone Camera
            </Button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. FOOTER                                               */}
      {/* ======================================================== */}
      <footer className="relative z-10 border-t border-[#252D3B] bg-[#090B10] mt-12 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="MathVision Logo" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="font-bold text-sm text-[#F1F5F9]">MathVision Platform</span>
              <p className="text-[11px] text-[#64748B]">
                Advanced AI Handwritten Mathematical Expression Recognition IDE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
            <button
              onClick={onOpenShortcuts}
              className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1"
            >
              <Keyboard className="w-3.5 h-3.5" /> Shortcuts
            </button>
            <button
              onClick={onOpenDocs}
              className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" /> Documentation
            </button>
            <button
              onClick={onOpenSettings}
              className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1"
            >
              <Server className="w-3.5 h-3.5" /> Settings & Backend
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLaunchWorkspace}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Open Studio IDE
          </Button>
        </div>
      </footer>

      {/* Mobile QR Camera Sync Modal Triggered from Homepage */}
      <MobileQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onPhotoReceived={handlePhotoFromPhone}
      />
    </div>
  );
};
