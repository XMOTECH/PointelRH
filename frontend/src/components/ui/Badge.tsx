import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const baseStyle = 'inline-flex items-center font-medium rounded-full border transition-colors select-none';

  const variants = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    error: 'bg-rose-50 text-rose-800 border-rose-200/80',
    info: 'bg-sky-50 text-sky-800 border-sky-200/80',
    primary: 'bg-primary/10 text-primary border-primary/20',
    neutral: 'bg-surface-container-high/60 text-on-surface-variant border-on-surface/10',
    default: 'bg-surface-container-low text-on-surface border-on-surface/10',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  // Suppression automatique des tirets du bas si le contenu est une chaîne
  const sanitizedChildren =
    typeof children === 'string' ? children.replace(/_/g, ' ') : children;

  return (
    <span className={cn(baseStyle, variants[variant], sizes[size], className)}>
      {sanitizedChildren}
    </span>
  );
};
