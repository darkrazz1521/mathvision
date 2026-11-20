import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { DEMO_PRESETS, DemoPreset } from '../../services/demoData';
import { renderLatexToHtml } from '../../utils/latex';
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

export const HomePage: React.FC<HomePageProps> = ({
  onLaunchWorkspace,
  onLoadPreset,
  isBackendConnected,
  onOpenSettings,
  onOpenDocs,
  onOpenModelSpecs,
  onOpenShortcuts,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('quadratic');

  const activePreset = DEMO_PRESETS.find((p) => p.id === selectedPresetId) || DEMO_PRESETS[0];
  const { html: heroRenderedHtml } = renderLatexToHtml(activePreset.latex, true);

  return (
    <div className="relative min-h-screen w-full color-grade-bg text-[#F1F5F9] overflow-y-auto selection:bg-[#8B7CFF]/30 selection:text-white">
      {/* Background Decorative Scientific Grid */}
      <div className="absolute inset-0 hero-science-grid pointer-events-none opacity-40 z-0" />

      {/* Floating Ambient Aura Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#8B7CFF]/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-10 w-[500px] h-[350px] bg-[#38BDF8]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* 1. TOP NAVBAR                                            */}
      {/* ======================================================== */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090B10]/80 border-b border-[#252D3B]/70 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative">
            <img src="/logo.svg" alt="MathVision" className="w-8 h-8 rounded-lg shadow-glow-accent" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#34D399] border-2 border-[#090B10]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-[#F1F5F9]">
              MathVision
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/40">
              v2.0 Scientific
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-xs text-[#94A3B8]">
          <a href="#features" className="hover:text-[#F1F5F9] transition-colors">
            Core Features
          </a>
          <a href="#interactive-demo" className="hover:text-[#F1F5F9] transition-colors">
            Interactive Demo
          </a>
          <a href="#architecture" className="hover:text-[#F1F5F9] transition-colors">
            Neural Architecture
          </a>
          <a href="#benchmarks" className="hover:text-[#F1F5F9] transition-colors">
            Benchmarks
          </a>
          <button onClick={onOpenDocs} className="hover:text-[#F1F5F9] transition-colors">
            132-Token Vocab
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <button
            onClick={onOpenSettings}
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
              isBackendConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            )}
            title="FastAPI Inference Status"
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400')} />
            <span>{isBackendConnected ? 'FastAPI Online' : 'Simulation Mode'}</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={onLaunchWorkspace}
            icon={<Sparkles className="w-4 h-4 text-white" />}
          >
            Launch Studio IDE
          </Button>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center">
        {/* Subtle Pill Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B27] border border-[#8B7CFF]/40 text-[#8B7CFF] text-xs font-mono mb-6 shadow-glow-accent/20"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>DenseNet-121 Encoder • 3-Layer Transformer • 12.82 MB INT8 Model</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F1F5F9] max-w-4xl leading-[1.12]"
        >
          Turn Handwritten Mathematics into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B7CFF] via-[#38BDF8] to-[#34D399]">
            Living LaTeX & Code.
          </span>
        </motion.h1>

        {/* Subhead description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-[#94A3B8] max-w-2xl leading-relaxed"
        >
          An AI-powered mathematical workspace. Transcribe handwritten ink and notebook photographs into verified LaTeX with <strong>cross-attention explainability</strong> and <strong>SymPy symbolic verification</strong>.
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
            className="shadow-glow-accent px-6"
            shortcut="Ctrl+Enter"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Mathematical Studio
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              const el = document.getElementById('interactive-demo');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            icon={<BrainCircuit className="w-4 h-4 text-[#38BDF8]" />}
          >
            Explore Interactive Demo
          </Button>
        </motion.div>

        {/* Micro-metrics pill strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full"
        >
          <div className="p-3 rounded-xl bg-[#10141D]/90 border border-[#252D3B] text-center">
            <span className="text-lg font-bold font-mono text-[#8B7CFF]">12.82 MB</span>
            <span className="text-[11px] text-[#94A3B8] block mt-0.5">INT8 Footprint</span>
          </div>
          <div className="p-3 rounded-xl bg-[#10141D]/90 border border-[#252D3B] text-center">
            <span className="text-lg font-bold font-mono text-[#38BDF8]">132 Tokens</span>
            <span className="text-[11px] text-[#94A3B8] block mt-0.5">Atomic Vocabulary</span>
          </div>
          <div className="p-3 rounded-xl bg-[#10141D]/90 border border-[#252D3B] text-center">
            <span className="text-lg font-bold font-mono text-[#34D399]">~120 ms</span>
            <span className="text-[11px] text-[#94A3B8] block mt-0.5">CPU Inference</span>
          </div>
          <div className="p-3 rounded-xl bg-[#10141D]/90 border border-[#252D3B] text-center">
            <span className="text-lg font-bold font-mono text-amber-400">CROHME-23</span>
            <span className="text-[11px] text-[#94A3B8] block mt-0.5">Benchmark Trained</span>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE LIVE HERO DEMO WIDGET                     */}
      {/* ======================================================== */}
      <section id="interactive-demo" className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center mb-6 text-center">
          <Badge variant="cyan" size="sm" dot>
            Live Interactive Recognition Showcase
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mt-2">
            Experience the Recognition Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mt-1">
            Select an expression to preview real-time KaTeX rendering, token cross-attention peaks, and SymPy simplification.
          </p>
        </div>

        {/* Interactive Demo Container */}
        <div className="p-6 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Top Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#252D3B] mb-5">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mr-2 shrink-0">
              Preset Equations:
            </span>
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 border select-none',
                  selectedPresetId === preset.id
                    ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF]/50 shadow-glow-accent'
                    : 'bg-[#151B27] text-[#94A3B8] border-[#252D3B] hover:text-[#F1F5F9] hover:bg-[#1E2536]'
                )}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Interactive Output Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Rendered Math & LaTeX Code */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="p-6 rounded-xl bg-[#090B10] border border-[#252D3B] min-h-[140px] flex items-center justify-center shadow-inner overflow-x-auto">
                <div
                  className="font-math text-[#F1F5F9] text-xl text-center select-text"
                  dangerouslySetInnerHTML={{ __html: heroRenderedHtml }}
                />
              </div>

              {/* LaTeX String Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#151B27] border border-[#252D3B]">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Code className="w-4 h-4 text-[#8B7CFF] shrink-0" />
                  <code className="text-xs font-mono text-[#F1F5F9] truncate">
                    {activePreset.latex}
                  </code>
                </div>
                <span className="text-[11px] font-mono text-[#34D399] shrink-0 ml-2">
                  {(activePreset.response.avg_confidence * 100).toFixed(1)}% Conf
                </span>
              </div>
            </div>

            {/* Right: Cross-Attention Spotlight & SymPy Preview */}
            <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
              <div className="p-3.5 rounded-xl bg-[#090B10] border border-[#252D3B]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2">
                  <span className="flex items-center gap-1.5 font-medium text-[#F1F5F9]">
                    <Zap className="w-3.5 h-3.5 text-[#8B7CFF]" />
                    Spatial Grounding Preview
                  </span>
                  <span className="text-[10px] font-mono text-[#38BDF8]">
                    {activePreset.response.tokens.length} Symbols
                  </span>
                </div>
                <div className="p-2 rounded bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={activePreset.response.preprocessed_image}
                    alt="Preprocessed feature map"
                    className="max-h-20 w-auto object-contain"
                  />
                </div>
              </div>

              {/* SymPy status */}
              <div className="p-3 rounded-xl bg-[#151B27] border border-[#252D3B] flex items-center justify-between text-xs">
                <span className="text-[#94A3B8] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                  SymPy Simplified Form:
                </span>
                <code className="font-mono text-[#F1F5F9] font-semibold">
                  {activePreset.response.sympy.simplified || 'Valid'}
                </code>
              </div>

              {/* CTA to Open preset in IDE */}
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => onLoadPreset(activePreset)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Open This in Studio Workspace
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FOUR PILLARS / BENTO GRID FEATURES                   */}
      {/* ======================================================== */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center mb-12 text-center">
          <Badge variant="accent" size="sm">
            Core Technological Innovations
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mt-2">
            Engineered for Mathematical Rigor
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mt-1">
            Bridging handwritten perceptual drawing with deep spatial attention and computer algebra systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bento Card 1: Dual Modality Ingestion */}
          <div className="p-6 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] hover:border-[#8B7CFF]/50 transition-all shadow-elevated group">
            <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/15 text-[#8B7CFF] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Pen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1.5 flex items-center justify-between">
              <span>Dual Modality Ingestion</span>
              <span className="text-xs text-[#94A3B8] font-mono">Ink & Photo</span>
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Seamlessly switch between high-DPI digital ink with pressure curves and real-world notebook photograph ingestion. Uses morphological Gaussian background division to isolate dark ink strokes from ruled notebook paper and shadows.
            </p>
          </div>

          {/* Bento Card 2: DenseNet-121 + Transformer */}
          <div className="p-6 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] hover:border-[#38BDF8]/50 transition-all shadow-elevated group">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1.5 flex items-center justify-between">
              <span>DenseNet-121 + Transformer</span>
              <span className="text-xs text-[#94A3B8] font-mono">Beam Search</span>
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Stride-8 convolutional encoder captures intricate 2D pen strokes into 256-dimensional feature representations. A 3-layer Pre-LN Transformer decoder with 8 cross-attention heads generates valid LaTeX sequences via length-normalized beam search.
            </p>
          </div>

          {/* Bento Card 3: Cross-Attention Spatial Grounding */}
          <div className="p-6 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] hover:border-[#34D399]/50 transition-all shadow-elevated group">
            <div className="w-10 h-10 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1.5 flex items-center justify-between">
              <span>Cross-Attention Explainability</span>
              <span className="text-xs text-[#94A3B8] font-mono">Signature Feature</span>
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Every emitted LaTeX symbol is mapped back to its normalized spatial attention coordinates on the input. Inspect peak reticles, top-3 alternatives (e.g. distinguishing <code>\pm</code> from <code>+</code>), and execute one-click corrections.
            </p>
          </div>

          {/* Bento Card 4: SymPy Computer Algebra System */}
          <div className="p-6 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] hover:border-amber-400/50 transition-all shadow-elevated group">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1.5 flex items-center justify-between">
              <span>SymPy Symbolic Verification</span>
              <span className="text-xs text-[#94A3B8] font-mono">CAS Integration</span>
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Distinguishes superficial syntax validity from deep symbolic equivalence. Integrates Python SymPy 1.13 to parse algebraic expression trees and render canonically simplified mathematical forms side-by-side.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. ARCHITECTURE PIPELINE WALKTHROUGH                     */}
      {/* ======================================================== */}
      <section id="architecture" className="relative z-10 max-w-6xl mx-auto px-6 py-14">
        <div className="p-8 rounded-3xl bg-[#10141D]/90 border border-[#252D3B] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <Badge variant="cyan" size="sm">
                Tensor Pipeline Specification
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] mt-1.5">
                End-to-End Neural Processing Pipeline
              </h2>
            </div>
            <Button size="sm" variant="outline" onClick={onOpenModelSpecs} icon={<Cpu className="w-4 h-4 text-[#8B7CFF]" />}>
              Full Technical Spec
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { num: '01', title: 'Input Ingestion', desc: 'Canvas stroke paths or raw photograph upload.' },
              { num: '02', title: 'Binarization', desc: 'Background division, adaptive threshold & aspect padding.' },
              { num: '03', title: 'DenseNet-121', desc: 'H/8 × W/8 feature grid downsampling into memory map.' },
              { num: '04', title: 'Transformer', desc: 'Pre-LN 3-layer decoder with cross-attention beam search.' },
              { num: '05', title: 'SymPy CAS', desc: 'Syntax validation, LaTeX parsing & simplification.' },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col p-4 rounded-xl bg-[#090B10] border border-[#252D3B] relative group">
                <span className="font-mono text-xs font-bold text-[#8B7CFF] mb-1">
                  {step.num}
                </span>
                <span className="text-xs font-semibold text-[#F1F5F9] mb-1">
                  {step.title}
                </span>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. CROHME BENCHMARK METRICS                              */}
      {/* ======================================================== */}
      <section id="benchmarks" className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] mb-2">
          CROHME-2023 Validation Metrics
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto mb-8">
          Evaluated against the official competition validation splits.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-[#10141D] border border-[#252D3B] text-center">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider">Expression Rate (ExpRate)</span>
            <span className="text-3xl font-extrabold font-mono text-[#8B7CFF] block mt-2">32.84%</span>
            <span className="text-[11px] text-[#64748B] block mt-1">Exact match zero-error expressions</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#10141D] border border-[#252D3B] text-center">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider">≤ 1 Error Rate</span>
            <span className="text-3xl font-extrabold font-mono text-[#38BDF8] block mt-2">41.42%</span>
            <span className="text-[11px] text-[#64748B] block mt-1">At most one token correction needed</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#10141D] border border-[#252D3B] text-center">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider">Character Error (CER)</span>
            <span className="text-3xl font-extrabold font-mono text-amber-400 block mt-2">40.88%</span>
            <span className="text-[11px] text-[#64748B] block mt-1">Average symbol edit distance</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. BOTTOM CTA & FOOTER                                   */}
      {/* ======================================================== */}
      <footer className="relative z-10 border-t border-[#252D3B] bg-[#090B10] mt-16 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="MathVision Logo" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="font-bold text-sm text-[#F1F5F9]">MathVision Platform</span>
              <p className="text-[11px] text-[#64748B]">Advanced AI Handwritten Mathematical Expression Recognition IDE</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
            <button onClick={onOpenShortcuts} className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5" /> Shortcuts
            </button>
            <button onClick={onOpenDocs} className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Documentation
            </button>
            <button onClick={onOpenSettings} className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1">
              <Server className="w-3.5 h-3.5" /> Settings
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onLaunchWorkspace}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Enter Studio Workspace
          </Button>
        </div>
      </footer>
    </div>
  );
};
