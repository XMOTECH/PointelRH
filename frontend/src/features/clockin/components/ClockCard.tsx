/**
 * Component: ClockCard
 * Affiche l'horloge en temps réel et le bouton de pointage (entrée / sortie / journée complète)
 */

import { Clock, LogIn, LogOut, CheckCircle } from 'lucide-react';
import { SPACING, UI_SIZES, COLORS, CLOCK_IN_MESSAGES } from '../constants';
import { useTimeFormatting } from '../hooks/hooks';
import type { TodayStatusResponse } from '../types';

type ClockState = 'idle' | 'checked_in' | 'complete';

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

  const buttonConfig = {
    idle: {
      label: 'Pointer l\'Entrée',
      onClick: onClockIn,
      disabled: isPending,
      style: {} as React.CSSProperties,
      icon: <LogIn size={18} style={{ marginRight: 8 }} />,
    },
    checked_in: {
      label: isPending ? CLOCK_IN_MESSAGES.clockOutPending : CLOCK_IN_MESSAGES.clockOutTitle,
      onClick: onClockOut,
      disabled: isPending,
      style: {
        backgroundColor: COLORS.warning,
        borderColor: COLORS.warning,
      } as React.CSSProperties,
      icon: <LogOut size={18} style={{ marginRight: 8 }} />,
    },
    complete: {
      label: CLOCK_IN_MESSAGES.dayComplete,
      onClick: () => {},
      disabled: true,
      style: {
        backgroundColor: COLORS.neutral,
        borderColor: COLORS.neutral,
        cursor: 'not-allowed',
      } as React.CSSProperties,
      icon: <CheckCircle size={18} style={{ marginRight: 8 }} />,
    },
  };

  const config = buttonConfig[clockState];

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
      }}
    >
      {/* Icon Container */}
      <div
        style={{
          width: UI_SIZES.clockIconContainerSize,
          height: UI_SIZES.clockIconContainerSize,
          borderRadius: '50%',
          backgroundColor: clockState === 'checked_in' ? COLORS.warningBg : clockState === 'complete' ? COLORS.successBg : COLORS.primaryBgLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: clockState === 'checked_in' ? COLORS.warning : clockState === 'complete' ? COLORS.success : COLORS.primary,
          marginBottom: SPACING.md,
        }}
      >
        <Clock size={UI_SIZES.iconSize} />
      </div>

      {/* Time Display */}
      <h3
        style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          margin: 0,
          color: COLORS.textHeader,
        }}
      >
        {formatTime(currentTime)}
      </h3>

      {/* Date Display */}
      <p
        style={{
          color: COLORS.textMuted,
          fontWeight: 500,
          marginTop: SPACING.sm,
        }}
      >
        {formatDate(currentTime)}
      </p>

      {/* Check-in/out times if available */}
      {todayAttendance?.checked_in_at && (
        <div style={{ marginTop: SPACING.base, fontSize: '0.875rem', color: COLORS.textMuted, textAlign: 'center' }}>
          <p style={{ margin: 0 }}>
            Entrée : {new Date(todayAttendance.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {todayAttendance.checked_out_at && (
            <p style={{ margin: '4px 0 0' }}>
              Sortie : {new Date(todayAttendance.checked_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {todayAttendance.work_minutes != null && (
                <span> — {Math.floor(todayAttendance.work_minutes / 60)}h{String(todayAttendance.work_minutes % 60).padStart(2, '0')} travaillées</span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={config.onClick}
        disabled={config.disabled}
        className="btn btn-primary"
        style={{
          marginTop: SPACING.lg,
          width: '100%',
          padding: SPACING.base,
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...config.style,
        }}
      >
        {config.icon}
        {isPending && clockState === 'idle' ? CLOCK_IN_MESSAGES.pending : config.label}
      </button>
    </div>
  );
};
