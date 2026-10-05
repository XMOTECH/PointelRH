import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Clock,
  Search,
  Pencil,
  Copy,
  Trash2,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  X,
} from 'lucide-react';
import { schedulesApi } from './api/schedules.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { ScheduleForm, type ScheduleFormData } from './components/ScheduleForm';
import { AssignScheduleModal } from './components/AssignScheduleModal';
import { SchedulesNavigationTabs } from './components/SchedulesNavigationTabs';
import type { Schedule } from '@/features/employees/types';
import { toast } from 'sonner';

const DAYS = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 },
  { label: 'Ven', value: 5 },
  { label: 'Sam', value: 6 },
  { label: 'Dim', value: 7 },
];

function calculateWeeklyMetrics(schedule: Schedule) {
  const start = schedule.start_time || '08:00';
  const end = schedule.end_time || '17:00';
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) {
    return { dailyHours: 0, weeklyHours: 0, netDailyHours: 0, netWeeklyHours: 0, breakMinutes: 0 };
  }
  let durationMinutes = (eH * 60 + eM) - (sH * 60 + sM);
  if (durationMinutes <= 0) {
    durationMinutes += 24 * 60;
  }
  const breakMinutes = durationMinutes >= 420 ? 60 : 0;
  const netDailyMinutes = Math.max(0, durationMinutes - breakMinutes);
  const dailyHours = Math.round((durationMinutes / 60) * 10) / 10;
  const netDailyHours = Math.round((netDailyMinutes / 60) * 10) / 10;
  const daysCount = schedule.work_days?.length || 5;
  const weeklyHours = Math.round(dailyHours * daysCount * 10) / 10;
  const netWeeklyHours = Math.round(netDailyHours * daysCount * 10) / 10;
  return { dailyHours, weeklyHours, netDailyHours, netWeeklyHours, breakMinutes };
}


