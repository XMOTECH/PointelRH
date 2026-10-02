import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning' | 'info';
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'tertiary';
  icon?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Annuler',
  variant = 'danger',
  confirmVariant,
  icon,
  onClose,
  onConfirm,
  isLoading,
  confirmDisabled,
  children,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const effectiveConfirmVariant =
    confirmVariant || (variant === 'danger' ? 'danger' : 'primary');
  const effectiveConfirmLabel =
    confirmLabel || (variant === 'danger' ? 'Supprimer' : 'Confirmer');

  const getIconAndBg = () => {
    if (icon) {
      const bg =
        variant === 'danger'
          ? 'bg-red-500/10'
          : variant === 'warning'
          ? 'bg-amber-500/10'
          : variant === 'info'
          ? 'bg-blue-500/10'
          : 'bg-primary/10';
      return { iconElement: icon, bgClass: bg };
    }

    switch (variant) {
      case 'danger':
        return {
          iconElement: <AlertTriangle size={24} className="text-red-500" />,
          bgClass: 'bg-red-500/10',
        };
      case 'warning':
        return {
          iconElement: <AlertCircle size={24} className="text-amber-500" />,
          bgClass: 'bg-amber-500/10',
        };
      case 'info':
        return {
          iconElement: <Info size={24} className="text-blue-500" />,
          bgClass: 'bg-blue-500/10',
        };
      case 'primary':
      default:
        return {
          iconElement: <CheckCircle2 size={24} className="text-primary" />,
          bgClass: 'bg-primary/10',
        };
    }
  };

  const { iconElement, bgClass } = getIconAndBg();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center shrink-0`}>
            {iconElement}
          </div>
          <div className="space-y-1 w-full">
            <h3 id="confirm-dialog-title" className="text-lg font-display font-bold text-on-surface">
              {title}
            </h3>
            {description && (
              <div className="text-sm text-on-surface-variant leading-relaxed">
                {description}
              </div>
            )}
          </div>

          {children && <div className="w-full">{children}</div>}

          <div className="flex gap-3 w-full pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={effectiveConfirmVariant}
              className="flex-1"
              onClick={onConfirm}
              isLoading={isLoading}
              disabled={confirmDisabled}
              autoFocus
            >
              {effectiveConfirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
