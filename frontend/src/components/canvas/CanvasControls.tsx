import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pen,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Grid,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
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
  const [isSampleDropdownOpen, setIsSampleDropdownOpen] = useState(false);

  const strokeSizes = [
    { size: 2, label: 'Fine (2px)' },
    { size: 4, label: 'Standard (4px)' },
    { size: 6, label: 'Bold (6px)' },
    { size: 8, label: 'Marker (8px)' },
  ];

  const gridStyles: { id: GridStyle; label: string }[] = [
    { id: 'dots', label: 'Dot Grid' },
    { id: 'ruled', label: 'Ruled Lines' },
    { id: 'lines', label: 'Graph Paper' },
    { id: 'none', label: 'Blank Paper' },
  ];

  const sampleEquations = [
    { id: 'fraction', label: 'Fraction: (a + b) / c', formula: '\\frac{a+b}{c}' },
    { id: 'quadratic', label: 'Quadratic: x² + 4 = 0', formula: 'x^2 + 4 = 0' },
    { id: 'integral', label: 'Calculus: ∫ x dx', formula: '\\int x dx' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#0D111A] border-b border-[#212836] select-none">
      {/* Left Cluster: Tool selector (Pen/Eraser) & Stroke size */}
      <div className="flex items-center gap-2">
        {/* Pen / Eraser Segmented Switch */}
        <div className="relative flex items-center gap-0.5 bg-[#090B10] p-1 rounded-xl border border-[#212836]">
          <Tooltip content="Digital Pen (P)" shortcut="P">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setTool('pen')}
              className={cn(
                'relative z-10 px-2.5 py-1 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5',
                tool === 'pen'
                  ? 'text-[#8B7CFF]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              )}
              aria-label="Pen tool"
            >
              {tool === 'pen' && (
                <motion.span
                  layoutId="activeToolPill"
                  className="absolute inset-0 rounded-lg bg-[#8B7CFF]/20 border border-[#8B7CFF]/40 shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <Pen className="w-3.5 h-3.5" />
              <span>Pen</span>
            </motion.button>
          </Tooltip>

          <Tooltip content="Ink Eraser (E)" shortcut="E">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setTool('eraser')}
              className={cn(
                'relative z-10 px-2.5 py-1 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5',
                tool === 'eraser'
                  ? 'text-rose-400'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              )}
              aria-label="Eraser tool"
            >
              {tool === 'eraser' && (
                <motion.span
                  layoutId="activeToolPill"
                  className="absolute inset-0 rounded-lg bg-rose-500/20 border border-rose-500/40 shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <Eraser className="w-3.5 h-3.5" />
              <span>Eraser</span>
            </motion.button>
          </Tooltip>
        </div>

        {/* Stroke width selector */}
        <div className="hidden sm:flex items-center gap-1 bg-[#090B10] px-2 py-1 rounded-xl border border-[#212836]">
          {strokeSizes.map(({ size, label }) => {
            const isCurrent = strokeWidth === size;
            return (
              <Tooltip key={size} content={label}>
                <motion.button
                  whileTap={{ scale: 0.90 }}
                  onClick={() => setStrokeWidth(size)}
                  className={cn(
                    'relative w-6 h-6 rounded-lg flex items-center justify-center transition-colors',
                    isCurrent
                      ? 'text-[#8B7CFF]'
                      : 'text-[#64748B] hover:text-[#94A3B8]'
                  )}
                  aria-label={label}
                >
                  {isCurrent && (
                    <motion.span
                      layoutId="activeStrokeWidthPill"
                      className="absolute inset-0 rounded-lg bg-[#182133] border border-[#2B3852] -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}
                  <span
                    className="rounded-full bg-current transition-all"
                    style={{ width: `${Math.max(2, size)}px`, height: `${Math.max(2, size)}px` }}
                  />
                </motion.button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Right Cluster: Background Grid, Undo/Redo, Samples, Clear */}
      <div className="flex items-center gap-1.5">
        {/* Background Paper Selector */}
        <div className="flex items-center gap-1.5 bg-[#090B10] px-2.5 py-1 rounded-xl border border-[#212836]">
          <Grid className="w-3.5 h-3.5 text-[#8B7CFF]" />
          <select
            value={gridStyle}
            onChange={(e) => setGridStyle(e.target.value as GridStyle)}
            className="bg-transparent text-xs text-[#CBD5E1] focus:outline-none cursor-pointer pr-1"
            aria-label="Notebook paper background style"
          >
            {gridStyles.map((g) => (
              <option key={g.id} value={g.id} className="bg-[#10141D] text-[#F8FAFC]">
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sample Loader Dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSampleDropdownOpen(!isSampleDropdownOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-[#141A28] text-[#8B7CFF] border border-[#2B3852] hover:bg-[#1C263B] transition-colors"
            title="Load mathematical sample equation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sample</span>
            <ChevronDown className={cn('w-3 h-3 text-[#94A3B8] transition-transform duration-200', isSampleDropdownOpen && 'rotate-180')} />
          </motion.button>

          <AnimatePresence>
            {isSampleDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-full mt-1 w-52 bg-[#0D111A] border border-[#252D3B] rounded-xl shadow-xl z-50 p-1 flex flex-col gap-0.5"
              >
                <span className="text-[10px] font-mono uppercase text-[#64748B] px-2 py-1 font-semibold">
                  Quick Handwriting Demos
                </span>
                {sampleEquations.map((sample) => (
                  <motion.button
                    whileHover={{ x: 2 }}
                    key={sample.id}
                    onClick={() => {
                      onLoadSample(sample.id);
                      setIsSampleDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#F8FAFC] hover:bg-[#182133] hover:text-[#8B7CFF] transition-colors flex items-center justify-between"
                  >
                    <span>{sample.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History: Undo & Redo */}
        <div className="flex items-center gap-0.5 bg-[#090B10] p-0.5 rounded-xl border border-[#212836]">
          <Tooltip content="Undo Stroke" shortcut="Ctrl+Z">
            <motion.button
              whileTap={{ scale: 0.90 }}
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#182133] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Undo stroke"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
          </Tooltip>

          <Tooltip content="Redo Stroke" shortcut="Ctrl+Shift+Z">
            <motion.button
              whileTap={{ scale: 0.90 }}
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#182133] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Redo stroke"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </motion.button>
          </Tooltip>
        </div>

        {/* Clear Canvas */}
        <Tooltip content="Clear Canvas">
          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={onClear}
            disabled={!canUndo}
            className="p-1.5 rounded-xl bg-[#090B10] text-[#94A3B8] border border-[#212836] hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Clear canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </Tooltip>

        {/* Export PNG */}
        <Tooltip content="Download Canvas PNG">
          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={onExportPng}
            disabled={!canUndo}
            className="p-1.5 rounded-xl bg-[#090B10] text-[#94A3B8] border border-[#212836] hover:text-[#38BDF8] hover:border-[#38BDF8]/30 hover:bg-[#38BDF8]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Export canvas PNG"
          >
            <Download className="w-3.5 h-3.5" />
          </motion.button>
        </Tooltip>
      </div>
    </div>
  );
};
