import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Numpad } from '../../components/ui/Numpad';
import { useRealTimeClock } from '../clockin/hooks/hooks';
import { useClockIn } from '../clockin/hooks/useClockIn';
import { useClockOut } from '../clockin/hooks/useClockOut';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

type KioskAction = 'checkin' | 'checkout';

export default function KioskPage() {
  const [pin, setPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [action, setAction] = useState<KioskAction>('checkin');

  // Prevent multiple clock-outs for the same event

  const currentTime = useRealTimeClock();
  const { 
    mutate: clockIn, 
    isPending: clockInPending, 
    error: clockInError, 
    isSuccess: clockInSuccess, 
    data: clockInData, 
    reset: resetClockIn 
  } = useClockIn();

  const { 
    mutate: clockOut, 
    isPending: clockOutPending, 
    error: clockOutError, 
    isSuccess: clockOutSuccess, 
    data: clockOutData, 
    reset: resetClockOut 
  } = useClockOut();
  const { user } = useAuth();

  const companyId = user?.company_id || new URLSearchParams(window.location.search).get('company_id');

  const isPending = clockInPending || clockOutPending;
  const isSuccess = clockInSuccess || clockOutSuccess;

  // PIN always attempts clock-in. If 409 (already clocked in), the useEffect
  // extracts employee_id from the error response and auto-triggers clock-out.
  const handlePinSubmit = useCallback((pinCode: string) => {
    if (!companyId) return;

    clockIn({
      channel: 'pin',
      company_id: companyId,
      payload: { pin_code: pinCode },
    }, {
      onError: (error) => {
        const err = error as { response?: { status?: number; data?: { employee_id?: string } } };
        if (err?.response?.status === 409 && err?.response?.data?.employee_id) {
          const empId = err.response.data.employee_id;
          setAction('checkout');
          resetClockIn();
          clockOut({ 
            employee_id: empId,
            company_id: companyId || undefined
          });
        }
      }
    });
  }, [companyId, clockIn, clockOut, resetClockIn]);

  // Auto-submit when 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin, handlePinSubmit]);

  // After clock-in success: check if employee was already clocked in today
  // and determine if we should show checkout option
  useEffect(() => {
    if (clockInSuccess && clockInData) {
      const employeeId = clockInData.employee_id;
      const firstName = clockInData.employee?.first_name || 'Employé';
      const timeStr = format(new Date(), 'HH:mm');

      const successTimer = setTimeout(() => {
        setSuccessMsg(`Bonjour ${firstName}, pointage enregistré à ${timeStr}`);
      }, 0);

      const resetTimer = setTimeout(() => {
        setPin('');
        setSuccessMsg('');
        setAction('checkin');
        resetClockIn();
      }, 4000);

      return () => {
        clearTimeout(successTimer);
        clearTimeout(resetTimer);
      };
    }

    if (clockInError) {
      const err = clockInError as { response?: { status?: number } };
      // Don't reset on 409 — the auto-clock-out handler will take over
      if (err?.response?.status !== 409) {
        const errorTimer = setTimeout(() => {
          setPin('');
        }, 0);
        return () => clearTimeout(errorTimer);
      }
    }
  }, [clockInSuccess, clockInError, clockInData, resetClockIn]);

  // After clock-out success
  useEffect(() => {
    if (clockOutSuccess && clockOutData) {
      const workMins = clockOutData.work_minutes;
      const hours = workMins ? Math.floor(workMins / 60) : 0;
      const mins = workMins ? workMins % 60 : 0;

      const successTimer = setTimeout(() => {
        setSuccessMsg(`Sortie enregistrée, durée ${hours}h${String(mins).padStart(2, '0')}`);
      }, 0);

      const resetTimer = setTimeout(() => {
        setPin('');
        setSuccessMsg('');
        setAction('checkin');
        resetClockOut();
      }, 4000);

      return () => {
        clearTimeout(successTimer);
        clearTimeout(resetTimer);
      };
    }

    if (clockOutError) {
      const errorTimer = setTimeout(() => {
        setPin('');
        setAction('checkin');
      }, 0);
      return () => clearTimeout(errorTimer);
    }
  }, [clockOutSuccess, clockOutError, clockOutData, resetClockOut]);

  // Removed the 409 auto-checkout useEffect (now handled in handlePinSubmit's onError)

  const handleKeyPress = useCallback((key: string) => {
    if (pin.length < 4 && !isPending && !isSuccess) {
      setPin((prev) => prev + key);
    }
  }, [pin.length, isPending, isSuccess]);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  // Physical Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers 0-9 (Normal and Numpad)
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } 
      // Backspace for correction
      else if (e.key === 'Backspace') {
        handleDelete();
      }
      // Escape to reset if needed
      else if (e.key === 'Escape') {
        setPin('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete]);

  const isCheckout = action === 'checkout';

  return (
    <div className="relative flex h-screen w-full flex-col bg-surface font-inter text-on-surface overflow-hidden">
      {/* Header */}
      <header className="flex w-full items-center justify-between px-12 py-8 bg-surface">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tighter text-on-surface uppercase font-space">
            Pointel<span className="text-primary">RH</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] text-on-surface-variant uppercase">
            Operational Precision
          </p>
        </div>
        <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-surface-container-lowest shadow-ambient">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Kiosk Actif</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-12">
        <div className="flex w-full max-w-6xl items-center justify-between gap-24">

          {/* Clock Section */}
          <div className="flex flex-col space-y-4 flex-1">
            <h2 className={cn(
              "text-xs font-bold tracking-[0.4em] uppercase",
              isCheckout ? "text-orange-500" : "text-primary"
            )}>
              {isCheckout ? 'Pointage de Sortie' : 'The Digital Atelier'}
            </h2>
            <div className="text-[12rem] font-medium leading-[0.8] tracking-tighter text-on-surface font-space">
              {format(currentTime, 'HH:mm')}
            </div>
            <div className="text-3xl font-light text-on-surface-variant tracking-tight pl-2">
              {format(currentTime, "EEEE d MMMM yyyy", { locale: fr })}
            </div>

            <div className="mt-12 flex items-center space-x-4 opacity-40">
               <div className="h-[1px] w-12 bg-on-surface-variant" />
               <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant italic">
                 Synchronisé en temps réel
               </span>
            </div>
          </div>

          {/* Interaction Module */}
          <div className={cn(
            "flex flex-col items-center rounded-[3rem] p-16 shadow-ambient w-[420px] transition-all duration-500",
            isCheckout ? "bg-orange-50" : "bg-surface-container-low"
          )}>
            <p className={cn(
              "mb-10 text-[10px] font-bold tracking-[0.3em] uppercase",
              isCheckout ? "text-orange-600" : "text-on-surface-variant"
            )}>
              {isCheckout ? 'PIN pour la sortie' : 'Saisissez votre PIN'}
            </p>

            {/* Checkout icon indicator */}
            {isCheckout && (
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <LogOut className="h-6 w-6 text-orange-600" />
              </div>
            )}

            {/* PIN Indicators */}
            <div className="mb-14 flex space-x-5">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = index < pin.length;
                return (
                  <div
                    key={index}
                    className={cn(
                      "h-3 w-3 rounded-full transition-all duration-300 ease-out",
                      isFilled
                        ? isCheckout
                          ? "bg-orange-500 scale-125 shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                          : "bg-primary scale-125 shadow-[0_0_15px_rgba(0,82,204,0.4)]"
                        : "bg-surface-container-highest"
                    )}
                  />
                );
              })}
            </div>

            <Numpad
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
              disabled={isPending || isSuccess}
            />

            <div className="h-8 mt-8 flex items-center justify-center w-full">
                {clockInError && !isCheckout && (clockInError as any)?.response?.status !== 409 && (
                  <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase animate-bounce">
                    PIN incorrect. réessayez.
                  </p>
                )}
                {clockOutError && (
                  <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase animate-bounce">
                    Erreur lors de la sortie.
                  </p>
                )}
                {isPending && (
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "h-1 w-8 rounded-full overflow-hidden",
                      isCheckout ? "bg-orange-200" : "bg-primary/20"
                    )}>
                        <div className={cn(
                          "h-full animate-[loading_1s_infinite]",
                          isCheckout ? "bg-orange-500" : "bg-primary"
                        )} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold tracking-widest uppercase",
                      isCheckout ? "text-orange-600" : "text-primary"
                    )}>
                      {isCheckout ? 'Sortie...' : 'Validation'}
                    </span>
                  </div>
                )}
            </div>

            {/* Back to check-in mode */}
            {isCheckout && !isPending && (
              <button
                onClick={() => {
                  setAction('checkin');
                  setPin('');
                  resetClockIn();
                  resetClockOut();
                }}
                className="mt-4 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase hover:text-on-surface transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Success Overlay */}
      <div
        className={cn(
          "absolute inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none",
          successMsg ? "opacity-100 backdrop-blur-2xl" : "opacity-0 backdrop-blur-0"
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center space-y-8 transform transition-all duration-700 ease-out p-12 rounded-[4rem]",
            successMsg ? "scale-100 translate-y-0" : "scale-90 translate-y-12"
          )}
        >
           <div className={cn(
             "flex h-32 w-32 items-center justify-center rounded-full animate-pulse",
             successMsg.startsWith('Sortie')
               ? "bg-orange-500 shadow-[0_20px_60px_rgba(234,88,12,0.3)]"
               : "bg-primary shadow-[0_20px_60px_rgba(0,82,204,0.3)]"
           )}>
             {successMsg.startsWith('Sortie')
               ? <LogOut className="h-16 w-16 text-white" />
               : <CheckCircle2 className="h-16 w-16 text-white" />
             }
           </div>
           <div className="text-center">
             <h3 className="text-5xl font-bold font-space tracking-tighter text-on-surface mb-2">
               {successMsg.split(',')[0]}
             </h3>
             <p className="text-lg font-medium text-on-surface-variant">
               {successMsg.split(',')[1] || (successMsg.startsWith('Sortie') ? 'Bonne soirée !' : 'Pointage enregistré.')}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
