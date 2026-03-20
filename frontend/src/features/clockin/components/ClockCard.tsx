/**
 * Component: ClockCard
 * Affiche l'horloge en temps réel et le bouton de pointage
 */

import { Clock } from 'lucide-react';
import { SPACING, UI_SIZES, COLORS, CLOCK_IN_MESSAGES } from '../constants';
import { useTimeFormatting } from '../hooks/hooks';

interface ClockCardProps {
  currentTime: Date;
  onClockIn: () => void;
  isPending: boolean;
  isSuccess: boolean;
}

export const ClockCard: React.FC<ClockCardProps> = ({
  currentTime,
  onClockIn,
  isPending,
  isSuccess,
}) => {
  const { formatTime, formatDate } = useTimeFormatting();

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
          backgroundColor: COLORS.primaryBgLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.primary,
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

      {/* Clock In Button */}
      <button
        onClick={onClockIn}
        disabled={isPending || isSuccess}
        className="btn btn-primary"
        style={{
          marginTop: SPACING.lg,
          width: '100%',
          padding: SPACING.base,
          fontSize: '1rem',
        }}
      >
        {isPending
          ? CLOCK_IN_MESSAGES.pending
          : isSuccess
            ? CLOCK_IN_MESSAGES.success
            : 'Pointer Maintenant'}
      </button>
    </div>
  );
};
