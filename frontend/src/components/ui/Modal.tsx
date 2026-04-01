import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  // Lock scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] transition-opacity"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] overflow-y-auto pointer-events-none">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(
                  "pointer-events-auto relative transform overflow-hidden rounded-[2rem] bg-surface-container-lowest text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl",
                  className
                )}
              >
                <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-display font-black text-on-surface tracking-tighter uppercase italic">
                    {title}
                  </h2>
                  <button
                    type="button"
                    className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    onClick={onClose}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="px-8 pb-8 pt-4">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
