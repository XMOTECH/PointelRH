import React from 'react';
import { cn } from '@/lib/utils';
import type { OffboardingStatus } from '../types';

interface OffboardingStatusBadgeProps {
  status: OffboardingStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  INITIATED: {
    label: 'Initié',
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  IN_PROGRESS: {
    label: 'En cours',
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  PENDING_DOCUMENTS: {
    label: 'Attente Documents',
    bg: 'bg-purple-500/10',
    text: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  COMPLETED: {
    label: 'Clôturé',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Annulé',
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-500',
  },
};

export const OffboardingStatusBadge: React.FC<OffboardingStatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-slate-500/10',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide',
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
};
