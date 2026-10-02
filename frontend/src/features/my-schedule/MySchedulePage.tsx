import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Palmtree,
  ShieldCheck,
} from 'lucide-react';
import { useMyShifts } from './hooks/useMySchedule';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

const DAYS_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

export default function MySchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  const { data: planningData, isLoading } = useMyShifts(weekStartStr);

  const shifts = planningData?.shifts || [];
  const leaves = planningData?.leaves || [];
  const missions = planningData?.missions || [];
  const standardSchedule = planningData?.standardSchedule;

  // Calcul du total des heures de la semaine
  const totalNetHours = shifts.reduce((acc: number, s: any) => {
    const [sH, sM] = s.startTime.split(':').map(Number);
    const [eH, eM] = s.endTime.split(':').map(Number);
    let gross = (eH * 60 + eM) - (sH * 60 + sM);
    if (gross <= 0) gross += 24 * 60;
    const net = Math.max(0, gross - (s.breakMinutes || 0));
    return acc + net / 60;
  }, 0);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-surface-container rounded-lg animate-pulse" />
        <div className="h-32 bg-surface-container rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-36 bg-surface-container rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 w-full"
    >
      {/* ── En-tête & Sélecteur de Semaine ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest p-5 rounded-3xl border border-on-surface/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-black font-display text-on-surface uppercase tracking-tight">
            Mon Planning de Travail
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Semaine du <strong>{format(weekStart, 'd MMMM', { locale: fr })}</strong> au <strong>{format(weekEnd, 'd MMMM yyyy', { locale: fr })}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container-low rounded-xl border border-on-surface/15 p-0.5">
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-1.5 hover:text-primary transition-colors text-on-surface-variant cursor-pointer"
              title="Semaine précédente"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-1.5 hover:text-primary transition-colors text-on-surface-variant cursor-pointer"
              title="Semaine suivante"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Résumé Semaine KPI ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-on-surface/10 flex items-center gap-3.5">
          <div className="text-primary shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Heures Planifiées</span>
            <p className="text-xl font-bold text-on-surface font-mono">{totalNetHours.toFixed(1)} h</p>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-on-surface/10 flex items-center gap-3.5">
          <div className="text-emerald-600 shrink-0">
            <CalendarDays size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Créneaux Effectifs</span>
            <p className="text-xl font-bold text-on-surface">{shifts.length} shift{shifts.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-on-surface/10 flex items-center gap-3.5">
          <div className="text-indigo-600 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Régime Référent</span>
            <p className="text-sm font-semibold text-on-surface truncate">{standardSchedule?.name || 'Horaire standard'}</p>
          </div>
        </div>
      </div>

      {/* ── Calendrier de la Semaine ── */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day, i) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const today = isToday(day);

          // Filtre les shifts du jour
          const dayShifts = shifts.filter((s: any) => s.date.split('T')[0] === dayStr);

          // Congé sur ce jour ?
          const dayDate = new Date(dayStr + 'T12:00:00Z');
          const dayLeave = leaves.find((l: any) => new Date(l.startDate) <= dayDate && new Date(l.endDate) >= dayDate);

          // Mission sur ce jour ?
          const dayMission = missions.find((m: any) => new Date(m.startDate) <= dayDate && (!m.endDate || new Date(m.endDate) >= dayDate));

          return (
            <div
              key={dayStr}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between min-h-[170px] transition-all ${
                today
                  ? 'bg-primary/[0.03] border-primary/40 ring-2 ring-primary/10 shadow-sm'
                  : 'bg-surface-container-lowest border-on-surface/10'
              }`}
            >
              {/* En-tête Jour */}
              <div className="border-b border-on-surface/10 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 block">
                  {DAYS_SHORT[i]}
                </span>
                <span className={`text-lg font-black leading-tight block ${today ? 'text-primary' : 'text-on-surface'}`}>
                  {format(day, 'd MMM', { locale: fr })}
                </span>
              </div>

              {/* Contenu du jour */}
              <div className="flex-1 py-2 space-y-1.5 flex flex-col justify-center">
                {dayShifts.length > 0 ? (
                  dayShifts.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl border text-xs bg-surface-container-low"
                      style={{ borderLeftWidth: '3.5px', borderLeftColor: s.color || '#3B82F6' }}
                    >
                      <div className="font-mono font-bold text-on-surface">
                        {s.startTime} - {s.endTime}
                      </div>
                      {s.jobTitle && (
                        <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5 truncate">
                          {s.jobTitle}
                        </p>
                      )}
                      {s.breakMinutes > 0 && (
                        <span className="flex items-center gap-1 text-[9px] text-on-surface-variant/70 mt-1">
                          <Coffee size={9} />
                          Pause : {s.breakMinutes}m
                        </span>
                      )}
                    </div>
                  ))
                ) : dayLeave ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5">
                    <Palmtree size={14} className="shrink-0" />
                    <span className="truncate">{dayLeave.leaveType?.name || 'Congé'}</span>
                  </div>
                ) : dayMission ? (
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-800 dark:text-indigo-200 text-xs font-bold flex items-center gap-1.5">
                    <Briefcase size={14} className="shrink-0" />
                    <span className="truncate">{dayMission.title}</span>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-[11px] font-semibold text-on-surface-variant/40 uppercase tracking-widest">
                      Repos
                    </span>
                  </div>
                )}
              </div>

              {/* Indicateur aujourd'hui */}
              {today && (
                <div className="pt-1.5 border-t border-primary/20 text-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                    Aujourd'hui
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
