import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/Skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type MetricVariant = 'primary' | 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'neutral';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: MetricVariant;
  subtitle?: string;
  trend?: {
    value: string | number;
    label?: string;
    positive?: boolean;
  };
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  subtitle,
  trend,
  isLoading = false,
  onClick,
  className,
}) => {
  if (isLoading) {
    return <Skeleton.Card className={className} />;
  }

  const variantStyles: Record<MetricVariant, { iconColor: string }> = {
    primary: {
      iconColor: 'text-primary',
    },
    emerald: {
      iconColor: 'text-emerald-600',
    },
    amber: {
      iconColor: 'text-amber-600',
    },
    rose: {
      iconColor: 'text-rose-600',
    },
    sky: {
      iconColor: 'text-sky-600',
    },
    indigo: {
      iconColor: 'text-indigo-600',
    },
    neutral: {
      iconColor: 'text-on-surface-variant',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-xl bg-surface-container-lowest border border-on-surface/10 shadow-2xs flex flex-col justify-between transition-all duration-200',
        onClick && 'cursor-pointer hover:border-primary/40 hover:shadow-xs active:scale-[0.99]',
        className
      )}
    >

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold font-display text-on-surface tracking-tight">
            {value}
          </p>
        </div>
        {/* Icône propre sans conteneur de fond (zéro bg / zéro boîte grise) */}
        <div className={cn('shrink-0 pt-0.5', style.iconColor)}>
          <Icon size={24} />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-on-surface/5 flex items-center justify-between text-xs text-on-surface-variant">
          {trend ? (
            <div className="flex items-center gap-1.5 font-medium">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-semibold text-[11px]',
                  trend.positive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                )}
              >
                {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend.value}
              </span>
              {trend.label && <span>{trend.label}</span>}
            </div>
          ) : (
            <span className="truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};
