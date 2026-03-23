import { useState, useEffect } from 'react';
import { Wifi, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    if (pin.length === 4) {
      clockIn({ channel: 'pin', payload: { pin_code: pin } } as any);
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
    <div className="flex h-screen w-full flex-col bg-[#F9FAFB] font-sans">
      <header className="flex w-full items-center justify-between px-10 py-6">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Operational Precision
        </h1>
        <div className="flex items-center space-x-2 text-sm font-semibold tracking-wide text-gray-600">
          <Wifi className="h-5 w-5 text-blue-600" />
          <span>CONNECTÉ</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-10">
        <div className="flex w-full max-w-5xl items-center justify-between">
          
          <div className="flex flex-col space-y-6">
            <h2 className="text-sm font-bold tracking-[0.2em] text-blue-600">
              POINTAGE SALARIÉ
            </h2>
            <div className="text-[10rem] font-bold leading-none tracking-tighter text-gray-900">
              {format(currentTime, 'HH:mm')}
            </div>
            <div className="text-4xl font-light text-gray-500">
              {format(currentTime, "EEEE d MMMM yyyy", { locale: fr })}
            </div>
          </div>

          <div className="flex flex-col items-center rounded-[2rem] bg-[#F3F4F6] p-12 shadow-sm">
            <p className="mb-8 text-xs font-bold tracking-[0.2em] text-gray-500">
              SAISISSEZ VOTRE PIN
            </p>
            
            <div className="mb-10 flex space-x-4">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = index < pin.length;
                return (
                  <div
                    key={index}
                    className={cn(
                      "h-4 w-4 rounded-full border-2 transition-all duration-200",
                      isFilled 
                        ? "border-blue-600 bg-blue-600" 
                        : "border-gray-300 bg-transparent"
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

            {isError && (
              <p className="mt-6 text-sm font-semibold text-red-500 animate-pulse">
                PIN incorrect. Veuillez réessayer.
              </p>
            )}
            {isPending && (
              <p className="mt-6 text-sm font-semibold text-blue-500 animate-pulse">
                Vérification...
              </p>
            )}
          </div>
        </div>
      </main>

      <div 
        className={cn(
          "absolute bottom-0 left-0 w-full transform transition-transform duration-500 ease-in-out",
          successMsg ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex bg-[#0052CC] px-8 py-6 text-white shadow-lg items-center">
          <div className="flex items-center space-x-6">
             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
               <CheckCircle2 className="h-6 w-6 text-white" />
             </div>
             <div>
               <h3 className="text-xl font-bold">{successMsg}</h3>
               <p className="text-sm font-medium text-blue-200">
                 Bonne journée de travail avec l'équipe Pointel.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
