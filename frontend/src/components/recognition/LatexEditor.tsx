import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Code, AlertCircle } from 'lucide-react';
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

  const { html, error: katexError } = renderLatexToHtml(currentLatex);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#10141D] rounded-xl border border-[#252D3B] overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#151B27] border-b border-[#252D3B]">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#8B7CFF]" />
          <span className="text-xs font-semibold text-[#F1F5F9]">Mathematical Output</span>
          {isModified && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30">
              Edited
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#090B10] p-0.5 rounded-lg border border-[#252D3B]">
            <button
              onClick={() => setViewMode('both')}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                viewMode === 'both'
                  ? 'bg-[#1E2536] text-[#F1F5F9]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              )}
              title="Split View"
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('rendered')}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                viewMode === 'rendered'
                  ? 'bg-[#1E2536] text-[#F1F5F9]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              )}
              title="Rendered Only"
            >
              Math
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                viewMode === 'code'
                  ? 'bg-[#1E2536] text-[#F1F5F9]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              )}
              title="LaTeX Code Only"
            >
              LaTeX
            </button>
          </div>

          {/* Reset to AI Prediction */}
          {isModified && (
            <Tooltip content="Reset to AI Prediction">
              <Button
                size="sm"
                variant="subtle"
                onClick={onReset}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            </Tooltip>
          )}

          {/* Copy LaTeX */}
          <Tooltip content={copied ? 'Copied to Clipboard!' : 'Copy LaTeX'}>
            <Button
              size="sm"
              variant={copied ? 'primary' : 'secondary'}
              onClick={handleCopy}
              icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* Rendered Math Display Box */}
        {(viewMode === 'both' || viewMode === 'rendered') && (
          <div className="flex flex-col rounded-xl bg-[#090B10] border border-[#252D3B] p-6 min-h-[140px] items-center justify-center relative overflow-x-auto shadow-inner">
            {katexError ? (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>KaTeX Syntax Error: {katexError}</span>
              </div>
            ) : html ? (
              <div
                className="select-text text-center text-[#F1F5F9] font-math"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <div className="text-xs text-[#94A3B8] italic">No mathematical expression</div>
            )}
            <div className="absolute bottom-2 right-3 text-[10px] text-[#64748B] font-mono uppercase tracking-wider select-none">
              KaTeX Live Preview
            </div>
          </div>
        )}

        {/* Editable LaTeX Code Area */}
        {(viewMode === 'both' || viewMode === 'code') && (
          <div className="flex flex-col flex-1 gap-1.5">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-mono">LaTeX Source</span>
              {originalLatex !== currentLatex && (
                <span className="text-[11px] text-[#8B7CFF]">
                  Original: <code className="font-mono">{originalLatex}</code>
                </span>
              )}
            </div>
            <textarea
              value={currentLatex}
              onChange={(e) => onLatexChange(e.target.value)}
              placeholder="Enter or edit LaTeX expression..."
              rows={4}
              className="w-full flex-1 min-h-[90px] font-mono text-sm bg-[#090B10] text-[#F1F5F9] p-3 rounded-xl border border-[#252D3B] focus:border-[#8B7CFF] focus:outline-none focus:ring-1 focus:ring-[#8B7CFF] transition-all resize-none selection:bg-[#8B7CFF]/30"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
