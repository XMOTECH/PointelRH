import React, { useState, useMemo } from 'react';
import {
  Copy,
  ArrowRight,
  CalendarBlank,
  Warning,
} from '@phosphor-icons/react';

import { addDays, format, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentWeekStart: Date;
  onConfirm: (payload: { sourceWeekStart: string; targetWeekStart: string; overwriteExisting: boolean }) => void;
  isLoading?: boolean;
}

export const DuplicateWeekModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentWeekStart,
  onConfirm,
  isLoading = false,
}) => {
  const nextWeekStart = useMemo(() => addDays(currentWeekStart, 7), [currentWeekStart]);
  const [targetDateStr, setTargetDateStr] = useState(format(nextWeekStart, 'yyyy-MM-dd'));
  const [overwrite, setOverwrite] = useState(false);

  // Semaine source formatée
  const sourceWeekEnd = useMemo(() => addDays(currentWeekStart, 6), [currentWeekStart]);
  const sourceFormattedRange = useMemo(() => {
    return `${format(currentWeekStart, 'd MMM', { locale: fr })} — ${format(sourceWeekEnd, 'd MMM yyyy', { locale: fr })}`;
  }, [currentWeekStart, sourceWeekEnd]);

  // Semaine cible calculée dynamiquement
  const targetWeekDates = useMemo(() => {
    try {
      if (!targetDateStr) return null;
      const d = new Date(targetDateStr + 'T12:00:00Z');
      const start = startOfWeek(d, { weekStartsOn: 1 });
      const end = endOfWeek(d, { weekStartsOn: 1 });
      return {
        start,
        end,
        label: `${format(start, 'd MMM', { locale: fr })} — ${format(end, 'd MMM yyyy', { locale: fr })}`,
        fullText: `Du lundi ${format(start, 'd MMMM', { locale: fr })} au dimanche ${format(end, 'd MMMM yyyy', { locale: fr })}`,
      };
    } catch {
      return null;
    }
  }, [targetDateStr]);

  // Presets rapides en 1 clic (+1 semaine, +2 semaines, +3 semaines, +4 semaines)
  const quickPresets = useMemo(() => [
    { label: '+1 sem.', days: 7 },
    { label: '+2 sem.', days: 14 },
    { label: '+3 sem.', days: 21 },
    { label: '+4 sem.', days: 28 },
  ], []);

  const handleApplyPreset = (days: number) => {
    const newTarget = addDays(currentWeekStart, days);
    setTargetDateStr(format(newTarget, 'yyyy-MM-dd'));
  };

  const handleConfirm = () => {
    onConfirm({
      sourceWeekStart: format(currentWeekStart, 'yyyy-MM-dd'),
      targetWeekStart: targetDateStr,
      overwriteExisting: overwrite,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="sm:max-w-lg"
      title="Dupliquer le planning"
      subtitle={`Copie intégrale des créneaux de travail vers une autre période`}
    >
      <div className="space-y-4 pt-1">
        {/* ── 1. Flow Banner Visuel : Source ➔ Cible (Style SaaS moderne) ── */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
          {/* Bloc Source */}
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Semaine source
            </span>
            <span className="text-xs font-bold text-slate-800 tracking-tight truncate block mt-0.5">
              {sourceFormattedRange}
            </span>
          </div>

          {/* Flèche de transition */}
          <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-2xs">
            <ArrowRight size={14} weight="bold" className="text-blue-600" />
          </div>

          {/* Bloc Cible */}
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Semaine cible
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Brouillon
              </span>
            </div>
            <span className="text-xs font-bold text-blue-700 tracking-tight truncate block mt-0.5">
              {targetWeekDates?.label || 'À définir'}
            </span>
          </div>
        </div>

        {/* ── 2. Sélection de la date avec raccourcis rapides en 1 clic ── */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Date de début de la semaine cible (Lundi)
            </label>

            {/* Micro-pills presets rapides */}
            <div className="flex items-center gap-1">
              {quickPresets.map((p) => {
                const targetPreset = addDays(currentWeekStart, p.days);
                const targetStr = format(targetPreset, 'yyyy-MM-dd');
                const isSelected = targetDateStr === targetStr;

                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyPreset(p.days)}
                    className={cn(
                      'px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all duration-150 cursor-pointer border',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <Input
              type="date"
              value={targetDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              className="text-xs font-medium h-10"
            />
          </div>

          {targetWeekDates?.fullText && (
            <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
              <CalendarBlank size={13} weight="duotone" className="text-blue-600 shrink-0" />
              <span>{targetWeekDates.fullText}</span>
            </p>
          )}
        </div>

        {/* ── 3. Option d'écrasement des shifts existants (Toggle Card Pro) ── */}
        <div
          onClick={() => setOverwrite(!overwrite)}
          className={cn(
            'p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start justify-between gap-3 select-none',
            overwrite
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/10'
              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {overwrite && (
                <Warning size={14} weight="bold" className="text-amber-600 shrink-0" />
              )}
              <span className={cn('text-xs font-bold', overwrite ? 'text-amber-900' : 'text-slate-800')}>
                {overwrite ? 'Remplacer les créneaux existants' : 'Conserver les créneaux existants'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
              {overwrite
                ? 'Tous les créneaux déjà planifiés sur la semaine cible seront supprimés et remplacés par ceux-ci.'
                : 'Les créneaux de cette semaine seront ajoutés sans supprimer ceux qui existent déjà sur la semaine cible.'}
            </p>
          </div>

          <div className="shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={overwrite}
              onCheckedChange={setOverwrite}
            />
          </div>
        </div>

        {/* ── 4. Barre d'action inférieure (SaaS Outlined + Solid) ── */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-xs shadow-2xs transition-all duration-150 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Annuler</span>
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
              Échap
            </kbd>
          </button>

          <button
            type="button"
            disabled={isLoading || !targetDateStr}
            onClick={handleConfirm}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs hover:shadow-sm active:scale-[0.99] transition-all duration-150 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Copy size={14} weight="duotone" className="shrink-0" />
            )}
            <span>Dupliquer la semaine</span>
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-bold text-blue-100 bg-blue-700/70 border border-blue-500/50 px-1.5 py-0.5 rounded shadow-2xs">
              ↵
            </kbd>
          </button>
        </div>
      </div>
    </Modal>
  );
};
