import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon } from 'lucide-react';
import { schedulesApi } from './api/schedules.api';
import { departmentsApi } from '../departments/api/departments.api';
import { Spinner } from '@/components/ui/Spinner';
import { FormattedNumber } from '@/components/ui/FormattedNumber';
import { startOfWeek, addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { ShiftModal } from './components/ShiftModal';
import type { ShiftFormData } from './components/ShiftModal';
import { DuplicateWeekModal } from './components/DuplicateWeekModal';
import { ShiftTemplatesDrawer } from './components/ShiftTemplatesDrawer';
import { DayNoteModal } from './components/DayNoteModal';
import { PlanningToolbar } from './components/PlanningToolbar';
import { PlanningDayHeader } from './components/PlanningDayHeader';
import { PlanningDayNotesRow } from './components/PlanningDayNotesRow';
import { PlanningDepartmentGroup } from './components/PlanningDepartmentGroup';
import { SchedulesNavigationTabs } from './components/SchedulesNavigationTabs';
import { cleanLabel, PLANNING_MIN_WIDTH, getEmployeeFullName } from './utils/planning.utils';
import type { ShiftItem, EmployeeRow } from './types';

export function WeeklyPlanningPage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');

  // Modales
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShiftData, setEditingShiftData] = useState<{
    id?: string;
    employeeId?: string | null;
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    jobTitle?: string | null;
    color?: string;
    notes?: string | null;
    isUnassigned?: boolean;
    violations?: any[];
  } | null>(null);

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isTemplatesDrawerOpen, setIsTemplatesDrawerOpen] = useState(false);

  // Notes de journée (style référence: Cocktail party, Michelin review, Inspection...)
  const [dayNotes, setDayNotes] = useState<Record<string, string>>({});
  const [activeDayNoteDate, setActiveDayNoteDate] = useState<string | null>(null);

  // Normalisation semaine
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  // Requête matrice semaine
  const { data: planningData, isLoading } = useQuery({
    queryKey: ['planning-week', weekStartStr, selectedDepartmentId],
    queryFn: () => schedulesApi.getWeekPlanning(weekStartStr, selectedDepartmentId || undefined),
  });

  // Requête modèles de shifts
  const { data: templates = [] } = useQuery({
    queryKey: ['shift-templates'],
    queryFn: () => schedulesApi.getShiftTemplates(),
  });

  // Requête départements
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getDepartments,
  });

  // Requête horaires contractuels (pour le compteur de l'onglet)
  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules'],
    queryFn: schedulesApi.getSchedules,
  });

  // ── Mutations ──
  const publishMutation = useMutation({
    mutationFn: () => schedulesApi.publishWeek(weekStartStr, selectedDepartmentId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning-week'] });
      toast.success('Le planning de la semaine a été publié avec succès.');
    },
    onError: () => toast.error('Erreur lors de la publication du planning.'),
  });

  const duplicateMutation = useMutation({
    mutationFn: schedulesApi.duplicateWeek,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['planning-week'] });
      toast.success(res.message || 'Semaine dupliquée avec succès.');
      setIsDuplicateModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la duplication de la semaine.');
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: schedulesApi.createShift,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['planning-week'] });
      if (res.violations?.length > 0) {
        toast.warning(`Shift créé avec ${res.violations.length} avertissement(s) de conformité.`);
      } else {
        toast.success('Shift créé avec succès.');
      }
      setIsShiftModalOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erreur lors de la création du shift.'),
  });

  const updateShiftMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => schedulesApi.updateShift(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['planning-week'] });
      if (res.violations?.length > 0) {
        toast.warning(`Shift modifié avec ${res.violations.length} avertissement(s) de conformité.`);
      } else {
        toast.success('Shift mis à jour.');
      }
      setIsShiftModalOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erreur lors de la modification.'),
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (id: string) => schedulesApi.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning-week'] });
      toast.success('Shift supprimé.');
      setIsShiftModalOpen(false);
    },
    onError: () => toast.error('Erreur lors de la suppression du shift.'),
  });

  const moveShiftMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { employeeId?: string | null; date?: string; startTime?: string; endTime?: string } }) =>
      schedulesApi.moveShift(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['planning-week'] });
      if (res?.violations?.length > 0) {
        toast.warning(`Créneau déplacé avec ${res.violations.length} avertissement(s) de conformité.`);
      } else {
        toast.success('Créneau déplacé avec succès.');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors du déplacement du créneau.');
    },
  });

  const handleMoveShift = (shiftId: string, targetDate: string, targetEmployeeId?: string | null) => {
    moveShiftMutation.mutate({
      id: shiftId,
      payload: {
        date: targetDate,
        employeeId: targetEmployeeId ?? null,
      },
    });
  };

  const createTemplateMutation = useMutation({
    mutationFn: schedulesApi.createShiftTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      toast.success('Modèle de shift enregistré.');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: schedulesApi.deleteShiftTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      toast.success('Modèle désactivé.');
    },
  });

  // Filtrage des employés par recherche textuelle
  const filteredEmployees = useMemo(() => {
    if (!planningData?.employees) return [];
    if (!searchQuery.trim()) return planningData.employees;

    const query = searchQuery.toLowerCase().trim();
    return planningData.employees.filter((empRow: EmployeeRow) => {
      const fullName = getEmployeeFullName(empRow.employee).toLowerCase();
      const job = (empRow.employee.jobTitle || '').toLowerCase();
      const dept = (empRow.employee.departmentName || '').toLowerCase();
      return fullName.includes(query) || job.includes(query) || dept.includes(query);
    });
  }, [planningData?.employees, searchQuery]);

  // Regroupement par département : n'affiche que les départements avec collaborateurs
  const departmentGroups = useMemo(() => {
    const groupMap = new Map<string, { id?: string; name: string; employees: EmployeeRow[] }>();

    filteredEmployees.forEach((empRow: EmployeeRow) => {
      const deptRaw = empRow.employee.departmentName || 'Équipe Générale';
      const key = deptRaw.toLowerCase();

      if (!groupMap.has(key)) {
        const matchingDept = departments.find(
          (d: any) => d.name.toLowerCase() === key || d.id === deptRaw,
        );
        groupMap.set(key, {
          id: matchingDept?.id,
          name: deptRaw,
          employees: [],
        });
      }

      groupMap.get(key)!.employees.push(empRow);
    });

    if (selectedDepartmentId) {
      const selectedDept = departments.find((d: any) => d.id === selectedDepartmentId);
      if (selectedDept) {
        const key = selectedDept.name.toLowerCase();
        return Array.from(groupMap.values()).filter((g) => g.name.toLowerCase() === key);
      }
    }

    return Array.from(groupMap.values());
  }, [departments, filteredEmployees, selectedDepartmentId]);

  // Liste des employés pour les sélecteurs de modale
  const employeesList = useMemo(() => {
    return planningData?.employees.map((e) => ({
      id: e.employee.id,
      firstName: e.employee.firstName || (e.employee as any).first_name || '',
      lastName: e.employee.lastName || (e.employee as any).last_name || '',
      jobTitle: cleanLabel(e.employee.jobTitle),
      departmentName: cleanLabel(e.employee.departmentName),
      totalWeeklyHours: Math.round((e.stats?.totalNetHours || (e as any)?.stats?.total_net_hours || 0) * 10) / 10,
    })) || [];
  }, [planningData?.employees]);

  // Totaux globaux consolidés de manière résiliente
  const totalWeeklyHours = useMemo(() => {
    if (!planningData?.employees) return 0;
    return planningData.employees.reduce((acc: number, e: EmployeeRow) => {
      let empHours = e.stats?.totalNetHours || (e as any)?.stats?.total_net_hours || 0;
      if (empHours === 0 && e.days) {
        let mins = 0;
        Object.values(e.days).forEach((items) => {
          items?.forEach((item) => {
            if (item.type === 'shift') {
              const start = item.startTime || (item as any).start_time;
              const end = item.endTime || (item as any).end_time;
              if (start && end) {
                const [sh, sm] = start.split(':').map(Number);
                const [eh, em] = end.split(':').map(Number);
                let diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
                if (diff < 0) diff += 24 * 60;
                diff -= (item.breakMinutes || 0);
                if (diff > 0) mins += diff;
              }
            }
          });
        });
        if (mins > 0) empHours = Number((mins / 60).toFixed(2));
      }
      return acc + empHours;
    }, 0);
  }, [planningData?.employees]);
  const isWeekPublished = planningData?.planningWeek?.status === 'PUBLISHED';
  const totalViolations = planningData?.violations?.length || 0;
  const openShiftsCount = planningData?.openShifts?.length || 0;

  // Actions d'ouverture de modales
  const handleOpenAddShift = (dateStr: string, employeeId?: string) => {
    setEditingShiftData({
      date: dateStr,
      employeeId: employeeId || null,
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 30,
      jobTitle: '',
      color: '#3B82F6',
      notes: '',
      isUnassigned: !employeeId,
    });
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift: ShiftItem, dateStr: string, employeeId?: string) => {
    setEditingShiftData({
      id: shift.id,
      date: dateStr,
      employeeId: employeeId || null,
      startTime: shift.startTime || '09:00',
      endTime: shift.endTime || '17:00',
      breakMinutes: shift.breakMinutes ?? 30,
      jobTitle: shift.jobTitle || '',
      color: shift.color || '#3B82F6',
      notes: shift.notes || '',
      isUnassigned: !employeeId,
      violations: shift.violations || [],
    });
    setIsShiftModalOpen(true);
  };

  const handleShiftSubmit = (data: ShiftFormData) => {
    const payload = {
      ...data,
      employeeId: data.employeeId || undefined,
      jobTitle: data.jobTitle || undefined,
      notes: data.notes || undefined,
    };
    if (editingShiftData?.id) {
      updateShiftMutation.mutate({
        id: editingShiftData.id,
        data: payload,
      });
    } else {
      createShiftMutation.mutate(payload);
    }
  };

  // Gestion des notes de journées
  const handleSaveDayNote = (dateStr: string, noteText: string) => {
    setDayNotes((prev) => {
      const updated = { ...prev };
      if (!noteText) {
        delete updated[dateStr];
      } else {
        updated[dateStr] = noteText;
      }
      return updated;
    });
    toast.success('Note de journée enregistrée.');
  };

  const handleDeleteDayNote = (dateStr: string) => {
    setDayNotes((prev) => {
      const updated = { ...prev };
      delete updated[dateStr];
      return updated;
    });
    toast.success('Note supprimée.');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-slate-500 font-medium">Chargement du planning de travail...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── Sub-Navigation Tabs ── */}
      <div className="flex items-center justify-between">
        <SchedulesNavigationTabs schedulesCount={schedules.length} />
      </div>

      {/* ── 1. Barre de commande unifiée & HUD Opérationnel (Architecture SaaS Pro) ── */}
      <PlanningToolbar
        currentDate={currentDate}
        weekStart={weekStart}
        weekEnd={weekEnd}
        isPublished={isWeekPublished}
        searchQuery={searchQuery}
        selectedDepartmentId={selectedDepartmentId}
        departments={departments}
        totalWeeklyHours={totalWeeklyHours}
        totalEmployeesCount={planningData?.employees.length || 0}
        openShiftsCount={openShiftsCount}
        violationsCount={totalViolations}
        onPrevWeek={() => setCurrentDate(addDays(currentDate, -7))}
        onNextWeek={() => setCurrentDate(addDays(currentDate, 7))}
        onToday={() => setCurrentDate(new Date())}
        onSearchChange={setSearchQuery}
        onDepartmentChange={setSelectedDepartmentId}
        onOpenCreateShift={() => handleOpenAddShift(weekStartStr)}
        onOpenDuplicate={() => setIsDuplicateModalOpen(true)}
        onOpenTemplates={() => setIsTemplatesDrawerOpen(true)}
        onPublish={() => publishMutation.mutate()}
        isPublishing={publishMutation.isPending}
      />

      {/* ── 3. Grille Principale WFM (Architecture CSS Grid Strictement Alignée) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className={PLANNING_MIN_WIDTH}>
            {/* En-tête des 7 jours avec pastille aujourd'hui */}
            <PlanningDayHeader
              weekDays={weekDays}
              daysSummary={planningData?.daysSummary}
            />

            {/* Ligne des notes du jour (Day notes 💬) */}
            <PlanningDayNotesRow
              weekDays={weekDays}
              notes={dayNotes}
              onEditNote={(dateStr) => setActiveDayNoteDate(dateStr)}
            />

            {/* Groupes par département (sans balises <table> disjointes) */}
            <div className="divide-y divide-slate-200">
              {departmentGroups.map((group) => (
                <PlanningDepartmentGroup
                  key={group.name}
                  departmentId={group.id}
                  departmentName={group.name}
                  employees={group.employees}
                  openShifts={planningData?.openShifts || []}
                  weekDays={weekDays}
                  defaultExpanded={true}
                  onAddPeople={() => handleOpenAddShift(weekStartStr)}
                  onAddShift={(dateStr, empId) => handleOpenAddShift(dateStr, empId)}
                  onEditShift={(shift, dateStr, empId) => handleOpenEditShift(shift, dateStr, empId)}
                  onMoveShift={handleMoveShift}
                />
              ))}

              {departmentGroups.length === 0 && (
                <div className="py-16 text-center bg-white">
                  <CalendarIcon size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">
                    Aucun collaborateur trouvé pour cette sélection.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ── 5. Modales ── */}
      {isShiftModalOpen && (
        <ShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          onSubmit={handleShiftSubmit}
          onDelete={editingShiftData?.id ? () => deleteShiftMutation.mutate(editingShiftData.id!) : undefined}
          isLoading={createShiftMutation.isPending || updateShiftMutation.isPending}
          isDeleting={deleteShiftMutation.isPending}
          employees={employeesList}
          templates={templates}
          initialData={editingShiftData || undefined}
        />
      )}

      {isDuplicateModalOpen && (
        <DuplicateWeekModal
          isOpen={isDuplicateModalOpen}
          onClose={() => setIsDuplicateModalOpen(false)}
          currentWeekStart={weekStart}
          onConfirm={(payload) => duplicateMutation.mutate({ ...payload, departmentId: selectedDepartmentId || undefined })}
          isLoading={duplicateMutation.isPending}
        />
      )}

      {isTemplatesDrawerOpen && (
        <ShiftTemplatesDrawer
          isOpen={isTemplatesDrawerOpen}
          onClose={() => setIsTemplatesDrawerOpen(false)}
          templates={templates}
          onCreateTemplate={(data) => createTemplateMutation.mutate({ ...data, departmentId: selectedDepartmentId || undefined })}
          onDeleteTemplate={(id) => deleteTemplateMutation.mutate(id)}
          isCreating={createTemplateMutation.isPending}
        />
      )}

      {activeDayNoteDate && (
        <DayNoteModal
          isOpen={!!activeDayNoteDate}
          dateStr={activeDayNoteDate}
          initialNote={dayNotes[activeDayNoteDate] || ''}
          onClose={() => setActiveDayNoteDate(null)}
          onSave={handleSaveDayNote}
          onDelete={handleDeleteDayNote}
        />
      )}
    </div>
  );
}
