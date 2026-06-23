'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(Toast & { removing?: boolean })[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    // Mark as removing for exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  }, []);

  const showToast = useCallback(
    (opts: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      const duration = opts.duration ?? 4000;

      setToasts((prev) => [...prev, { ...opts, id }]);

      timers.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: 'success', title, message }),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast({ type: 'error', title, message }),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: 'warning', title, message }),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast({ type: 'info', title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-6 right-4 md:right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
        style={{ width: 'min(420px, calc(100vw - 32px))' }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const styleMap: Record<ToastType, { wrapper: string; icon: string; bar: string }> = {
  success: {
    wrapper: 'bg-[#0f1f15] border border-emerald-500/30 text-emerald-100',
    icon: 'text-emerald-400 bg-emerald-500/15 rounded-lg p-2',
    bar: 'bg-emerald-500',
  },
  error: {
    wrapper: 'bg-[#1f0f0f] border border-red-500/30 text-red-100',
    icon: 'text-red-400 bg-red-500/15 rounded-lg p-2',
    bar: 'bg-red-500',
  },
  warning: {
    wrapper: 'bg-[#1c1607] border border-amber-500/30 text-amber-100',
    icon: 'text-amber-400 bg-amber-500/15 rounded-lg p-2',
    bar: 'bg-amber-500',
  },
  info: {
    wrapper: 'bg-[#0d1520] border border-blue-500/30 text-blue-100',
    icon: 'text-blue-400 bg-blue-500/15 rounded-lg p-2',
    bar: 'bg-blue-500',
  },
};

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast & { removing?: boolean };
  onClose: () => void;
}) {
  const styles = styleMap[toast.type];

  return (
    <div
      className={`
        relative w-full rounded-2xl shadow-2xl overflow-hidden pointer-events-auto
        ${styles.wrapper}
        ${toast.removing
          ? 'animate-toast-out'
          : 'animate-toast-in'
        }
      `}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* Progress bar */}
      <div
        className={`absolute top-0 left-0 h-[3px] ${styles.bar} rounded-t-2xl`}
        style={{
          animation: `toast-progress ${toast.duration ?? 4000}ms linear forwards`,
        }}
      />

      <div className="flex items-start gap-3 px-4 py-4">
        {/* Icon */}
        <span className={styles.icon}>
          {iconMap[toast.type]}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-dm-sans font-semibold text-sm leading-snug">{toast.title}</p>
          {toast.message && (
            <p className="text-xs mt-1 opacity-70 leading-relaxed">{toast.message}</p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity mt-0.5 cursor-pointer"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
