import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  zIndex?: number;
  showCloseButton?: boolean;
  position?: 'right' | 'center';
}

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full',
};

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
  headerActions,
  size = '3xl',
  zIndex = 100,
  showCloseButton = true,
  position = 'right',
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll & écoute de la touche Échap
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const headerContent = (title || headerActions || showCloseButton) && (
    <div className="px-6 py-4 border-b border-on-surface/10 bg-surface-container-lowest/95 backdrop-blur-sm flex items-center justify-between gap-4 shrink-0">
      <div className="min-w-0 flex-1">
        {typeof title === 'string' ? (
          <h2 className="text-lg font-bold text-on-surface tracking-tight truncate">
            {title}
          </h2>
        ) : (
          title
        )}
        {subtitle && (
          typeof subtitle === 'string' ? (
            <p className="text-xs text-on-surface-variant font-medium mt-0.5 truncate">
              {subtitle}
            </p>
          ) : (
            subtitle
          )
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {headerActions}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <div style={{ zIndex }} className="fixed inset-0 overflow-hidden">
          {/* Backdrop avec flou élégant */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {position === 'center' ? (
            /* Mode Centré (comme la modale de formulaire) */
            <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-5 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 14 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={cn(
                  'pointer-events-auto w-full max-h-[92vh] flex flex-col bg-surface-container-lowest rounded-2xl border border-on-surface/10 shadow-2xl overflow-hidden text-on-surface',
                  sizeClasses[size],
                  className
                )}
              >
                {headerContent}

                {/* Main Content Body (scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {children}
                </div>

                {/* Sticky Footer */}
                {footer && (
                  <div className="px-6 py-3.5 border-t border-on-surface/10 bg-surface-container-low/70 backdrop-blur-sm shrink-0">
                    {footer}
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            /* Mode Tiroir Latéral Droit (Slide-over) */
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className={cn(
                  'pointer-events-auto w-screen flex flex-col bg-surface-container-lowest border-l border-on-surface/10 shadow-2xl overflow-hidden text-on-surface',
                  sizeClasses[size],
                  className
                )}
              >
                {headerContent}

                {/* Main Content Body (scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {children}
                </div>

                {/* Sticky Footer */}
                {footer && (
                  <div className="px-6 py-4 border-t border-on-surface/10 bg-surface-container-low/70 backdrop-blur-sm shrink-0">
                    {footer}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
