import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Search,
  Briefcase,
  Moon,
  Palmtree,
  CalendarOff,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { schedulesApi } from './api/schedules.api';
import { Spinner } from '@/components/ui/Spinner';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScheduleOverrideModal } from './components/ScheduleOverrideModal';
import { toast } from 'sonner';

const DAYS_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

/* ─── Barre shift style Teams ─────────────────────────────────── */
function ShiftCell({ shift, onClick }: { shift: any; onClick: () => void }) {
  // Repos — cellule quasi vide (style Teams: jours off = vide)
  if (shift.status === 'rest') {
    return (
      <div
        onClick={onClick}
        className="h-14 flex items-center justify-center rounded-lg cursor-pointer
                   hover:bg-gray-100 transition-colors group/rest"
      >
        <div className="flex items-center gap-1 text-gray-300 group-hover/rest:text-gray-400 transition-colors">
          <Moon size={12} />
          <span className="text-[10px] font-semibold uppercase tracking-wide">Repos</span>
        </div>
      </div>
    );
  }

  // Congé
  if (shift.status === 'leave') {
    return (
      <div
        onClick={onClick}
        className="h-14 flex items-center gap-2 px-3 rounded-lg cursor-pointer
                   bg-emerald-500 text-white shadow-sm shadow-emerald-500/25
                   hover:bg-emerald-600 hover:shadow-md transition-all"
      >
        <Palmtree size={14} className="flex-shrink-0 opacity-80" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold leading-tight">Congé</span>
          {shift.reason && (
            <span className="text-[10px] font-medium opacity-75 truncate leading-tight">{shift.reason}</span>
          )}
        </div>
      </div>
    );
  }

  // Absent (override off)
  if (shift.status === 'off') {
    return (
      <div
        onClick={onClick}
        className="h-14 flex items-center gap-2 px-3 rounded-lg cursor-pointer
                   bg-rose-500 text-white shadow-sm shadow-rose-500/25
                   hover:bg-rose-600 hover:shadow-md transition-all"
      >
        <CalendarOff size={14} className="flex-shrink-0 opacity-80" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold leading-tight">Absent</span>
          {shift.reason && (
            <span className="text-[10px] font-medium opacity-75 truncate leading-tight">{shift.reason}</span>
          )}
        </div>
      </div>
    );
  }

  // Jour de travail — déterminer le sous-type
  const startTime = shift.start_time || shift.start?.split('T')[1]?.substring(0, 5) || '';
  const endTime = shift.end_time || shift.end?.split('T')[1]?.substring(0, 5) || '';
  const isRealShift = shift.type === 'shift';
  const isOverride = shift.is_override;
  const isMission = !!shift.mission_title;
  const isPending = shift.status === 'pending';

  // Couleurs par type (barres pleines — style Teams Shifts)
  let bgClass = 'bg-primary shadow-primary/25';
  let hoverClass = 'hover:brightness-110';
  let Icon = Clock;
  let label = 'Planning';

  if (isPending) {
    bgClass = 'bg-amber-500 shadow-amber-500/25';
    Icon = AlertCircle;
    label = 'En attente';
  } else if (isMission) {
    bgClass = 'bg-indigo-500 shadow-indigo-500/25';
    Icon = Briefcase;
    label = shift.mission_title;
  } else if (isOverride && !isRealShift) {
    bgClass = 'bg-orange-500 shadow-orange-500/25';
    Icon = Pencil;
    label = 'Modifié';
  }

  return (
    <div
      onClick={onClick}
      className={`h-14 flex items-center gap-2 px-3 rounded-lg cursor-pointer
                  text-white shadow-sm ${bgClass} ${hoverClass}
                  hover:shadow-md transition-all`}
    >
      <Icon size={14} className="flex-shrink-0 opacity-80" />
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold leading-tight tracking-tight">
          {startTime} – {endTime}
        </span>
        <span className="text-[10px] font-medium opacity-75 truncate leading-tight">{label}</span>
      </div>
    </div>
  );
}

