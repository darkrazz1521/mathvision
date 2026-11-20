import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  ArrowRight,
  Info,
  Smartphone,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MobileQrModal } from './MobileQrModal';
import { cn } from '../../utils/cn';

interface PhotoUploadProps {
  onRecognize: (file: File, previewUrl: string) => void;
  isRecognizing: boolean;
  preprocessedImage?: string | null;
}

// Convert base64 data URL to standard File object
function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onRecognize,
  isRecognizing,
  preprocessedImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeKb: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreprocessed, setShowPreprocessed] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Maximum size is 10 MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    img.src = url;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl && !previewUrl.startsWith('data:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageMeta(null);
    setShowPreprocessed(false);
  };

  const handleSubmit = () => {
    if (!selectedFile || !previewUrl) return;
    onRecognize(selectedFile, previewUrl);
  };

  // Called when mobile phone uploads picture over QR sync
  const handlePhotoFromPhone = (dataUrl: string, filename: string) => {
    const file = dataUrlToFile(dataUrl, filename);
    setSelectedFile(file);
    setPreviewUrl(dataUrl);

    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    img.src = dataUrl;

    // Immediately trigger recognition!
    onRecognize(file, dataUrl);
  };

  return (
    <div className="flex flex-col h-full bg-[#10141D] rounded-xl border border-[#252D3B] overflow-hidden">
      {/* Top Header / Mode Switcher */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#10141D] border-b border-[#252D3B]">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-xs font-semibold text-[#F1F5F9]">Notebook Photo Ingestion</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Scan QR with Phone Button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/40 hover:bg-[#8B7CFF]/25 transition-colors"
            title="Scan QR to capture photo using phone camera"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan with Phone</span>
          </button>

          {preprocessedImage && previewUrl && (
            <div className="flex items-center gap-1 bg-[#090B10] p-1 rounded-lg border border-[#252D3B]">
              <button
                onClick={() => setShowPreprocessed(false)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                  !showPreprocessed
                    ? 'bg-[#1E2536] text-[#F1F5F9]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                )}
              >
                Original Photo
              </button>
              <button
                onClick={() => setShowPreprocessed(true)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1',
                  showPreprocessed
                    ? 'bg-[#8B7CFF]/20 text-[#8B7CFF]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                )}
              >
                <span>Preprocessed</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Upload / Preview Area */}
      <div className="flex-1 p-4 flex flex-col justify-center items-center overflow-hidden">
        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
              isDragging
                ? 'border-[#8B7CFF] bg-[#8B7CFF]/10 scale-[0.99]'
                : 'border-[#252D3B] hover:border-[#38BDF8]/60 bg-[#090B10]/50 hover:bg-[#151B27]/40'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
            />

            <div className="p-4 rounded-2xl bg-[#151B27] border border-[#252D3B] text-[#38BDF8] mb-3 shadow-elevated">
              <Upload className="w-7 h-7" />
            </div>

            <p className="text-sm font-semibold text-[#F1F5F9]">
              Drag and drop your handwritten mathematics photo
            </p>
            <p className="text-xs text-[#94A3B8] max-w-sm mt-1">
              Supports PNG, JPG, or JPEG up to 10 MB. Works with lined notebooks, graph paper, and whiteboard shots.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <Button
                size="sm"
                variant="secondary"
                icon={<Upload className="w-3.5 h-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Smartphone className="w-3.5 h-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQrModalOpen(true);
                }}
              >
                Scan with Phone Camera (QR)
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#090B10] rounded-xl border border-[#252D3B] p-3 overflow-hidden">
            {/* Image Preview with Toggle Support */}
            <div className="relative max-w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-lg">
              <img
                src={showPreprocessed && preprocessedImage ? preprocessedImage : previewUrl}
                alt="Handwritten math preview"
                className="max-h-full max-w-full object-contain rounded-lg border border-[#252D3B]"
              />

              {showPreprocessed && (
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-emerald-500/40 text-[11px] font-mono text-emerald-400">
                  Adaptive Threshold & Denoised Ink Crop
                </div>
              )}
            </div>

            {/* Quick Actions overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#10141D]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#252D3B] shadow-elevated">
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#8B7CFF] hover:bg-[#8B7CFF]/10 transition-colors"
                title="Scan new photo with Phone"
                aria-label="Scan new photo with Phone"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536] transition-colors"
                title="Replace Image"
                aria-label="Replace Image"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleRemove}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Remove Image"
                aria-label="Remove Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Preprocessing Features Callout Banner */}
      <div className="px-4 py-2.5 bg-[#090B10]/70 border-t border-[#252D3B] text-xs text-[#94A3B8] flex items-start gap-2">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Notebook Preprocessing:</strong> Automatically removes paper shadows via Gaussian background division, isolates dark ink from ruled/grid lines, and tight-crops bounding boxes.
        </p>
      </div>

      {/* Footer Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#10141D] border-t border-[#252D3B]">
        <div className="text-xs text-[#94A3B8]">
          {imageMeta ? (
            <span>
              {imageMeta.width} × {imageMeta.height} px • {imageMeta.sizeKb} KB
            </span>
          ) : (
            <span>No image selected</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsQrModalOpen(true)}
            icon={<QrCode className="w-4 h-4 text-[#8B7CFF]" />}
          >
            Scan with Phone
          </Button>

          <Button
            variant="primary"
            size="md"
            disabled={!selectedFile || isRecognizing}
            isLoading={isRecognizing}
            onClick={handleSubmit}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Recognize Photo
          </Button>
        </div>
      </div>

      {/* Mobile QR Camera Sync Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        maxWidth="md"
      >
        <MobileQrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          onPhotoReceived={handlePhotoFromPhone}
        />
      </Modal>
    </div>
  );
};
