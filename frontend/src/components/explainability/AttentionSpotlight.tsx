import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TokenMetadata } from '../../types/api';
import { Eye, EyeOff, Sliders, Zap } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../utils/cn';

interface AttentionSpotlightProps {
  preprocessedImage: string;
  activeToken: TokenMetadata | null;
  activeTokenIndex: number | null;
  tokens: TokenMetadata[];
  onSelectToken: (index: number) => void;
  opacity: number;
  onOpacityChange: (val: number) => void;
  showSpotlight: boolean;
  onToggleSpotlight: () => void;
  showCrosshair: boolean;
  onToggleCrosshair: () => void;
  showCoordinates: boolean;
  onToggleCoordinates: () => void;
  spotlightRadius: number;
  onRadiusChange: (val: number) => void;
}

export const AttentionSpotlight: React.FC<AttentionSpotlightProps> = ({
  preprocessedImage,
  activeToken,
  activeTokenIndex,
  tokens,
  onSelectToken,
  opacity,
  onOpacityChange,
  showSpotlight,
  onToggleSpotlight,
  showCrosshair,
  onToggleCrosshair,
  showCoordinates,
  onToggleCoordinates,
  spotlightRadius,
  onRadiusChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showConfig, setShowConfig] = useState(false);

  const hasCoords = activeToken && typeof activeToken.x === 'number' && typeof activeToken.y === 'number';

  return (
    <div className="flex flex-col rounded-xl bg-[#10141D] border border-[#252D3B] overflow-hidden">
      {/* Spotlight Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#151B27] border-b border-[#252D3B]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#8B7CFF]" />
          <span className="text-xs font-semibold text-[#F1F5F9]">Cross-Attention Grounding</span>
          {activeToken && (
            <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30">
              Token: {activeToken.token}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Spotlight Visibility Toggle */}
          <Tooltip content={showSpotlight ? 'Hide Spotlight' : 'Show Spotlight'}>
            <button
              onClick={onToggleSpotlight}
              className={cn(
                'p-1.5 rounded-lg text-xs transition-colors',
                showSpotlight
                  ? 'bg-[#8B7CFF]/20 text-[#8B7CFF]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              )}
              aria-label="Toggle Attention Spotlight"
            >
              {showSpotlight ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </Tooltip>

          {/* Config Slider Dropdown Toggle */}
          <Tooltip content="Spotlight Configuration">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={cn(
                'p-1.5 rounded-lg text-xs transition-colors',
                showConfig
                  ? 'bg-[#1E2536] text-[#F1F5F9]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              )}
              aria-label="Spotlight settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Expandable Configuration Controls */}
      {showConfig && (
        <div className="flex flex-wrap items-center gap-4 px-3.5 py-2.5 bg-[#090B10] border-b border-[#252D3B] text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span>Intensity:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-20 accent-[#8B7CFF] cursor-pointer"
            />
            <span className="font-mono text-[11px] text-[#F1F5F9] w-7">
              {Math.round(opacity * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Radius:</span>
            <input
              type="range"
              min="16"
              max="64"
              step="4"
              value={spotlightRadius}
              onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
              className="w-20 accent-[#8B7CFF] cursor-pointer"
            />
            <span className="font-mono text-[11px] text-[#F1F5F9] w-7">
              {spotlightRadius}px
            </span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showCrosshair}
              onChange={onToggleCrosshair}
              className="accent-[#8B7CFF] rounded"
            />
            <span>Crosshair</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showCoordinates}
              onChange={onToggleCoordinates}
              className="accent-[#8B7CFF] rounded"
            />
            <span>Coordinates</span>
          </label>
        </div>
      )}

      {/* Spotlight Canvas / Image Display */}
      <div className="p-3 bg-[#090B10] flex flex-col items-center justify-center">
        <div
          ref={containerRef}
          className="relative inline-block max-w-full rounded-lg overflow-hidden border border-[#252D3B] bg-white shadow-inner select-none"
        >
          {/* Preprocessed Image from DenseNet Canvas */}
          <img
            src={preprocessedImage}
            alt="Preprocessed feature canvas"
            className="block max-h-36 w-auto object-contain pointer-events-none"
          />

          {/* Attention Spotlight Marker */}
          {showSpotlight && hasCoords && (
            <motion.div
              key={`${activeTokenIndex}_${activeToken?.token}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="absolute pointer-events-none"
              style={{
                left: `${(activeToken!.x * 100).toFixed(2)}%`,
                top: `${(activeToken!.y * 100).toFixed(2)}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Radial Attention Glow */}
              <div
                className="rounded-full pointer-events-none"
                style={{
                  width: `${spotlightRadius * 2}px`,
                  height: `${spotlightRadius * 2}px`,
                  transform: 'translate(-50%, -50%)',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  background: `radial-gradient(circle, rgba(139, 124, 255, ${opacity}) 0%, rgba(56, 189, 248, ${opacity * 0.4}) 55%, transparent 75%)`,
                  boxShadow: `0 0 16px 2px rgba(139, 124, 255, ${opacity * 0.7})`,
                }}
              />

              {/* Crosshair Center Reticle */}
              {showCrosshair && (
                <>
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full w-4 h-[1.5px] bg-[#8B7CFF]" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full w-4 h-[1.5px] bg-[#8B7CFF]" />
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full w-[1.5px] h-4 bg-[#8B7CFF]" />
                  <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-x-full w-[1.5px] h-4 bg-[#8B7CFF]" />
                  <div className="w-2 h-2 rounded-full border border-white bg-[#8B7CFF] -translate-x-1/2 -translate-y-1/2" />
                </>
              )}
            </motion.div>
          )}

          {/* Floating Clamped Coordinate Badge */}
          {showSpotlight && hasCoords && showCoordinates && (
            <div
              className="absolute pointer-events-none px-2 py-0.5 rounded bg-black/95 text-white font-mono text-[9px] whitespace-nowrap shadow-lg border border-[#252D3B] -translate-x-1/2 z-30 transition-all duration-150"
              style={{
                left: `${Math.min(Math.max(activeToken!.x * 100, 15), 85).toFixed(2)}%`,
                top: `calc(${Math.min(Math.max(activeToken!.y * 100, 10), 85).toFixed(2)}% + ${spotlightRadius + 6}px)`,
              }}
            >
              ({activeToken!.x.toFixed(3)}, {activeToken!.y.toFixed(3)})
            </div>
          )}

          {/* All token peak markers clickable spots */}
          <div className="absolute inset-0">
            {tokens.map((t, idx) => {
              if (typeof t.x !== 'number' || typeof t.y !== 'number') return null;
              const isSelected = idx === activeTokenIndex;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectToken(idx)}
                  className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full group focus:outline-none"
                  style={{
                    left: `${(t.x * 100).toFixed(2)}%`,
                    top: `${(t.y * 100).toFixed(2)}%`,
                  }}
                  title={`Select token: ${t.token} (${t.confidence ? (t.confidence * 100).toFixed(1) + '%' : ''})`}
                  aria-label={`Select token ${t.token}`}
                >
                  <span
                    className={cn(
                      'block w-1.5 h-1.5 mx-auto my-auto rounded-full transition-transform',
                      isSelected
                        ? 'scale-150 bg-[#8B7CFF] ring-2 ring-white ring-offset-1 ring-offset-black'
                        : 'bg-black/40 group-hover:bg-[#8B7CFF] group-hover:scale-125'
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-[#64748B] mt-2 text-center">
          DenseNet 12×W/8 feature memory cross-attention peak normalized to input coordinate bounds.
        </p>
      </div>
    </div>
  );
};
