/**
 * ClockInPage
 * Page principale pour le pointage avec horloge en temps réel, QR Code et reconnaissance faciale
 *
 * Responsabilités:
 * - Orchestrer les composants de l'UI
 * - Gérer l'état du pointage (entrée + sortie)
 * - Afficher les messages de statut
 * - Permettre le choix du mode de pointage (Web / Reconnaissance Faciale)
 */

import { useState } from 'react';
import { Monitor, ScanFace } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClockIn } from './hooks/useClockIn';
import { useClockOut } from './hooks/useClockOut';
import { useRealTimeClock, useTodayStatus } from './hooks/hooks';
import { ClockCard, FaceRecognitionCard, SuccessMessage, ClockOutSuccessMessage, ErrorMessage } from './components';
import { CLOCK_IN_MESSAGES, SPACING, LAYOUT } from './constants';

type ClockInMode = 'web' | 'face';

export default function ClockInPage() {
  const { user } = useAuth();
  const currentTime = useRealTimeClock();
  const { todayAttendance, isCheckedIn, isCheckedOut } = useTodayStatus(user?.employee_id);
  const [mode, setMode] = useState<ClockInMode>('web');

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

  const handleFaceClockIn = (descriptor: number[]) => {
    clockIn({
      channel: 'face',
      payload: { descriptor },
    });
  };

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

      {/* Sélecteur de mode */}
      {clockState === 'idle' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: SPACING.lg,
          }}
        >
          <button
            onClick={() => setMode('web')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '999px',
              border: '2px solid',
              borderColor: mode === 'web' ? 'var(--primary)' : 'var(--border-light)',
              backgroundColor: mode === 'web' ? 'var(--primary)' : 'transparent',
              color: mode === 'web' ? 'white' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Monitor size={16} />
            Web
          </button>
          <button
            onClick={() => setMode('face')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '999px',
              border: '2px solid',
              borderColor: mode === 'face' ? 'var(--primary)' : 'var(--border-light)',
              backgroundColor: mode === 'face' ? 'var(--primary)' : 'transparent',
              color: mode === 'face' ? 'white' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <ScanFace size={16} />
            Reconnaissance Faciale
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: LAYOUT.gridColumns,
          gap: LAYOUT.gridGap,
        }}
      >
        {mode === 'web' || clockState !== 'idle' ? (
          <ClockCard
            currentTime={currentTime}
            onClockIn={() => clockIn({
              channel: 'web',
              payload: { user_id: user?.id || '' },
            })}
            onClockOut={() => {
              if (user?.employee_id) {
                clockOut({ employee_id: user.employee_id });
              }
            }}
            isPending={isPending}
            clockState={clockState}
            todayAttendance={todayAttendance}
          />
        ) : (
          <FaceRecognitionCard
            onFaceDetected={handleFaceClockIn}
            isPending={isPending}
            disabled={clockState !== 'idle'}
          />
        )}
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
