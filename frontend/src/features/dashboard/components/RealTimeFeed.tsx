import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Monitor, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';

interface RealTimeAttendance {
  id: string;
  employee_name: string;
  clock_in: string;
  status: 'present' | 'late' | 'absent';
}

interface RealTimeFeedProps {
  attendances: RealTimeAttendance[];
  loading: boolean;
}

export function RealTimeFeed({ attendances, loading }: RealTimeFeedProps) {
  const events = (attendances || []).slice(0, 10);

  const formatTimeSafe = (dateString?: string) => {
    if (!dateString) return '--:--:--';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '--:--:--';
    return format(d, 'HH:mm:ss');
  };

  return (
    <Card className="h-full bg-surface-container-lowest border-none p-8">
      <CardHeader className="flex flex-row justify-between items-center mb-10 px-0">
        <div>
          <CardTitle className="text-2xl font-display font-bold text-on-surface">Pointages Récents</CardTitle>
          <p className="text-xs font-medium text-on-surface-variant opacity-50 uppercase tracking-widest mt-1">Mises à jour des terminaux en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live</span>
        </div>
      </CardHeader>

      <div className="flex flex-col">
          <div className="grid grid-cols-4 px-4 py-3 mb-2 text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">
            <span>Employé</span>
            <span>Heure</span>
            <span>Méthode</span>
            <span>Statut</span>
          </div>
          
          <div className="flex flex-col gap-1">
            {loading ? (
              <div className="p-12 text-center text-on-surface-variant opacity-50">Synchronisation des flux...</div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant opacity-30 italic">Aucune activité détectée sur les terminaux</div>
            ) : (
              <AnimatePresence>
                {events.map((event, idx) => (
                  <motion.div
                    key={event.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "grid grid-cols-4 items-center px-4 py-4 rounded-xl transition-all duration-200 hover:scale-[1.01]",
                      idx % 2 === 0 ? "bg-surface" : "bg-surface-container-low"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-sm relative">
                        {event.employee_name?.charAt(0) || 'E'}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-surface leading-tight truncate max-w-[120px]">{event.employee_name}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-on-surface tracking-tighter font-mono">{formatTimeSafe(event.clock_in)}</span>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded bg-primary/5 flex items-center justify-center text-primary">
                          <Monitor size={12} />
                       </div>
                       <span className="text-[10px] font-bold text-primary uppercase tracking-widest">QR SCAN</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium text-on-surface-variant">
                      <span className={cn(
                        "font-bold uppercase tracking-tighter text-[9px]",
                        event.status === 'present' ? 'text-emerald-600' : 'text-amber-600'
                      )}>{event.status}</span>
                      <ChevronRight size={14} className="opacity-30" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
      </div>
    </Card>
  );
}
