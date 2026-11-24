import React from 'react';
import { motion } from 'framer-motion';
import {
  Pen,
  Camera,
  QrCode,
  Sparkles,
  History,
  Star,
  Cpu,
  Server,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  HardDrive,
  Code,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Tooltip } from '../ui/Tooltip';
import { HistoryEntry } from '../../types/history';
import { getHistory } from '../../services/historyStorage';
import { DEMO_PRESETS } from '../../services/demoData';
import { renderLatexToHtml } from '../../utils/latex';
import { cn } from '../../utils/cn';

interface DashboardViewProps {
  onStartCanvas: () => void;
  onStartPhoto: () => void;
  onOpenQrModal: () => void;
  onOpenPlayground: () => void;
  onOpenHistory: () => void;
  onOpenModelSpecs: () => void;
  onOpenSettings: () => void;
  onLoadHistoryEntry: (entry: HistoryEntry) => void;
  isBackendConnected: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartCanvas,
  onStartPhoto,
  onOpenQrModal,
  onOpenPlayground,
  onOpenHistory,
  onOpenModelSpecs,
  onOpenSettings,
  onLoadHistoryEntry,
  isBackendConnected,
}) => {
  const history = getHistory();
  const recentHistory = history.slice(0, 4);

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 color-grade-bg text-[#F1F5F9]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ======================================================== */}
        {/* 1. WELCOME & TELEMETRY COMMAND HEADER                   */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#10141D]/90 border border-[#252D3B] shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B7CFF]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B27] border border-[#8B7CFF]/30 text-[#8B7CFF] text-xs font-mono mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MathVision Studio Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
                Mathematical Intelligence Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mt-1.5 leading-relaxed">
                MathDenseNet stride-8 convolutional encoder with 3-layer Bidirectional Fusion Coverage Transformer decoder (v5.0-Final). Optimized for Render CPU with sub-second inference.
              </p>
            </div>

            {/* Live System Status Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onOpenSettings}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors select-none',
                  isBackendConnected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                )}
              >
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  )}
                />
                <span className="font-mono">
                  {isBackendConnected ? 'FastAPI Render Online (V5)' : 'Local Fallback'}
                </span>
              </button>

              <button
                onClick={onOpenModelSpecs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151B27] border border-[#252D3B] text-xs font-mono text-[#38BDF8] hover:border-[#38BDF8]/50 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>6.57M · 13MB FP16</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#252D3B]/70">
            <div className="p-3 rounded-xl bg-[#090B10] border border-[#252D3B]">
              <span className="text-[11px] text-[#94A3B8] uppercase font-mono block">CROHME Vocab</span>
              <span className="text-lg font-bold font-mono text-[#8B7CFF] mt-0.5 block">132 Tokens</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090B10] border border-[#252D3B]">
              <span className="text-[11px] text-[#94A3B8] uppercase font-mono block">CPU Inference</span>
              <span className="text-lg font-bold font-mono text-[#38BDF8] mt-0.5 block">Bi-Beam-5</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090B10] border border-[#252D3B]">
              <span className="text-[11px] text-[#94A3B8] uppercase font-mono block">ExpRate (Bi-Beam)</span>
              <span className="text-lg font-bold font-mono text-[#34D399] mt-0.5 block">41.30%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090B10] border border-[#252D3B]">
              <span className="text-[11px] text-[#94A3B8] uppercase font-mono block">Equations Saved</span>
              <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">{history.length}</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. THREE QUICK-START WORKFLOW CARDS                     */}
        {/* ======================================================== */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
            Recognition Ingestion Modalities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Digital Ink */}
            <div
              onClick={onStartCanvas}
              className="p-6 rounded-2xl bg-[#10141D] border border-[#252D3B] hover:border-[#8B7CFF]/60 hover:shadow-glow-accent/20 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/15 text-[#8B7CFF] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Pen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F1F5F9] mb-1">
                  Digital Handwriting Ink
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Write mathematics naturally using mouse, stylus, or touch screen. High-DPI stroke rasterization with adjustable pen sizes.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#252D3B] flex items-center justify-between text-xs font-semibold text-[#8B7CFF]">
                <span>Launch Ink Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Notebook Photo Upload */}
            <div
              onClick={onStartPhoto}
              className="p-6 rounded-2xl bg-[#10141D] border border-[#252D3B] hover:border-[#38BDF8]/60 hover:shadow-glow-cyan/20 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F1F5F9] mb-1">
                  Notebook Photograph
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Upload photos of paper handwriting. Applies 31×31 Gaussian background division to remove shadows and blue ruled lines.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#252D3B] flex items-center justify-between text-xs font-semibold text-[#38BDF8]">
                <span>Upload Paper Photo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Mobile Camera QR Sync */}
            <div
              onClick={onOpenQrModal}
              className="p-6 rounded-2xl bg-[#10141D] border border-[#252D3B] hover:border-[#34D399]/60 hover:shadow-glow-emerald/20 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F1F5F9] mb-1">
                  Phone Camera Live Sync
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Scan QR code with your phone. Snap a photo of your notebook; image is transferred directly to your desktop workspace over HTTPS.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#252D3B] flex items-center justify-between text-xs font-semibold text-[#34D399]">
                <span>Open QR Code Sync</span>
                <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. RECENT EQUATIONS & CROHME PLAYGROUND                  */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Recent Equations (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#10141D] border border-[#252D3B]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#8B7CFF]" />
                <h3 className="text-sm font-bold text-[#F1F5F9]">
                  Recent Recognition History
                </h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={onOpenHistory}
                  className="text-xs font-medium text-[#38BDF8] hover:underline"
                >
                  View All ({history.length})
                </button>
              )}
            </div>

            {recentHistory.length > 0 ? (
              <div className="space-y-2.5">
                {recentHistory.map((entry) => {
                  const { html } = renderLatexToHtml(entry.currentLatex || entry.originalLatex, false);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => onLoadHistoryEntry(entry)}
                      className="p-3.5 rounded-xl bg-[#090B10] border border-[#252D3B] hover:border-[#8B7CFF]/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {entry.inputPreview ? (
                          <img
                            src={entry.inputPreview}
                            alt="Input Preview"
                            className="w-12 h-9 rounded object-contain bg-white shrink-0 p-0.5 border border-[#252D3B]"
                          />
                        ) : (
                          <div className="w-12 h-9 rounded bg-[#151B27] flex items-center justify-center shrink-0">
                            <Pen className="w-3.5 h-3.5 text-[#94A3B8]" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <div
                            className="font-math text-sm text-[#F1F5F9] truncate"
                            dangerouslySetInnerHTML={{ __html: html }}
                          />
                          <code className="text-[10px] font-mono text-[#94A3B8] truncate block mt-0.5">
                            {entry.currentLatex || entry.originalLatex}
                          </code>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {(entry.avgConfidence * 100).toFixed(0)}%
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-[#64748B] text-xs">
                <History className="w-6 h-6 mx-auto mb-2 opacity-40" />
                No saved equations yet. Write or upload an equation in Studio to see your history here.
              </div>
            )}
          </div>

          {/* Right: Example Playground & SymPy Overview (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#10141D] border border-[#252D3B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                  <h3 className="text-sm font-bold text-[#F1F5F9]">
                    CROHME Example Playground
                  </h3>
                </div>
                <button
                  onClick={onOpenPlayground}
                  className="text-xs font-medium text-[#38BDF8] hover:underline"
                >
                  Explore All
                </button>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Test the engine with pre-verified CROHME-2023 competition expressions including fractions, radicals, summations, integrals, and polynomials.
              </p>

              <div className="space-y-2">
                {DEMO_PRESETS.slice(0, 3).map((demo) => (
                  <div
                    key={demo.id}
                    onClick={onOpenPlayground}
                    className="p-2.5 rounded-xl bg-[#090B10] border border-[#252D3B] hover:border-[#38BDF8]/40 transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#F1F5F9]">{demo.name}</span>
                    <span className="text-[10px] font-mono text-[#8B7CFF]">{demo.category}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#252D3B]">
              <Button
                variant="primary"
                size="md"
                onClick={onStartCanvas}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Studio Workspace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
