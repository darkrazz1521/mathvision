import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { uploadMobilePhoto } from '../../services/api';

interface MobileCameraCaptureProps {
  sessionId: string;
}

export const MobileCameraCapture: React.FC<MobileCameraCaptureProps> = ({ sessionId }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if API endpoint was passed in URL query
  const searchParams = new URLSearchParams(window.location.search);
  const customApi = searchParams.get('api') || undefined;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please snap or select an image file.');
      return;
    }
    setErrorMessage(null);

    // Optimize and downscale large phone camera photos on device before upload
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1600;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], 'phone_capture.jpg', { type: 'image/jpeg' });
                setSelectedFile(optimizedFile);
                setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85));
              } else {
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
              }
            },
            'image/jpeg',
            0.85
          );
        } catch {
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
      };
      img.onerror = () => {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    if (previewUrl && !previewUrl.startsWith('data:')) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsSuccess(false);
    setErrorMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const res = await uploadMobilePhoto(sessionId, selectedFile, selectedFile.name, customApi);
      setIsUploading(false);

      if (res.ok) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to upload photo to session.');
      }
    } catch (err: unknown) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090B10] text-[#F1F5F9] flex flex-col justify-between p-4 selection:bg-[#8B7CFF]/30">
      {/* Hidden native inputs: one with capture='environment' for rear camera, one for gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Top Header */}
      <header className="flex items-center justify-between pb-3 border-b border-[#252D3B]">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MathVision" className="w-7 h-7 rounded-lg" />
          <span className="font-bold text-sm text-[#F1F5F9]">MathVision Mobile</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#151B27] border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sync: {sessionId}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center my-4">
        <AnimatePresence mode="wait">
          {/* State 1: Success Confirmed */}
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm p-6 rounded-2xl bg-[#10141D] border border-emerald-500/40 text-center flex flex-col items-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <h2 className="text-lg font-bold text-[#F1F5F9]">
                Transferred to Desktop!
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1.5 max-w-xs leading-relaxed">
                Your photograph was uploaded to MathVision. Look at your computer screen—the equation is recognizing right now.
              </p>

              <div className="mt-6 w-full flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleRetake}
                  icon={<Camera className="w-4 h-4" />}
                >
                  Snap Another Equation
                </Button>
              </div>
            </motion.div>
          ) : previewUrl ? (
            /* State 2: Preview Photo & Confirm Upload */
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm flex flex-col items-center gap-4"
            >
              <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-[#252D3B] shadow-2xl max-h-[55vh] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Captured equation"
                  className="w-full h-auto max-h-[55vh] object-contain"
                />

                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={handleRetake}
                    className="p-2 rounded-xl bg-black/75 text-white backdrop-blur-md border border-[#252D3B] text-xs flex items-center gap-1 shadow-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retake
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="w-full p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Upload CTA */}
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-glow-accent text-sm"
                onClick={handleUpload}
                isLoading={isUploading}
                icon={<Upload className="w-4 h-4" />}
              >
                Send to MathVision Desktop
              </Button>
            </motion.div>
          ) : (
            /* State 3: Ready to Snap Photo */
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm flex flex-col items-center text-center p-6 rounded-2xl bg-[#10141D] border border-[#252D3B] shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#8B7CFF]/15 text-[#8B7CFF] flex items-center justify-center mb-4 shadow-glow-accent/20">
                <Camera className="w-8 h-8" />
              </div>

              <h2 className="text-base font-bold text-[#F1F5F9]">
                Snap Handwritten Equation
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                Point your phone camera directly at the mathematical expression in your notebook, textbook, or paper.
              </p>

              {/* Big Camera Trigger Button */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B7CFF] to-[#38BDF8] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-glow-accent active:scale-[0.98] transition-all"
              >
                <Camera className="w-5 h-5" />
                <span>Open Phone Camera</span>
              </button>

              {/* Or Choose from Photos */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full mt-2.5 py-3 px-4 rounded-xl bg-[#151B27] hover:bg-[#1E2536] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#252D3B] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
                <span>Choose Existing Photo</span>
              </button>

              {/* Tips */}
              <div className="mt-6 p-3 rounded-xl bg-[#090B10] border border-[#252D3B] text-left w-full">
                <span className="text-[10px] font-semibold text-[#8B7CFF] uppercase tracking-wider block mb-1">
                  Tips for best recognition:
                </span>
                <ul className="text-[11px] text-[#94A3B8] space-y-1 list-disc list-inside">
                  <li>Hold phone steady parallel to the page.</li>
                  <li>Good ambient light without harsh glare.</li>
                  <li>MathVision auto-removes ruled paper lines.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="pt-2 text-center text-[10px] text-[#64748B]">
        MathVision v2.0 • DenseNet-121 HMER Platform
      </footer>
    </div>
  );
};
