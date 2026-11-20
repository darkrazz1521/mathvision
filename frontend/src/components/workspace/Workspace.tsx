import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandwritingCanvas } from '../canvas/HandwritingCanvas';
import { PhotoUpload } from '../upload/PhotoUpload';
import { RecognitionView } from '../recognition/RecognitionView';
import { AttentionSpotlight } from '../explainability/AttentionSpotlight';
import { TokenInspector } from '../explainability/TokenInspector';
import { VerificationPanel } from '../verification/VerificationPanel';
import { WorkspaceState, WorkspaceActions } from '../../types/workspace';
import { Tabs } from '../ui/Tabs';
import { Tooltip } from '../ui/Tooltip';
import {
  Pen,
  Image as ImageIcon,
  Sparkles,
  BrainCircuit,
  Columns3,
  SquareDashedBottomCode,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface WorkspaceProps {
  workspace: WorkspaceState;
  actions: WorkspaceActions;
  onRecognize: (fileOrBlob: Blob | File, previewUrl: string) => void;
  isRecognizing: boolean;
}

export type WorkspaceViewMode = 'balanced' | 'canvas-focus' | 'inspect-focus';

export const Workspace: React.FC<WorkspaceProps> = ({
  workspace,
  actions,
  onRecognize,
  isRecognizing,
}) => {
  // Mobile / small-screen tab view selector
  const [mobileView, setMobileView] = useState<'input' | 'recognition' | 'explainability'>('input');

  // Studio View Mode & Panel Collapse States
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('balanced');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const {
    inputMode,
    prediction,
    editedLatex,
    activeTokenIndex,
    tokenEdits,
    overlayOpacity,
    showSpotlight,
    showCrosshair,
    showCoordinates,
    spotlightRadius,
  } = workspace;

  const activeToken =
    prediction && activeTokenIndex !== null && activeTokenIndex >= 0 && activeTokenIndex < prediction.tokens.length
      ? prediction.tokens[activeTokenIndex]
      : null;

  // Compute dynamic column layout based on viewMode and collapsed panels
  const getColSpan = () => {
    if (viewMode === 'canvas-focus') {
      return {
        left: isLeftCollapsed ? 'hidden' : isRightCollapsed ? 'lg:col-span-8' : 'lg:col-span-7',
        center: isLeftCollapsed ? 'lg:col-span-12' : isRightCollapsed ? 'lg:col-span-4' : 'lg:col-span-5',
        right: isRightCollapsed ? 'hidden' : 'hidden', // Auto-hide right in canvas focus unless toggled
      };
    }

    if (viewMode === 'inspect-focus') {
      return {
        left: isLeftCollapsed ? 'hidden' : 'lg:col-span-3',
        center: isLeftCollapsed ? 'lg:col-span-5' : 'lg:col-span-4',
        right: isRightCollapsed ? 'hidden' : isLeftCollapsed ? 'lg:col-span-7' : 'lg:col-span-5',
      };
    }

    // Balanced Mode:
    if (isLeftCollapsed && isRightCollapsed) {
      return { left: 'hidden', center: 'lg:col-span-12', right: 'hidden' };
    }
    if (isLeftCollapsed) {
      return { left: 'hidden', center: 'lg:col-span-6', right: 'lg:col-span-6' };
    }
    if (isRightCollapsed) {
      return { left: 'lg:col-span-6', center: 'lg:col-span-6', right: 'hidden' };
    }
    return { left: 'lg:col-span-4', center: 'lg:col-span-4', right: 'lg:col-span-4' };
  };

  const colSpans = getColSpan();

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden color-grade-bg text-[#F1F5F9]">
      {/* ======================================================== */}
      {/* STUDIO TOOLBAR: Layout Switcher, Collapses, Mode Pills   */}
      {/* ======================================================== */}
      <div className="h-11 px-4 bg-[#10141D]/90 backdrop-blur-md border-b border-[#252D3B] flex items-center justify-between shrink-0 select-none z-10">
        {/* Left: Input Modality Tabs */}
        <div className="flex items-center gap-2">
          <Tabs
            size="sm"
            tabs={[
              { id: 'canvas', label: 'Digital Ink', icon: <Pen className="w-3.5 h-3.5" /> },
              { id: 'photo', label: 'Notebook Photo', icon: <ImageIcon className="w-3.5 h-3.5" /> },
            ]}
            activeTab={inputMode}
            onChange={(id) => actions.setInputMode(id as 'canvas' | 'photo')}
          />

          {/* Quick Collapse Left Button */}
          <Tooltip content={isLeftCollapsed ? 'Show Input Panel' : 'Collapse Input Panel'}>
            <button
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
              className={cn(
                'hidden lg:flex items-center gap-1 p-1.5 rounded-lg text-xs transition-colors border',
                isLeftCollapsed
                  ? 'bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/40'
                  : 'bg-[#090B10] text-[#94A3B8] border-[#252D3B] hover:text-[#F1F5F9]'
              )}
              aria-label="Toggle input panel"
            >
              <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform', isLeftCollapsed && 'rotate-180')} />
            </button>
          </Tooltip>
        </div>

        {/* Center: Viewport Mode Switcher (Studio vs Canvas Focus vs Inspect Focus) */}
        <div className="hidden md:flex items-center gap-1 bg-[#090B10] p-0.5 rounded-xl border border-[#252D3B]">
          <button
            onClick={() => {
              setViewMode('balanced');
              setIsLeftCollapsed(false);
              setIsRightCollapsed(false);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
              viewMode === 'balanced' && !isLeftCollapsed && !isRightCollapsed
                ? 'bg-[#1E2536] text-[#F1F5F9] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Studio (3-Zone)</span>
          </button>

          <button
            onClick={() => {
              setViewMode('canvas-focus');
              setIsLeftCollapsed(false);
              setIsRightCollapsed(true);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
              viewMode === 'canvas-focus'
                ? 'bg-[#1E2536] text-[#F1F5F9] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <SquareDashedBottomCode className="w-3.5 h-3.5" />
            <span>Canvas Focus</span>
          </button>

          <button
            onClick={() => {
              setViewMode('inspect-focus');
              setIsRightCollapsed(false);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
              viewMode === 'inspect-focus'
                ? 'bg-[#1E2536] text-[#F1F5F9] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Deep Inspection</span>
          </button>
        </div>

        {/* Right: Intelligence Panel Quick Toggle */}
        <div className="flex items-center gap-2">
          <Tooltip content={isRightCollapsed ? 'Show Explainability Panel' : 'Collapse Explainability Panel'}>
            <button
              onClick={() => {
                if (viewMode === 'canvas-focus' && isRightCollapsed) {
                  setViewMode('balanced');
                  setIsRightCollapsed(false);
                } else {
                  setIsRightCollapsed(!isRightCollapsed);
                }
              }}
              className={cn(
                'hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border',
                isRightCollapsed
                  ? 'bg-[#090B10] text-[#94A3B8] border-[#252D3B] hover:text-[#F1F5F9]'
                  : 'bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/40'
              )}
              aria-label="Toggle intelligence panel"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>{isRightCollapsed ? 'Show Explain' : 'Explain Active'}</span>
              <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', isRightCollapsed && 'rotate-180')} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Mobile Segmented Navigation Header */}
      <div className="lg:hidden flex items-center justify-between p-2.5 bg-[#10141D] border-b border-[#252D3B]">
        <div className="flex items-center gap-1 bg-[#090B10] p-1 rounded-xl border border-[#252D3B] w-full justify-around">
          <button
            onClick={() => setMobileView('input')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors',
              mobileView === 'input' ? 'bg-[#1E2536] text-[#F1F5F9]' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Input</span>
          </button>
          <button
            onClick={() => setMobileView('recognition')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors',
              mobileView === 'recognition' ? 'bg-[#1E2536] text-[#F1F5F9]' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Output</span>
            {prediction && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => setMobileView('explainability')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors',
              mobileView === 'explainability' ? 'bg-[#1E2536] text-[#F1F5F9]' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Explain</span>
            {prediction && <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF]" />}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN WORKSPACE GRID                                      */}
      {/* ======================================================== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* ======================================================== */}
        {/* LEFT PANEL: INPUT (Ink Canvas / Photo Upload)            */}
        {/* ======================================================== */}
        <div
          className={cn(
            'flex flex-col gap-2.5 h-full overflow-hidden transition-all duration-300',
            colSpans.left,
            mobileView === 'input' ? 'flex' : 'hidden lg:flex'
          )}
        >
          <div className="flex-1 min-h-0 overflow-hidden shadow-elevated rounded-xl">
            {inputMode === 'canvas' ? (
              <HandwritingCanvas
                onRecognize={(blob, previewUrl) => {
                  onRecognize(blob, previewUrl);
                  if (window.innerWidth < 1024) setMobileView('recognition');
                  // Automatically open right panel when recognized
                  setIsRightCollapsed(false);
                }}
                isRecognizing={isRecognizing}
              />
            ) : (
              <PhotoUpload
                onRecognize={(file, previewUrl) => {
                  onRecognize(file, previewUrl);
                  if (window.innerWidth < 1024) setMobileView('recognition');
                  setIsRightCollapsed(false);
                }}
                isRecognizing={isRecognizing}
                preprocessedImage={prediction?.preprocessed_image}
              />
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER PANEL: RECOGNITION OUTPUT & LATEX EDITOR          */}
        {/* ======================================================== */}
        <div
          className={cn(
            'flex flex-col h-full overflow-hidden transition-all duration-300',
            colSpans.center,
            mobileView === 'recognition' ? 'flex' : 'hidden lg:flex'
          )}
        >
          <RecognitionView workspace={workspace} actions={actions} />
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: INTELLIGENCE, ATTENTION & VERIFICATION      */}
        {/* ======================================================== */}
        <div
          className={cn(
            'flex flex-col h-full gap-3 overflow-y-auto pr-1 transition-all duration-300',
            colSpans.right,
            mobileView === 'explainability' ? 'flex' : 'hidden lg:flex'
          )}
        >
          {/* Panel Top Title */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-[#10141D] rounded-xl border border-[#252D3B] shrink-0 shadow-subtle">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#8B7CFF]" />
              <h3 className="text-xs font-semibold text-[#F1F5F9]">
                Intelligence & Explainability
              </h3>
            </div>

            <span className="text-[10px] font-mono text-[#94A3B8]">
              {prediction ? `${prediction.tokens.length} Symbols` : 'Awaiting Input'}
            </span>
          </div>

          {prediction ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3"
            >
              {/* Feature 1: Spatial Attention Spotlight */}
              {prediction.preprocessed_image && (
                <AttentionSpotlight
                  preprocessedImage={prediction.preprocessed_image}
                  activeToken={activeToken}
                  activeTokenIndex={activeTokenIndex}
                  tokens={prediction.tokens}
                  onSelectToken={actions.setActiveTokenIndex}
                  opacity={overlayOpacity}
                  onOpacityChange={(val) => actions.updateExplainabilityConfig({ overlayOpacity: val })}
                  showSpotlight={showSpotlight}
                  onToggleSpotlight={() => actions.updateExplainabilityConfig({ showSpotlight: !showSpotlight })}
                  showCrosshair={showCrosshair}
                  onToggleCrosshair={() => actions.updateExplainabilityConfig({ showCrosshair: !showCrosshair })}
                  showCoordinates={showCoordinates}
                  onToggleCoordinates={() => actions.updateExplainabilityConfig({ showCoordinates: !showCoordinates })}
                  spotlightRadius={spotlightRadius}
                  onRadiusChange={(val) => actions.updateExplainabilityConfig({ spotlightRadius: val })}
                />
              )}

              {/* Feature 2: Token Inspector & Top-3 Alternatives */}
              <TokenInspector
                tokens={prediction.tokens}
                activeTokenIndex={activeTokenIndex}
                onSelectToken={actions.setActiveTokenIndex}
                onReplaceToken={actions.replaceToken}
                tokenEdits={tokenEdits}
              />

              {/* Feature 3: Mathematical & Symbolic Verification */}
              <VerificationPanel
                syntaxValid={prediction.syntax_valid}
                sympy={prediction.sympy}
                currentLatex={editedLatex}
              />
            </motion.div>
          ) : (
            /* Elegant Guided Empty State instead of messy blank cards */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-[#10141D]/90 border border-[#252D3B] backdrop-blur-md">
              <div className="w-12 h-12 rounded-2xl bg-[#151B27] border border-[#252D3B] text-[#8B7CFF] flex items-center justify-center mb-3 shadow-glow-accent/20">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-semibold text-[#F1F5F9]">
                Neural Inspection Standby
              </h4>
              <p className="text-xs text-[#94A3B8] max-w-xs mt-1.5 leading-relaxed">
                Draw an expression on the digital canvas or upload notebook photo, then click <strong>Recognize Equation</strong>.
              </p>

              <div className="mt-5 p-3 rounded-lg bg-[#090B10] border border-[#252D3B] text-left w-full max-w-xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8] mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>What appears here:</span>
                </div>
                <ul className="text-[11px] text-[#94A3B8] space-y-1 list-disc list-inside">
                  <li>Decoder cross-attention spotlight</li>
                  <li>Token confidence & Top-3 alternatives</li>
                  <li>Symbol-by-symbol correction controls</li>
                  <li>SymPy symbolic simplification</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
