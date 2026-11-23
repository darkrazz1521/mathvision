import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LatexEditor } from './LatexEditor';
import { PipelineProgress } from './PipelineProgress';
import { WorkspaceState, WorkspaceActions } from '../../types/workspace';
import { formatConfidence } from '../../utils/latex';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import {
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Loader2,
  Scan,
  RefreshCw,
  AlertCircle,
  Binary,
} from 'lucide-react';
import { saveHistoryEntry } from '../../services/historyStorage';
import { useToast } from '../ui/Toast';

interface RecognitionViewProps {
  workspace: WorkspaceState;
  actions: WorkspaceActions;
  onRetry?: () => void;
}

export const RecognitionView: React.FC<RecognitionViewProps> = ({
  workspace,
  actions,
  onRetry,
}) => {
  const { success } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const {
    prediction,
    editedLatex,
    processingStatus,
    currentStepMessage,
    errorMessage,
    inputImagePreview,
  } = workspace;

  const isProcessing =
    processingStatus === 'preparing' ||
    processingStatus === 'preprocessing' ||
    processingStatus === 'decoding' ||
    processingStatus === 'verifying';

  // Elapsed timer during active recognition processing
  useEffect(() => {
    if (!isProcessing) {
      setElapsedMs(0);
      return;
    }
    const startTime = performance.now();
    const interval = setInterval(() => {
      setElapsedMs(Math.round(performance.now() - startTime));
    }, 50);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const isModified = prediction ? prediction.latex !== editedLatex : false;

  const handleSaveToFavorites = () => {
    if (!prediction) return;
    saveHistoryEntry({
      inputMode: workspace.inputMode,
      inputPreview: workspace.inputImagePreview || '',
      originalLatex: prediction.latex,
      currentLatex: editedLatex,
      tokens: prediction.tokens,
      avgConfidence: prediction.avg_confidence,
      latencyMs: prediction.latency_ms,
      syntaxValid: prediction.syntax_valid,
      sympy: prediction.sympy,
      preprocessedImage: prediction.preprocessed_image,
      isFavorite: true,
    });
    setIsSaved(true);
    success('Saved Equation', 'Expression stored in your workspace favorites.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-2.5 overflow-hidden">
      {/* Top Status & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[#0D111A] rounded-xl border border-[#212836] shrink-0 select-none shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#8B7CFF]/15 text-[#8B7CFF]">
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B7CFF]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#F8FAFC] leading-none">
              Recognition Output
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#182133] text-[#38BDF8] border border-[#2B3852]">
              v4-Final
            </span>
          </div>
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-[#8B7CFF] bg-[#8B7CFF]/10 px-2 py-0.5 rounded border border-[#8B7CFF]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF] animate-ping" />
              Recognizing... ({(elapsedMs / 1000).toFixed(1)}s)
            </span>
          </div>
        )}

        {prediction && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-1.5"
          >
            {/* Sequence Mean Confidence Badge */}
            <Tooltip content="Mean token emission confidence across the decoded sequence">
              <Badge
                variant={prediction.avg_confidence > 0.85 ? 'success' : 'warning'}
                dot
                size="sm"
              >
                {formatConfidence(prediction.avg_confidence)} Seq Avg
              </Badge>
            </Tooltip>

            {/* Latency Badge */}
            <Tooltip content="Measured end-to-end CPU inference + SymPy validation latency">
              <Badge variant="cyan" size="sm">
                <Clock className="w-3 h-3 mr-1 inline" />
                {prediction.latency_ms} ms
              </Badge>
            </Tooltip>

            {/* Save Equation Button */}
            <Tooltip content={isSaved ? 'Saved to Favorites!' : 'Save to Favorites'}>
              <Button
                size="xs"
                variant={isSaved ? 'primary' : 'outline'}
                onClick={handleSaveToFavorites}
                icon={isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </Tooltip>
          </motion.div>
        )}
      </div>

      {/* Pipeline Progress Indicator */}
      {(isProcessing || prediction || processingStatus === 'error') && (
        <div className="shrink-0">
          <PipelineProgress
            status={processingStatus}
            currentMessage={currentStepMessage}
            latencyMs={prediction?.latency_ms}
            sympyValid={prediction?.sympy?.valid}
            syntaxValid={prediction?.syntax_valid}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-2">
        {/* Warning Banner */}
        {prediction && (prediction.is_ood || prediction.warning) && !isProcessing && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs shadow-sm shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1 text-[11px] leading-snug">
              <strong className="text-amber-200">Scribble Warning: </strong>
              <span>
                {prediction.warning ||
                  'Low confidence — handwriting may contain ambiguous non-mathematical strokes.'}
              </span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STATE 1: ACTIVE PROCESSING */}
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center bg-[#0D111A] rounded-xl border border-[#212836] shadow-sm relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#8B7CFF]/5 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
                {/* Neural Scanner Orb */}
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#141A28] border border-[#8B7CFF]/40 text-[#8B7CFF] flex items-center justify-center shadow-glow-accent">
                    <Binary className="w-8 h-8 animate-pulse text-[#38BDF8]" />
                  </div>
                  <div className="absolute -inset-1.5 rounded-2xl border border-[#8B7CFF]/30 animate-ping pointer-events-none opacity-40" />
                </div>

                <h4 className="text-sm font-bold text-[#F8FAFC] tracking-tight">
                  Neural Mathematical Recognition
                </h4>

                <p className="text-xs text-[#94A3B8] mt-1 font-mono">
                  {currentStepMessage || 'Processing expression with DenseNet-121 & Coverage Attention...'}
                </p>

                {/* Input Image Scanning Thumbnail */}
                {inputImagePreview && (
                  <div className="mt-4 relative rounded-lg overflow-hidden border border-[#252D3B] bg-[#090B10] max-h-24 max-w-[200px] shadow-inner">
                    <img
                      src={inputImagePreview}
                      alt="Input Preview"
                      className="w-full h-full object-contain opacity-75"
                    />
                    {/* Laser Scanner Line */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_8px_#38BDF8] animate-bounce" />
                  </div>
                )}

                {/* Indeterminate Gradient Beam */}
                <div className="w-full h-1 bg-[#151B27] rounded-full overflow-hidden mt-5 border border-[#212836]">
                  <div className="w-1/2 h-full bg-gradient-to-r from-[#8B7CFF] via-[#38BDF8] to-emerald-400 rounded-full animate-pulse" />
                </div>

                <div className="flex items-center justify-between w-full mt-2 text-[10px] text-[#64748B] font-mono">
                  <span>DenseNet-121 Backbone</span>
                  <span>Coverage Attention V4</span>
                  <span>SymPy CAS</span>
                </div>
              </div>
            </motion.div>
          ) : processingStatus === 'error' ? (
            /* STATE 2: PIPELINE ERROR */
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center bg-[#0D111A] rounded-xl border border-rose-500/30 shadow-sm overflow-y-auto"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3 shadow-md">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-rose-200">
                Recognition Pipeline Error
              </h4>
              <p className="text-xs text-[#94A3B8] max-w-sm mt-1.5 leading-relaxed font-mono">
                {errorMessage || 'Failed to complete mathematical recognition. Ensure input strokes or image is clearly visible.'}
              </p>

              <div className="flex items-center gap-2 mt-5">
                {onRetry && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onRetry}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Retry Recognition
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.setProcessingStatus('idle')}
                >
                  Dismiss Error
                </Button>
              </div>
            </motion.div>
          ) : prediction ? (
            /* STATE 3: PREDICTION SUCCESS */
            <motion.div
              key="prediction"
              initial={{ opacity: 0, scale: 0.98, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              <LatexEditor
                originalLatex={prediction.latex}
                currentLatex={editedLatex}
                onLatexChange={actions.setEditedLatex}
                onReset={actions.resetToOriginalPrediction}
                isModified={isModified}
              />
            </motion.div>
          ) : (
            /* STATE 4: SCIENTIFIC STANDBY */
            <motion.div
              key="standby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center bg-[#0D111A] rounded-xl border border-[#212836] shadow-sm overflow-y-auto"
            >
              <div className="p-3.5 rounded-2xl bg-[#141A28] border border-[#212836] text-[#8B7CFF] mb-3.5 shadow-md">
                <Layers className="w-7 h-7 opacity-80" />
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">
                Ready for Mathematical Recognition
              </h4>
              <p className="text-xs text-[#94A3B8] max-w-sm mt-1.5 leading-relaxed">
                Inscribe an equation on the canvas or ingest a photograph, then click <strong className="text-[#F8FAFC]">Recognize Equation</strong>.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs text-left">
                <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#212836] flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-semibold text-[#CBD5E1] block">Two-Dimensional Syntax</span>
                    <span className="text-[#64748B]">Fractions, exponents, square roots, matrices</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#212836] flex items-start gap-2.5">
                  <Cpu className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-semibold text-[#CBD5E1] block">DenseNet-121 + Beam Search</span>
                    <span className="text-[#64748B]">Real-time INT8 CPU inference in ~120ms</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#212836] flex items-start gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B7CFF] shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-semibold text-[#CBD5E1] block">SymPy Computer Algebra</span>
                    <span className="text-[#64748B]">Automated mathematical syntax verification</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
