import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { getShiftPalette, cleanLabel } from '../utils/planning.utils';
import type { ShiftItem } from '../types';

interface ShiftCardProps {
  shift: ShiftItem;
  onClick?: () => void;
  className?: string;
  fallbackRole?: string;
  dateStr?: string;
  employeeId?: string | null;
  draggable?: boolean;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  onClick,
  className = '',
  fallbackRole,
  dateStr,
  employeeId,
  draggable = true,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const dragOccurredRef = React.useRef(false);

  const roleRaw = shift.jobTitle || (shift as any).job_title || shift.title || fallbackRole || 'Collaborateur';
  const cleanTitle = cleanLabel(roleRaw);
  const palette = getShiftPalette(shift.color, cleanTitle);
  const hasNotes = Boolean(shift.notes && shift.notes.trim().length > 0);
  const hasViolations = Boolean(shift.violations && shift.violations.length > 0);

  const start = shift.startTime || (shift as any).start_time || '';
  const end = shift.endTime || (shift as any).end_time || '';
  const timeDisplay = start && end ? `${start} - ${end}` : (start || end || 'Horaire à définir');

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return;
    dragOccurredRef.current = true;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        shiftId: shift.id,
        originDate: dateStr,
        originEmployeeId: employeeId ?? null,
      })
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTimeout(() => {
      dragOccurredRef.current = false;
    }, 120);
  };

  const handleClick = () => {
    if (dragOccurredRef.current) return;
    onClick?.();
  };

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-150 ${
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } hover:shadow-md hover:-translate-y-0.5 select-none ${
        isDragging ? 'opacity-30 scale-95 ring-2 ring-blue-500' : ''
      } ${className}`}
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.border,
      }}
    >
      {/* Barre d'accent verticale saturée (style référence) */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: palette.accent }}
      />

      {/* Contenu principal */}
      <div className="flex-1 min-w-0">
        {/* Horaires et indicateurs */}
        <div className="flex items-center justify-between gap-1">
          <span
            className="text-[11px] font-bold tracking-tight truncate leading-tight"
            style={{ color: palette.text }}
          >
            {timeDisplay}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {hasNotes && (
              <span
                className="opacity-75 hover:opacity-100 transition-opacity"
                title={shift.notes || 'Note attachée'}
                style={{ color: palette.subtext }}
              >
                <FileText size={11} />
              </span>
            )}
            {hasViolations && (
              <span
                className="text-rose-600 animate-pulse"
                title={shift.violations?.map((v) => cleanLabel(v.message)).join('\n')}
              >
                <AlertTriangle size={11} />
              </span>
            )}
          </div>
        </div>

        {/* Intitulé du poste / rôle */}
        <div className="flex items-center justify-between mt-0.5">
          <span
            className="text-[10px] font-semibold truncate leading-tight"
            style={{ color: palette.subtext }}
          >
            {cleanTitle}
          </span>

          {shift.breakMinutes && shift.breakMinutes > 0 ? (
            <span
              className="text-[9px] font-medium opacity-60 ml-1 shrink-0"
              style={{ color: palette.subtext }}
            >
              {shift.breakMinutes}m
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
