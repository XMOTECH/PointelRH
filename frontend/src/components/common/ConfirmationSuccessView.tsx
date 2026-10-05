import React from 'react';
import { Button } from '@/components/ui/Button';
import { Check, ShieldCheck, ArrowRight } from 'lucide-react';

export interface NextStepItem {
  title: string;
  description?: string;
  badge?: string;
}

export interface ConfirmationSuccessViewProps {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  variant?: 'emerald' | 'primary';
  tag?: string;
  nextStepsTitle?: string;
  nextSteps?: Array<string | NextStepItem>;
  securityNote?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    isLoading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const ConfirmationSuccessView: React.FC<ConfirmationSuccessViewProps> = ({
  title,
  subtitle,
  icon: IconComponent,
  variant = 'emerald',
  tag,
  nextStepsTitle = 'PROCHAINES ÉTAPES',
  nextSteps = [],
  securityNote,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  const isEmerald = variant === 'emerald';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── 1. Success Badge Icon ── */}
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
            isEmerald
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : 'bg-primary/10 text-primary border-primary/20'
          }`}
        >
          {IconComponent ? (
            <IconComponent size={22} className="stroke-[2.5]" />
          ) : (
            <Check size={22} className="stroke-[2.5]" />
          )}
        </div>

        {tag && (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            {tag}
          </span>
        )}
      </div>

      {/* ── 2. Heading & Subtitle ── */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-on-surface">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
          {subtitle}
        </p>
      </div>

      {/* ── 3. Next Up / Prochaines Étapes Box (Tenmō Box Pattern) ── */}
      {nextSteps.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-surface-container-low border border-dashed border-slate-200/90 dark:border-on-surface/10 space-y-3">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            {nextStepsTitle}
          </p>

          <div className="space-y-2.5">
            {nextSteps.map((step, idx) => {
              if (typeof step === 'string') {
                return (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{step}</span>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-white dark:bg-surface-container-lowest border border-slate-200 dark:border-on-surface/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {step.title}
                      </p>
                      {step.description && (
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {step.badge && (
                    <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {step.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Primary & Secondary CTA Actions ── */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 pt-2">
          {primaryAction && (
            <Button
              variant="primary"
              onClick={primaryAction.onClick}
              isLoading={primaryAction.isLoading}
              className="h-10 px-6 text-xs font-bold rounded-xl shadow-sm"
            >
              <span>{primaryAction.label}</span>
              {primaryAction.icon ? (
                <primaryAction.icon size={14} className="ml-2" />
              ) : (
                <ArrowRight size={14} className="ml-2" />
              )}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="h-10 px-4 text-xs font-semibold rounded-xl text-slate-700"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* ── 5. Security & Legal Trust Anchor ── */}
      {securityNote && (
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
          <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
          <span className="text-[11px] leading-relaxed">{securityNote}</span>
        </div>
      )}
    </div>
  );
};
