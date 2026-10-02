/**
 * Component: ClockCard
 * Affiche l'horloge en temps réel entourée d'un anneau de progression circulaire dynamique
 * qui se charge à partir du temps de présence cumulé de l'employé sur ses sessions du jour.
 */

import React from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, Coffee } from 'lucide-react';
import { useTimeFormatting } from '../hooks/hooks';
import type { TodayStatusResponse } from '../types';

export type ClockState = 'idle' | 'checked_in' | 'complete' | 'paused';

interface ClockCardProps {
  currentTime: Date;
  onClockIn: () => void;
  onClockOut: () => void;
  isPending: boolean;
  clockState: ClockState;
  todayAttendance: TodayStatusResponse | null;
}

export const ClockCard: React.FC<ClockCardProps> = ({
  currentTime,
  onClockIn,
  onClockOut,
  isPending,
  clockState,
  todayAttendance,
}) => {
  const { formatTime, formatDate } = useTimeFormatting();

  // ── Calculation of Circular Progress ──────────────────────────────────────
  const WORK_DAY_MINUTES = 8 * 60; // 8 heures = 480 minutes
  const TOTAL_CIRCUMFERENCE = 565.487; // 2 * PI * R (R = 90)

  let progressPercent = 0;
  let elapsedHours = 0;
  let elapsedMinutes = 0;
  let checkedInTimeStr = '';

  const rawCheckIn = todayAttendance?.checked_in_at || (todayAttendance as any)?.clockIn || (todayAttendance as any)?.clock_in;
  if (rawCheckIn) {
    const checkInDate = new Date(rawCheckIn);
    checkedInTimeStr = checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Calcul du temps total travaillé aujourd'hui (cumul multi-sessions)
  const totalWorkMins = todayAttendance?.work_minutes ?? (todayAttendance as any)?.workMinutes ?? 0;
  
  if (clockState === 'checked_in' && rawCheckIn) {
    const checkInDate = new Date(rawCheckIn);
    const currentSessionMs = Math.max(0, currentTime.getTime() - checkInDate.getTime());
    const currentSessionMins = Math.floor(currentSessionMs / 60000);
    // Cumul des sessions précédentes + session en cours
    const grandTotalMins = totalWorkMins > 0 ? totalWorkMins : currentSessionMins;
    elapsedHours = Math.floor(grandTotalMins / 60);
    elapsedMinutes = grandTotalMins % 60;
    progressPercent = Math.min(100, Math.round((grandTotalMins / WORK_DAY_MINUTES) * 100));
  } else if (clockState === 'paused' || clockState === 'complete') {
    elapsedHours = Math.floor(totalWorkMins / 60);
    elapsedMinutes = totalWorkMins % 60;
    progressPercent = Math.min(100, Math.round((totalWorkMins / WORK_DAY_MINUTES) * 100));
  }

  const strokeDashoffset = TOTAL_CIRCUMFERENCE - (progressPercent / 100) * TOTAL_CIRCUMFERENCE;

  // ── Action Button Configuration ──────────────────────────────────────────
  const buttonConfig = {
    idle: {
      label: "Pointer l'Entrée",
      onClick: onClockIn,
      disabled: isPending,
      className: 'bg-primary text-on-primary hover:bg-primary/90',
      icon: <LogIn size={18} />,
    },
    checked_in: {
      label: isPending ? 'Enregistrement de la sortie...' : 'Pointer la Sortie (Pause / Fin)',
      onClick: onClockOut,
      disabled: isPending,
      className: 'bg-amber-600 text-white hover:bg-amber-700',
      icon: <LogOut size={18} />,
    },
    paused: {
      label: isPending ? 'Enregistrement de l\'entrée...' : 'Reprendre le travail',
      onClick: onClockIn,
      disabled: isPending,
      className: 'bg-primary text-on-primary hover:bg-primary/90',
      icon: <LogIn size={18} />,
    },
    complete: {
      label: 'Journée terminée',
      onClick: () => {},
      disabled: true,
      className: 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-70',
      icon: <CheckCircle2 size={18} />,
    },
  };

  const config = buttonConfig[clockState];
  const sessionsCount = todayAttendance?.sessionsCount ?? (todayAttendance?.sessions?.length ?? 1);

  return (
    <div className="bg-surface-container-lowest/90 border border-on-surface/15 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-none relative overflow-hidden transition-all">
      {/* ── Circular Progress Ring Component ──────────────── */}
      <div className="relative w-64 h-64 flex items-center justify-center my-3">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Track */}
          <circle
            cx="100"
            cy="100"
            r="89"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="7"
            className="text-on-surface/10"
          />
          {/* Progress Arc */}
          <circle
            cx="100"
            cy="100"
            r="89"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="7"
            strokeDasharray={TOTAL_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${
              clockState === 'complete'
                ? 'text-emerald-500'
                : clockState === 'checked_in'
                ? 'text-primary'
                : clockState === 'paused'
                ? 'text-amber-500'
                : 'text-primary/40'
            }`}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {clockState === 'idle' && (
            <>
              <Clock size={28} className="text-primary mb-1.5 opacity-80" />
              <span className="text-4xl font-mono font-black text-on-surface tracking-tight">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs text-on-surface-variant font-medium mt-1">
                {formatDate(currentTime)}
              </span>
            </>
          )}

          {clockState === 'checked_in' && (
            <>
              <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-mono mb-1.5 tracking-wider uppercase">
                {progressPercent}% de la journée
              </span>
              <span className="text-3xl font-mono font-black text-on-surface tracking-tight">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs font-semibold text-primary mt-1">
                {elapsedHours}h {String(elapsedMinutes).padStart(2, '0')}m cumulés
              </span>
              {checkedInTimeStr && (
                <span className="text-[11px] text-on-surface-variant/70 font-medium">
                  En service depuis {checkedInTimeStr}
                </span>
              )}
            </>
          )}

          {clockState === 'paused' && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-bold mb-1.5">
                <Coffee size={12} />
                <span>En pause ({sessionsCount} séance{sessionsCount > 1 ? 's' : ''})</span>
              </div>
              <span className="text-3xl font-mono font-black text-on-surface tracking-tight">
                {elapsedHours}h {String(elapsedMinutes).padStart(2, '0')}m
              </span>
              <span className="text-xs font-semibold text-on-surface-variant mt-1">
                Temps total effectué aujourd'hui
              </span>
              <span className="text-[11px] text-primary font-medium mt-0.5">
                Prêt à reprendre le travail
              </span>
            </>
          )}

          {clockState === 'complete' && (
            <>
              <CheckCircle2 size={36} className="text-emerald-500 mb-1.5" />
              <span className="text-2xl font-mono font-extrabold text-on-surface">
                {elapsedHours}h {String(elapsedMinutes).padStart(2, '0')}m
              </span>
              <span className="text-xs font-bold text-emerald-600 mt-0.5">
                Journée clôturée
              </span>
              {checkedInTimeStr && (
                <span className="text-[11px] text-on-surface-variant/70 font-medium mt-0.5">
                  Dernier pointage : {checkedInTimeStr}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Subtitle Date ─────────────────────────── */}
      {clockState !== 'idle' && (
        <p className="text-xs text-on-surface-variant font-medium mt-1 mb-2">
          {formatDate(currentTime)}
        </p>
      )}

      {/* ── Main Action Button ───────────────────────────── */}
      <button
        onClick={config.onClick}
        disabled={config.disabled}
        className={`w-full max-w-xs flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-full font-bold text-sm transition-all duration-300 shadow-sm cursor-pointer mt-3 hover:scale-[1.02] active:scale-[0.98] ${config.className}`}
      >
        {config.icon}
        {isPending ? 'Enregistrement en cours...' : config.label}
      </button>
    </div>
  );
};
