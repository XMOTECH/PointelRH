import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, LogOut, ScanFace, KeyRound, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Numpad } from '../../components/ui/Numpad';
import { useRealTimeClock } from '../clockin/hooks/hooks';
import { usePunch } from '../clockin/hooks/usePunch';
import { useFaceDetection } from '../clockin/hooks/useFaceDetection';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { LuminaLogo } from '../../components/ui/LuminaLogo';

type KioskAction = 'checkin' | 'checkout';
type KioskMode = 'pin' | 'face';

export default function KioskPage() {
  const [pin, setPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [action, setAction] = useState<KioskAction>('checkin');
  const [mode, setMode] = useState<KioskMode>('pin');

  const currentTime = useRealTimeClock();
  const {
    mutate: punch,
    isPending,
    error: punchError,
    isSuccess,
    data: punchData,
    reset: resetPunch,
  } = usePunch();

  const { user } = useAuth();
  const companyId = (user as any)?.companyId || user?.company_id || new URLSearchParams(window.location.search).get('company_id') || new URLSearchParams(window.location.search).get('companyId') || undefined;

  // ── PIN Logic ──────────────────────────────────────────
  const handlePinSubmit = useCallback((pinCode: string) => {
    punch({
      channel: 'pin',
      company_id: companyId,
      companyId: companyId,
      payload: { pin: pinCode, pin_code: pinCode, pinCode: pinCode },
    }, {
      onSuccess: (res) => {
        setAction(res.action === 'CLOCK_IN' ? 'checkin' : 'checkout');
        setSuccessMsg(res.message);
        setTimeout(() => {
          setPin('');
          setSuccessMsg('');
          setAction('checkin');
          resetPunch();
        }, 4000);
      },
      onError: () => {
        setTimeout(() => {
          setPin('');
          resetPunch();
        }, 3000);
      },
    });
  }, [companyId, punch, resetPunch]);

  // Auto-submit when 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin, handlePinSubmit]);

  // ── Face Logic ──────────────────────────────────────────
  const handleFaceClockIn = useCallback((descriptor: number[]) => {
    punch({
      channel: 'face',
      company_id: companyId,
      companyId: companyId,
      payload: { descriptor },
    }, {
      onSuccess: (res) => {
        setAction(res.action === 'CLOCK_IN' ? 'checkin' : 'checkout');
        setSuccessMsg(res.message);
        setTimeout(() => {
          setPin('');
          setSuccessMsg('');
          setAction('checkin');
          resetPunch();
        }, 4000);
      },
      onError: () => {
        setTimeout(() => {
          resetPunch();
        }, 3000);
      },
    });
  }, [companyId, punch, resetPunch]);

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

  const isCheckout = action === 'checkout' || (punchData?.action === 'CLOCK_OUT');
  const isLeaving = isCheckout || (successMsg.toLowerCase().includes('départ') || successMsg.toLowerCase().includes('au revoir'));

  return (
    <div className="relative min-h-screen lg:h-screen w-full flex flex-col bg-surface font-inter text-on-surface overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <header className="flex w-full items-center justify-between px-6 py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 bg-surface shrink-0">
        <div className="flex items-center">
          <LuminaLogo variant="horizontal" size="lg" showTagline={true} />
        </div>
        
        {/* Mode Switcher Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-full border border-on-surface/10">
          <button
            onClick={() => { setMode('pin'); resetPunch(); }}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300",
              mode === 'pin'
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <KeyRound size={14} />
            <span>Code PIN</span>
          </button>
          <button
            onClick={() => { setMode('face'); resetPunch(); }}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300",
              mode === 'face'
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <ScanFace size={14} />
            <span>Visage</span>
          </button>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center space-x-3 bg-surface-container-low px-4 py-2 rounded-full border border-on-surface/10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase font-space">
            Kiosque Connecté
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-4 md:py-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-16 w-full">
          {/* Time Display */}
          <div className="flex flex-col items-center lg:items-start space-y-1 sm:space-y-2 select-none text-center lg:text-left">
            <h2 className={cn(
              "text-xs md:text-sm font-black tracking-widest uppercase mb-1 font-space transition-colors",
              isCheckout ? "text-orange-500" : "text-primary"
            )}>
              Pointage Intelligent
            </h2>
            <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[11rem] font-medium leading-[0.85] tracking-tighter text-on-surface font-space">
              {format(currentTime, 'HH:mm')}
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-light text-on-surface-variant tracking-tight pl-0 lg:pl-2 capitalize">
              {format(currentTime, "EEEE d MMMM yyyy", { locale: fr })}
            </div>
          </div>

          {/* Interaction Module */}
          {mode === 'pin' ? (
            <PinModule
              pin={pin}
              isCheckout={isCheckout}
              isPending={isPending}
              isSuccess={isSuccess}
              error={punchError}
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
              onCancel={() => {
                setAction('checkin');
                setPin('');
                resetPunch();
              }}
            />
          ) : (
            <FaceModule
              isCheckout={isCheckout}
              isPending={isPending}
              onFaceDetected={handleFaceClockIn}
              error={punchError}
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
             isLeaving
               ? "bg-orange-500 shadow-[0_20px_60px_rgba(234,88,12,0.3)]"
               : "bg-primary shadow-[0_20px_60px_rgba(0,82,204,0.3)]"
           )}>
             {isLeaving
               ? <LogOut className="h-16 w-16 text-white" />
               : <CheckCircle2 className="h-16 w-16 text-white" />
             }
           </div>
           <div className="text-center">
             <h3 className="text-4xl md:text-5xl font-bold font-space tracking-tighter text-on-surface mb-2">
               {successMsg}
             </h3>
             <p className="text-on-surface-variant font-medium text-lg">
               {isLeaving ? 'Bon repos et à bientôt !' : 'Bonne journée de travail !'}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}

// ── PIN Module ─────────────────────────────────────────────

interface PinModuleProps {
  pin: string;
  isCheckout: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | null;
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

function PinModule({
  pin,
  isCheckout,
  isPending,
  isSuccess,
  error,
  onKeyPress,
  onDelete,
  onCancel,
}: PinModuleProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-[280px] sm:max-w-xs md:max-w-sm shrink-0">
      <div className="text-center mb-6">
        <h3 className="text-base sm:text-lg font-bold text-on-surface">
          Entrez votre code PIN
        </h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Code à 4 chiffres pour enregistrer votre pointage
        </p>
      </div>

      {/* PIN Indicators */}
      <div className="mb-5 md:mb-8 flex space-x-4 sm:space-x-5">
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

      <div className="h-8 mt-6 flex items-center justify-center w-full">
        {error && (
          <p className="text-[11px] font-bold tracking-widest text-red-500 uppercase animate-bounce">
            {(error as any)?.response?.data?.message || 'PIN incorrect. Réessayez.'}
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
              Validation...
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

// ── Face Module (Studio Viewfinder) ────────────────────────

interface FaceModuleProps {
  isCheckout: boolean;
  isPending: boolean;
  onFaceDetected: (descriptor: number[]) => void;
  error: Error | null;
}

function FaceModule({ isCheckout, isPending, onFaceDetected, error }: FaceModuleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
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

  // Boucle de détection temps réel fluide
  useEffect(() => {
    if (!cameraReady || !modelsLoaded || !videoRef.current) return;

    let running = true;

    const detect = async () => {
      if (!running || !videoRef.current) return;
      if (videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const result = await detectFace(videoRef.current);

      if (!running) return;

      if (result) {
        setFaceDetected(true);

        // Déclenchement automatique
        if (!isPending && !cooldownRef.current) {
          cooldownRef.current = true;
          onFaceDetected(result.descriptor);
          setTimeout(() => { cooldownRef.current = false; }, 4000);
        }
      } else {
        setFaceDetected(false);
      }

      setTimeout(() => {
        if (running) animFrameRef.current = requestAnimationFrame(detect);
      }, 70);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => { running = false; };
  }, [cameraReady, modelsLoaded, detectFace, isPending, onFaceDetected]);

  const hasError = !!error;
  const isTargetLocked = faceDetected || isPending;

  return (
    <div className="flex flex-col items-center w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[460px] shrink-0">
      <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-300 shadow-sm ${
        hasError
          ? 'border-rose-500 ring-4 ring-rose-500/20'
          : isTargetLocked
          ? 'border-emerald-400 ring-4 ring-emerald-400/20'
          : 'border-on-surface/15'
      }`}>
        
        {/* Live Camera Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Floating Minimal HUD Target Reticle */}
        <div className="absolute inset-6 pointer-events-none flex items-center justify-center">
          <div
            className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg transition-colors duration-300 ${
              isTargetLocked ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
            }`}
          />
          <div
            className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg transition-colors duration-300 ${
              isTargetLocked ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
            }`}
          />
          <div
            className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg transition-colors duration-300 ${
              isTargetLocked ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
            }`}
          />
          <div
            className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-lg transition-colors duration-300 ${
              isTargetLocked ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
            }`}
          />

          {!isTargetLocked && !hasError && cameraReady && (
            <motion.div
              animate={{ y: ['-90%', '90%'] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] opacity-75"
            />
          )}
        </div>

        {/* Status Pill in Viewfinder */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none px-4">
          <div className={`backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-md transition-all ${
            hasError
              ? 'bg-rose-950/80 border border-rose-500/30 text-rose-300'
              : isPending
              ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
              : faceDetected
              ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
              : 'bg-slate-950/70 border border-white/10 text-white'
          }`}>
            {(!cameraReady || modelsLoading) && (
              <>
                <Loader2 size={13} className="animate-spin text-white/70" />
                <span>{modelsLoading ? 'Initialisation de l\'IA...' : 'Activation caméra...'}</span>
              </>
            )}
            {cameraReady && !modelsLoading && !faceDetected && !isPending && !hasError && (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{isCheckout ? 'Regardez la caméra pour enregistrer votre départ' : 'Positionnez votre visage devant la caméra'}</span>
              </>
            )}
            {faceDetected && !isPending && !hasError && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-300">Visage détecté • Identification...</span>
              </>
            )}
            {isPending && !hasError && (
              <>
                <Loader2 size={13} className="animate-spin text-emerald-400" />
                <span className="text-emerald-300">Pointage en cours...</span>
              </>
            )}
            {hasError && (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-rose-300">{(error as any)?.response?.data?.message || 'Visage non reconnu'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant font-medium text-center mt-3">
        L'identification et le pointage d'arrivée ou de départ s'enregistrent automatiquement sans contact.
      </p>
    </div>
  );
}
