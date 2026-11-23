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
  Orbit,
  Atom,
  Radio,
  Rocket,
  Binary,
  LayoutDashboard,
  Copy,
  PenTool,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { DEMO_PRESETS, DemoPreset } from '../../services/demoData';
import { MathConstellation } from './MathConstellation';
import { MathHero3D } from './MathHero3D';
import { LiveNeuralPipeline } from './LiveNeuralPipeline';
import { InteractiveHeroSandbox } from './InteractiveHeroSandbox';
import { VocabularyExplorer } from './VocabularyExplorer';
import { MobileQrModal } from '../upload/MobileQrModal';
import { renderLatexToHtml } from '../../utils/latex';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';
import {
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  scaleRevealVariants,
  slideLeftVariants,
  slideRightVariants,
  VIEWPORT_ONCE,
} from '../../utils/motion';
import { AnimatedMetric } from './AnimatedMetric';

interface HomePageProps {
  onLaunchWorkspace: () => void;
  onOpenDashboard: () => void;
  onLoadPreset: (preset: DemoPreset) => void;
  isBackendConnected: boolean;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
  onOpenModelSpecs: () => void;
  onOpenShortcuts: () => void;
  onPhotoReceivedFromPhone?: (dataUrl: string, filename: string) => void;
}

// 5 Interconnected Scientific Reality Domains
const UNIVERSE_DOMAINS = [
  {
    id: 'physics',
    name: 'Astrophysics & Spacetime',
    icon: Orbit,
    tag: 'Cosmic Scale',
    color: '#8B7CFF',
    latex: 'E = m c ^ { 2 }',
    equationName: "Einstein's Mass-Energy Equivalence",
    description:
      'From the geometry of four-dimensional spacetime to the orbital trajectories of planetary bodies, gravitation is expressed through field tensors and nonlinear differential equations.',
    connection: 'Handwritten by Albert Einstein in 1905; transcribed and verified into LaTeX by MathVision.',
    variables: [
      { sym: 'E', meaning: 'Rest energy of mass' },
      { sym: 'm', meaning: 'Invariant rest mass' },
      { sym: 'c', meaning: 'Universal speed of light in vacuum (299,792,458 m/s)' },
    ],
  },
  {
    id: 'quantum',
    name: 'Quantum Wave Mechanics',
    icon: Atom,
    tag: 'Subatomic Scale',
    color: '#38BDF8',
    latex: 'i \\hbar \\frac { \\partial } { \\partial t } \\Psi = \\hat { H } \\Psi',
    equationName: 'Schrödinger Wave Equation',
    description:
      'The probabilistic nature of electrons and subatomic particles is described by complex Hilbert spaces and Hamiltonian differential operators.',
    connection: 'Contains partial derivatives, fractions, Greek psi, and operator hats—all recognized atomically.',
    variables: [
      { sym: 'i', meaning: 'Imaginary unit (i² = -1)' },
      { sym: 'ħ', meaning: 'Reduced Planck constant (h / 2π)' },
      { sym: 'Ψ', meaning: 'Quantum state wave function' },
      { sym: 'Ĥ', meaning: 'Hamiltonian observable operator' },
    ],
  },
  {
    id: 'waves',
    name: 'Electrodynamics & Optics',
    icon: Radio,
    tag: 'Light & Information',
    color: '#34D399',
    latex: '\\nabla \\times \\mathbf { E } = - \\frac { \\partial \\mathbf { B } } { \\partial t }',
    equationName: 'Faraday-Maxwell Induction Law',
    description:
      'The foundational law governing fiber optics, telecommunication satellites, electrical power grids, and radio communication.',
    connection: 'Cross products, vector fields, and time derivatives synthesized into publication-ready code.',
    variables: [
      { sym: '∇×', meaning: 'Curl spatial differential vector operator' },
      { sym: 'E', meaning: 'Electric field vector intensity' },
      { sym: 'B', meaning: 'Magnetic flux density vector' },
    ],
  },
  {
    id: 'calculus',
    name: 'Calculus & Aerospace',
    icon: Rocket,
    tag: 'Continuous Motion',
    color: '#F59E0B',
    latex: '\\int _ { a } ^ { b } f ^ { \\prime } ( x ) d x = f ( b ) - f ( a )',
    equationName: 'Fundamental Theorem of Calculus',
    description:
      'Unites differentiation and integration into a single mathematical framework, underpinning classical dynamics, fluid mechanics, and aerospace trajectories.',
    connection: 'Subscripts, superscripts, derivative primes, and integration limits resolved into balanced trees.',
    variables: [
      { sym: '∫', meaning: 'Riemann continuous integration accumulator' },
      { sym: 'f\'', meaning: 'First-order instantaneous derivative' },
      { sym: '[a, b]', meaning: 'Definite boundary domain' },
    ],
  },
  {
    id: 'attention',
    name: 'Modern Attention AI',
    icon: Binary,
    tag: 'Cognitive Computing',
    color: '#A78BFA',
    latex: '\\mathrm { Attention } ( Q , K , V ) = \\mathrm { softmax } \\left( \\frac { Q K ^ { T } } { \\sqrt { d _ { k } } } \\right) V',
    equationName: 'Scaled Dot-Product Attention (Vaswani et al.)',
    description:
      'The foundational mathematical operation of modern Artificial Intelligence and Transformers—the exact architecture MathVision uses to ground mathematical symbols.',
    connection: 'Matrix transposes, square roots, fractions, and multi-token function calls encoded with zero syntax errors.',
    variables: [
      { sym: 'Q, K, V', meaning: 'Query, Key, and Value projection tensors' },
      { sym: 'dk', meaning: 'Key dimension scaling factor' },
      { sym: 'softmax', meaning: 'Normalized probability distribution across spatial sequence' },
    ],
  },
];

