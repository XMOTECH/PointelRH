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
import { Link } from 'react-router-dom';
import { Monitor, ScanFace, UserPlus, HeartHandshake, PlaneTakeoff, Briefcase, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClockIn } from './hooks/useClockIn';
import { useClockOut } from './hooks/useClockOut';
import { useRealTimeClock, useTodayStatus } from './hooks/hooks';
import { ClockCard, FaceRecognitionCard, SuccessMessage, ClockOutSuccessMessage, ErrorMessage } from './components';
import { useFaceEnrollmentStatus } from '@/features/employees/hooks/useFaceEnrollment';
import { FaceEnrollmentModal } from '@/features/employees/components/FaceEnrollmentModal';

type ClockInMode = 'web' | 'face';

export default function ClockInPage() {
  const { user } = useAuth();
  const targetId = user?.employee_id || user?.id;
  const currentTime = useRealTimeClock();
  const { todayAttendance, isCheckedOut, hasActiveSession } = useTodayStatus(targetId);
  const [mode, setMode] = useState<ClockInMode>('web');
  const { data: faceStatus } = useFaceEnrollmentStatus(targetId);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const needsEnrollment = mode === 'face' && faceStatus && !faceStatus.enrolled;

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

  // Détermination de l'état : en session active, en pause (séance précédente clôturée), ou idle
  const clockState = (hasActiveSession || clockInSuccess) && !clockOutSuccess
    ? 'checked_in'
    : (isCheckedOut || clockOutSuccess)
      ? 'paused'
      : 'idle';

  const isPending = clockInPending || clockOutPending;

  // Extract error messages safely
  const clockInErrStatus = (clockInErrorObj as any)?.response?.status;
  const clockInErrorMessage = clockInErrStatus === 409
    ? ((clockInErrorObj as any)?.response?.data?.message || 'Vous avez déjà une session active.')
    : (clockInErrorObj as any)?.response?.data?.message || (clockInErrorObj as any)?.response?.data?.error || 'Une erreur est survenue lors du pointage.';
  const clockOutErrorMessage = (clockOutErrorObj as any)?.response?.data?.message || (clockOutErrorObj as any)?.response?.data?.error || 'Une erreur est survenue lors du pointage de sortie.';

  const userCompanyId = user?.company_id || (user as any)?.companyId;

  const handleFaceClockIn = (descriptor: number[]) => {
    clockIn({
      channel: 'face',
      company_id: userCompanyId,
      companyId: userCompanyId,
      payload: {
        descriptor,
        companyId: userCompanyId,
      },
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pt-2">

      {/* Sélecteur de mode (Segmented Control Unifié Style Apple) */}
      {clockState === 'idle' && (
        <div className="flex justify-center">
          <div className="p-1 bg-surface-container-low border border-on-surface/10 rounded-full inline-flex items-center gap-1">
            <button
              onClick={() => setMode('web')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-extrabold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                mode === 'web'
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface bg-transparent'
              }`}
            >
              <Monitor size={15} />
              Pointage Web
            </button>
            <button
              onClick={() => setMode('face')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-extrabold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                mode === 'face'
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface bg-transparent'
              }`}
            >
              <ScanFace size={15} />
              Reconnaissance Faciale
            </button>
          </div>
        </div>
      )}

      <div className="w-full">
        {mode === 'web' || clockState !== 'idle' ? (
          <ClockCard
            currentTime={currentTime}
            onClockIn={() => clockIn({
              channel: 'web',
              company_id: userCompanyId,
              companyId: userCompanyId,
              payload: {
                user_id: user?.id || (user as any)?.user_id || user?.employee_id || '',
                userId: user?.id || (user as any)?.user_id || user?.employee_id || '',
                employee_id: user?.employee_id || user?.id || '',
                email: user?.email || '',
                companyId: userCompanyId,
              },
            })}
            onClockOut={() => {
              const empId = user?.employee_id || user?.id || '';
              if (empId) {
                clockOut({
                  employee_id: empId,
                  company_id: userCompanyId,
                });
              }
            }}
            isPending={isPending}
            clockState={clockState}
            todayAttendance={todayAttendance}
          />
        ) : needsEnrollment ? (
          <div className="flex flex-col items-center gap-5 p-10 bg-surface-container-lowest border border-dashed border-outline-variant rounded-3xl text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ScanFace size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">
                Configurez la reconnaissance faciale
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                Pour pointer par reconnaissance faciale, vous devez d'abord enregistrer votre visage. Cela ne prend que quelques secondes.
              </p>
            </div>
            <button
              onClick={() => setEnrollModalOpen(true)}
              className="btn btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl"
            >
              <UserPlus size={18} />
              Enregistrer mon visage
            </button>
          </div>
        ) : (
          <FaceRecognitionCard
            onFaceDetected={handleFaceClockIn}
            isPending={isPending}
            isSuccess={clockInSuccess}
            isError={clockInError}
            errorMessage={clockInErrorMessage}
            disabled={clockState !== 'idle'}
          />
        )}
      </div>

      {/* Messages de statut */}
      <div>
        {clockInSuccess && clockState === 'checked_in' && !clockOutSuccess && (
          <SuccessMessage timestamp={new Date()} />
        )}
        {(clockOutSuccess || (clockState === 'paused' && todayAttendance)) && (
          <ClockOutSuccessMessage
            workMinutes={todayAttendance?.work_minutes ?? null}
            overtimeMinutes={todayAttendance?.overtime_minutes ?? null}
          />
        )}
        {clockInError && <ErrorMessage message={clockInErrorMessage} />}
        {clockOutError && <ErrorMessage message={clockOutErrorMessage} />}
      </div>

      {/* Espace Collaborateur - Raccourcis & Indicateurs */}
      <div className="pt-6 border-t border-on-surface/10 space-y-4">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
          Mon Espace LuminaRH
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <Link
            to="/my-advances"
            className="flex flex-col gap-2 p-4 rounded-2xl border border-on-surface/10 bg-surface-container-lowest hover:border-primary/30 transition-all group"
          >
            <HeartHandshake size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-on-surface block">Prêts & Acomptes</span>
              <span className="text-[11px] text-on-surface-variant">Demandes d'aides</span>
            </div>
          </Link>

          <Link
            to="/my-leaves"
            className="flex flex-col gap-2 p-4 rounded-2xl border border-on-surface/10 bg-surface-container-lowest hover:border-primary/30 transition-all group"
          >
            <PlaneTakeoff size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-on-surface block">Mes Congés</span>
              <span className="text-[11px] text-on-surface-variant">Demandes de congés</span>
            </div>
          </Link>

          <Link
            to="/my-missions"
            className="flex flex-col gap-2 p-4 rounded-2xl border border-on-surface/10 bg-surface-container-lowest hover:border-primary/30 transition-all group"
          >
            <Briefcase size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-on-surface block">Mes Missions</span>
              <span className="text-[11px] text-on-surface-variant">Affectations</span>
            </div>
          </Link>

          <Link
            to="/my-profile"
            className="flex flex-col gap-2 p-4 rounded-2xl border border-on-surface/10 bg-surface-container-lowest hover:border-primary/30 transition-all group"
          >
            <User size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-on-surface block">Mon Profil</span>
              <span className="text-[11px] text-on-surface-variant">Code PIN & Infos</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Face Enrollment Modal */}
      {user?.employee_id && (
        <FaceEnrollmentModal
          open={enrollModalOpen}
          onClose={() => setEnrollModalOpen(false)}
          employeeId={user.employee_id}
          employeeName={`${user.first_name || ''} ${user.last_name || ''}`}
        />
      )}
    </div>
  );
}
