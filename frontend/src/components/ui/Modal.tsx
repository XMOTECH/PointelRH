import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  zIndex?: number;
}

export function Modal({ open, onClose, title, subtitle, children, className, zIndex = 100 }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll & écoute de la touche Échap
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop avec flou élégant couvrant 100% du viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{ zIndex }}
            className="fixed inset-0 w-screen h-screen min-h-screen bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div style={{ zIndex: zIndex + 1 }} className="fixed inset-0 w-screen h-screen overflow-y-auto pointer-events-none">
            <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={cn(
                  "pointer-events-auto relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-200/80",
                  className
                )}
              >
                <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={onClose}
                    aria-label="Fermer la boîte de dialogue"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="px-6 py-5">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