// Architectural FAQ
const FAQS = [
  {
    q: 'How does MathVision differ from standard OCR (Optical Character Recognition)?',
    a: 'Standard OCR models process text in linear 1D sequences (left-to-right). Mathematics is inherently two-dimensional, featuring superscripts, nested square roots, fractions with arbitrary numerator/denominator bounds, and complex spatial limits. MathVision combines a stride-8 DenseNet-121 convolutional encoder with a 3-layer Pre-LN Transformer decoder featuring 8 cross-attention heads to simultaneously perceive 2D spatial coordinates and generate atomic LaTeX tokens.',
  },
  {
    q: 'Why is SymPy computer algebra integration important?',
    a: 'Syntactic validity only guarantees that curly braces and LaTeX tags are balanced. SymPy builds an actual Computer Algebra System (CAS) expression tree to verify mathematical consistency and generate canonically simplified forms side-by-side with the recognized equation.',
  },
  {
    q: 'How does mobile phone camera submission work?',
    a: 'Clicking "Scan with Phone Camera" generates an encrypted temporary session with a QR code. Point your smartphone camera at the QR code to open the mobile camera interface. Photos taken on your phone are processed through a 31×31 Gaussian background division algorithm on the backend to remove shadows, wrinkles, and notebook ruled lines before feeding the cleaned ink into the neural encoder.',
  },
  {
    q: 'Can MathVision run inference locally on CPU?',
    a: 'Yes. The DenseNet-121 encoder and Coverage Multi-Head Attention Transformer decoder (v4-Final) have been quantized into INT8 ONNX binaries with a combined footprint of only 8.80 MB. Inference completes in approximately 120 ms on standard CPUs without requiring expensive GPU servers.',
  },
  {
    q: 'What is the CROHME-2023 benchmark standard?',
    a: 'CROHME (Competition on Recognition of Online Handwritten Mathematical Expressions) is the premier worldwide benchmark in mathematical computer vision. MathVision is trained and validated on the official CROHME-2023 corpus, covering 132 atomic LaTeX tokens with zero-error expression rate (ExpRate), ≤1 error rate, and Character Error Rate (CER) tracking.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  onLaunchWorkspace,
  onOpenDashboard,
  onLoadPreset,
  isBackendConnected,
  onOpenSettings,
  onOpenDocs,
  onOpenModelSpecs,
  onOpenShortcuts,
  onPhotoReceivedFromPhone,
}) => {
  const { success } = useToast();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeDomainId, setActiveDomainId] = useState<string>('physics');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [copiedLatex, setCopiedLatex] = useState(false);

  const activeDomain =
    UNIVERSE_DOMAINS.find((d) => d.id === activeDomainId) || UNIVERSE_DOMAINS[0];
  const { html: domainRenderedMath } = renderLatexToHtml(activeDomain.latex, true);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePhotoFromPhone = (dataUrl: string, filename: string) => {
    success('Photo Received from Phone', 'Transferring equation to studio workspace...');
    if (onPhotoReceivedFromPhone) {
      onPhotoReceivedFromPhone(dataUrl, filename);
    } else {
      setTimeout(() => {
        onLaunchWorkspace();
      }, 600);
    }
  };

  const handleCopyLatex = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  return (
    <div className="relative min-h-screen w-full color-grade-bg text-[#F1F5F9] overflow-x-hidden selection:bg-[#8B7CFF]/30 selection:text-white">
      {/* 1. Fixed Background Interactive Mathematical Constellation */}
      <MathConstellation />

      {/* Atmospheric Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-[#8B7CFF]/10 blur-[170px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[1200px] right-0 w-[700px] h-[500px] bg-[#38BDF8]/08 blur-[180px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[2600px] left-0 w-[700px] h-[550px] bg-[#34D399]/08 blur-[190px] rounded-full pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* TOP PUBLIC NAVIGATION                                   */}
      {/* ======================================================== */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#090B10]/80 border-b border-[#252D3B]/50 px-4 sm:px-8 py-3 flex items-center justify-between">
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
              v4-Final HMER
            </span>
          </div>
        </div>

        {/* Public Narrative Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-[#94A3B8]">
          <button
            onClick={() => scrollToSection('act-universe')}
            className="hover:text-[#F1F5F9] transition-colors"
          >
            Universe of Math
          </button>
          <button
            onClick={() => scrollToSection('act-human-medium')}
            className="hover:text-[#F1F5F9] transition-colors"
          >
            Human Inscription
          </button>
          <button
            onClick={() => scrollToSection('act-transformation')}
            className="hover:text-[#F1F5F9] transition-colors"
          >
            Neural Engine
          </button>
          <button
            onClick={() => scrollToSection('act-fabric')}
            className="hover:text-[#F1F5F9] transition-colors"
          >
            Fabric of Reality
          </button>
          <button
            onClick={() => scrollToSection('act-sandbox')}
            className="hover:text-[#F1F5F9] transition-colors"
          >
            Live Sandbox
          </button>
          <button
            onClick={() => scrollToSection('act-benchmarks')}
            className="hover:text-[#F1F5F9] transition-colors"
          >
            Benchmarks & Vocab
          </button>
          <button
            onClick={() => scrollToSection('act-faq')}
            className="hover:text-[#F1F5F9] transition-colors"
          >
            FAQ
          </button>
        </div>

        {/* Right Action Array */}
        <div className="flex items-center gap-2.5">
          {/* Server Connection Pill */}
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

          {/* Phone QR Trigger */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151B27] border border-[#252D3B] text-xs font-medium text-[#38BDF8] hover:border-[#38BDF8]/50 hover:bg-[#1E2536] transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Scan Phone QR</span>
          </button>

          {/* App Dashboard Link */}
          <button
            onClick={onOpenDashboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151B27] border border-[#252D3B] text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536] transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* Launch Studio IDE */}
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
      {/* ACT I — THE UNIVERSE OF MATHEMATICS (OPEN HERO)          */}
      {/* ======================================================== */}
      <section
        id="act-universe"
        className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center scroll-mt-20 overflow-hidden"
      >
        {/* Philosophy Monospace Index Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151B27]/90 border border-[#8B7CFF]/40 text-[#8B7CFF] text-xs font-mono mb-6 backdrop-blur-md shadow-glow-accent/20"
        >
          <Orbit className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>ACT I • The Universal Operating System of Reality</span>
        </motion.div>

        {/* Monumental Coordinated Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F1F5F9] max-w-5xl leading-[1.08] sm:leading-[1.06]"
        >
          Everything in the Universe <br className="hidden sm:inline" />
          is Inscribed in{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B7CFF] via-[#38BDF8] to-[#34D399]">
            Mathematics.
          </span>
        </motion.h1>

        {/* Narrative Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-sm sm:text-lg text-[#94A3B8] max-w-2xl leading-relaxed font-normal"
        >
          From the tensor curvature of general relativity to the self-attention weights of deep Transformer decoders, mathematics is the foundational code of reality. MathVision bridges human freehand intuition with verified Computer Algebra systems.
        </motion.p>

        {/* Real-Time Interactive 3D WebGL Centerpiece (Dedicated Stage, No Collisions) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="w-full max-w-3xl my-6 relative flex items-center justify-center"
        >
          <MathHero3D />
        </motion.div>

        {/* Hero Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 relative z-20"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onLaunchWorkspace}
            className="shadow-glow-accent px-8 py-3.5 text-sm font-semibold rounded-2xl"
            shortcut="Ctrl+Enter"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Enter Studio Workspace
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => setIsQrModalOpen(true)}
            icon={<Smartphone className="w-4 h-4 text-[#38BDF8]" />}
            className="border-[#252D3B] hover:border-[#38BDF8]/50 rounded-2xl"
          >
            Scan with Phone Camera
          </Button>

          <button
            onClick={() => scrollToSection('act-transformation')}
            className="px-6 py-3 text-xs font-mono font-medium text-[#94A3B8] hover:text-[#F1F5F9] transition-colors flex items-center gap-1.5"
          >
            <span>Explore the Neural Engine</span>
            <span className="text-[#8B7CFF]">↓</span>
          </button>
        </motion.div>

        {/* High-Impact Model Telemetry Bar (Dedicated Independent Card Space, Completely Unobstructed) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-12 w-full max-w-5xl pt-8 border-t border-[#252D3B]/60 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center relative z-20"
        >
          <div className="p-4 rounded-2xl bg-[#10141D]/80 border border-[#252D3B]/80 backdrop-blur-md transition-all hover:border-[#8B7CFF]/40 shadow-sm">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#8B7CFF] block">
              8.80 MB
            </span>
            <span className="text-xs font-semibold text-[#F1F5F9] mt-1.5 block">
              INT8 ONNX Footprint
            </span>
            <span className="text-[11px] text-[#64748B] block mt-0.5">
              DenseNet-121 + v4 Coverage Decoder
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#10141D]/80 border border-[#252D3B]/80 backdrop-blur-md transition-all hover:border-[#38BDF8]/40 shadow-sm">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#38BDF8] block">
              132 Tokens
            </span>
            <span className="text-xs font-semibold text-[#F1F5F9] mt-1.5 block">
              Atomic LaTeX Space
            </span>
            <span className="text-[11px] text-[#64748B] block mt-0.5">
              CROHME Grammar Units
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#10141D]/80 border border-[#252D3B]/80 backdrop-blur-md transition-all hover:border-[#34D399]/40 shadow-sm">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#34D399] block">
              ~120 ms
            </span>
            <span className="text-xs font-semibold text-[#F1F5F9] mt-1.5 block">
              CPU Inference Latency
            </span>
            <span className="text-[11px] text-[#64748B] block mt-0.5">
              Beam Width 3 on 4-Core CPU
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#10141D]/80 border border-[#252D3B]/80 backdrop-blur-md transition-all hover:border-amber-400/40 shadow-sm">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-amber-400 block">
              CROHME-23
            </span>
            <span className="text-xs font-semibold text-[#F1F5F9] mt-1.5 block">
              Benchmark Verified
            </span>
            <span className="text-[11px] text-[#64748B] block mt-0.5">
              Official Validation Split
            </span>
          </div>
        </motion.div>
      </section>

      {/* Living Equation Ticker Marquee Ribbon with Edge Fade Mask */}
      <div className="relative z-10 w-full py-3.5 overflow-hidden border-y border-[#252D3B]/40 bg-[#090B10]/60 backdrop-blur-md select-none [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee space-x-12 text-xs font-mono text-[#64748B]">
          <span>•</span>
          <span className="text-[#8B7CFF] font-semibold">\int_{'{-\\infty}'}^{'{\\infty}'} e^{'-x^2'} dx = \sqrt{'{'}\pi{'}'}</span>
          <span>•</span>
          <span className="text-[#38BDF8]">i \hbar \frac{'{'}\partial{'}'}{'{'}\partial t{'}'}\Psi = \hat{'{'}H{'}'}\Psi</span>
          <span>•</span>
          <span className="text-[#34D399]">E = m c^2</span>
          <span>•</span>
          <span className="text-amber-400">\nabla \times \mathbf{'{'}E{'}'} = -\frac{'{'}\partial \mathbf{'{'}B{'}'}{'}'}{'{'}\partial t{'}'}</span>
          <span>•</span>
          <span className="text-purple-400">\mathcal{'{'}F{'}'}(\omega) = \int_{'{-\\infty}'}^{'{\\infty}'} f(t) e^{'-i\\omega t'} dt</span>
          <span>•</span>
          <span className="text-pink-400">e^{'{i\\pi}'} + 1 = 0</span>
          <span>•</span>
          <span className="text-emerald-400">\sum_{'{n=1}'}^{'{\\infty}'} \frac{'{1}'}{'{n^2}'} = \frac{'{'}\pi^2{'}'}{'{6}'}</span>
          <span>•</span>
          <span className="text-sky-400">\mathrm{'{'}Attention{'}'}(Q,K,V) = \mathrm{'{'}softmax{'}'}\left(\frac{'{QK^T}'}{'{\\sqrt{d_k}}'}\right)V</span>
          <span>•</span>
          {/* Duplicate set for seamless infinite loop */}
          <span className="text-[#8B7CFF] font-semibold">\int_{'{-\\infty}'}^{'{\\infty}'} e^{'-x^2'} dx = \sqrt{'{'}\pi{'}'}</span>
          <span>•</span>
          <span className="text-[#38BDF8]">i \hbar \frac{'{'}\partial{'}'}{'{'}\partial t{'}'}\Psi = \hat{'{'}H{'}'}\Psi</span>
          <span>•</span>
          <span className="text-[#34D399]">E = m c^2</span>
          <span>•</span>
          <span className="text-amber-400">\nabla \times \mathbf{'{'}E{'}'} = -\frac{'{'}\partial \mathbf{'{'}B{'}'}{'}'}{'{'}\partial t{'}'}</span>
          <span>•</span>
          <span className="text-purple-400">\mathcal{'{'}F{'}'}(\omega) = \int_{'{-\\infty}'}^{'{\\infty}'} f(t) e^{'-i\\omega t'} dt</span>
          <span>•</span>
          <span className="text-pink-400">e^{'{i\\pi}'} + 1 = 0</span>
          <span>•</span>
          <span className="text-emerald-400">\sum_{'{n=1}'}^{'{\\infty}'} \frac{'{1}'}{'{n^2}'} = \frac{'{'}\pi^2{'}'}{'{6}'}</span>
          <span>•</span>
          <span className="text-sky-400">\mathrm{'{'}Attention{'}'}(Q,K,V) = \mathrm{'{'}softmax{'}'}\left(\frac{'{QK^T}'}{'{\\sqrt{d_k}}'}\right)V</span>
          <span>•</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ACT II — THE LANGUAGE OF HUMAN THINKING (INK & PAPER)    */}
      {/* ======================================================== */}
      <section
        id="act-human-medium"
        className="relative z-10 max-w-7xl mx-auto px-6 py-28 scroll-mt-20 overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Human Storytelling Editorial */}
          <motion.div
            variants={slideLeftVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8B7CFF] font-semibold">
              <span>// ACT II — THE HUMAN MEDIUM</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[#F1F5F9] leading-tight tracking-tight">
              The Pen is Humanity&apos;s Native Mathematical Interface.
            </h2>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              For four centuries, every foundational breakthrough in physics and mathematics was inscribed by hand on scratch paper—from Newton&apos;s quills in Cambridge to Einstein&apos;s chalkboard in Princeton and Ramanujan&apos;s notebooks in Madras.
            </p>

            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Yet traditional computer vision fails at handwritten mathematics. Inky loops, overlapping fractions, horizontal division lines, and subtle exponents create high structural ambiguity that standard optical character recognition cannot decipher.
            </p>

            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              className="pt-4 border-t border-[#252D3B]/60 space-y-4"
            >
              <motion.div variants={staggerItemVariants} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#8B7CFF]/15 text-[#8B7CFF] flex items-center justify-center shrink-0 mt-1">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F1F5F9]">
                    Digital Ink Trajectory (x, y, t)
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    120 Hz Bezier curve capture preserving stroke velocity and pressure.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={staggerItemVariants} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center shrink-0 mt-1">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F1F5F9]">
                    31×31 Gaussian Shadow Division
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Morphological background division cancels lighting gradients and blue notebook lines.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column: Open Interactive Ink-to-LaTeX Transformation Stage */}
          <motion.div
            variants={scaleRevealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-7 relative"
          >
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#151B27]/80 to-[#10141D]/90 border border-[#252D3B] shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#252D3B]/50">
                <span className="text-xs font-mono text-[#8B7CFF] font-semibold">
                  MORPHOLOGICAL INK CONVERSION
                </span>
                <span className="text-xs font-mono text-[#34D399]">LIVE TRANSLATION</span>
              </div>

              {/* Visual Stroke Demonstration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Left: Freehand Handwritten SVG Path */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono text-[#94A3B8] mb-2 uppercase">
                    Freehand Ink Inscription
                  </span>
                  <div className="w-full h-32 rounded-2xl bg-[#090B10] border border-[#252D3B] p-4 flex items-center justify-center relative shadow-inner">
                    <svg
                      viewBox="0 0 220 100"
                      className="w-full h-full stroke-[#F1F5F9] fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round"
                    >
                      <motion.path
                        d="M 25 30 L 45 30 M 25 30 L 25 70 L 45 70 M 25 50 L 40 50 M 60 46 L 80 46 M 60 56 L 80 56 M 95 65 L 95 48 C 95 40, 105 40, 105 48 L 105 65 M 105 48 C 105 40, 115 40, 115 48 L 115 65 M 130 55 C 130 42, 145 42, 145 52 M 155 35 C 155 25, 168 25, 168 35 C 168 45, 155 50, 170 50"
                        initial={{ pathLength: 0 } as any}
                        animate={{ pathLength: 1 } as any}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                      />
                    </svg>
                  </div>
                </div>

                {/* Right: KaTeX Verified Preview */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono text-[#34D399] mb-2 uppercase">
                    Synthesized LaTeX Form
                  </span>
                  <div className="w-full h-32 rounded-2xl bg-[#090B10] border border-[#252D3B] p-4 flex flex-col items-center justify-center relative shadow-inner">
                    <div
                      className="font-math text-2xl text-[#F1F5F9]"
                      dangerouslySetInnerHTML={{
                        __html: renderLatexToHtml('E = m c ^ { 2 }', true).html,
                      }}
                    />
                    <code className="text-[11px] font-mono text-[#8B7CFF] mt-2">
                      E = m c ^ {'{2}'}
                    </code>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#252D3B]/50 flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Automated symbol segmentation & spatial hierarchy</span>
                <span className="text-emerald-400 font-mono">0.0% Syntax Error</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* ACT III — THE FIVE-STAGE TRANSFORMATION STAGE            */}
      {/* ======================================================== */}
      <section
        id="act-transformation"
        className="relative z-10 max-w-7xl mx-auto px-6 py-20 scroll-mt-20 overflow-hidden"
      >
        <motion.div
          variants={scaleRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <LiveNeuralPipeline
            onOpenWorkspaceWithEquation={(latex) => {
              const match = DEMO_PRESETS.find((p) => p.latex === latex) || DEMO_PRESETS[0];
              onLoadPreset(match);
            }}
          />
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* ACT IV — THE MATHEMATICAL FABRIC OF REALITY              */}
      {/* ======================================================== */}
      <section
        id="act-fabric"
        className="relative z-10 max-w-7xl mx-auto px-6 py-28 scroll-mt-20 overflow-hidden"
      >
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="text-xs font-mono text-[#38BDF8] font-semibold mb-2">
            // ACT IV — THE UNIVERSAL CONNECTIVITY
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F1F5F9] tracking-tight">
            The Mathematical Fabric of Reality.
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mt-3 leading-relaxed">
            The equations recognized by MathVision are the identical foundational laws that govern the cosmos, electromagnetic waves, quantum probability fields, and the attention weights of modern AI.
          </p>
        </motion.div>

        {/* Domain Tab Selector (Minimal Hairline Tabs) */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8"
        >
          {UNIVERSE_DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const isSelected = domain.id === activeDomainId;
            return (
              <motion.button
                variants={staggerItemVariants}
                key={domain.id}
                onClick={() => setActiveDomainId(domain.id)}
                className={cn(
                  'px-4 py-2.5 text-xs font-semibold rounded-2xl border transition-all flex items-center gap-2 shrink-0 select-none',
                  isSelected
                    ? 'bg-[#151B27] text-white border-[#8B7CFF] shadow-glow-accent/30 font-bold scale-105'
                    : 'bg-[#10141D]/60 text-[#94A3B8] border-[#252D3B]/80 hover:text-[#F1F5F9] hover:bg-[#151B27]/60'
                )}
              >
                <Icon className="w-4 h-4" style={{ color: domain.color }} />
                <span>{domain.name}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Asymmetric Exhibition Display (Open Layout, NO Nested Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Scientific Context (6 cols) */}
          <motion.div
            variants={slideLeftVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#151B27] border border-[#252D3B]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeDomain.color }} />
              <span style={{ color: activeDomain.color }}>{activeDomain.tag}</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5F9]">
              {activeDomain.equationName}
            </h3>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              {activeDomain.description}
            </p>

            {/* Variable Definition Matrix */}
            <div className="space-y-2 pt-2 border-t border-[#252D3B]/60">
              <span className="text-xs font-mono text-[#8B7CFF] font-semibold block uppercase">
                Symbolic Variable Decomposition:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeDomain.variables.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#94A3B8]">
                    <code className="font-mono text-emerald-400 font-bold bg-[#151B27] px-1.5 py-0.5 rounded border border-[#252D3B]">
                      {v.sym}
                    </code>
                    <span className="truncate">{v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#090B10] border border-[#252D3B] text-xs space-y-1">
              <span className="font-semibold text-[#8B7CFF] block">
                Why It Matters for AI Recognition:
              </span>
              <p className="text-[#94A3B8]">{activeDomain.connection}</p>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  const match =
                    DEMO_PRESETS.find((p) => p.latex === activeDomain.latex) ||
                    DEMO_PRESETS[0];
                  onLoadPreset(match);
                }}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Inspect This Equation in Studio
              </Button>

              <button
                onClick={() => handleCopyLatex(activeDomain.latex)}
                className="text-xs font-mono text-[#94A3B8] hover:text-[#F1F5F9] flex items-center gap-1.5 transition-colors"
              >
                {copiedLatex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy LaTeX</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Right: Grand KaTeX Mathematical Exhibit (6 cols) */}
          <motion.div
            variants={scaleRevealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-6 flex flex-col gap-4"
          >
            <div className="p-8 sm:p-10 rounded-3xl bg-[#090B10] border border-[#252D3B] min-h-[220px] flex items-center justify-center shadow-2xl relative overflow-x-auto max-w-full">
              <div
                className="font-math text-[#F1F5F9] text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center select-text max-w-full overflow-x-auto py-2"
                dangerouslySetInnerHTML={{ __html: domainRenderedMath }}
              />
              <div className="absolute bottom-3 right-4 text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                KaTeX Precision Render
              </div>
            </div>

            {/* Source Syntax Strip */}
            <div className="p-4 rounded-2xl bg-[#151B27] border border-[#252D3B] flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Code className="w-4 h-4 text-[#8B7CFF] shrink-0" />
                <code className="text-xs font-mono text-[#38BDF8] truncate">
                  {activeDomain.latex}
                </code>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/30">
                Validated
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* ACT V — REAL-TIME INTERACTIVE EXPERIMENTATION LAB        */}
      {/* ======================================================== */}
      <section
        id="act-sandbox"
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 scroll-mt-20 overflow-hidden"
      >
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="flex flex-col items-center text-center mb-10"
        >
          <div className="text-xs font-mono text-[#34D399] font-semibold mb-2">
            // ACT V — REAL-TIME EXPERIMENTATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F1F5F9] tracking-tight">
            Write. Ground. Verify.
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mt-2 leading-relaxed">
            Test the engine live: draw equations on the canvas, inspect cross-attention spatial grounding coordinates, or slide through notebook photo background division.
          </p>
        </motion.div>

        <motion.div
          variants={scaleRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <InteractiveHeroSandbox
            onOpenInStudio={(item) => {
              if (typeof item === 'string') {
                const match = DEMO_PRESETS.find((p) => p.latex === item);
                if (match) onLoadPreset(match);
                else onLaunchWorkspace();
              } else {
                onLoadPreset(item);
              }
            }}
            isBackendConnected={isBackendConnected}
          />
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* ACT VI — MATHEMATICAL RIGOR, BENCHMARKS & VOCABULARY     */}
      {/* ======================================================== */}
      <section
        id="act-benchmarks"
        className="relative z-10 max-w-7xl mx-auto px-6 py-28 scroll-mt-20 overflow-hidden"
      >
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="flex flex-col items-center text-center mb-14"
        >
          <div className="text-xs font-mono text-amber-400 font-semibold mb-2">
            // ACT VI — EMPIRICAL BENCHMARKS & 132-TOKEN VOCABULARY
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F1F5F9] tracking-tight">
            CROHME-2023 Validation Metrics.
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mt-3 leading-relaxed">
            Evaluated on official international competition validation splits under pure INT8 CPU inference.
          </p>
        </motion.div>

        {/* Numerical Benchmark Display (Animated Numbers, Staggered Reveal) */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center pb-12 border-b border-[#252D3B]/60"
        >
          <motion.div
            variants={staggerItemVariants}
            className="p-6 rounded-2xl bg-[#10141D]/60 border border-[#252D3B]/60"
          >
            <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8] font-semibold">
              Expression Rate (ExpRate)
            </span>
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono text-[#8B7CFF] block mt-3">
              <AnimatedMetric value={34.08} suffix="%" />
            </span>
            <span className="text-xs text-[#64748B] block mt-2">
              Exact match zero-error mathematical expressions
            </span>
          </motion.div>

          <motion.div
            variants={staggerItemVariants}
            className="p-6 rounded-2xl bg-[#10141D]/60 border border-[#252D3B]/60"
          >
            <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8] font-semibold">
              ≤ 1 Error Rate
            </span>
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono text-[#38BDF8] block mt-3">
              <AnimatedMetric value={45.65} suffix="%" />
            </span>
            <span className="text-xs text-[#64748B] block mt-2">
              At most one single token correction required
            </span>
          </motion.div>

          <motion.div
            variants={staggerItemVariants}
            className="p-6 rounded-2xl bg-[#10141D]/60 border border-[#252D3B]/60"
          >
            <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8] font-semibold">
              Character Error Rate (CER)
            </span>
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono text-emerald-400 block mt-3">
              <AnimatedMetric value={31.27} suffix="%" />
            </span>
            <span className="text-xs text-[#64748B] block mt-2">
              Average symbol Levenshtein edit distance
            </span>
          </motion.div>
        </motion.div>

        <div className="mt-4 text-center">
          <span className="inline-block text-[11px] font-mono text-[#64748B] px-3 py-1 rounded-full bg-[#151B27]/50 border border-[#252D3B]/50">
            Official CROHME-2023 Validation Set Benchmark • DenseNetHMER v4-Final Architecture
          </span>
        </div>

        {/* 132-Token Atomic Vocabulary Matrix */}
        <motion.div
          variants={scaleRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="pt-16"
        >
          <VocabularyExplorer />
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* ACT VII — ARCHITECTURAL FAQ & TECHNICAL TRANSPARENCY     */}
      {/* ======================================================== */}
      <section
        id="act-faq"
        className="relative z-10 max-w-4xl mx-auto px-6 py-20 scroll-mt-20 overflow-hidden"
      >
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="text-xs font-mono text-[#38BDF8] font-semibold mb-2">
            // ACT VII — ARCHITECTURAL TRANSPARENCY
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5F9]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mt-2">
            Technical answers regarding our DenseNet-121 encoder, Transformer decoder, and SymPy CAS integration.
          </p>
        </motion.div>

        {/* Minimal Hairline Accordion (Zero Heavy Card Boxes) */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="divide-y divide-[#252D3B]/60 border-y border-[#252D3B]/60"
        >
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <motion.div variants={staggerItemVariants} key={idx} className="py-4">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full py-2 flex items-center justify-between text-left gap-4 hover:text-[#8B7CFF] transition-colors group"
                >
                  <span className="text-base font-semibold text-[#F1F5F9] group-hover:text-[#8B7CFF] transition-colors">
                    {faq.q}
                  </span>
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
                      className="pt-2 pb-3 text-sm text-[#94A3B8] leading-relaxed font-normal"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* ACT VIII — THE STUDIO PORTAL (GRAND FINALE)              */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 overflow-hidden">
        <motion.div
          variants={scaleRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="relative p-10 sm:p-16 rounded-3xl bg-gradient-to-b from-[#151B27]/80 to-[#10141D] border border-[#8B7CFF]/40 shadow-glow-hero overflow-hidden text-center flex flex-col items-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-[#8B7CFF]/20 blur-[110px] rounded-full pointer-events-none" />

          <Badge variant="accent" size="sm" dot>
            Production-Ready AI Workspace
          </Badge>
          <h2 className="text-3xl sm:text-6xl font-black text-[#F1F5F9] mt-4 max-w-3xl leading-tight tracking-tight">
            Enter the Scientific Studio Workspace.
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mt-4 leading-relaxed">
            Write equations with digital stylus, snap notebook photographs with your phone, or explore token cross-attention grounding in real time.
          </p>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.div variants={staggerItemVariants}>
              <Button
                variant="primary"
                size="lg"
                onClick={onLaunchWorkspace}
                icon={<ArrowRight className="w-4 h-4" />}
                className="px-8 py-3.5 shadow-glow-accent text-sm font-semibold rounded-2xl"
              >
                Enter Studio Workspace
              </Button>
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsQrModalOpen(true)}
                icon={<Smartphone className="w-4 h-4 text-[#38BDF8]" />}
                className="rounded-2xl"
              >
                Scan Phone Camera
              </Button>
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <Button
                variant="outline"
                size="lg"
                onClick={onOpenDashboard}
                icon={<LayoutDashboard className="w-4 h-4 text-[#8B7CFF]" />}
                className="rounded-2xl"
              >
                View Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* EDITORIAL FOOTER                                         */}
      {/* ======================================================== */}
      <footer className="relative z-10 border-t border-[#252D3B]/60 bg-[#090B10] px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="MathVision Logo" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="font-bold text-sm text-[#F1F5F9]">MathVision Platform</span>
              <p className="text-xs text-[#64748B]">
                Handwritten Mathematical Expression Recognition (HMER) IDE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#94A3B8]">
            <button
              onClick={onOpenShortcuts}
              className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1.5"
            >
              <Keyboard className="w-3.5 h-3.5" /> Shortcuts
            </button>
            <button
              onClick={onOpenDocs}
              className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> Documentation
            </button>
            <button
              onClick={onOpenSettings}
              className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1.5"
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

      {/* Mobile QR Camera Sync Modal */}
      <MobileQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onPhotoReceived={handlePhotoFromPhone}
      />
    </div>
  );
};