export const ScheduleListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);
  const [assigningSchedule, setAssigningSchedule] = useState<Schedule | null>(null);

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ['schedules'],
    queryFn: schedulesApi.getSchedules,
  });

  const createMutation = useMutation({
    mutationFn: schedulesApi.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Horaire contractuel créé avec succès');
      setIsFormOpen(false);
      setEditingSchedule(null);
    },
    onError: () => {
      toast.error('Erreur lors de la création de l’horaire contractuel');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Schedule> }) =>
      schedulesApi.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Horaire contractuel mis à jour');
      setIsFormOpen(false);
      setEditingSchedule(null);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schedulesApi.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Horaire supprimé');
      setDeletingSchedule(null);
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleDuplicate = (schedule: Schedule) => {
    createMutation.mutate({
      name: `${schedule.name} (Copie)`,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      grace_minutes: schedule.grace_minutes ?? 15,
      work_days: schedule.work_days ?? [1, 2, 3, 4, 5],
    });
  };

  const handleFormSubmit = (data: ScheduleFormData) => {
    if (editingSchedule) {
      updateMutation.mutate({
        id: editingSchedule.id,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredSchedules = useMemo(() => {
    if (!searchQuery.trim()) return schedules;
    const q = searchQuery.toLowerCase();
    return schedules.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.start_time?.toLowerCase().includes(q) ||
        s.end_time?.toLowerCase().includes(q)
    );
  }, [schedules, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Sub-Navigation Tabs & Actions Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <SchedulesNavigationTabs schedulesCount={schedules.length} />

        <div className="flex items-center gap-2.5">
          {schedules.length > 4 && (
            <div className="relative w-52 hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs bg-surface-container-lowest"
              />
            </div>
          )}

          <Button
            size="sm"
            className="h-9 px-3.5 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            onClick={() => {
              setEditingSchedule(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={15} />
            <span>Nouvel horaire</span>
          </Button>
        </div>
      </div>


      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredSchedules.map((schedule) => {
          const { dailyHours, netDailyHours, netWeeklyHours, breakMinutes } = calculateWeeklyMetrics(schedule);
          const workDays = schedule.work_days || [1, 2, 3, 4, 5];
          const assignedCount = schedule.assigned_employees_count || 0;
          const assignedEmployees = schedule.assigned_employees || [];

          return (
            <Card
              key={schedule.id}
              className="group bg-surface-container-lowest border border-outline-variant/60 hover:border-outline-variant rounded-2xl p-4.5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between gap-4"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-center shrink-0 text-on-surface">
                      <Clock size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-on-surface tracking-tight truncate">
                        {schedule.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                        <span className="font-semibold text-on-surface">
                          {netWeeklyHours} h / semaine
                        </span>
                        <span className="text-[11px] text-on-surface-variant/60">
                          ({netDailyHours}h/j net)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingSchedule(schedule);
                        setIsFormOpen(true);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      title="Modifier cet horaire"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(schedule)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      title="Dupliquer cet horaire"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingSchedule(schedule)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-red-600 hover:bg-red-500/10 transition-colors"
                      title="Supprimer cet horaire"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Schedule Time & Tolerance Row */}
                <div className="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl bg-surface-container-low/40 border border-outline-variant/30">
                  <div className="flex items-center gap-1.5 font-bold text-on-surface">
                    <span>{schedule.start_time || '08:00'} — {schedule.end_time || '17:00'}</span>
                    {breakMinutes > 0 && (
                      <span className="text-[11px] font-normal text-on-surface-variant">
                        · pause {breakMinutes}m
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-on-surface-variant">
                    Tolérance +{schedule.grace_minutes || 0}m
                  </span>
                </div>

                {/* Days of Week Pills (Soft, harmonized, no aggressive black keys) */}
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((d) => {
                    const isActive = workDays.includes(d.value);
                    return (
                      <div
                        key={d.value}
                        className={`py-1 rounded-lg text-center text-[10px] transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                            : 'bg-surface-container-low/40 text-on-surface-variant/35 font-medium'
                        }`}
                      >
                        {d.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer: Real Assigned Employees & Assignment Action */}
              <div className="pt-2.5 border-t border-outline-variant/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {assignedCount > 0 ? (
                    <div className="flex items-center -space-x-1.5">
                      {assignedEmployees.slice(0, 4).map((emp) => (
                        <div
                          key={emp.id}
                          title={`${emp.first_name} ${emp.last_name}`}
                          className="rounded-full ring-2 ring-surface-container-lowest"
                        >
                          <Avatar
                            size="xs"
                            firstName={emp.first_name}
                            lastName={emp.last_name}
                          />
                        </div>
                      ))}
                      {assignedCount > 4 && (
                        <div className="h-6 w-6 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold flex items-center justify-center ring-2 ring-surface-container-lowest shrink-0">
                          +{assignedCount - 4}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <span className="text-xs text-on-surface-variant">
                    {assignedCount > 0 ? (
                      <>
                        <strong className="text-on-surface font-semibold">{assignedCount}</strong> rattaché{assignedCount > 1 ? 's' : ''}
                      </>
                    ) : (
                      <span className="text-on-surface-variant/50">0 collaborateur</span>
                    )}
                  </span>
                </div>

                <button
                  onClick={() => setAssigningSchedule(schedule)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  {assignedCount > 0 ? 'Gérer' : '+ Assigner'}
                </button>
              </div>
            </Card>
          );
        })}

        {/* Empty state */}
        {filteredSchedules.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/60 rounded-3xl bg-surface-container-lowest/50 text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">
                {searchQuery ? 'Aucun résultat correspondant' : 'Aucun horaire contractuel configuré'}
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1 font-medium">
                {searchQuery
                  ? `Aucun horaire ne correspond à la recherche "${searchQuery}". Essayez un autre mot-clé.`
                  : 'Créez votre premier horaire contractuel de référence (ex: Standard 40h) pour calibrer la badgeuse et les plannings.'}
              </p>
            </div>
            {!searchQuery && (
              <Button
                className="btn-primary mt-2"
                onClick={() => {
                  setEditingSchedule(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus size={16} />
                <span>Créer un horaire</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <ScheduleForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSchedule(null);
        }}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        initialData={editingSchedule}
      />

      {/* ── Assign Employees Modal ── */}
      <AssignScheduleModal
        isOpen={Boolean(assigningSchedule)}
        onClose={() => setAssigningSchedule(null)}
        schedule={assigningSchedule}
      />

      {/* ── Confirm Delete Modal ── */}
      {deletingSchedule && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-bold text-on-surface">
                Supprimer l’horaire contractuel ?
              </h3>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Êtes-vous sûr de vouloir supprimer{' '}
              <strong className="text-on-surface">{deletingSchedule.name}</strong> ? Cette action est irréversible.
            </p>

            {(deletingSchedule.assigned_employees_count || 0) > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <strong className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                  Attention : Collaborateurs rattachés
                </strong>
                <p className="text-[11px] leading-relaxed">
                  Cet horaire est actuellement associé à{' '}
                  <strong>{deletingSchedule.assigned_employees_count} collaborateur(s)</strong>.
                  La suppression supprimera cette référence pour leurs pointages.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingSchedule(null)}
                className="h-9 px-4 text-xs font-semibold rounded-lg"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={() => deleteMutation.mutate(deletingSchedule.id)}
                isLoading={deleteMutation.isPending}
                className="h-9 px-4 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
