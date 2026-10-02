import React from 'react';
import { format } from 'date-fns';
import { MessageSquare, Plus } from 'lucide-react';
import { PLANNING_GRID_COLS } from '../utils/planning.utils';

interface PlanningDayNotesRowProps {
  weekDays: Date[];
  notes: Record<string, string>;
  onEditNote: (dateStr: string, currentNote?: string) => void;
}

export const PlanningDayNotesRow: React.FC<PlanningDayNotesRowProps> = ({
  weekDays,
  notes,
  onEditNote,
}) => {
  return (
    <div className={`${PLANNING_GRID_COLS} border-b border-slate-200 bg-slate-50/60 text-xs`}>
      {/* Intitulé de la ligne (fixé à gauche) */}
      <div className="sticky left-0 z-20 bg-slate-50 px-4 py-2 border-r border-slate-200 flex items-center gap-1.5 text-slate-600 font-medium">
        <MessageSquare size={13} className="text-slate-400" />
        <span>Notes du jour</span>
      </div>

      {/* Colonnes des jours */}
      {weekDays.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const note = notes[dayStr];

        return (
          <div
            key={dayStr}
            className="px-2 py-1.5 border-r border-slate-200 last:border-r-0 flex items-center bg-slate-50/30 min-w-0"
          >
            {note ? (
              <div
                onClick={() => onEditNote(dayStr, note)}
                role="button"
                tabIndex={0}
                className="group w-full flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 font-medium cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs truncate"
                title={note}
              >
                <span className="truncate">{note}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onEditNote(dayStr)}
                className="w-full h-6 rounded border border-dashed border-transparent hover:border-slate-300 flex items-center justify-center text-[10px] text-slate-400 hover:text-blue-600 transition-all opacity-0 hover:opacity-100 cursor-pointer"
                title="Ajouter une note de journée"
              >
                <Plus size={11} className="mr-0.5" /> Note
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
