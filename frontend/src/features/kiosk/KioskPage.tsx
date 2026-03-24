import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Numpad } from '../../components/ui/Numpad';
import { useRealTimeClock } from '../clockin/hooks/hooks';
import { useClockIn } from '../clockin/hooks/useClockIn';
import { cn } from '../../lib/utils';

export default function KioskPage() {
  const [pin, setPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const currentTime = useRealTimeClock();
  const { mutate: clockIn, isPending, isError, isSuccess, data } = useClockIn();

  // Identifiant de l'entreprise (à rendre dynamique plus tard via config ou URL)
  const COMPANY_ID = '3a655ab3-1c07-404c-8201-a9226aeda728';

  useEffect(() => {
    if (pin.length === 4) {
      clockIn({ 
        channel: 'pin', 
        company_id: COMPANY_ID,
        payload: { pin_code: pin } 
      } as any);
    }
  }, [pin, clockIn]);

  useEffect(() => {
    if (isSuccess) {
      const firstName = (data as any)?.employee?.first_name || 'Employé';
      const timeStr = format(new Date(), 'HH:mm');
      setSuccessMsg(`Bonjour ${firstName}, pointage enregistré à ${timeStr}`);
      
      const timer = setTimeout(() => {
        setPin('');
        setSuccessMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
    
    if (isError) {
      setPin('');
    }
  }, [isSuccess, isError, data]);

  const handleKeyPress = (key: string) => {
    if (pin.length < 4 && !isPending && !isSuccess) {
      setPin((prev) => prev + key);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-surface font-inter text-on-surface overflow-hidden">
      {/* Header - No Line Rule */}
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
          
          {/* Editorial Clock Section - Architectural Authority */}
          <div className="flex flex-col space-y-4 flex-1">
            <h2 className="text-xs font-bold tracking-[0.4em] text-primary uppercase">
              The Digital Atelier
            </h2>
            <div className="text-[12rem] font-medium leading-[0.8] tracking-tighter text-on-surface font-space">
              {format(currentTime, 'HH:mm')}
            </div>
            <div className="text-3xl font-light text-on-surface-variant tracking-tight pl-2">
              {format(currentTime, "EEEE d MMMM yyyy", { locale: fr })}
            </div>
            
            <div className="mt-12 flex items-center space-x-4 opacity-40">
               <div className="h-[1px] w-12 bg-on-surface-variant" />
               <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant italic">Synchronisé en temps réel</span>
            </div>
          </div>

          {/* Interaction Module - Tonal Layering */}
          <div className="flex flex-col items-center rounded-[3rem] bg-surface-container-low p-16 shadow-ambient w-[420px] transition-all duration-500">
            <p className="mb-10 text-[10px] font-bold tracking-[0.3em] text-on-surface-variant uppercase">
              Saisissez votre PIN
            </p>
            
            {/* PIN Indicators - Lithographic Depth */}
            <div className="mb-14 flex space-x-5">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = index < pin.length;
                return (
                  <div
                    key={index}
                    className={cn(
                      "h-3 w-3 rounded-full transition-all duration-300 ease-out",
                      isFilled 
                        ? "bg-primary scale-125 shadow-[0_0_15px_rgba(0,82,204,0.4)]" 
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
                {isError && (
                  <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase animate-bounce">
                    PIN incorrect. réessayez.
                  </p>
                )}
                {isPending && (
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-8 bg-primary/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-[loading_1s_infinite]" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Validation</span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>

      {/* Success Overlay - Glassmorphism */}
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
           <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary shadow-[0_20px_60px_rgba(0,82,204,0.3)] animate-pulse">
             <CheckCircle2 className="h-16 w-16 text-white" />
           </div>
           <div className="text-center">
             <h3 className="text-5xl font-bold font-space tracking-tighter text-on-surface mb-2 tracking-tight">
               {successMsg.split(',')[0]}
             </h3>
             <p className="text-lg font-medium text-on-surface-variant">
               {successMsg.split(',')[1] || "Pointage enregistré."}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
