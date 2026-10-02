import React from 'react';
import { format, isToday } from 'date-fns';
import { Plus } from '@phosphor-icons/react';
import { ShiftCard } from './ShiftCard';
import { PLANNING_GRID_COLS } from '../utils/planning.utils';
import type { ShiftItem } from '../types';

interface PlanningOpenShiftsRowProps {
  weekDays: Date[];
  openShifts: any[];
  departmentId?: string;
  onAddOpenShift: (dateStr: string) => void;
  onEditShift: (shift: ShiftItem, dateStr: string) => void;
  onMoveShift?: (shiftId: string, targetDate: string, targetEmployeeId?: string | null) => void;
}

export const PlanningOpenShiftsRow: React.FC<PlanningOpenShiftsRowProps> = ({
  weekDays,
  openShifts,
  departmentId,
  onAddOpenShift,
  onEditShift,
  onMoveShift,
}) => {
  const [dragOverDay, setDragOverDay] = React.useState<string | null>(null);

  // Filtrer les shifts ouverts rattachés à ce département si spécifié
  const deptOpenShifts = openShifts.filter((s) => {
    if (!departmentId) return true;
    return !s.departmentId || s.departmentId === departmentId;
  });

  return (
    <div className={`${PLANNING_GRID_COLS} border-b border-slate-200/80 bg-white group`}>
      {/* Colonne fixe "Créneaux ouverts" (Open shifts de la référence) */}
      <div className="sticky left-0 z-10 bg-white px-4 py-2 border-r border-slate-200 flex items-center">
        <span className="text-xs font-semibold text-slate-500">
          Créneaux ouverts
        </span>
      </div>

      {/* 7 colonnes pour les jours */}
      {weekDays.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const today = isToday(day);
        const dayShifts = deptOpenShifts.filter((s) => s.date?.split('T')[0] === dayStr);
        const isTarget = dragOverDay === dayStr;
        const isEmpty = dayShifts.length === 0;

        return (
          <div
            key={dayStr}
            onClick={() => {
              if (isEmpty) {
                onAddOpenShift(dayStr);
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
                // Si déjà sur les shifts ouverts de ce même jour, ne rien faire
                if (originDate === dayStr && originEmployeeId === null) return;
                // Déplacer et désassigner le shift
                onMoveShift?.(shiftId, dayStr, null);
              } catch (err) {
                console.error('Erreur déplacement vers créneaux ouverts:', err);
              }
            }}
            className={`group/cell relative p-1.5 border-r border-slate-200 last:border-r-0 transition-all duration-150 select-none ${
              isTarget
                ? 'bg-amber-100/70 ring-2 ring-inset ring-amber-500/80 shadow-inner'
                : isEmpty
                ? 'cursor-pointer hover:bg-amber-50/20'
                : ''
            } ${today ? 'bg-blue-50/20' : 'bg-white'}`}
          >
            <div className="min-h-[46px] flex flex-col justify-center gap-1.5 pointer-events-auto">
              {!isEmpty ? (
                <>
                  {dayShifts.map((s) => (
                    <ShiftCard
                      key={s.id}
                      shift={{
                        id: s.id,
                        type: 'shift',
                        status: s.status || 'DRAFT',
                        startTime: s.startTime,
                        endTime: s.endTime,
                        breakMinutes: s.breakMinutes,
                        jobTitle: s.jobTitle,
                        color: s.color || '#F59E0B',
                        notes: s.notes,
                      }}
                      dateStr={dayStr}
                      employeeId={null}
                      onClick={() => onEditShift(s, dayStr)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddOpenShift(dayStr);
                    }}
                    className="w-full h-5 rounded text-[10px] font-medium text-slate-400 hover:text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-1 opacity-0 group-hover/cell:opacity-100 transition-all cursor-pointer"
                    title="Ajouter un créneau ouvert supplémentaire"
                  >
                    <Plus size={11} weight="bold" />
                    <span>Créneau libre</span>
                  </button>
                </>
              ) : (
                /* Ghost Pill élégant pour créneau ouvert (Option A SaaS) */
                <div className="w-full h-full min-h-[46px] flex items-center justify-center">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200/90 text-slate-700 shadow-2xs text-[11px] font-semibold transition-all duration-150 ${
                      isTarget
                        ? 'opacity-0'
                        : 'opacity-0 group-hover/cell:opacity-100 group-hover/cell:scale-100 scale-95 hover:border-amber-400 hover:text-amber-700 hover:shadow-xs'
                    }`}
                  >
                    <Plus size={12} weight="bold" className="text-amber-600 shrink-0" />
                    <span>Créneau libre</span>
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
