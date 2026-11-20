import React, { useState } from 'react';
import { LatexEditor } from './LatexEditor';
import { PipelineProgress } from './PipelineProgress';
import { WorkspaceState, WorkspaceActions } from '../../types/workspace';
import { formatConfidence } from '../../utils/latex';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Bookmark, BookmarkCheck, Sparkles, Layers, Clock } from 'lucide-react';
import { saveHistoryEntry } from '../../services/historyStorage';
import { useToast } from '../ui/Toast';

interface RecognitionViewProps {
  workspace: WorkspaceState;
  actions: WorkspaceActions;
}

export const RecognitionView: React.FC<RecognitionViewProps> = ({
  workspace,
  actions,
}) => {
  const { success } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  const {
    prediction,
    editedLatex,
    processingStatus,
    currentStepMessage,
  } = workspace;

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
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {/* Top Status & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#10141D] rounded-xl border border-[#252D3B]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#8B7CFF]/15 text-[#8B7CFF]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#F1F5F9] leading-none">
              Recognition Output
            </h3>
            <span className="text-[10px] text-[#94A3B8]">
              DenseNet-121 + Beam Search Decoder
            </span>
          </div>
        </div>

        {prediction && (
          <div className="flex items-center gap-2">
            {/* Confidence Badge */}
            <Tooltip content="Mean token emission confidence from beam search">
              <Badge
                variant={prediction.avg_confidence > 0.85 ? 'success' : 'warning'}
                dot
                size="sm"
              >
                {formatConfidence(prediction.avg_confidence)} Confidence
              </Badge>
            </Tooltip>

            {/* Latency Badge */}
            <Tooltip content="End-to-end CPU inference + SymPy latency">
              <Badge variant="cyan" size="sm">
                <Clock className="w-3 h-3 mr-1 inline" />
                {prediction.latency_ms} ms
              </Badge>
            </Tooltip>

            {/* Save Equation Button */}
            <Tooltip content={isSaved ? 'Saved!' : 'Save to Favorites'}>
              <Button
                size="xs"
                variant={isSaved ? 'primary' : 'outline'}
                onClick={handleSaveToFavorites}
                icon={isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Pipeline Progress Indicator */}
      {(processingStatus !== 'idle' || prediction) && (
        <PipelineProgress
          status={processingStatus}
          currentMessage={currentStepMessage}
          latencyMs={prediction?.latency_ms}
        />
      )}

      {/* Main LaTeX & KaTeX Editor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {prediction ? (
          <LatexEditor
            originalLatex={prediction.latex}
            currentLatex={editedLatex}
            onLatexChange={actions.setEditedLatex}
            onReset={actions.resetToOriginalPrediction}
            isModified={isModified}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#10141D] rounded-xl border border-[#252D3B]">
            <div className="p-4 rounded-2xl bg-[#151B27] border border-[#252D3B] text-[#94A3B8] mb-3">
              <Layers className="w-8 h-8 opacity-40" />
            </div>
            <h4 className="text-sm font-semibold text-[#F1F5F9]">
              Ready for Mathematical Recognition
            </h4>
            <p className="text-xs text-[#94A3B8] max-w-sm mt-1">
              Draw an equation on the digital canvas or upload a notebook photograph, then click <strong>Recognize Equation</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
