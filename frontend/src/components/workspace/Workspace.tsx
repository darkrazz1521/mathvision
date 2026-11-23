import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HandwritingCanvas } from '../canvas/HandwritingCanvas';
import { PhotoUpload } from '../upload/PhotoUpload';
import { RecognitionView } from '../recognition/RecognitionView';
import { AttentionSpotlight } from '../explainability/AttentionSpotlight';
import { TokenInspector } from '../explainability/TokenInspector';
import { VerificationPanel } from '../verification/VerificationPanel';
import { WorkspaceState, WorkspaceActions } from '../../types/workspace';
import { Tabs } from '../ui/Tabs';
import { Tooltip } from '../ui/Tooltip';
import { Modal } from '../ui/Modal';
import {
  Pen,
  Image as ImageIcon,
  Sparkles,
  BrainCircuit,
  Columns3,
  SquareDashedBottomCode,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Lightbulb,
  Crosshair,
  ShieldCheck,
  Binary,
  QrCode,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface WorkspaceProps {
  workspace: WorkspaceState;
  actions: WorkspaceActions;
  onRecognize: (fileOrBlob: Blob | File, previewUrl: string, explicitMode?: 'canvas' | 'photo') => void;
  isRecognizing: boolean;
  onOpenQrSync?: () => void;
  incomingPhoto?: { file: File; dataUrl: string } | null;
  onClearIncomingPhoto?: () => void;
  onRetry?: () => void;
}

export type WorkspaceViewMode = 'balanced' | 'canvas-focus' | 'inspect-focus';

export const Workspace: React.FC<WorkspaceProps> = ({
  workspace,
  actions,
  onRecognize,
  isRecognizing,
  onOpenQrSync,
  incomingPhoto,
  onClearIncomingPhoto,
  onRetry,
}) => {
  // Mobile / tablet segmented view selector (<1024px)
  const [mobileView, setMobileView] = useState<'input' | 'recognition' | 'explainability'>('input');

  // Studio View Mode & Panel Collapse States (>=1024px)
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('balanced');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);

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

  // Determine explicit desktop grid areas and track sizing
  const getDesktopGridStyle = (): React.CSSProperties => {
    if (viewMode === 'canvas-focus') {
      if (isRightCollapsed) {
        return {
          display: 'grid',
          gridTemplateAreas: '"input output"',
          gridTemplateColumns: 'minmax(420px, 1.5fr) minmax(340px, 1fr)',
        };
      }
      return {
        display: 'grid',
        gridTemplateAreas: '"input output explain"',
        gridTemplateColumns: 'minmax(380px, 1.35fr) minmax(320px, 1fr) minmax(280px, 0.85fr)',
      };
    }

    if (viewMode === 'inspect-focus') {
      if (isLeftCollapsed) {
        return {
          display: 'grid',
          gridTemplateAreas: '"output explain"',
          gridTemplateColumns: 'minmax(340px, 1fr) minmax(440px, 1.45fr)',
        };
      }
      return {
        display: 'grid',
        gridTemplateAreas: '"input output explain"',
        gridTemplateColumns: 'minmax(280px, 0.85fr) minmax(320px, 1fr) minmax(400px, 1.4fr)',
      };
    }

    // Default: Studio 3-Zone (Balanced)
    if (isLeftCollapsed && isRightCollapsed) {
      return {
        display: 'grid',
        gridTemplateAreas: '"output"',
        gridTemplateColumns: '1fr',
      };
    }
    if (isLeftCollapsed) {
      return {
        display: 'grid',
        gridTemplateAreas: '"output explain"',
        gridTemplateColumns: 'minmax(360px, 1fr) minmax(360px, 1fr)',
      };
    }
    if (isRightCollapsed) {
      return {
        display: 'grid',
        gridTemplateAreas: '"input output"',
        gridTemplateColumns: 'minmax(380px, 1.25fr) minmax(340px, 1fr)',
      };
    }

    return {
      display: 'grid',
      gridTemplateAreas: '"input output explain"',
      gridTemplateColumns: 'minmax(300px, 1.1fr) minmax(330px, 1fr) minmax(300px, 1fr)',
    };
  };

  const isLeftVisibleDesktop = !isLeftCollapsed;
  const isCenterVisibleDesktop = true;
  const isRightVisibleDesktop =
    !isRightCollapsed && (viewMode !== 'canvas-focus' || !isRightCollapsed);

  // Render Input Component (Digital Ink or Notebook Photo)
  const renderInputPanel = () => (
    <div className="flex-1 min-h-0 min-w-0 h-full w-full overflow-hidden shadow-sm rounded-xl box-border">
      {inputMode === 'canvas' ? (
        <HandwritingCanvas
          onRecognize={(blob, previewUrl) => {
            onRecognize(blob, previewUrl);
            setMobileView('recognition');
            setIsRightCollapsed(false);
          }}
          isRecognizing={isRecognizing}
        />
      ) : (
        <PhotoUpload
          onRecognize={(file, previewUrl) => {
            onRecognize(file, previewUrl, 'photo');
            setMobileView('recognition');
            setIsRightCollapsed(false);
          }}
          isRecognizing={isRecognizing}
          preprocessedImage={prediction?.preprocessed_image}
          incomingPhoto={incomingPhoto}
          onClearIncomingPhoto={onClearIncomingPhoto}
        />
      )}
    </div>
  );

  // Render Explainability Panel Content
  const renderExplainPanel = () => (
    <div className="flex flex-col h-full min-h-0 min-w-0 w-full gap-2.5 overflow-y-auto pr-1 box-border">
      {/* Panel Top Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D111A] rounded-xl border border-[#212836] shrink-0 shadow-sm select-none">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[#8B7CFF]" />
          <h3 className="text-xs font-bold text-[#F8FAFC]">
            Intelligence & Explainability
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#94A3B8]">
            {prediction ? `${prediction.tokens.length} Symbols` : 'Standby'}
          </span>

          {prediction && (
            <Tooltip content="Expand Full Deep-Dive Inspection">
              <button
                onClick={() => setIsExplainModalOpen(true)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#8B7CFF] hover:bg-[#8B7CFF]/10 transition-colors"
                aria-label="Expand Full Deep-Dive Inspection"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {prediction ? (
        <div className="flex flex-col gap-2.5">
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
        </div>
      ) : (
        /* Standby State with Architectural Explanation & Guide */
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-[#0D111A] border border-[#212836] shadow-sm overflow-y-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#141A28] border border-[#212836] text-[#8B7CFF] flex items-center justify-center mb-3 shadow-md">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="text-sm font-bold text-[#F8FAFC]">
            Neural Explainability Standby
          </h4>
          <p className="text-xs text-[#94A3B8] max-w-xs mt-1.5 leading-relaxed">
            Draw an expression or upload a notebook photograph, then click <strong className="text-[#F8FAFC]">Recognize Equation</strong>.
          </p>

          <div className="mt-5 p-3 rounded-xl bg-[#080B11] border border-[#212836] text-left w-full max-w-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8]">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Explainability Features:</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-[#94A3B8]">
              <div className="flex items-start gap-2">
                <Crosshair className="w-3.5 h-3.5 text-[#8B7CFF] shrink-0 mt-0.5" />
                <span>Cross-attention 2D spatial spotlight per emitted token</span>
              </div>
              <div className="flex items-start gap-2">
                <Binary className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                <span>Beam search alternative token probability inspection</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>SymPy Computer Algebra System syntactic verification</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col h-full w-full overflow-hidden bg-[#090B10] text-[#F1F5F9]">
      {/* ======================================================== */}
      {/* STUDIO TOOLBAR: Layout Switcher, Collapses, Mode Pills   */}
      {/* ======================================================== */}
      <div className="h-10 min-h-[40px] px-3.5 bg-[#0D111A] border-b border-[#212836] flex items-center justify-between shrink-0 select-none z-10">
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

          {onOpenQrSync && (
            <button
              onClick={onOpenQrSync}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/40 hover:bg-[#8B7CFF]/25 transition-colors select-none"
              title="Scan QR to capture photo using phone camera"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phone QR</span>
            </button>
          )}

          {/* Quick Collapse Left Button */}
          <Tooltip content={isLeftCollapsed ? 'Show Input Panel' : 'Collapse Input Panel'}>
            <button
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
              className={cn(
                'hidden lg:flex items-center gap-1 p-1 rounded-lg text-xs transition-colors border',
                isLeftCollapsed
                  ? 'bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/40'
                  : 'bg-[#090B10] text-[#94A3B8] border-[#212836] hover:text-[#F1F5F9]'
              )}
              aria-label="Toggle input panel"
            >
              <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform', isLeftCollapsed && 'rotate-180')} />
            </button>
          </Tooltip>
        </div>

        {/* Center: Viewport Mode Switcher (Studio vs Canvas Focus vs Inspect Focus) */}
        <div className="hidden md:flex items-center relative gap-1 bg-[#090B10] p-0.5 rounded-xl border border-[#212836]">
          <button
            onClick={() => {
              setViewMode('balanced');
              setIsLeftCollapsed(false);
              setIsRightCollapsed(false);
            }}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors select-none z-10',
              viewMode === 'balanced' && !isLeftCollapsed && !isRightCollapsed
                ? 'text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            )}
          >
            {viewMode === 'balanced' && !isLeftCollapsed && !isRightCollapsed && (
              <motion.div
                layoutId="activeWorkspaceViewMode"
                className="absolute inset-0 bg-[#182133] border border-[#2B3852] rounded-lg -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <Columns3 className="w-3.5 h-3.5 text-[#8B7CFF]" />
            <span>Studio (3-Zone)</span>
          </button>

          <button
            onClick={() => {
              setViewMode('canvas-focus');
              setIsLeftCollapsed(false);
              setIsRightCollapsed(true);
            }}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors select-none z-10',
              viewMode === 'canvas-focus'
                ? 'text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            )}
          >
            {viewMode === 'canvas-focus' && (
              <motion.div
                layoutId="activeWorkspaceViewMode"
                className="absolute inset-0 bg-[#182133] border border-[#2B3852] rounded-lg -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <SquareDashedBottomCode className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Canvas Focus</span>
          </button>

          <button
            onClick={() => {
              setViewMode('inspect-focus');
              setIsRightCollapsed(false);
            }}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors select-none z-10',
              viewMode === 'inspect-focus'
                ? 'text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            )}
          >
            {viewMode === 'inspect-focus' && (
              <motion.div
                layoutId="activeWorkspaceViewMode"
                className="absolute inset-0 bg-[#182133] border border-[#2B3852] rounded-lg -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
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
                'hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border select-none',
                isRightCollapsed
                  ? 'bg-[#090B10] text-[#94A3B8] border-[#212836] hover:text-[#F1F5F9]'
                  : 'bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/35'
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

      {/* Mobile / Tablet Segmented Navigation (<1024px) */}
      <div className="lg:hidden flex items-center justify-between p-2 bg-[#0D111A] border-b border-[#212836] shrink-0">
        <div className="flex items-center gap-1 bg-[#090B10] p-1 rounded-xl border border-[#212836] w-full justify-around">
          <button
            onClick={() => setMobileView('input')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors',
              mobileView === 'input'
                ? 'bg-[#182133] text-[#F8FAFC] border border-[#2B3852]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            )}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Input</span>
          </button>
          <button
            onClick={() => setMobileView('recognition')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors',
              mobileView === 'recognition'
                ? 'bg-[#182133] text-[#F8FAFC] border border-[#2B3852]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Output</span>
            {(prediction || isRecognizing) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </button>
          <button
            onClick={() => setMobileView('explainability')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors',
              mobileView === 'explainability'
                ? 'bg-[#182133] text-[#F8FAFC] border border-[#2B3852]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            )}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#8B7CFF]" />
            <span>Explain</span>
            {prediction && <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF]" />}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP 3-ZONE EXPLICIT CSS GRID (>=1024px)              */}
      {/* ======================================================== */}
      <div
        className="flex-1 min-h-0 min-w-0 w-full p-3 gap-3 overflow-hidden hidden lg:grid box-border"
        style={getDesktopGridStyle()}
      >
        {/* Panel 1: Input (Digital Ink / Notebook Photo) */}
        {isLeftVisibleDesktop && (
          <div
            style={{ gridArea: 'input' }}
            className="flex flex-col h-full min-h-0 min-w-0 w-full overflow-hidden box-border"
          >
            {renderInputPanel()}
          </div>
        )}

        {/* Panel 2: Recognition Output & LaTeX Editor */}
        {isCenterVisibleDesktop && (
          <div
            style={{ gridArea: 'output' }}
            className="flex flex-col h-full min-h-0 min-w-0 w-full overflow-hidden box-border"
          >
            <RecognitionView
              workspace={workspace}
              actions={actions}
              onRetry={onRetry}
            />
          </div>
        )}

        {/* Panel 3: Intelligence & Explainability */}
        {isRightVisibleDesktop && (
          <div
            style={{ gridArea: 'explain' }}
            className="flex flex-col h-full min-h-0 min-w-0 w-full overflow-hidden box-border"
          >
            {renderExplainPanel()}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MOBILE / TABLET SEGMENTED VIEW CONTAINER (<1024px)       */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 min-w-0 w-full p-2.5 overflow-hidden flex flex-col lg:hidden box-border">
        {mobileView === 'input' && (
          <div className="flex flex-col h-full min-h-0 min-w-0 w-full overflow-hidden">
            {renderInputPanel()}
          </div>
        )}

        {mobileView === 'recognition' && (
          <div className="flex flex-col h-full min-h-0 min-w-0 w-full overflow-hidden">
            <RecognitionView
              workspace={workspace}
              actions={actions}
              onRetry={onRetry}
            />
          </div>
        )}

        {mobileView === 'explainability' && (
          <div className="flex flex-col h-full min-h-0 min-w-0 w-full overflow-hidden">
            {renderExplainPanel()}
          </div>
        )}
      </div>

      {/* Expanded Deep-Dive Intelligence & Explainability Modal */}
      {prediction && (
        <Modal
          isOpen={isExplainModalOpen}
          onClose={() => setIsExplainModalOpen(false)}
          title="Neural Cross-Attention & Spatial Grounding Deep Dive"
          subtitle="Inspect peak attention coordinates on DenseNet feature maps, explore alternative hypotheses, and verify SymPy algebra"
          maxWidth="4xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-2 max-h-[75vh] overflow-y-auto">
            {/* Left: High-Resolution Feature Map & Spotlight (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <span className="text-xs font-semibold text-[#8B7CFF] uppercase tracking-wider block font-mono">
                DenseNet-121 Feature Memory & Attention Grid
              </span>

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
            </div>

            {/* Right: Detailed Token Sequence & SymPy Verification (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <TokenInspector
                tokens={prediction.tokens}
                activeTokenIndex={activeTokenIndex}
                onSelectToken={actions.setActiveTokenIndex}
                onReplaceToken={actions.replaceToken}
                tokenEdits={tokenEdits}
              />

              <VerificationPanel
                syntaxValid={prediction.syntax_valid}
                sympy={prediction.sympy}
                currentLatex={editedLatex}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
