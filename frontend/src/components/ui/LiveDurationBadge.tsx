import React from 'react';
import { Clock, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { FormattedNumber } from './FormattedNumber';
import { cn } from '@/lib/utils';

export interface LiveDurationBadgeProps {
  startTime?: string | null;
  endTime?: string | null;
  breakMinutes?: number;
  maxLegalHours?: number; // Défaut: 10h en France / Sénégal
  className?: string;
}

/**
 * Calcule la durée nette en heures décimales
 */
export function computeNetHours(startTime?: string | null, endTime?: string | null, breakMinutes: number = 0): number {
  if (!startTime || !endTime) return 0;
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  let gross = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
  if (gross <= 0) gross += 24 * 60; // Gère le passage à minuit
  const net = Math.max(0, gross - (breakMinutes || 0));
  return Number((net / 60).toFixed(2));
}

export const LiveDurationBadge: React.FC<LiveDurationBadgeProps> = ({
  startTime,
  endTime,
  breakMinutes = 0,
  maxLegalHours = 10,
  className = '',
}) => {
  const netHours = computeNetHours(startTime, endTime, breakMinutes);
  const isExceeded = netHours > maxLegalHours;
  const isZero = netHours <= 0;

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3.5 py-2 rounded-xl border transition-colors',
        isExceeded
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : isZero
          ? 'bg-slate-50 border-slate-200 text-slate-500'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Clock size={16} weight="duotone" className={isExceeded ? 'text-rose-600' : isZero ? 'text-slate-400' : 'text-emerald-600'} />
        <span className="text-xs font-semibold">Temps de travail effectif :</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm font-black font-mono">
          <FormattedNumber value={netHours} type="duration" zeroDisplay="dash" />
        </div>

        {!isZero && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
              isExceeded
                ? 'bg-rose-200/80 text-rose-800'
                : 'bg-emerald-200/70 text-emerald-800'
            )}
            title={
              isExceeded
                ? `Dépassement du plafond journalier légal (max ${maxLegalHours}h)`
                : `Conforme à la limite journalière (max ${maxLegalHours}h)`
            }
          >
            {isExceeded ? (
              <>
                <WarningCircle size={13} weight="duotone" />
                <span>&gt; {maxLegalHours}h</span>
              </>
            ) : (
              <>
                <CheckCircle size={13} weight="duotone" />
                <span>Conforme</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
