import React, { useState } from 'react';
import { ChevronDown, ChevronRight, UserPlus } from 'lucide-react';
import { cleanLabel } from '../utils/planning.utils';
import { PlanningOpenShiftsRow } from './PlanningOpenShiftsRow';
import { PlanningEmployeeRow } from './PlanningEmployeeRow';
import type { EmployeeRow, ShiftItem } from '../types';

interface PlanningDepartmentGroupProps {
  departmentId?: string;
  departmentName: string;
  employees: EmployeeRow[];
  openShifts: any[];
  weekDays: Date[];
  defaultExpanded?: boolean;
  onAddPeople?: (departmentId?: string) => void;
  onAddShift: (dateStr: string, employeeId?: string) => void;
  onEditShift: (shift: ShiftItem, dateStr: string, employeeId?: string) => void;
  onMoveShift?: (shiftId: string, targetDate: string, targetEmployeeId?: string | null) => void;
}

export const PlanningDepartmentGroup: React.FC<PlanningDepartmentGroupProps> = ({
  departmentId,
  departmentName,
  employees,
  openShifts,
  weekDays,
  defaultExpanded = true,
  onAddPeople,
  onAddShift,
  onEditShift,
  onMoveShift,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const cleanDeptName = cleanLabel(departmentName || 'Général').toUpperCase();

  return (
    <div className="border-b border-slate-200 last:border-b-0 bg-white">
      {/* En-tête du groupe de département (Style référence: ⌄ KITCHEN STAFF ... + Add people) */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100/75 border-b border-slate-200 select-none">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown size={15} className="text-slate-400" />
          ) : (
            <ChevronRight size={15} className="text-slate-400" />
          )}
          <span>{cleanDeptName}</span>
          <span className="text-[11px] font-normal text-slate-400">
            ({employees.length} {employees.length > 1 ? 'collaborateurs' : 'collaborateur'})
          </span>
        </button>

        {onAddPeople && (
          <button
            type="button"
            onClick={() => onAddPeople(departmentId)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-white"
          >
            <UserPlus size={13} />
            <span>Ajouter un créneau</span>
          </button>
        )}
      </div>

      {/* Contenu dépliable du groupe (CSS Grid natif, sans balise table) */}
      {isExpanded && (
        <div className="divide-y divide-slate-100">
          {/* Ligne des créneaux ouverts pour ce groupe */}
          <PlanningOpenShiftsRow
            weekDays={weekDays}
            openShifts={openShifts}
            departmentId={departmentId}
            onAddOpenShift={(dateStr) => onAddShift(dateStr, undefined)}
            onEditShift={(shift, dateStr) => onEditShift(shift, dateStr, undefined)}
            onMoveShift={onMoveShift}
          />

          {/* Lignes des collaborateurs de ce département */}
          {employees.length > 0 ? (
            employees.map((empRow) => (
              <PlanningEmployeeRow
                key={empRow.employee.id}
                empRow={empRow}
                weekDays={weekDays}
                onAddShift={(dateStr, empId) => onAddShift(dateStr, empId)}
                onEditShift={(shift, dateStr, empId) => onEditShift(shift, dateStr, empId)}
                onMoveShift={onMoveShift}
              />
            ))
          ) : (
            <div className="py-4 text-center text-xs text-slate-400 italic bg-white">
              Aucun collaborateur assigné à cette équipe.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
