import React from 'react';
import { format, isToday } from 'date-fns';
import { PLANNING_GRID_COLS } from '../utils/planning.utils';
import { FormattedNumber } from '@/components/ui/FormattedNumber';
import type { DaySummary } from '../types';

interface PlanningDayHeaderProps {
  weekDays: Date[];
  daysSummary?: Record<string, DaySummary>;
}

const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const PlanningDayHeader: React.FC<PlanningDayHeaderProps> = ({
  weekDays,
  daysSummary = {},
}) => {
  return (
    <div className={`${PLANNING_GRID_COLS} border-b border-slate-200 bg-white sticky top-0 z-20`}>
      {/* Colonne fixe d'en-tête collaborateur */}
      <div className="sticky left-0 z-30 bg-white px-4 py-3 text-left border-r border-slate-200 flex items-center">
        <span className="text-xs font-semibold text-slate-500">
          Collaborateur / Heures
        </span>
      </div>

      {/* 7 colonnes pour les jours de la semaine */}
      {weekDays.map((day, i) => {
        const today = isToday(day);
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayNumber = format(day, 'd');
        const summary = daysSummary[dayStr];

        return (
          <div
            key={dayStr}
            className={`px-3 py-2.5 text-center border-r border-slate-200 last:border-r-0 flex flex-col items-center justify-center ${
              today ? 'bg-blue-50/40' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">
                {DAYS_SHORT[i]}
              </span>

              {today ? (
                // Pastille bleue pour aujourd'hui (comme sur la référence)
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
                  {dayNumber}
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-800">
                  {dayNumber}
                </span>
              )}
            </div>

            {/* Total d'heures prévues sur la journée formaté professionnellement */}
            {summary && summary.totalNetHours > 0 ? (
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-0.5">
                <FormattedNumber value={summary.totalNetHours} type="duration" />
                <span>•</span>
                <FormattedNumber value={summary.scheduledHeadcount} type="count" unit="pers." />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
