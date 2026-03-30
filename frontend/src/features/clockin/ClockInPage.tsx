/**
 * ClockInPage
 * Page principale pour le pointage avec horloge en temps réel et QR Code
 *
 * Responsabilités:
 * - Orchestrer les composants de l'UI
 * - Gérer l'état du pointage (entrée + sortie)
 * - Afficher les messages de statut
 */

import { useAuth } from '@/hooks/useAuth';
import { useClockIn } from './hooks/useClockIn';
import { useClockOut } from './hooks/useClockOut';
import { useRealTimeClock, useQRCodeData, useTodayStatus } from './hooks/hooks';
import { ClockCard, QRCodeCard, SuccessMessage, ClockOutSuccessMessage, ErrorMessage } from './components';
import { CLOCK_IN_MESSAGES, SPACING, LAYOUT } from './constants';

export default function ClockInPage() {
  const { user } = useAuth();
  const currentTime = useRealTimeClock();
  const { qrToken, isLoading: qrLoading } = useQRCodeData(user?.employee_id);
  const { todayAttendance, isCheckedIn, isCheckedOut } = useTodayStatus(user?.employee_id);

  const {
    mutate: clockIn,
    isPending: clockInPending,
    isSuccess: clockInSuccess,
    isError: clockInError,
    error: clockInErrorObj,
  } = useClockIn();

  const {
    mutate: clockOut,
    isPending: clockOutPending,
    isSuccess: clockOutSuccess,
    isError: clockOutError,
    error: clockOutErrorObj,
  } = useClockOut();

  // Determine clock state based on today's attendance
  const clockState = isCheckedOut || clockOutSuccess
    ? 'complete'
    : isCheckedIn || clockInSuccess
      ? 'checked_in'
      : 'idle';

  const isPending = clockInPending || clockOutPending;

  // Extract error messages safely
  const clockInErrorMessage = (clockInErrorObj as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Une erreur est survenue.';
  const clockOutErrorMessage = (clockOutErrorObj as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Une erreur est survenue lors du pointage de sortie.';

  return (
    <div className="clock-in-container" style={{ maxWidth: LAYOUT.containerMaxWidth, margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ marginBottom: SPACING.lg, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          {CLOCK_IN_MESSAGES.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: SPACING.sm }}>
          {clockState === 'checked_in'
            ? CLOCK_IN_MESSAGES.clockOutDescription
            : clockState === 'complete'
              ? CLOCK_IN_MESSAGES.dayCompleteDescription
              : CLOCK_IN_MESSAGES.description}
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
            payload: { qr_token: qrToken || '' },
          })}
          onClockOut={() => {
            if (user?.employee_id) {
              clockOut({ employee_id: user.employee_id });
            }
          }}
          isPending={isPending || qrLoading}
          clockState={clockState}
          todayAttendance={todayAttendance}
        />
        <QRCodeCard qrValue={qrToken || ''} userId={user?.id} />
      </div>

      {/* Messages de statut */}
      <div style={{ marginTop: SPACING.lg }}>
        {clockInSuccess && clockState === 'checked_in' && !clockOutSuccess && (
          <SuccessMessage timestamp={new Date()} />
        )}
        {(clockOutSuccess || (clockState === 'complete' && todayAttendance)) && (
          <ClockOutSuccessMessage
            workMinutes={todayAttendance?.work_minutes ?? null}
            overtimeMinutes={todayAttendance?.overtime_minutes ?? null}
          />
        )}
        {clockInError && <ErrorMessage message={clockInErrorMessage} />}
        {clockOutError && <ErrorMessage message={clockOutErrorMessage} />}
      </div>
    </div>
  );
}
