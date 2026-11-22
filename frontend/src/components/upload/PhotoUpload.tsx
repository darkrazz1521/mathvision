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

// Convert base64 data URL to standard File object safely
function dataUrlToFile(dataUrl: string, filename: string): File {
  try {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0]?.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob((arr[1] || '').trim().replace(/\s/g, ''));
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (err) {
    console.error('Failed to convert base64 to File:', err);
    return new File([new Uint8Array(0)], filename, { type: 'image/jpeg' });
  }
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
    try {
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

      // Close QR modal
      setIsQrModalOpen(false);

      // Instantly trigger recognition pipeline so user sees the transferred equation recognizing immediately
      if (file && file.size > 0) {
        onRecognize(file, dataUrl);
      }
    } catch (err) {
      console.error('Failed to process phone photo:', err);
      setIsQrModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0D111A] rounded-xl border border-[#212836] overflow-hidden shadow-sm">
      {/* Top Header / Mode Switcher */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#141A28] border-b border-[#212836] shrink-0 select-none">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-xs font-bold text-[#F8FAFC]">Notebook Photo Ingestion</span>
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
            <div className="flex items-center gap-1 bg-[#090B10] p-0.5 rounded-lg border border-[#212836]">
              <button
                onClick={() => setShowPreprocessed(false)}
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-md transition-colors',
                  !showPreprocessed
                    ? 'bg-[#182133] text-[#F8FAFC]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                )}
              >
                Original Photo
              </button>
              <button
                onClick={() => setShowPreprocessed(true)}
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1',
                  showPreprocessed
                    ? 'bg-[#8B7CFF]/20 text-[#8B7CFF]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
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
      <div className="flex-1 min-h-0 p-3.5 flex flex-col justify-center items-center overflow-hidden">
        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full max-w-lg h-full max-h-[380px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200',
              isDragging
                ? 'border-[#8B7CFF] bg-[#8B7CFF]/10 scale-[0.99]'
                : 'border-[#252D3B] hover:border-[#38BDF8]/60 bg-[#090B10]/60 hover:bg-[#141A28]/50'
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

            <div className="p-3 rounded-2xl bg-[#141A28] border border-[#212836] text-[#38BDF8] mb-3 shadow-md">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">
              Drag and drop your handwritten mathematics photo
            </p>
            <p className="text-[11px] text-[#94A3B8] max-w-sm mt-1 leading-relaxed">
              Supports PNG, JPG, JPEG, WEBP up to 10 MB. Works with notebook pages, graph sheets, or whiteboards.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
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
                Scan with Phone (QR)
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#080B11] rounded-xl border border-[#212836] p-3 overflow-hidden">
            {/* Image Preview with Toggle Support */}
            <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden rounded-lg">
              <img
                src={showPreprocessed && preprocessedImage ? preprocessedImage : previewUrl}
                alt="Handwritten math preview"
                className="max-h-[60vh] max-w-full object-contain rounded-lg border border-[#212836] shadow-sm"
              />

              {showPreprocessed && (
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-sm border border-emerald-500/40 text-[10px] font-mono text-emerald-400">
                  Adaptive Threshold & Denoised Ink Crop
                </div>
              )}

              {!showPreprocessed && (
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-sm border border-[#8B7CFF]/40 text-[10px] font-mono text-[#8B7CFF] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Photo Ready • Ready to Recognize</span>
                </div>
              )}
            </div>

            {/* Quick Actions overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#0D111A]/90 backdrop-blur-md p-1 rounded-xl border border-[#212836] shadow-md">
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#8B7CFF] hover:bg-[#8B7CFF]/10 transition-colors flex items-center gap-1 text-xs"
                title="Scan new photo with Phone"
                aria-label="Scan new photo with Phone"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Phone QR</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#182133] transition-colors flex items-center gap-1 text-xs"
                title="Replace Image"
                aria-label="Replace Image"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Replace</span>
              </button>
              <button
                onClick={handleRemove}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Remove Image"
                aria-label="Remove Image"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
      <div className="px-3.5 py-2 bg-[#080B11] border-t border-[#212836] text-[11px] text-[#94A3B8] flex items-center gap-2 shrink-0">
        <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
        <p className="leading-tight truncate">
          <strong className="text-[#CBD5E1]">Notebook Preprocessing:</strong> Shadow removal, ink isolation, line subtraction, & auto tight-cropping.
        </p>
      </div>

      {/* Footer Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0B0E16] border-t border-[#212836] shrink-0">
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
            {isRecognizing ? 'Processing Photo...' : 'Recognize Photo'}
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
