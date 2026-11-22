import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasControls } from './CanvasControls';
import { CanvasTool, GridStyle } from '../../types/workspace';
import { Stroke, setupHighDpiCanvas, redrawStrokes, exportCanvasForBackend } from '../../utils/canvas';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '../../utils/cn';

interface HandwritingCanvasProps {
  onRecognize: (blob: Blob, previewUrl: string) => void;
  isRecognizing: boolean;
  disabled?: boolean;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  onRecognize,
  isRecognizing,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<CanvasTool>('pen');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [gridStyle, setGridStyle] = useState<GridStyle>('dots');

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  // Redraw canvas whenever strokes change or canvas re-sizes
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    redrawStrokes(ctx, strokes);
  }, [strokes]);

  // Resize canvas when container size changes
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setupHighDpiCanvas(canvas, rect.width, rect.height);
        redraw();
      }
    };

    updateSize();
    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [redraw]);

  // Pointer event handlers
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || isRecognizing) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const point = getCoordinates(e);
    const newStroke: Stroke = {
      points: [point],
      color: tool === 'pen' ? '#F1F5F9' : '#090B10',
      size: strokeWidth,
      isEraser: tool === 'eraser',
    };

    currentStrokeRef.current = newStroke;
    setIsDrawing(true);
    setRedoStack([]); // Clear redo stack on new stroke
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const point = getCoordinates(e);
    currentStrokeRef.current.points.push(point);

    // Live continuous drawing directly onto canvas context for maximum responsiveness
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        redrawStrokes(ctx, [...strokes, currentStrokeRef.current]);
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentStrokeRef.current) return;
    setIsDrawing(false);
    const completedStroke = currentStrokeRef.current;
    currentStrokeRef.current = null;

    if (completedStroke.points.length > 0) {
      setStrokes((prev) => [...prev, completedStroke]);
    }
  };

  // Undo / Redo / Clear actions
  const handleUndo = useCallback(() => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, last]);
  }, [strokes]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setStrokes((prev) => [...prev, next]);
  }, [redoStack]);

  const handleClear = useCallback(() => {
    if (strokes.length === 0) return;
    setStrokes([]);
    setRedoStack([]);
  }, [strokes]);

  // Keyboard shortcut listeners (Ctrl+Z, Ctrl+Shift+Z, P, E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        handleRedo();
      } else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'p') {
        setTool('pen');
      } else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'e') {
        setTool('eraser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Export Canvas PNG
  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathvision-canvas-${Date.now()}.png`;
    a.click();
  };

  // Submit canvas to recognition engine
  const handleRecognizeSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;

    try {
      const blob = await exportCanvasForBackend(canvas, strokes);
      const previewUrl = canvas.toDataURL('image/png');
      onRecognize(blob, previewUrl);
    } catch (err) {
      console.error('Failed to export canvas blob:', err);
    }
  };

  // Preload sample strokes
  const handleLoadSample = (sampleId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const newStrokes: Stroke[] = [];
    const color = '#F1F5F9';
    const size = 4;

    if (sampleId === 'fraction') {
      // Draw: (a + b) / c
      // Horizontal fraction bar:
      newStrokes.push({
        points: [{ x: cx - 100, y: cy }, { x: cx + 100, y: cy }],
        color,
        size,
        isEraser: false,
      });
      // 'a' on top-left:
      newStrokes.push({
        points: [
          { x: cx - 60, y: cy - 20 },
          { x: cx - 40, y: cy - 20 },
          { x: cx - 40, y: cy - 50 },
          { x: cx - 60, y: cy - 50 },
          { x: cx - 60, y: cy - 20 },
          { x: cx - 35, y: cy - 20 },
        ],
        color,
        size,
        isEraser: false,
      });
      // '+' on top-center:
      newStrokes.push({
        points: [{ x: cx - 15, y: cy - 35 }, { x: cx + 15, y: cy - 35 }],
        color,
        size,
        isEraser: false,
      });
      newStrokes.push({
        points: [{ x: cx, y: cy - 50 }, { x: cx, y: cy - 20 }],
        color,
        size,
        isEraser: false,
      });
      // 'b' on top-right:
      newStrokes.push({
        points: [
          { x: cx + 35, y: cy - 55 },
          { x: cx + 35, y: cy - 20 },
          { x: cx + 55, y: cy - 20 },
          { x: cx + 55, y: cy - 38 },
          { x: cx + 35, y: cy - 38 },
        ],
        color,
        size,
        isEraser: false,
      });
      // 'c' on bottom:
      newStrokes.push({
        points: [
          { x: cx + 15, y: cy + 25 },
          { x: cx - 10, y: cy + 25 },
          { x: cx - 15, y: cy + 45 },
          { x: cx + 15, y: cy + 50 },
        ],
        color,
        size,
        isEraser: false,
      });
    } else if (sampleId === 'quadratic') {
      // Draw: x^2 + 4 = 0
      // 'x'
      newStrokes.push({
        points: [{ x: cx - 110, y: cy - 20 }, { x: cx - 75, y: cy + 20 }],
        color,
        size,
        isEraser: false,
      });
      newStrokes.push({
        points: [{ x: cx - 75, y: cy - 20 }, { x: cx - 110, y: cy + 20 }],
        color,
        size,
        isEraser: false,
      });
      // '^2'
      newStrokes.push({
        points: [
          { x: cx - 65, y: cy - 35 },
          { x: cx - 45, y: cy - 35 },
          { x: cx - 65, y: cy - 10 },
          { x: cx - 45, y: cy - 10 },
        ],
        color,
        size,
        isEraser: false,
      });
      // '+'
      newStrokes.push({
        points: [{ x: cx - 30, y: cy }, { x: cx - 5, y: cy }],
        color,
        size,
        isEraser: false,
      });
      newStrokes.push({
        points: [{ x: cx - 17, y: cy - 15 }, { x: cx - 17, y: cy + 15 }],
        color,
        size,
        isEraser: false,
      });
      // '4'
      newStrokes.push({
        points: [
          { x: cx + 15, y: cy - 20 },
          { x: cx + 15, y: cy + 5 },
          { x: cx + 40, y: cy + 5 },
        ],
        color,
        size,
        isEraser: false,
      });
      newStrokes.push({
        points: [{ x: cx + 32, y: cy - 20 }, { x: cx + 32, y: cy + 20 }],
        color,
        size,
        isEraser: false,
      });
      // '='
      newStrokes.push({
        points: [{ x: cx + 55, y: cy - 6 }, { x: cx + 80, y: cy - 6 }],
        color,
        size,
        isEraser: false,
      });
      newStrokes.push({
        points: [{ x: cx + 55, y: cy + 6 }, { x: cx + 80, y: cy + 6 }],
        color,
        size,
        isEraser: false,
      });
      // '0'
      newStrokes.push({
        points: [
          { x: cx + 105, y: cy - 20 },
          { x: cx + 90, y: cy - 20 },
          { x: cx + 90, y: cy + 20 },
          { x: cx + 115, y: cy + 20 },
          { x: cx + 115, y: cy - 20 },
          { x: cx + 105, y: cy - 20 },
        ],
        color,
        size,
        isEraser: false,
      });
    } else {
      // Draw: \int x dx
      // '\int'
      newStrokes.push({
        points: [
          { x: cx - 70, y: cy - 40 },
          { x: cx - 85, y: cy - 40 },
          { x: cx - 80, y: cy },
          { x: cx - 75, y: cy + 40 },
          { x: cx - 90, y: cy + 40 },
        ],
        color,
        size,
        isEraser: false,
      });
      // 'x'
      newStrokes.push({
        points: [{ x: cx - 45, y: cy - 15 }, { x: cx - 15, y: cy + 15 }],
        color,
        size,
        isEraser: false,
      });
      newStrokes.push({
        points: [{ x: cx - 15, y: cy - 15 }, { x: cx - 45, y: cy + 15 }],
        color,
        size,
        isEraser: false,
      });
      // 'd'
      newStrokes.push({
        points: [
          { x: cx + 15, y: cy - 35 },
          { x: cx + 15, y: cy + 15 },
          { x: cx - 5, y: cy + 15 },
          { x: cx - 5, y: cy - 5 },
          { x: cx + 15, y: cy - 5 },
        ],
        color,
        size,
        isEraser: false,
      });
      // 'x'
      newStrokes.push({
        points: [{ x: cx + 30, y: cy - 15 }, { x: cx + 55, y: cy + 15 }],
        color,
        size,
        isEraser: false,
      });
      newStrokes.push({
        points: [{ x: cx + 55, y: cy - 15 }, { x: cx + 30, y: cy + 15 }],
        color,
        size,
        isEraser: false,
      });
    }

    setStrokes(newStrokes);
    setRedoStack([]);
  };

  const gridClass = {
    dots: 'canvas-grid-dots',
    lines: 'canvas-grid-lines',
    ruled: 'canvas-ruled-paper',
    none: 'bg-[#090B10]',
  }[gridStyle];

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0D111A] rounded-xl border border-[#212836] overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      <CanvasControls
        tool={tool}
        setTool={setTool}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        gridStyle={gridStyle}
        setGridStyle={setGridStyle}
        canUndo={strokes.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onExportPng={handleExportPng}
        onLoadSample={handleLoadSample}
      />

      {/* Main Drawing Surface */}
      <div
        ref={containerRef}
        className={cn(
          'relative flex-1 min-h-0 w-full overflow-hidden select-none touch-none',
          tool === 'pen' ? 'cursor-crosshair' : 'cursor-cell',
          gridClass
        )}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 block w-full h-full"
        />

        {/* Empty State Onboarding Overlay */}
        {strokes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="p-3.5 rounded-2xl bg-[#141A28]/90 border border-[#212836] text-[#8B7CFF] mb-3 backdrop-blur-md shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-[#F8FAFC] tracking-tight">
              Write your mathematical expression here
            </p>
            <p className="text-xs text-[#94A3B8] max-w-xs mt-1.5 leading-relaxed">
              Use your mouse, stylus, or touch screen. Write fractions, exponents, Greek symbols, integrals, or matrices.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pointer-events-auto">
              <span className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-1 mr-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Or load sample:
              </span>
              <button
                onClick={() => handleLoadSample('fraction')}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#141A28] hover:bg-[#1C253B] text-[#8B7CFF] border border-[#252D3B] hover:border-[#8B7CFF]/40 transition-colors font-mono font-medium"
              >
                (a + b) / c
              </button>
              <button
                onClick={() => handleLoadSample('quadratic')}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#141A28] hover:bg-[#1C253B] text-[#38BDF8] border border-[#252D3B] hover:border-[#38BDF8]/40 transition-colors font-mono font-medium"
              >
                x² + 4 = 0
              </button>
              <button
                onClick={() => handleLoadSample('integral')}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#141A28] hover:bg-[#1C253B] text-emerald-400 border border-[#252D3B] hover:border-emerald-500/40 transition-colors font-mono font-medium"
              >
                ∫ x dx
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Footer Bar with Stroke info and Primary Recognize CTA */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#0B0E16] border-t border-[#212836]">
        <div className="text-xs text-[#94A3B8] flex items-center gap-2.5 font-mono">
          <span>
            Strokes: <strong className="text-[#F8FAFC]">{strokes.length}</strong>
          </span>
          <span className="text-[#334155]">•</span>
          <span>
            DPI: <strong className="text-[#F8FAFC]">{window.devicePixelRatio || 1}x</strong>
          </span>
          {strokes.length > 0 && (
            <>
              <span className="text-[#334155]">•</span>
              <span className="text-emerald-400 text-[11px]">Ink Ready</span>
            </>
          )}
        </div>

        <Button
          variant="primary"
          size="md"
          disabled={strokes.length === 0 || isRecognizing}
          isLoading={isRecognizing}
          onClick={handleRecognizeSubmit}
          shortcut="Ctrl+Enter"
          icon={<ArrowRight className="w-4 h-4" />}
          className={cn(
            'shadow-lg transition-all',
            strokes.length > 0 && !isRecognizing && 'shadow-glow-accent hover:scale-[1.02]'
          )}
        >
          {isRecognizing ? 'Recognizing Expression...' : 'Recognize Equation'}
        </Button>
      </div>
    </div>
  );
};
