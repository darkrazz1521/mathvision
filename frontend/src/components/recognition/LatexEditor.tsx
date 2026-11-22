import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RotateCcw, Code, AlertCircle, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { renderLatexToHtml } from '../../utils/latex';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../utils/cn';

interface LatexEditorProps {
  originalLatex: string;
  currentLatex: string;
  onLatexChange: (latex: string) => void;
  onReset: () => void;
  isModified: boolean;
}

export const LatexEditor: React.FC<LatexEditorProps> = ({
  originalLatex,
  currentLatex,
  onLatexChange,
  onReset,
  isModified,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'both' | 'rendered' | 'code'>('both');
  const [scale, setScale] = useState<number>(1.0);

  const { html, error: katexError } = renderLatexToHtml(currentLatex);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cycleScale = () => {
    setScale((prev) => (prev === 1.0 ? 1.25 : prev === 1.25 ? 1.5 : 1.0));
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0D111A] rounded-xl border border-[#212836] overflow-hidden shadow-sm">
      {/* Editor Sub-Header Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#141A28] border-b border-[#212836] shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#8B7CFF]" />
          <span className="text-xs font-bold text-[#F8FAFC]">Mathematical Output</span>
          {isModified && (
            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30">
              Edited
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Segmented Controls */}
          <div className="flex items-center relative bg-[#090B10] p-0.5 rounded-lg border border-[#212836]">
            <button
              onClick={() => setViewMode('both')}
              className={cn(
                'relative px-2 py-1 text-xs font-medium rounded-md transition-colors z-10',
                viewMode === 'both'
                  ? 'text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              )}
              title="Split preview & source view"
            >
              {viewMode === 'both' && (
                <motion.div
                  layoutId="activeLatexViewMode"
                  className="absolute inset-0 bg-[#182133] rounded-md -z-10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              Split
            </button>
            <button
              onClick={() => setViewMode('rendered')}
              className={cn(
                'relative px-2 py-1 text-xs font-medium rounded-md transition-colors z-10',
                viewMode === 'rendered'
                  ? 'text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              )}
              title="Mathematical preview only"
            >
              {viewMode === 'rendered' && (
                <motion.div
                  layoutId="activeLatexViewMode"
                  className="absolute inset-0 bg-[#182133] rounded-md -z-10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              Math
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={cn(
                'relative px-2 py-1 text-xs font-medium rounded-md transition-colors z-10',
                viewMode === 'code'
                  ? 'text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              )}
              title="LaTeX source code only"
            >
              {viewMode === 'code' && (
                <motion.div
                  layoutId="activeLatexViewMode"
                  className="absolute inset-0 bg-[#182133] rounded-md -z-10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              LaTeX
            </button>
          </div>

          {/* Scale preview toggle */}
          {viewMode !== 'code' && (
            <Tooltip content={`Preview Scale: ${scale}x (click to change)`}>
              <button
                onClick={cycleScale}
                className="px-2 py-1 rounded-lg text-[11px] font-mono font-semibold bg-[#090B10] text-[#94A3B8] hover:text-[#8B7CFF] border border-[#212836] transition-colors"
                aria-label="Toggle math font scale"
              >
                {scale}x
              </button>
            </Tooltip>
          )}

          {/* Reset to AI Prediction */}
          {isModified && (
            <Tooltip content="Revert to raw model output">
              <Button
                size="xs"
                variant="subtle"
                onClick={onReset}
                icon={<RotateCcw className="w-3 h-3" />}
              >
                Revert
              </Button>
            </Tooltip>
          )}

          {/* Copy LaTeX */}
          <Tooltip content={copied ? 'Copied to Clipboard!' : 'Copy LaTeX source'}>
            <Button
              size="xs"
              variant={copied ? 'primary' : 'secondary'}
              onClick={handleCopy}
              icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Main Workspace Body - Flex Stretches 100% to fill container */}
      <div className="flex-1 min-h-0 flex flex-col p-3 gap-3 overflow-hidden">
        {/* Rendered Math Preview Stage */}
        {(viewMode === 'both' || viewMode === 'rendered') && (
          <div
            className={cn(
              'flex flex-col rounded-xl bg-[#080B11] border border-[#212836] p-4 items-center justify-center relative overflow-x-auto overflow-y-auto shadow-inner transition-all',
              viewMode === 'both' ? 'flex-1 min-h-[140px]' : 'h-full flex-1 min-h-[220px]'
            )}
          >
            {katexError ? (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 px-3.5 py-2.5 rounded-lg border border-rose-500/30 max-w-md">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-mono text-[11px]">KaTeX Error: {katexError}</span>
              </div>
            ) : html ? (
              <div
                className="select-text text-center text-[#F8FAFC] font-math transition-transform duration-200"
                style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <div className="text-xs text-[#64748B] italic">No mathematical expression generated</div>
            )}

            <div className="absolute bottom-2 right-3 text-[9px] text-[#475569] font-mono uppercase tracking-widest select-none pointer-events-none">
              KaTeX High-Precision Preview
            </div>
          </div>
        )}

        {/* Editable LaTeX Monospace Source Box */}
        {(viewMode === 'both' || viewMode === 'code') && (
          <div
            className={cn(
              'flex flex-col gap-1.5 overflow-hidden',
              viewMode === 'both' ? 'flex-1 min-h-[120px]' : 'h-full flex-1 min-h-[220px]'
            )}
          >
            <div className="flex items-center justify-between text-xs text-[#94A3B8] shrink-0">
              <span className="font-mono text-[11px] font-semibold flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#38BDF8]" />
                LaTeX Source
              </span>
              {originalLatex !== currentLatex && (
                <span className="text-[10px] text-[#8B7CFF] truncate max-w-xs font-mono">
                  Initial: <code>{originalLatex}</code>
                </span>
              )}
            </div>
            <textarea
              value={currentLatex}
              onChange={(e) => onLatexChange(e.target.value)}
              placeholder="LaTeX tokens appear here. You can manually edit braces, exponents, or commands..."
              className="w-full flex-1 min-h-0 font-mono text-xs sm:text-sm bg-[#080B11] text-[#F8FAFC] p-3 rounded-xl border border-[#212836] focus:border-[#8B7CFF] focus:outline-none focus:ring-1 focus:ring-[#8B7CFF] transition-all resize-none selection:bg-[#8B7CFF]/30 leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