/* ─── Page principale ─────────────────────────────────────────── */
export function WeeklyPlanningPage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [searchQuery, setSearchQuery] = React.useState('');

  const [selectedCell, setSelectedCell] = React.useState<{
    employeeId: string;
    employeeName: string;
    date: string;
    dayData: any;
  } | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: planning, isLoading } = useQuery({
    queryKey: ['timeline', format(weekStart, 'yyyy-MM-dd')],
    queryFn: () => schedulesApi.getTimeline({
      start: format(weekStart, 'yyyy-MM-dd'),
      end: format(weekEnd, 'yyyy-MM-dd'),
    }),
  });

  const overrideMutation = useMutation({
    mutationFn: schedulesApi.saveOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      toast.success('Planning mis à jour');
      setSelectedCell(null);
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const filteredPlanning = planning?.filter((p: any) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* ── Header bar ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Planning</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Semaine du {format(weekStart, 'd MMM', { locale: fr })} au {format(weekEnd, 'd MMM yyyy', { locale: fr })}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Navigation semaine */}
          <div className="flex items-center bg-surface-container-lowest rounded-lg border border-outline-variant">
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-2 hover:bg-surface-container rounded-l-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-on-surface-variant" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-2 hover:bg-surface-container rounded-r-lg transition-colors"
            >
              <ChevronRight size={18} className="text-on-surface-variant" />
            </button>
          </div>

          {/* Recherche */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={15} />
            <input
              type="text"
              placeholder="Rechercher un collaborateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest rounded-lg text-sm
                         border border-outline-variant focus:ring-2 focus:ring-primary/20
                         focus:border-primary/40 transition-all outline-none placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>
      </div>

      {/* ── Grille planning (style Teams Shifts) ── */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header jours */}
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-surface-container-lowest px-5 py-3 text-left
                               border-b border-r border-outline-variant min-w-[220px]">
                  <span className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-wider">
                    Collaborateur
                  </span>
                </th>
                {weekDays.map((day, i) => {
                  const today = isToday(day);
                  return (
                    <th
                      key={day.toString()}
                      className={`px-2 py-3 border-b border-outline-variant min-w-[130px] text-center
                                  ${today ? 'bg-primary/5' : ''}`}
                    >
                      <span className="text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-wider block">
                        {DAYS_SHORT[i]}
                      </span>
                      <span className={`text-lg font-bold block leading-tight
                        ${today ? 'text-primary' : 'text-on-surface'}`}>
                        {format(day, 'd')}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Corps */}
            <tbody>
              {filteredPlanning?.map((emp: any, rowIdx: number) => (
                <tr
                  key={emp.employee_id}
                  className={`group transition-colors hover:bg-primary/[0.02]
                              ${rowIdx % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}
                >
                  {/* Colonne employé */}
                  <td className="sticky left-0 z-10 px-5 py-3 border-r border-outline-variant
                                 bg-inherit group-hover:bg-primary/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center
                                      text-xs font-bold text-primary border border-primary/20 flex-shrink-0">
                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate leading-tight">
                          {emp.first_name} {emp.last_name}
                        </p>
                        {emp.schedule_name && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold
                                           bg-primary/8 text-primary/70 leading-none">
                            {emp.schedule_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cellules jours */}
                  {weekDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const today = isToday(day);
                    const dayShifts = emp.shifts?.filter((s: any) => s.date === dayStr) || [];

                    return (
                      <td
                        key={dayStr}
                        className={`p-1.5 border-r border-outline-variant/30 align-top
                                    ${today ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex flex-col gap-1">
                          {dayShifts.length > 0 ? dayShifts.map((shift: any, idx: number) => (
                            <ShiftCell
                              key={shift.id || `${dayStr}-${idx}`}
                              shift={shift}
                              onClick={() => setSelectedCell({
                                employeeId: emp.employee_id,
                                employeeName: `${emp.first_name} ${emp.last_name}`,
                                date: dayStr,
                                dayData: shift,
                              })}
                            />
                          )) : (
                            <div
                              onClick={() => setSelectedCell({
                                employeeId: emp.employee_id,
                                employeeName: `${emp.first_name} ${emp.last_name}`,
                                date: dayStr,
                                dayData: { status: 'rest' },
                              })}
                              className="h-14 rounded-lg border border-dashed border-outline-variant/30
                                         flex items-center justify-center cursor-pointer
                                         hover:border-primary/30 hover:bg-primary/5 transition-all
                                         opacity-0 group-hover:opacity-100"
                            />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {(!filteredPlanning || filteredPlanning.length === 0) && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <CalendarIcon size={40} className="mx-auto text-on-surface-variant/20 mb-3" />
                    <p className="text-sm text-on-surface-variant/50 font-medium">Aucun collaborateur trouvé</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Légende ── */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        {[
          { color: 'bg-primary', label: 'Travail' },
          { color: 'bg-orange-500', label: 'Modifié' },
          { color: 'bg-emerald-500', label: 'Congé' },
          { color: 'bg-rose-500', label: 'Absent' },
          { color: 'bg-indigo-500', label: 'Mission' },
          { color: 'bg-amber-500', label: 'En attente' },
          { color: 'bg-gray-300', label: 'Repos' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="text-[11px] font-medium text-on-surface-variant/60">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Override Modal ── */}
      {selectedCell && (
        <ScheduleOverrideModal
          isOpen={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          employeeName={selectedCell.employeeName}
          date={new Date(selectedCell.date)}
          isLoading={overrideMutation.isPending}
          initialData={{
            is_off: selectedCell.dayData.status === 'off' || selectedCell.dayData.status === 'rest',
            start_time: selectedCell.dayData.start_time?.substring(0, 5)
              || selectedCell.dayData.start?.split('T')[1]?.substring(0, 5)
              || '08:00',
            end_time: selectedCell.dayData.end_time?.substring(0, 5)
              || selectedCell.dayData.end?.split('T')[1]?.substring(0, 5)
              || '17:00',
            reason: selectedCell.dayData.reason || '',
          }}
          onSubmit={(data) => overrideMutation.mutate({
            employee_id: selectedCell.employeeId,
            date: selectedCell.date,
            ...data,
          })}
        />
      )}
    </div>
  );
}
