import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, LogOut, ScanFace, KeyRound, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Numpad } from '../../components/ui/Numpad';
import { useRealTimeClock } from '../clockin/hooks/hooks';
import { useClockIn } from '../clockin/hooks/useClockIn';
import { useClockOut } from '../clockin/hooks/useClockOut';
import { useFaceDetection } from '../clockin/hooks/useFaceDetection';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

type KioskAction = 'checkin' | 'checkout';
type KioskMode = 'pin' | 'face';

export default function KioskPage() {
  const [pin, setPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [action, setAction] = useState<KioskAction>('checkin');
  const [mode, setMode] = useState<KioskMode>('pin');

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

  // ── PIN Logic ──────────────────────────────────────────
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

  // ── Face Logic ──────────────────────────────────────────
  const handleFaceClockIn = useCallback((descriptor: number[]) => {
    if (!companyId) return;

    clockIn({
      channel: 'face',
      company_id: companyId,
      payload: { descriptor },
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

  // ── Success/Error effects (shared) ─────────────────────
  useEffect(() => {
    if (clockInSuccess && clockInData) {
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
      if (err?.response?.status !== 409) {
        const errorTimer = setTimeout(() => {
          setPin('');
        }, 0);
        return () => clearTimeout(errorTimer);
      }
    }
  }, [clockInSuccess, clockInError, clockInData, resetClockIn]);

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

  // ── PIN Keyboard ───────────────────────────────────────
  const handleKeyPress = useCallback((key: string) => {
    if (pin.length < 4 && !isPending && !isSuccess) {
      setPin((prev) => prev + key);
    }
  }, [pin.length, isPending, isSuccess]);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    if (mode !== 'pin') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) handleKeyPress(e.key);
      else if (e.key === 'Backspace') handleDelete();
      else if (e.key === 'Escape') setPin('');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleKeyPress, handleDelete]);

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
        <div className="flex items-center gap-4">
          {/* Mode Toggle */}
          <div className="flex items-center rounded-full bg-surface-container-low p-1 gap-1">
            <button
              onClick={() => { setMode('pin'); setPin(''); }}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                mode === 'pin'
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <KeyRound size={12} />
              PIN
            </button>
            <button
              onClick={() => setMode('face')}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                mode === 'face'
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <ScanFace size={12} />
              Visage
            </button>
          </div>

          <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-surface-container-lowest shadow-ambient">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Kiosk Actif</span>
          </div>
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
          {mode === 'pin' ? (
            <PinModule
              pin={pin}
              isCheckout={isCheckout}
              isPending={isPending}
              isSuccess={isSuccess}
              clockInError={clockInError}
              clockOutError={clockOutError}
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
              onCancel={() => {
                setAction('checkin');
                setPin('');
                resetClockIn();
                resetClockOut();
              }}
            />
          ) : (
            <FaceModule
              isCheckout={isCheckout}
              isPending={isPending}
              onFaceDetected={handleFaceClockIn}
              clockInError={clockInError}
              clockOutError={clockOutError}
            />
          )}
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

// ── PIN Module ────────────────────────────────────────────

interface PinModuleProps {
  pin: string;
  isCheckout: boolean;
  isPending: boolean;
  isSuccess: boolean;
  clockInError: Error | null;
  clockOutError: Error | null;
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

function PinModule({ pin, isCheckout, isPending, isSuccess, clockInError, clockOutError, onKeyPress, onDelete, onCancel }: PinModuleProps) {
  return (
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
        onKeyPress={onKeyPress}
        onDelete={onDelete}
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

      {isCheckout && !isPending && (
        <button
          onClick={onCancel}
          className="mt-4 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase hover:text-on-surface transition-colors"
        >
          Annuler
        </button>
      )}
    </div>
  );
}

// ── Face Module ───────────────────────────────────────────

interface FaceModuleProps {
  isCheckout: boolean;
  isPending: boolean;
  onFaceDetected: (descriptor: number[]) => void;
  clockInError: Error | null;
  clockOutError: Error | null;
}

function FaceModule({ isCheckout, isPending, onFaceDetected, clockInError, clockOutError }: FaceModuleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const cooldownRef = useRef(false);

  const { modelsLoaded, isLoading: modelsLoading, detectFace } = useFaceDetection();
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Démarrer la webcam
  useEffect(() => {
    if (!modelsLoaded) return;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setCameraReady(false);
      }
    };

    start();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [modelsLoaded]);

  // Boucle de détection automatique (kiosk: auto clock-in quand un visage est détecté)
  useEffect(() => {
    if (!cameraReady || !modelsLoaded || !videoRef.current) return;

    let running = true;

    const detect = async () => {
      if (!running || !videoRef.current || !canvasRef.current) return;
      if (videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const result = await detectFace(videoRef.current);

      if (!running) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (result) {
          setFaceDetected(true);
          const { x, y, width, height } = result.detection.box;
          ctx.strokeStyle = '#00B5AD';
          ctx.lineWidth = 4;
          const cornerLen = 25;
          // Draw corners
          ctx.beginPath(); ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + width - cornerLen, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + cornerLen); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, y + height - cornerLen); ctx.lineTo(x, y + height); ctx.lineTo(x + cornerLen, y + height); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + width - cornerLen, y + height); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width, y + height - cornerLen); ctx.stroke();

          // Auto clock-in en kiosk (avec cooldown pour éviter les doublons)
          if (!isPending && !cooldownRef.current) {
            cooldownRef.current = true;
            onFaceDetected(result.descriptor);
            // Cooldown de 5 secondes
            setTimeout(() => { cooldownRef.current = false; }, 5000);
          }
        } else {
          setFaceDetected(false);
        }
      }

      setTimeout(() => {
        if (running) animFrameRef.current = requestAnimationFrame(detect);
      }, 300);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => { running = false; };
  }, [cameraReady, modelsLoaded, detectFace, isPending, onFaceDetected]);

  const errorMsg = clockInError && (clockInError as any)?.response?.status !== 409
    ? 'Visage non reconnu'
    : clockOutError
      ? 'Erreur lors de la sortie'
      : null;

  return (
    <div className={cn(
      "flex flex-col items-center rounded-[3rem] p-12 shadow-ambient w-[420px] transition-all duration-500",
      isCheckout ? "bg-orange-50" : "bg-surface-container-low"
    )}>
      <p className={cn(
        "mb-6 text-[10px] font-bold tracking-[0.3em] uppercase",
        isCheckout ? "text-orange-600" : "text-on-surface-variant"
      )}>
        {isCheckout ? 'Reconnaissance pour sortie' : 'Regardez la caméra'}
      </p>

      {/* Video */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#1a1a2e',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', pointerEvents: 'none' }}
        />

        {/* Overlay guide */}
        {!faceDetected && cameraReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '55%', aspectRatio: '3/4', border: '2px dashed rgba(255,255,255,0.4)', borderRadius: '50%' }} />
          </div>
        )}

        {/* Loading overlay */}
        {(modelsLoading || !cameraReady) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', gap: '12px' }}>
            <Loader2 size={36} className="animate-spin text-white" />
            <p className="text-white/70 text-xs">{modelsLoading ? 'Chargement IA...' : 'Caméra...'}</p>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="h-8 mt-6 flex items-center justify-center w-full">
        {isPending && (
          <div className="flex items-center space-x-2">
            <Loader2 size={14} className={cn("animate-spin", isCheckout ? "text-orange-500" : "text-primary")} />
            <span className={cn("text-[10px] font-bold tracking-widest uppercase", isCheckout ? "text-orange-600" : "text-primary")}>
              Reconnaissance...
            </span>
          </div>
        )}
        {errorMsg && (
          <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase animate-bounce">
            {errorMsg}
          </p>
        )}
        {!isPending && !errorMsg && cameraReady && (
          <p className={cn(
            "text-[10px] font-bold tracking-widest uppercase",
            faceDetected ? "text-green-600" : "text-on-surface-variant"
          )}>
            {faceDetected ? 'Visage détecté — identification...' : 'En attente d\'un visage...'}
          </p>
        )}
      </div>
    </div>
  );
}
