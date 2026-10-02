import React from 'react';
import { format, isToday } from 'date-fns';
import { Plus } from '@phosphor-icons/react';
import { Avatar } from '@/components/ui/Avatar';
import { ShiftCard } from './ShiftCard';
import { AbsenceCard } from './AbsenceCard';
import { FormattedNumber } from '@/components/ui/FormattedNumber';
import {
  cleanLabel,
  getEmployeeFullName,
  PLANNING_GRID_COLS,
} from '../utils/planning.utils';
import type { EmployeeRow, ShiftItem } from '../types';

interface PlanningEmployeeRowProps {
  empRow: EmployeeRow;
  weekDays: Date[];
  onAddShift: (dateStr: string, employeeId: string) => void;
  onEditShift: (shift: ShiftItem, dateStr: string, employeeId: string) => void;
  onMoveShift?: (shiftId: string, targetDate: string, targetEmployeeId?: string | null) => void;
}

export const PlanningEmployeeRow: React.FC<PlanningEmployeeRowProps> = ({
  empRow,
  weekDays,
  onAddShift,
  onEditShift,
  onMoveShift,
}) => {
  const { employee, stats, days = {} } = empRow;
  const [dragOverDay, setDragOverDay] = React.useState<string | null>(null);
  
  // Résolution robuste du nom complet (support camelCase, snake_case et name brut)
  const fullName = getEmployeeFullName(employee);
  const jobTitleClean = cleanLabel(employee.jobTitle || (employee as any).job_title || employee.departmentName || 'Collaborateur');

  // Calcul résilient des heures hebdomadaires (serveur en priorité, recalcul local en secours)
  const weeklyHours = React.useMemo(() => {
    const serverHours = stats?.totalNetHours ?? (stats as any)?.total_net_hours;
    if (typeof serverHours === 'number' && serverHours > 0) return serverHours;

    let totalMinutes = 0;
    Object.values(days).forEach((dayItems) => {
      dayItems?.forEach((item) => {
        if (item.type === 'shift') {
          const start = item.startTime || (item as any).start_time;
          const end = item.endTime || (item as any).end_time;
          if (start && end) {
            const [sh, sm] = start.split(':').map(Number);
            const [eh, em] = end.split(':').map(Number);
            let diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
            if (diff < 0) diff += 24 * 60;
            diff -= (item.breakMinutes || 0);
            if (diff > 0) totalMinutes += diff;
          }
        }
      });
    });

    return totalMinutes > 0 ? Number((totalMinutes / 60).toFixed(2)) : (serverHours ?? 0);
  }, [stats, days]);

  return (
    <div className={`${PLANNING_GRID_COLS} border-b border-slate-200/80 hover:bg-slate-50/60 transition-colors bg-white group`}>
      {/* Colonne fixe d'identité du collaborateur (Style référence) */}
      <div className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/90 px-3.5 py-2.5 border-r border-slate-200 transition-colors flex items-center justify-between gap-2.5">
        {/* Avatar + Nom + Poste */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            name={fullName}
            firstName={employee.firstName || (employee as any).first_name}
            lastName={employee.lastName || (employee as any).last_name}
            size="sm"
            className="shrink-0 ring-1 ring-slate-200"
          />
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 truncate leading-tight">
              {fullName}
            </span>
            <span className="block text-[11px] font-medium text-slate-500 truncate leading-tight mt-0.5">
              {jobTitleClean}
            </span>
          </div>
        </div>

        {/* Heures cumulées sur la semaine formatées professionnellement */}
        <div className="shrink-0 text-right">
          <span
            className={`inline-block px-2 py-0.5 rounded-md text-[11px] transition-colors ${
              weeklyHours > 0
                ? 'font-bold text-slate-800 bg-slate-100 border border-slate-200/80 shadow-2xs'
                : 'text-slate-400 bg-slate-50 border border-slate-100'
            }`}
          >
            <FormattedNumber
              value={weeklyHours}
              type="duration"
              zeroDisplay="dimmed"
            />
          </span>
        </div>
      </div>

      {/* 7 cellules jours */}
      {weekDays.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const today = isToday(day);
        const dayItems = days[dayStr] || [];
        const isTarget = dragOverDay === dayStr;

        const isEmpty = dayItems.length === 0;

        return (
          <div
            key={dayStr}
            onClick={() => {
              if (isEmpty) {
                onAddShift(dayStr, employee.id);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverDay !== dayStr) setDragOverDay(dayStr);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (dragOverDay === dayStr) setDragOverDay(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverDay(null);
              try {
                const raw = e.dataTransfer.getData('application/json');
                if (!raw) return;
                const { shiftId, originDate, originEmployeeId } = JSON.parse(raw);
                if (!shiftId) return;
                if (originDate === dayStr && originEmployeeId === employee.id) return;
                onMoveShift?.(shiftId, dayStr, employee.id);
              } catch (err) {
                console.error('Erreur déplacement shift:', err);
              }
            }}
            className={`group/cell relative p-1.5 border-r border-slate-200 last:border-r-0 transition-all duration-150 select-none ${
              isTarget
                ? 'bg-blue-100/70 ring-2 ring-inset ring-blue-500/80 shadow-inner'
                : isEmpty
                ? 'cursor-pointer hover:bg-blue-50/30'
                : ''
            } ${today ? 'bg-blue-50/20' : 'bg-white'}`}
          >
            <div className="min-h-[52px] flex flex-col justify-center gap-1.5 pointer-events-auto">
              {!isEmpty ? (
                <>
                  {dayItems.map((item) => {
                    if (item.type === 'leave' || item.type === 'mission') {
                      return (
                        <AbsenceCard
                          key={item.id}
                          item={item}
                          dateStr={dayStr}
                          onClick={() => onEditShift(item, dayStr, employee.id)}
                        />
                      );
                    }

                    return (
                      <ShiftCard
                        key={item.id}
                        shift={item}
                        dateStr={dayStr}
                        employeeId={employee.id}
                        fallbackRole={jobTitleClean}
                        onClick={() => onEditShift(item, dayStr, employee.id)}
                      />
                    );
                  })}
                  {/* Micro-bouton d'ajout d'un 2ème shift si besoin */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddShift(dayStr, employee.id);
                    }}
                    className="w-full h-5 rounded text-[10px] font-medium text-slate-400 hover:text-blue-600 hover:bg-slate-100 flex items-center justify-center gap-1 opacity-0 group-hover/cell:opacity-100 transition-all cursor-pointer"
                    title={`Ajouter un créneau supplémentaire pour ${fullName}`}
                  >
                    <Plus size={11} weight="bold" />
                    <span>Créneau</span>
                  </button>
                </>
              ) : (
                /* Ghost Pill élégant au centre (Option A SaaS) */
                <div className="w-full h-full min-h-[52px] flex items-center justify-center">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200/90 text-slate-700 shadow-2xs text-[11px] font-semibold transition-all duration-150 ${
                      isTarget
                        ? 'opacity-0'
                        : 'opacity-0 group-hover/cell:opacity-100 group-hover/cell:scale-100 scale-95 hover:border-blue-400 hover:text-blue-600 hover:shadow-xs'
                    }`}
                  >
                    <Plus size={12} weight="bold" className="text-blue-600 shrink-0" />
                    <span>Créneau</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
