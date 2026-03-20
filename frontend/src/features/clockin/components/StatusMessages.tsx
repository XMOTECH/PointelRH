/**
 * Component: SuccessMessage
 * Affiche un message de succès formatté
 */

import { CheckCircle } from 'lucide-react';
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
 * Component: ErrorMessage
 * Affiche un message d'erreur formaté
 */

import { AlertCircle } from 'lucide-react';

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
