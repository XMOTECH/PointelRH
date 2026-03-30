/**
 * Component: StatusMessages
 * Affiche les messages de succès/erreur pour le pointage
 */

import { CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { SPACING, COLORS, BORDER_RADIUS, UI_SIZES, CLOCK_IN_MESSAGES } from '../constants';

interface SuccessMessageProps {
  timestamp: Date;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ timestamp }) => (
  <div
    style={{
      padding: SPACING.base,
      backgroundColor: COLORS.successBg,
      border: `1px solid ${COLORS.successBorder}`,
      borderRadius: BORDER_RADIUS.sm,
      color: COLORS.success,
      display: 'flex',
      alignItems: 'center',
      gap: SPACING.xs,
    }}
  >
    <CheckCircle size={UI_SIZES.statusIconSize} />
    <div>
      <p style={{ fontWeight: 700, margin: 0 }}>Pointage Réussi !</p>
      <p style={{ fontSize: '0.875rem', margin: 0 }}>
        {CLOCK_IN_MESSAGES.successDetail(timestamp.toLocaleTimeString())}
      </p>
    </div>
  </div>
);

/**
 * Component: ClockOutSuccessMessage
 * Affiche un message de succès pour la sortie avec le résumé de la journée
 */

interface ClockOutSuccessMessageProps {
  workMinutes: number | null;
  overtimeMinutes: number | null;
}

export const ClockOutSuccessMessage: React.FC<ClockOutSuccessMessageProps> = ({ workMinutes, overtimeMinutes }) => {
  const hours = workMinutes != null ? Math.floor(workMinutes / 60) : 0;
  const mins = workMinutes != null ? workMinutes % 60 : 0;

  return (
    <div
      style={{
        padding: SPACING.base,
        backgroundColor: COLORS.warningBg,
        border: `1px solid ${COLORS.warningBorder}`,
        borderRadius: BORDER_RADIUS.sm,
        color: COLORS.warning,
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.xs,
      }}
    >
      <LogOut size={UI_SIZES.statusIconSize} />
      <div>
        <p style={{ fontWeight: 700, margin: 0 }}>{CLOCK_IN_MESSAGES.clockOutSuccess}</p>
        <p style={{ fontSize: '0.875rem', margin: 0 }}>
          Durée totale : {hours}h{String(mins).padStart(2, '0')}
          {overtimeMinutes != null && overtimeMinutes > 0 && (
            <span> — dont {Math.floor(overtimeMinutes / 60)}h{String(overtimeMinutes % 60).padStart(2, '0')} supplémentaires</span>
          )}
        </p>
      </div>
    </div>
  );
};

/**
 * Component: ErrorMessage
 * Affiche un message d'erreur formaté
 */

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div
    style={{
      padding: SPACING.base,
      backgroundColor: COLORS.errorBg,
      border: `1px solid ${COLORS.errorBorder}`,
      borderRadius: BORDER_RADIUS.sm,
      color: COLORS.error,
      display: 'flex',
      alignItems: 'center',
      gap: SPACING.xs,
    }}
  >
    <AlertCircle size={UI_SIZES.statusIconSize} />
    <div>
      <p style={{ fontWeight: 700, margin: 0 }}>{CLOCK_IN_MESSAGES.error}</p>
      <p style={{ fontSize: '0.875rem', margin: 0 }}>{message}</p>
    </div>
  </div>
);
