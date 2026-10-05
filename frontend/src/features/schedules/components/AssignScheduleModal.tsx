import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Search, Users, Check, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { employeesApi } from '@/features/employees/api/employees.api';
import { schedulesApi } from '../api/schedules.api';
import type { Schedule } from '@/features/employees/types';
import { toast } from 'sonner';

interface AssignScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
}

export const AssignScheduleModal: React.FC<AssignScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule,
}) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all employees in company
  const { data: employees = [], isLoading } = useQuery<any[]>({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getEmployees(),
    enabled: isOpen,
  });

  // Initialize selected IDs based on current schedule
  useEffect(() => {
    if (isOpen && schedule) {
      const fromSchedule = (schedule.assigned_employees || []).map((e: any) => e.id);
      const fromEmployees = (employees || [])
        .filter(
          (emp) =>
            emp.scheduleId === schedule.id ||
            emp.schedule_id === schedule.id ||
            emp.schedule?.id === schedule.id
        )
        .map((emp) => emp.id);
      const alreadyAssigned = Array.from(new Set([...fromSchedule, ...fromEmployees]));
      setSelectedEmployeeIds(alreadyAssigned);
      setSearchQuery('');
    }
  }, [isOpen, schedule?.id, employees.length]);

  // Escape key & scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  // Filtered employees by search
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter((emp) => {
      const name = `${emp.first_name || emp.firstName || ''} ${emp.last_name || emp.lastName || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const job = (emp.jobTitle || emp.position || '').toLowerCase();
      return name.includes(q) || email.includes(q) || job.includes(q);
    });
  }, [employees, searchQuery]);

  const toggleEmployee = (empId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map((e) => e.id));
    }
  };

  const handleSave = async () => {
    if (!schedule) return;
    setIsSubmitting(true);
    try {
      await schedulesApi.assignEmployeesToSchedule(schedule.id, selectedEmployeeIds);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['schedules'] }),
        queryClient.invalidateQueries({ queryKey: ['employees'] }),
      ]);
      toast.success('Affectations mises à jour avec succès');
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Erreur lors de la mise à jour des affectations';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !schedule) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 py-4.5 border-b border-outline-variant/60 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-on-surface">
              Assigner des collaborateurs
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5 font-medium">
              <Clock size={13} className="text-primary" />
              <span>{schedule.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Search & Batch Selection Sub-bar ── */}
        <div className="p-4 border-b border-outline-variant/40 space-y-2.5 bg-surface-container-low/30 shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email, poste..."
              className="pl-8.5 h-9 text-xs bg-surface-container-lowest font-medium"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
            <span>
              <strong className="text-on-surface font-semibold">
                {selectedEmployeeIds.length}
              </strong>{' '}
              sélectionné{selectedEmployeeIds.length > 1 ? 's' : ''} sur {employees.length}
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-primary font-semibold hover:underline text-[11px]"
            >
              {selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}
            </button>
          </div>
        </div>

        {/* ── Employee List ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 divide-y divide-outline-variant/20">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Spinner size="md" />
              <span className="text-xs text-on-surface-variant">Chargement des collaborateurs...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant">
              Aucun collaborateur trouvé pour cette recherche.
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const firstName = emp.first_name || emp.firstName || '';
              const lastName = emp.last_name || emp.lastName || '';
              const isSelected = selectedEmployeeIds.includes(emp.id);
              const isCurrentSchedule =
                emp.scheduleId === schedule.id || emp.schedule_id === schedule.id;
              const hasOtherSchedule =
                (emp.scheduleId || emp.schedule_id) && !isCurrentSchedule;

              return (
                <div
                  key={emp.id}
                  onClick={() => toggleEmployee(emp.id)}
                  className={`pt-2 pb-2 px-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary/5 hover:bg-primary/10'
                      : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Custom Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-primary border-primary text-on-primary'
                          : 'border-outline-variant bg-surface-container-lowest'
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>

                    {/* Avatar & Details */}
                    <Avatar
                      size="sm"
                      firstName={firstName}
                      lastName={lastName}
                      className="shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-on-surface truncate">
                        {firstName} {lastName}
                      </div>
                      <div className="text-[11px] text-on-surface-variant/70 truncate">
                        {emp.jobTitle || emp.position || emp.department?.name || emp.email}
                      </div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div className="shrink-0 text-[10px]">
                    {isCurrentSchedule ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <UserCheck size={11} />
                        Actuel
                      </span>
                    ) : hasOtherSchedule ? (
                      <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant/70 font-medium">
                        Autre horaire
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant/50 font-medium">
                        Non assigné
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-6 py-4 border-t border-outline-variant/60 flex items-center justify-end gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold rounded-lg"
          >
            Annuler
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            isLoading={isSubmitting}
            className="h-9 px-4 text-xs font-semibold rounded-lg shadow-sm"
          >
            Enregistrer les affectations
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
