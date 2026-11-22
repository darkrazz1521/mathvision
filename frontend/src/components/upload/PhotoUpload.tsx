import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  ArrowRight,
  Info,
  Smartphone,
  QrCode,
  Crop,
  RotateCw,
  RotateCcw,
  Undo2,
  Check,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MobileQrModal } from './MobileQrModal';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';

interface PhotoUploadProps {
  onRecognize: (file: File, previewUrl: string) => void;
  isRecognizing: boolean;
  preprocessedImage?: string | null;
  incomingPhoto?: { file: File; dataUrl: string } | null;
  onClearIncomingPhoto?: () => void;
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
  incomingPhoto,
  onClearIncomingPhoto,
}) => {
  const { success } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);

  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeKb: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreprocessed, setShowPreprocessed] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Interactive Crop & Rotation states
  const [isCropping, setIsCropping] = useState(false);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [isDraggingCrop, setIsDraggingCrop] = useState<string | null>(null); // 'move' | 'tl' | 'tr' | 'bl' | 'br'
  const [cropDragStart, setCropDragStart] = useState<{ x: number; y: number; initialBox: typeof cropBox } | null>(null);

  // Sync incoming photo from QR modal (global sync)
  useEffect(() => {
    if (incomingPhoto?.file && incomingPhoto?.dataUrl) {
      setSelectedFile(incomingPhoto.file);
      setPreviewUrl(incomingPhoto.dataUrl);
      setOriginalFile(incomingPhoto.file);
      setOriginalPreviewUrl(incomingPhoto.dataUrl);
      setIsCropping(false);
      setShowPreprocessed(false);

      const img = new Image();
      img.onload = () => {
        setImageMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKb: Math.round(incomingPhoto.file.size / 1024),
        });
      };
      img.src = incomingPhoto.dataUrl;

      onClearIncomingPhoto?.();
    }
  }, [incomingPhoto, onClearIncomingPhoto]);

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Image file is too large. Maximum size is 15 MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setOriginalFile(file);
    setOriginalPreviewUrl(url);
    setIsCropping(false);
    setShowPreprocessed(false);

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
    setOriginalFile(null);
    setOriginalPreviewUrl(null);
    setImageMeta(null);
    setShowPreprocessed(false);
    setIsCropping(false);
  };

  const handleSubmit = () => {
    if (!selectedFile || !previewUrl) return;
    onRecognize(selectedFile, previewUrl);
  };

  // Called when mobile phone uploads picture over QR sync inside PhotoUpload
  const handlePhotoFromPhone = (dataUrl: string, filename: string) => {
    try {
      const file = dataUrlToFile(dataUrl, filename);
      setSelectedFile(file);
      setPreviewUrl(dataUrl);
      setOriginalFile(file);
      setOriginalPreviewUrl(dataUrl);
      setIsCropping(false);
      setShowPreprocessed(false);

      const img = new Image();
      img.onload = () => {
        setImageMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKb: Math.round(file.size / 1024),
        });
      };
      img.src = dataUrl;

      // Close QR modal without auto-recognizing so user can crop/rotate/preview!
      setIsQrModalOpen(false);
      success('Photo Received from Phone', 'Loaded! You can crop or rotate, then click Recognize Photo.');
    } catch (err) {
      console.error('Failed to process phone photo:', err);
      setIsQrModalOpen(false);
    }
  };

  // Rotate image by +/- 90 degrees
  const handleRotate = (angleDelta: number) => {
    if (!previewUrl || !selectedFile) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const isSideways = Math.abs(angleDelta % 180) === 90;
      canvas.width = isSideways ? img.naturalHeight : img.naturalWidth;
      canvas.height = isSideways ? img.naturalWidth : img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Translate to center and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angleDelta * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], selectedFile.name || 'rotated_photo.jpg', { type: 'image/jpeg' });
          const newUrl = canvas.toDataURL('image/jpeg', 0.92);
          setSelectedFile(newFile);
          setPreviewUrl(newUrl);
          setImageMeta({
            width: canvas.width,
            height: canvas.height,
            sizeKb: Math.round(blob.size / 1024),
          });
        }
      }, 'image/jpeg', 0.92);
    };
    img.src = previewUrl;
  };

  // Apply Crop Rectangle
  const handleApplyCrop = () => {
    if (!previewUrl || !selectedFile) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      const cropX = Math.max(0, Math.round((cropBox.x / 100) * naturalW));
      const cropY = Math.max(0, Math.round((cropBox.y / 100) * naturalH));
      const cropW = Math.min(naturalW - cropX, Math.round((cropBox.width / 100) * naturalW));
      const cropH = Math.min(naturalH - cropY, Math.round((cropBox.height / 100) * naturalH));

      if (cropW < 20 || cropH < 20) {
        setIsCropping(false);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], selectedFile.name || 'cropped_photo.jpg', { type: 'image/jpeg' });
          const newUrl = canvas.toDataURL('image/jpeg', 0.92);
          setSelectedFile(newFile);
          setPreviewUrl(newUrl);
          setImageMeta({
            width: cropW,
            height: cropH,
            sizeKb: Math.round(blob.size / 1024),
          });
          setIsCropping(false);
        }
      }, 'image/jpeg', 0.92);
    };
    img.src = previewUrl;
  };

  // Reset to raw uploaded photo
  const handleResetOriginal = () => {
    if (originalPreviewUrl && originalFile) {
      setSelectedFile(originalFile);
      setPreviewUrl(originalPreviewUrl);
      setIsCropping(false);
      const img = new Image();
      img.onload = () => {
        setImageMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKb: Math.round(originalFile.size / 1024),
        });
      };
      img.src = originalPreviewUrl;
    }
  };

  // Crop Drag Handlers
  const startDragging = (type: string, e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDraggingCrop(type);
    setCropDragStart({
      x: e.clientX,
      y: e.clientY,
      initialBox: { ...cropBox },
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCrop || !cropDragStart || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = ((e.clientX - cropDragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - cropDragStart.y) / rect.height) * 100;
    const init = cropDragStart.initialBox;

    const newBox = { ...cropBox };

    if (isDraggingCrop === 'move') {
      const maxX = 100 - init.width;
      const maxY = 100 - init.height;
      newBox.x = Math.max(0, Math.min(maxX, init.x + deltaX));
      newBox.y = Math.max(0, Math.min(maxY, init.y + deltaY));
    } else if (isDraggingCrop === 'br') {
      newBox.width = Math.max(10, Math.min(100 - init.x, init.width + deltaX));
      newBox.height = Math.max(10, Math.min(100 - init.y, init.height + deltaY));
    } else if (isDraggingCrop === 'bl') {
      const newX = Math.max(0, Math.min(init.x + init.width - 10, init.x + deltaX));
      newBox.width = init.x + init.width - newX;
      newBox.x = newX;
      newBox.height = Math.max(10, Math.min(100 - init.y, init.height + deltaY));
    } else if (isDraggingCrop === 'tr') {
      const newY = Math.max(0, Math.min(init.y + init.height - 10, init.y + deltaY));
      newBox.height = init.y + init.height - newY;
      newBox.y = newY;
      newBox.width = Math.max(10, Math.min(100 - init.x, init.width + deltaX));
    } else if (isDraggingCrop === 'tl') {
      const newX = Math.max(0, Math.min(init.x + init.width - 10, init.x + deltaX));
      const newY = Math.max(0, Math.min(init.y + init.height - 10, init.y + deltaY));
      newBox.width = init.x + init.width - newX;
      newBox.height = init.y + init.height - newY;
      newBox.x = newX;
      newBox.y = newY;
    }

    setCropBox(newBox);
  };

  const handlePointerUp = () => {
    setIsDraggingCrop(null);
    setCropDragStart(null);
  };

  const handleCropAreaPointerDown = (e: React.PointerEvent) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const initialWidth = 50;
    const initialHeight = 40;
    const newBox = {
      x: Math.max(0, Math.min(100 - initialWidth, clickX - initialWidth / 2)),
      y: Math.max(0, Math.min(100 - initialHeight, clickY - initialHeight / 2)),
      width: initialWidth,
      height: initialHeight,
    };
    setCropBox(newBox);
    setIsDraggingCrop('move');
    setCropDragStart({
      x: e.clientX,
      y: e.clientY,
      initialBox: newBox,
    });
  };

  const hasEdits = originalPreviewUrl && previewUrl !== originalPreviewUrl;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0D111A] rounded-xl border border-[#212836] overflow-hidden shadow-sm">
      {/* Top Header / Mode Switcher */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#141A28] border-b border-[#212836] shrink-0 select-none">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-xs font-bold text-[#F8FAFC]">Notebook Photo</span>
        </div>

        <div className="flex items-center gap-2">
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </button>
            </div>
          )}

          {/* Phone QR button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/40 hover:bg-[#8B7CFF]/25 transition-colors"
            title="Scan QR to capture photo using phone camera"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Phone QR</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 min-h-0 p-3 flex flex-col items-center justify-center relative overflow-hidden bg-[#0A0D14]">
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
              Supports PNG, JPG, JPEG, WEBP up to 15 MB. Works with notebook pages, graph sheets, or whiteboards.
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
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#080B11] rounded-xl border border-[#212836] p-2 overflow-hidden">
            {/* Image Preview with Interactive Crop Support - NO TEXT OVERLAYS ON PHOTO */}
            <div
              ref={imageContainerRef}
              className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden rounded-lg select-none"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <img
                src={showPreprocessed && preprocessedImage ? preprocessedImage : previewUrl}
                alt="Handwritten math preview"
                className="max-h-[58vh] max-w-full object-contain rounded-lg border border-[#212836] shadow-sm pointer-events-none"
                draggable={false}
              />

              {/* Interactive Crop Overlay */}
              {isCropping && (
                <div
                  className="absolute inset-0 cursor-crosshair"
                  onPointerDown={handleCropAreaPointerDown}
                >
                  {/* Outer dimmed mask */}
                  <div
                    className="absolute top-0 left-0 right-0 bg-black/70 pointer-events-none"
                    style={{ height: `${cropBox.y}%` }}
                  />
                  <div
                    className="absolute left-0 right-0 bottom-0 bg-black/70 pointer-events-none"
                    style={{ top: `${cropBox.y + cropBox.height}%` }}
                  />
                  <div
                    className="absolute left-0 bg-black/70 pointer-events-none"
                    style={{
                      top: `${cropBox.y}%`,
                      height: `${cropBox.height}%`,
                      width: `${cropBox.x}%`,
                    }}
                  />
                  <div
                    className="absolute right-0 bg-black/70 pointer-events-none"
                    style={{
                      top: `${cropBox.y}%`,
                      height: `${cropBox.height}%`,
                      left: `${cropBox.x + cropBox.width}%`,
                    }}
                  />

                  {/* Active Crop Box with rule-of-thirds grid */}
                  <div
                    className="absolute border-2 border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-move"
                    style={{
                      left: `${cropBox.x}%`,
                      top: `${cropBox.y}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`,
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      startDragging('move', e);
                    }}
                  >
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                      <div className="border-r border-b border-white/20" />
                      <div className="border-r border-b border-white/20" />
                      <div className="border-b border-white/20" />
                      <div className="border-r border-b border-white/20" />
                      <div className="border-r border-b border-white/20" />
                      <div className="border-b border-white/20" />
                      <div className="border-r border-white/20" />
                      <div className="border-r border-white/20" />
                      <div />
                    </div>

                    {/* Corner Handles */}
                    <div
                      className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#38BDF8] rounded-sm cursor-nwse-resize shadow-md"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        startDragging('tl', e);
                      }}
                    />
                    <div
                      className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#38BDF8] rounded-sm cursor-nesw-resize shadow-md"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        startDragging('tr', e);
                      }}
                    />
                    <div
                      className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#38BDF8] rounded-sm cursor-nesw-resize shadow-md"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        startDragging('bl', e);
                      }}
                    />
                    <div
                      className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#38BDF8] rounded-sm cursor-nwse-resize shadow-md"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        startDragging('br', e);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* In-Crop Control Bar */}
            {isCropping && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0D111A]/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#38BDF8]/40 shadow-2xl z-20">
                <span className="text-[11px] text-[#94A3B8] font-medium hidden sm:inline">
                  Select formula area:
                </span>
                <button
                  onClick={handleApplyCrop}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Crop</span>
                </button>
                <button
                  onClick={() => setIsCropping(false)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#182133] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}

            {/* Quick Image Tools Toolbar (Rotate, Crop, Reset, Replace, Remove) */}
            {!isCropping && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#0D111A]/90 backdrop-blur-md p-1 rounded-xl border border-[#212836] shadow-md z-10">
                <button
                  onClick={() => handleRotate(-90)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors flex items-center gap-1 text-xs"
                  title="Rotate Left (-90°)"
                  aria-label="Rotate Left"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleRotate(90)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors flex items-center gap-1 text-xs"
                  title="Rotate Right (+90°)"
                  aria-label="Rotate Right"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Rotate</span>
                </button>

                <div className="w-[1px] h-3.5 bg-[#212836] mx-0.5" />

                <button
                  onClick={() => setIsCropping(true)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#8B7CFF] hover:bg-[#8B7CFF]/15 transition-colors flex items-center gap-1 text-xs"
                  title="Crop equation boundary"
                  aria-label="Crop equation"
                >
                  <Crop className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-[#8B7CFF]">Crop</span>
                </button>

                {hasEdits && (
                  <button
                    onClick={handleResetOriginal}
                    className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-400/15 transition-colors flex items-center gap-1 text-xs"
                    title="Reset to original uploaded photo"
                    aria-label="Reset photo"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Reset</span>
                  </button>
                )}

                <div className="w-[1px] h-3.5 bg-[#212836] mx-0.5" />

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
            )}

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
      <div className="px-3.5 py-1.5 bg-[#080B11] border-t border-[#212836] text-[11px] text-[#94A3B8] flex items-center gap-2 shrink-0">
        <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
        <p className="leading-tight truncate">
          <strong className="text-[#CBD5E1]">Notebook Preprocessing:</strong> Shadow removal, ink isolation, line subtraction, & auto tight-cropping.
        </p>
      </div>

      {/* Footer Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0B0E16] border-t border-[#212836] shrink-0">
        <div className="text-xs text-[#94A3B8] flex items-center gap-2">
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
            disabled={!selectedFile || isRecognizing || isCropping}
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