import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TokenMetadata } from '../../types/api';
import { TokenEdit } from '../../types/workspace';
import { formatConfidence, getConfidenceColor } from '../../utils/latex';
import { tokenSequenceVariants, tokenChipVariants } from '../../utils/motion';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface TokenInspectorProps {
  tokens: TokenMetadata[];
  activeTokenIndex: number | null;
  onSelectToken: (index: number) => void;
  onReplaceToken: (index: number, newToken: string) => void;
  tokenEdits: TokenEdit[];
}

export const TokenInspector: React.FC<TokenInspectorProps> = ({
  tokens,
  activeTokenIndex,
  onSelectToken,
  onReplaceToken,
  tokenEdits,
}) => {
  const [customToken, setCustomToken] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const activeToken =
    activeTokenIndex !== null && activeTokenIndex >= 0 && activeTokenIndex < tokens.length
      ? tokens[activeTokenIndex]
      : null;

  const isTokenEdited = (index: number) => {
    return tokenEdits.some((e) => e.index === index);
  };

  const handlePrevToken = () => {
    if (activeTokenIndex === null) {
      if (tokens.length > 0) onSelectToken(0);
    } else if (activeTokenIndex > 0) {
      onSelectToken(activeTokenIndex - 1);
    }
  };

  const handleNextToken = () => {
    if (activeTokenIndex === null) {
      if (tokens.length > 0) onSelectToken(0);
    } else if (activeTokenIndex < tokens.length - 1) {
      onSelectToken(activeTokenIndex + 1);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTokenIndex !== null && customToken.trim()) {
      onReplaceToken(activeTokenIndex, customToken.trim());
      setCustomToken('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-[#10141D] border border-[#252D3B] p-3.5">
      {/* Inspector Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Edit3 className="w-4 h-4 text-[#8B7CFF]" />
          <h4 className="text-xs font-semibold text-[#F1F5F9]">
            Token Sequence & Alternatives
          </h4>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] text-[#94A3B8] font-mono mr-1">
            {activeTokenIndex !== null ? `${activeTokenIndex + 1} / ${tokens.length}` : `${tokens.length} tokens`}
          </span>
          <button
            onClick={handlePrevToken}
            disabled={activeTokenIndex === null || activeTokenIndex === 0}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Token (Left Arrow)"
            aria-label="Previous Token"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextToken}
            disabled={activeTokenIndex === null || activeTokenIndex === tokens.length - 1}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Token (Right Arrow)"
            aria-label="Next Token"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Token Sequence Chips */}
      <motion.div
        variants={tokenSequenceVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-1.5 p-2 bg-[#090B10] rounded-lg border border-[#252D3B] max-h-36 overflow-y-auto"
      >
        {tokens.map((tokenMeta, idx) => {
          const isSelected = idx === activeTokenIndex;
          const edited = isTokenEdited(idx);

          return (
            <motion.button
              variants={tokenChipVariants}
              whileTap={{ scale: 0.95 }}
              key={idx}
              onClick={() => onSelectToken(idx)}
              className={cn(
                'group relative px-2.5 py-1 rounded-md font-mono text-xs transition-colors flex items-center gap-1.5 border select-none',
                isSelected
                  ? 'text-[#8B7CFF] border-[#8B7CFF]'
                  : edited
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-[#151B27] text-[#F1F5F9] border-[#252D3B] hover:border-[#38BDF8]/50 hover:bg-[#1E2536]'
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="activeTokenChipIndicator"
                  className="absolute inset-0 rounded-md bg-[#8B7CFF]/20 border border-[#8B7CFF] shadow-[0_0_12px_rgba(139,124,255,0.45)] -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <span>{tokenMeta.token}</span>
              {edited && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Manually edited" />
              )}
              {tokenMeta.confidence < 0.75 && !edited && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Low confidence" />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Active Token Details & Top-3 Alternatives Panel */}
      {activeToken ? (
        <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-[#151B27] border border-[#252D3B]">
          {/* Active Token Meta Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8]">Selected:</span>
              <code className="text-sm font-bold font-mono px-2 py-0.5 rounded bg-[#090B10] text-[#8B7CFF] border border-[#252D3B]">
                {activeToken.token}
              </code>
            </div>

            <div className="flex items-center gap-2" title="Individual token softmax emission probability at this decoding step">
              <span className="text-xs text-[#94A3B8]">Token Conf:</span>
              <span
                className={cn(
                  'text-xs font-mono font-semibold',
                  activeToken.confidence >= 0.85
                    ? 'text-emerald-400'
                    : activeToken.confidence >= 0.6
                    ? 'text-amber-400'
                    : 'text-rose-400'
                )}
              >
                {formatConfidence(activeToken.confidence)}
              </span>
            </div>
          </div>

          {/* Animated Token Confidence Progress Bar */}
          <div className="w-full bg-[#090B10] h-1.5 rounded-full overflow-hidden border border-[#212836]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(activeToken.confidence * 100)}%` }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'h-full rounded-full',
                activeToken.confidence >= 0.85
                  ? 'bg-emerald-400'
                  : activeToken.confidence >= 0.6
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              )}
            />
          </div>

          {/* Top-3 Alternative Predictions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                Top Alternatives (Beam Search)
              </span>
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-[11px] text-[#38BDF8] hover:underline"
              >
                {showCustomInput ? 'Hide Custom' : 'Custom Symbol'}
              </button>
            </div>

            {activeToken.alternatives && activeToken.alternatives.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5">
                {activeToken.alternatives.map((alt, altIdx) => (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    key={altIdx}
                    onClick={() => {
                      if (activeTokenIndex !== null) {
                        onReplaceToken(activeTokenIndex, alt.token);
                      }
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#10141D] hover:bg-[#1E2536] border border-[#252D3B] hover:border-[#8B7CFF]/50 transition-colors text-center group"
                  >
                    <span className="font-mono text-sm font-semibold text-[#F1F5F9] group-hover:text-[#8B7CFF]">
                      {alt.token}
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8] mt-0.5">
                      {formatConfidence(alt.prob ?? alt.confidence ?? 0)}
                    </span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">
                No high-ranking alternatives for this token.
              </p>
            )}
          </div>

          {/* Custom Symbol Replacement Form */}
          {showCustomInput && (
            <form onSubmit={handleApplyCustom} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="Custom LaTeX token (e.g. \beta, +)"
                className="flex-1 bg-[#090B10] border border-[#252D3B] rounded-lg px-2.5 py-1 text-xs text-[#F1F5F9] font-mono focus:border-[#8B7CFF] focus:outline-none"
              />
              <Button size="xs" variant="primary" type="submit" disabled={!customToken.trim()}>
                Apply
              </Button>
            </form>
          )}
        </div>
      ) : (
        <div className="p-3 text-center text-xs text-[#64748B] bg-[#090B10] rounded-lg border border-[#252D3B]">
          Click any symbol chip above to inspect cross-attention peak & alternatives.
        </div>
      )}
    </div>
  );
};
