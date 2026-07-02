import React, { useEffect, useEffectEvent } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const onCancelEvent = useEffectEvent(onCancel);
  const onConfirmEvent = useEffectEvent(onConfirm);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancelEvent();
      if (e.key === 'Enter') onConfirmEvent();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <LazyMotion features={domAnimation}>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-[var(--muted)] text-sm">{message}</p>
            </div>
            <div className="px-6 py-4 bg-[var(--background)] border-t border-[var(--border)] flex justify-end gap-3">
              <button type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--background)] transition"
              >
                {cancelLabel}
              </button>
              <button type="button"
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  isDestructive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-[var(--text)] text-[var(--background)] hover:opacity-90'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
    </LazyMotion>
  );
}
