import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => string;
  success: (title: string, description?: string, action?: ToastMessage['action']) => string;
  error: (title: string, description?: string, action?: ToastMessage['action']) => string;
  warning: (title: string, description?: string, action?: ToastMessage['action']) => string;
  info: (title: string, description?: string, action?: ToastMessage['action']) => string;
  loading: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (options: Omit<ToastMessage, 'id'>): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Default duration: Error is persistent (0 or long), loading is persistent until dismissed
      let defaultDuration = 4000;
      if (options.type === 'error') defaultDuration = 9000;
      else if (options.type === 'warning') defaultDuration = 5500;
      else if (options.type === 'loading') defaultDuration = 0; // manual dismiss

      const duration = options.duration !== undefined ? options.duration : defaultDuration;
      const newToast: ToastMessage = { ...options, id, duration };

      setToasts((prev) => {
        // Prevent duplicate spam of identical title+type
        const filtered = prev.filter((t) => !(t.type === options.type && t.title === options.title));
        // Keep at most 3 toasts on screen simultaneously
        const updated = [...filtered, newToast];
        return updated.slice(-3);
      });

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string, action?: ToastMessage['action']) =>
      addToast({ type: 'success', title, description, action, duration: 4000 }),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string, action?: ToastMessage['action']) =>
      addToast({ type: 'error', title, description, action, duration: 9000 }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string, action?: ToastMessage['action']) =>
      addToast({ type: 'warning', title, description, action, duration: 5500 }),
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string, action?: ToastMessage['action']) =>
      addToast({ type: 'info', title, description, action, duration: 4000 }),
    [addToast]
  );

  const loading = useCallback(
    (title: string, description?: string) =>
      addToast({ type: 'loading', title, description, duration: 0 }),
    [addToast]
  );

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />,
    loading: <Loader2 className="w-4 h-4 text-[#8B7CFF] shrink-0 mt-0.5 animate-spin" />,
  };

  const borders = {
    success: 'border-emerald-500/35 bg-[#0C1514]/95 text-emerald-100 shadow-emerald-950/40',
    warning: 'border-amber-500/35 bg-[#17130B]/95 text-amber-100 shadow-amber-950/40',
    error: 'border-rose-500/40 bg-[#1A0E13]/95 text-rose-100 shadow-rose-950/40',
    info: 'border-[#38BDF8]/35 bg-[#0C1522]/95 text-sky-100 shadow-sky-950/40',
    loading: 'border-[#8B7CFF]/40 bg-[#120F1D]/95 text-purple-100 shadow-purple-950/40',
  };

  const portalContent = (
    <aside
      aria-label="Notifications"
      className="fixed top-16 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto pointer-events-none select-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            role={item.type === 'error' ? 'alert' : 'status'}
            aria-live={item.type === 'error' ? 'assertive' : 'polite'}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl text-xs sm:text-sm transition-all',
              borders[item.type]
            )}
          >
            {icons[item.type]}
            <div className="flex-1 min-w-0 pr-1">
              <p className="font-semibold text-[#F8FAFC] tracking-tight leading-snug">
                {item.title}
              </p>
              {item.description && (
                <p className="text-[11px] sm:text-xs text-[#94A3B8] mt-1 leading-relaxed break-words font-normal">
                  {item.description}
                </p>
              )}
              {item.action && (
                <button
                  onClick={() => {
                    item.action?.onClick();
                    removeToast(item.id);
                  }}
                  className="mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  {item.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success,
        error,
        warning,
        info,
        loading,
        dismiss: removeToast,
      }}
    >
      {children}
      {mounted && createPortal(portalContent, document.body)}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
