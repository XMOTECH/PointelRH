/**
 * ClockInPage
 * Page principale pour le pointage avec horloge en temps réel et QR Code
 *
 * Responsabilités:
 * - Orchestrer les composants de l'UI
 * - Gérer l'état du pointage
 * - Afficher les messages de statut
 */

import { useAuth } from '@/hooks/useAuth';
import { useClockIn } from './hooks/useClockIn';
import { useRealTimeClock, useQRCodeData } from './hooks/hooks';
import { ClockCard, QRCodeCard, SuccessMessage, ErrorMessage } from './components';
import { CLOCK_IN_MESSAGES, SPACING, LAYOUT } from './constants';

export default function ClockInPage() {
  const { user } = useAuth();
  const { mutate: clockIn, isPending, isSuccess, isError, error } = useClockIn();
  const currentTime = useRealTimeClock();
  const { qrToken, isLoading: qrLoading } = useQRCodeData(user?.employee_id);

  // Extraire le message d'erreur de manière sûre
  const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Une erreur est survenue.';

  return (
    <div className="clock-in-container" style={{ maxWidth: LAYOUT.containerMaxWidth, margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ marginBottom: SPACING.lg, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          {CLOCK_IN_MESSAGES.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: SPACING.sm }}>
          {CLOCK_IN_MESSAGES.description}
        </p>
      </div>

      {/* Contenu - Cartes côte à côte */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: LAYOUT.gridColumns,
          gap: LAYOUT.gridGap,
        }}
      >
        <ClockCard
          currentTime={currentTime}
          onClockIn={() => clockIn({
            channel: 'qr',
            payload: { qr_token: qrToken || '' }
          })}
          isPending={isPending || qrLoading}
          isSuccess={isSuccess}
        />
        <QRCodeCard qrValue={qrToken || ''} userId={user?.id} />
      </div>

      {/* Messages de statut */}
      <div style={{ marginTop: SPACING.lg }}>
        {isSuccess && <SuccessMessage timestamp={new Date()} />}
        {isError && <ErrorMessage message={errorMessage} />}
      </div>
    </div>
  );
}
