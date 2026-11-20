import React, { useState } from 'react';
import { DEMO_PRESETS, DemoPreset } from '../../services/demoData';
import { renderLatexToHtml } from '../../utils/latex';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../utils/cn';

interface ExamplePlaygroundProps {
  onLoadExample: (example: DemoPreset) => void;
  onClose?: () => void;
}

export const ExamplePlayground: React.FC<ExamplePlaygroundProps> = ({
  onLoadExample,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Algebra', 'Calculus', 'Series', 'Trigonometry', 'Physics'];

  const filteredExamples = activeCategory === 'All'
    ? DEMO_PRESETS
    : DEMO_PRESETS.filter((ex) => ex.category === activeCategory);

  const handleCopyLatex = (latex: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(latex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-1">
      {/* Category Pills & Note */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap',
                activeCategory === cat
                  ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/40'
                  : 'bg-[#090B10] text-[#94A3B8] border border-[#252D3B] hover:text-[#F1F5F9]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#64748B] italic">
          * Preloaded examples with ground-truth token cross-attention metadata
        </span>
      </div>

      {/* Grid of Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {filteredExamples.map((ex) => {
          const { html } = renderLatexToHtml(ex.latex);
          const isCopied = copiedId === ex.id;

          return (
            <div
              key={ex.id}
              onClick={() => {
                onLoadExample(ex);
                onClose?.();
              }}
              className="group flex flex-col justify-between p-4 rounded-xl bg-[#151B27] border border-[#252D3B] hover:border-[#8B7CFF]/50 hover:bg-[#1A2232] transition-all cursor-pointer shadow-subtle"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#F1F5F9]">{ex.name}</span>
                  <Badge variant="accent" size="sm">
                    {ex.category}
                  </Badge>
                </div>

                <p className="text-[11px] text-[#94A3B8] mb-3 leading-snug line-clamp-2">
                  {ex.description}
                </p>

                {/* Rendered Math Box */}
                <div className="rounded-lg bg-[#090B10] border border-[#252D3B] p-4 flex items-center justify-center min-h-[70px] overflow-x-auto">
                  <div
                    className="font-math text-[#F1F5F9] text-base text-center"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#252D3B]/50">
                <code className="text-[10px] font-mono text-[#64748B] truncate max-w-[180px]">
                  {ex.latex}
                </code>

                <div className="flex items-center gap-1.5">
                  <Tooltip content={isCopied ? 'Copied' : 'Copy LaTeX'}>
                    <button
                      onClick={(e) => handleCopyLatex(ex.latex, ex.id, e)}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536] transition-colors"
                      aria-label="Copy LaTeX"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </Tooltip>

                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => {
                      onLoadExample(ex);
                      onClose?.();
                    }}
                    icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  >
                    Load
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
