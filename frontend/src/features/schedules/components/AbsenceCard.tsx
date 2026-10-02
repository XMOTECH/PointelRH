import React from 'react';
import { cleanLabel } from '../utils/planning.utils';
import type { ShiftItem } from '../types';

interface AbsenceCardProps {
  item: ShiftItem;
  dateStr?: string;
  onClick?: () => void;
  className?: string;
}

export const AbsenceCard: React.FC<AbsenceCardProps> = ({
  item,
  onClick,
  className = '',
}) => {
  const isSick = item.title?.toLowerCase().includes('malad') || item.status?.toLowerCase().includes('sick');
  const title = cleanLabel(item.title || (isSick ? 'Maladie' : 'Congé payé'));

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-100/90 transition-all select-none cursor-pointer hover:bg-slate-200/80 ${className}`}
    >
      {/* Barre d'accent neutre (style référence gris sobre) */}
      <div className={`w-1 self-stretch rounded-full shrink-0 ${isSick ? 'bg-amber-500' : 'bg-slate-400'}`} />

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <span className="block text-[11px] font-bold text-slate-800 truncate leading-tight">
          {title}
        </span>
        <span className="block text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">
          {isSick ? 'Arrêt maladie' : 'Absence validée'}
        </span>
      </div>
    </div>
  );
};
