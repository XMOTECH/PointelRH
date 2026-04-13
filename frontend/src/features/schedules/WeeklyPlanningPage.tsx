import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Briefcase,
  Moon,
  Palmtree,
  CalendarOff
} from 'lucide-react';
import { schedulesApi } from './api/schedules.api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScheduleOverrideModal } from './components/ScheduleOverrideModal';
import { toast } from 'sonner';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function ShiftCell({ shift, onClick }: { shift: any; onClick: () => void }) {
  // Jour de repos (template)
  if (shift.status === 'rest') {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer rounded-xl p-3 space-y-1 bg-gray-50 border border-gray-200/50 text-gray-400 transition-all hover:shadow-md"
      >
        <div className="flex items-center gap-1.5">
          <Moon size={12} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Repos</span>
        </div>
      </div>
    );
  }

  // Conge approuve
  if (shift.status === 'leave') {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer rounded-xl p-3 space-y-1 bg-emerald-50/80 border border-emerald-200 text-emerald-700 transition-all hover:shadow-md relative overflow-hidden"
      >
        <div className="flex items-center gap-1.5">
          <Palmtree size={12} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Congé</span>
        </div>
        {shift.reason && (
          <span className="text-[9px] font-medium opacity-70 block truncate">{shift.reason}</span>
        )}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
      </div>
    );
  }

  // Override jour off
  if (shift.status === 'off') {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer rounded-xl p-3 space-y-1 bg-rose-50/80 border border-rose-200 text-rose-600 transition-all hover:shadow-md relative overflow-hidden"
      >
        <div className="flex items-center gap-1.5">
          <CalendarOff size={12} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Absent</span>
        </div>
        {shift.reason && (
          <span className="text-[9px] font-medium opacity-70 block truncate">{shift.reason}</span>
        )}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
      </div>
    );
  }

  // Jour de travail (template, override ou shift reel)
  const startTime = shift.start_time || shift.start?.split('T')[1]?.substring(0, 5) || '';
  const endTime = shift.end_time || shift.end?.split('T')[1]?.substring(0, 5) || '';
  const isRealShift = shift.type === 'shift';
  const isOverride = shift.is_override;
  const isMission = !!shift.mission_title;
  const isPending = shift.status === 'pending';

  let classes = 'bg-primary/5 border border-primary/20 text-primary-900';
  if (isPending) classes = 'bg-amber-50/80 border border-amber-200 text-amber-900';
  else if (isMission) classes = 'bg-indigo-50/80 border border-indigo-200 text-indigo-900';
  else if (isOverride) classes = 'bg-orange-50/80 border border-orange-200 text-orange-900';

  let barColor = 'bg-primary';
  if (isPending) barColor = 'bg-amber-500';
  else if (isMission) barColor = 'bg-indigo-500';
  else if (isOverride) barColor = 'bg-orange-500';

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-3 space-y-2 group/card relative overflow-hidden transition-all hover:shadow-lg glass ${classes}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock size={10} className="opacity-60 flex-shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-tighter truncate">
              {startTime} - {endTime}
            </span>
          </div>
          {isPending ? (
            <AlertCircle size={14} className="text-amber-500 animate-pulse flex-shrink-0" />
          ) : (
            <CheckCircle size={14} className="text-primary opacity-40 flex-shrink-0" />
          )}
        </div>
        {isMission && (
          <div className="flex items-center gap-1 mt-1 text-primary">
            <Briefcase size={10} className="flex-shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest truncate">
              {shift.mission_title}
            </span>
          </div>
        )}
        {isOverride && !isRealShift && (
          <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Modifié</span>
        )}
        {!isRealShift && !isOverride && (
          <span className="text-[9px] font-medium text-on-surface-variant/40 uppercase tracking-widest">Planning</span>
        )}
      </div>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`} />
    </div>
  );
}

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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-surface-container-low/50 p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase italic">
            Planning Hebdomadaire
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <CalendarIcon size={16} className="text-primary" />
            <span className="text-sm font-bold text-on-surface-variant">
              Semaine du {format(weekStart, 'dd MMMM', { locale: fr })} au {format(weekEnd, 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center bg-surface-container rounded-xl p-1 border border-outline-variant">
            <Button variant="tertiary" size="sm" onClick={() => setCurrentDate(addDays(currentDate, -7))} className="!p-2"><ChevronLeft size={18} /></Button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-1.5 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors"
            >
              Aujourd'hui
            </button>
            <Button variant="tertiary" size="sm" onClick={() => setCurrentDate(addDays(currentDate, 7))} className="!p-2"><ChevronRight size={18} /></Button>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Planning Grid */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="sticky left-0 z-20 bg-surface-container-low/80 backdrop-blur-md px-6 py-4 text-left border-b border-r border-outline-variant/50 min-w-[240px]">
                  <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest text">Collaborateurs</span>
                </th>
                {weekDays.map((day, i) => (
                  <th key={day.toString()} className="px-4 py-4 border-b border-outline-variant/30 min-w-[140px]">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{DAYS[i]}</span>
                      <span className={`text-lg font-black mt-1 ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'text-primary' : 'text-on-surface'}`}>
                        {format(day, 'dd')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredPlanning?.map((emp: any) => (
                <tr key={emp.employee_id} className="group hover:bg-primary/5 transition-colors">
                  <td className="sticky left-0 z-10 bg-surface-container-lowest group-hover:bg-primary/[0.02] px-6 py-4 border-r border-outline-variant/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 shadow-sm text-sm overflow-hidden">
                          {emp.first_name?.[0] || '?'}{emp.last_name?.[0] || '?'}
                        </div>
                        {emp.occupancy_rate > 90 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-on-surface leading-tight text-sm">{(emp.first_name || 'Inconnu') + ' ' + (emp.last_name || '')}</p>
                        {emp.schedule_name && (
                          <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">{emp.schedule_name}</span>
                        )}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest">Charge</span>
                            <span className={`text-[9px] font-black ${emp.occupancy_rate > 90 ? 'text-red-500' : 'text-primary'}`}>{Math.round(emp.occupancy_rate)}%</span>
                          </div>
                          <div className="w-24 h-1 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${emp.occupancy_rate > 90 ? 'bg-red-500' : 'bg-primary'}`}
                              style={{ width: `${Math.min(100, emp.occupancy_rate)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayShifts = emp.shifts?.filter((s: any) => s.date === dayStr) || [];

                    return (
                      <td key={dayStr} className="p-2 border-r border-outline-variant/10 align-top">
                        <div className="flex flex-col gap-2">
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
                              className="h-12 border-2 border-dashed border-outline-variant/20 rounded-xl flex items-center justify-center group/empty hover:border-primary/30 transition-all cursor-pointer bg-surface-container-lowest/50 opacity-40 hover:opacity-100"
                            >
                              <Plus size={16} className="text-on-surface-variant opacity-0 group-hover/empty:opacity-40 transition-all" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Legend */}
      <div className="flex flex-wrap items-center gap-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40" />
          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Travail (Planning)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400" />
          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Override</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Congé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Repos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-400" />
          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Mission</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">En attente</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={12} className="text-primary" />
          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Taux d'occupation</span>
        </div>
      </div>

      {/* Override Modal */}
      {selectedCell && (
        <ScheduleOverrideModal
          isOpen={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          employeeName={selectedCell.employeeName}
          date={new Date(selectedCell.date)}
          isLoading={overrideMutation.isPending}
          initialData={{
            is_off: selectedCell.dayData.status === 'off' || selectedCell.dayData.status === 'rest',
            start_time: selectedCell.dayData.start_time?.substring(0, 5) || selectedCell.dayData.start?.split('T')[1]?.substring(0, 5) || '08:00',
            end_time: selectedCell.dayData.end_time?.substring(0, 5) || selectedCell.dayData.end?.split('T')[1]?.substring(0, 5) || '17:00',
            reason: selectedCell.dayData.reason || '',
          }}
          onSubmit={(data) => overrideMutation.mutate({
            employee_id: selectedCell.employeeId,
            date: selectedCell.date,
            ...data
          })}
        />
      )}
    </div>
  );
}
