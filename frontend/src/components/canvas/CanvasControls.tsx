import React from 'react';
import { Pen, Eraser, RotateCcw, RotateCw, Trash2, Download, Grid, Sparkles } from 'lucide-react';
import { CanvasTool, GridStyle } from '../../types/workspace';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../utils/cn';

interface CanvasControlsProps {
  tool: CanvasTool;
  setTool: (tool: CanvasTool) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  gridStyle: GridStyle;
  setGridStyle: (g: GridStyle) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExportPng: () => void;
  onLoadSample: (sampleId: string) => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  tool,
  setTool,
  strokeWidth,
  setStrokeWidth,
  gridStyle,
  setGridStyle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onExportPng,
  onLoadSample,
}) => {
  const strokeSizes = [2, 4, 6, 8];

  const gridStyles: { id: GridStyle; label: string }[] = [
    { id: 'dots', label: 'Dot Grid' },
    { id: 'lines', label: 'Graph Lines' },
    { id: 'ruled', label: 'Ruled Lines' },
    { id: 'none', label: 'Blank Paper' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#10141D] border-b border-[#252D3B]">
      {/* Tool selector: Pen / Eraser */}
      <div className="flex items-center gap-1 bg-[#090B10] p-1 rounded-lg border border-[#252D3B]">
        <Tooltip content="Pen Tool (P)" shortcut="P">
          <button
            onClick={() => setTool('pen')}
            className={cn(
              'p-1.5 rounded-md transition-all text-xs flex items-center gap-1.5',
              tool === 'pen'
                ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/40'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151B27]'
            )}
            aria-label="Pen tool"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Pen</span>
          </button>
        </Tooltip>

        <Tooltip content="Eraser Tool (E)" shortcut="E">
          <button
            onClick={() => setTool('eraser')}
            className={cn(
              'p-1.5 rounded-md transition-all text-xs flex items-center gap-1.5',
              tool === 'eraser'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151B27]'
            )}
            aria-label="Eraser tool"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Eraser</span>
          </button>
        </Tooltip>
      </div>

      {/* Stroke width selector */}
      <div className="flex items-center gap-1.5 bg-[#090B10] px-2 py-1 rounded-lg border border-[#252D3B]">
        <span className="text-[11px] text-[#94A3B8] select-none mr-0.5">Size</span>
        {strokeSizes.map((size) => (
          <button
            key={size}
            onClick={() => setStrokeWidth(size)}
            className={cn(
              'w-5 h-5 rounded flex items-center justify-center transition-colors',
              strokeWidth === size
                ? 'bg-[#1E2536] text-[#8B7CFF]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
            aria-label={`Stroke width ${size}px`}
          >
            <span
              className="rounded-full bg-current"
              style={{ width: `${Math.max(2, size)}px`, height: `${Math.max(2, size)}px` }}
            />
          </button>
        ))}
      </div>

      {/* Grid Pattern Selector */}
      <div className="flex items-center gap-1 bg-[#090B10] px-2 py-1 rounded-lg border border-[#252D3B]">
        <Grid className="w-3.5 h-3.5 text-[#94A3B8]" />
        <select
          value={gridStyle}
          onChange={(e) => setGridStyle(e.target.value as GridStyle)}
          className="bg-transparent text-xs text-[#F1F5F9] focus:outline-none cursor-pointer pr-1"
          aria-label="Grid paper background style"
        >
          {gridStyles.map((g) => (
            <option key={g.id} value={g.id} className="bg-[#10141D] text-[#F1F5F9]">
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* Undo / Redo / Clear / Export */}
      <div className="flex items-center gap-1">
        <Tooltip content="Undo Stroke" shortcut="Ctrl+Z">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Undo stroke"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Redo Stroke" shortcut="Ctrl+Shift+Z">
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Redo stroke"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Clear Canvas">
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            aria-label="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Export Canvas PNG">
          <button
            onClick={onExportPng}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors"
            aria-label="Export canvas PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Quick Sample Expression Dropdown */}
        <div className="relative group">
          <Tooltip content="Load Example Strokes">
            <button
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#8B7CFF] hover:bg-[#8B7CFF]/10 transition-colors"
              aria-label="Load sample handwriting"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </Tooltip>
          <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-[#151B27] border border-[#252D3B] rounded-xl shadow-elevated hidden group-hover:block z-30">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Sample Handwriting
            </div>
            <button
              onClick={() => onLoadSample('fraction')}
              className="w-full text-left px-3 py-1.5 text-xs text-[#F1F5F9] hover:bg-[#1E2536] hover:text-[#8B7CFF] transition-colors"
            >
              Fraction: (a + b) / c
            </button>
            <button
              onClick={() => onLoadSample('quadratic')}
              className="w-full text-left px-3 py-1.5 text-xs text-[#F1F5F9] hover:bg-[#1E2536] hover:text-[#8B7CFF] transition-colors"
            >
              Quadratic Formula
            </button>
            <button
              onClick={() => onLoadSample('integral')}
              className="w-full text-left px-3 py-1.5 text-xs text-[#F1F5F9] hover:bg-[#1E2536] hover:text-[#8B7CFF] transition-colors"
            >
              Definite Integral
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
