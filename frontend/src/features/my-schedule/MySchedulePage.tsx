import { motion } from 'framer-motion';
import { CalendarDays, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useMySchedule } from './hooks/useMySchedule';
import { cn } from '@/lib/utils';

const DAY_NAMES: Record<number, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
  7: 'Dimanche',
};

export default function MySchedulePage() {
  const { data: schedule, isLoading } = useMySchedule();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-surface-container rounded-lg animate-pulse" />
        <div className="h-40 bg-surface-container rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-28 bg-surface-container rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8"
      >
        <div className="text-center py-20">
          <CalendarDays size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
          <p className="text-on-surface-variant">Aucun planning assigné</p>
        </div>
      </motion.div>
    );
  }

  const workDays: number[] = schedule.work_days || schedule.schedule?.work_days || [];
  const startTime = schedule.start_time || schedule.schedule?.start_time || '—';
  const endTime = schedule.end_time || schedule.schedule?.end_time || '—';
  const graceMinutes = schedule.grace_minutes ?? schedule.schedule?.grace_minutes ?? 0;
  const scheduleName = schedule.name || schedule.schedule?.name || 'Planning';
  const timezone = schedule.timezone || schedule.schedule?.timezone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-6"
    >
      <h1 className="text-2xl font-display font-bold text-on-surface">Mon Planning</h1>

      {/* Schedule Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>{scheduleName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Horaires</p>
                <p className="text-sm font-bold text-on-surface">{startTime} → {endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Tolérance retard</p>
                <p className="text-sm font-bold text-on-surface">{graceMinutes} min</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <CalendarDays size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Jours travaillés</p>
                <p className="text-sm font-bold text-on-surface">{workDays.length} jour{workDays.length !== 1 ? 's' : ''} / semaine</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map(day => {
          const isWorkDay = workDays.includes(day);
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: day * 0.05 }}
              className={cn(
                'rounded-2xl border p-4 text-center transition-all',
                isWorkDay
                  ? 'bg-green-50 border-green-200'
                  : 'bg-surface-container-low border-surface-container opacity-50'
              )}
            >
              <p className={cn(
                'text-sm font-bold mb-1',
                isWorkDay ? 'text-green-800' : 'text-on-surface-variant'
              )}>
                {DAY_NAMES[day]}
              </p>
              {isWorkDay ? (
                <p className="text-xs text-green-600">{startTime} — {endTime}</p>
              ) : (
                <p className="text-xs text-on-surface-variant/60">Repos</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Timezone */}
      {timezone && (
        <p className="text-xs text-on-surface-variant/50 text-right">Fuseau horaire : {timezone}</p>
      )}
    </motion.div>
  );
}
