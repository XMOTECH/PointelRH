/**
 * ClockInPage
 * Page principale pour le pointage avec horloge en temps réel et QR Code
 *
 * Responsabilités:
 * - Orchestrer les composants de l'UI
 * - Gérer l'état du pointage
 * - Afficher les messages de statut
 */

import { useAuth } from '../../context/AuthContext';
import { useClockIn } from './hooks/useClockIn';
import { useRealTimeClock, useQRCodeData } from './hooks/hooks';
import { ClockCard, QRCodeCard, SuccessMessage, ErrorMessage } from './components';
import { CLOCK_IN_MESSAGES, SPACING, LAYOUT } from './constants';

export default function ClockInPage() {
  const { user } = useAuth();
  const { mutate: clockIn, isPending, isSuccess, isError, error } = useClockIn();
  const currentTime = useRealTimeClock();
  const qrValue = useQRCodeData(user?.id);

  // Extraire le message d'erreur de manière sûre
  const errorMessage = (error as any)?.response?.data?.error || 'Une erreur est survenue.';

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
          onClockIn={() => clockIn()}
          isPending={isPending}
          isSuccess={isSuccess}
        />
        <QRCodeCard qrValue={qrValue} userId={user?.id} />
      </div>

      {/* Messages de statut */}
      <div style={{ marginTop: SPACING.lg }}>
        {isSuccess && <SuccessMessage timestamp={new Date()} />}
        {isError && <ErrorMessage message={errorMessage} />}
      </div>
    </div>
  );
}
