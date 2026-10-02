import React, { useMemo } from 'react';
import {
  CaretLeft,
  CaretRight,
  CaretDown,
  Copy,
  Plus,
  Funnel,
  Printer,
  Sparkle,
  PaperPlaneTilt,
  CalendarBlank,
  CheckCircle,
  Clock,
  MagnifyingGlass,
  Users,
  WarningCircle,
  Warning,
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FormattedNumber } from '@/components/ui/FormattedNumber';
import { cleanLabel } from '../utils/planning.utils';
import { cn } from '@/lib/utils';

interface PlanningToolbarProps {
  currentDate: Date;
  weekStart: Date;
  weekEnd: Date;
  isPublished: boolean;
  searchQuery: string;
  selectedDepartmentId: string;
  departments: Array<{ id: string; name: string }>;
  totalWeeklyHours?: number;
  totalEmployeesCount?: number;
  openShiftsCount?: number;
  violationsCount?: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onSearchChange: (q: string) => void;
  onDepartmentChange: (deptId: string) => void;
  onOpenCreateShift: () => void;
  onOpenDuplicate: () => void;
  onOpenTemplates: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

export const PlanningToolbar: React.FC<PlanningToolbarProps> = ({
  currentDate: _currentDate,
  weekStart,
  weekEnd,
  isPublished,
  searchQuery,
  selectedDepartmentId,
  departments,
  totalWeeklyHours = 0,
  totalEmployeesCount = 0,
  openShiftsCount = 0,
  violationsCount = 0,
  onPrevWeek,
  onNextWeek,
  onToday,
  onSearchChange,
  onDepartmentChange,
  onOpenCreateShift,
  onOpenDuplicate,
  onOpenTemplates,
  onPublish,
  isPublishing = false,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Formatage propre du libellé de période (gère les semaines à cheval sur 2 mois)
  const formattedDateRange = useMemo(() => {
    const startMonth = format(weekStart, 'MMMM', { locale: fr });
    const endMonth = format(weekEnd, 'MMMM', { locale: fr });
    const year = format(weekEnd, 'yyyy', { locale: fr });

    if (startMonth === endMonth) {
      return `${format(weekStart, 'd')} — ${format(weekEnd, 'd MMMM yyyy', { locale: fr })}`;
    }
    return `${format(weekStart, 'd MMM', { locale: fr })} — ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`;
  }, [weekStart, weekEnd]);

  return (
    <div className="space-y-2.5">
      {/* ── NIVEAU 1 : Barre de commande unifiée (Command Header) ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Bloc Gauche : Titre + Statut + Contrôles temporels */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-black tracking-tight text-slate-900">
              Planning
            </h1>

            {/* Badge de statut du planning */}
            {isPublished ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <CheckCircle size={12} weight="bold" />
                <span>Publié</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                <Clock size={12} weight="duotone" />
                <span>Brouillon</span>
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Navigation temporelle intégrée */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={onPrevWeek}
                className="p-1 hover:bg-white text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Semaine précédente"
              >
                <CaretLeft size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={onToday}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={onNextWeek}
                className="p-1 hover:bg-white text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Semaine suivante"
              >
                <CaretRight size={14} weight="bold" />
              </button>
            </div>

            <span className="text-xs font-bold text-slate-800 tracking-tight hidden sm:inline">
              {formattedDateRange}
            </span>
          </div>
        </div>

        {/* Bloc Droite : Actions globales ordonnées par priorité */}
        <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end flex-wrap">
          {/* Utilitaires : Dupliquer, Modèles, Imprimer */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenDuplicate}
              className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Dupliquer la semaine"
            >
              <Copy size={14} weight="duotone" />
              <span className="hidden xl:inline">Dupliquer</span>
            </button>

            <button
              type="button"
              onClick={onOpenTemplates}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Gérer les modèles de créneaux"
            >
              <Sparkle size={14} weight="duotone" className="text-blue-600" />
              <span>Modèles</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              title="Imprimer le planning"
            >
              <Printer size={15} weight="duotone" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Action de publication */}
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing}
            className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <PaperPlaneTilt size={14} weight="bold" className="text-slate-600" />
            <span>{isPublished ? 'Mettre à jour' : 'Publier'}</span>
          </button>

          {/* Action Primaire WFM : Créer un créneau */}
          <button
            type="button"
            onClick={onOpenCreateShift}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs hover:shadow-sm active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={14} weight="bold" />
            <span>Créer un créneau</span>
          </button>
        </div>
      </div>

      {/* ── NIVEAU 2 : Sub-Bar HUD Opérationnelle (Filtres à gauche + KPIs à droite) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-0.5">
        {/* Filtres de travail : Recherche + Département + Vue */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Recherche */}
          <div className="relative">
            <MagnifyingGlass
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 sm:w-44 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Sélecteur Département */}
          <div className="relative">
            <Funnel
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={selectedDepartmentId}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="text-xs pl-7 pr-7 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer appearance-none"
            >
              <option value="">Tous les départements</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {cleanLabel(d.name)}
                </option>
              ))}
            </select>
            <CaretDown
              size={11}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Switcher de vue */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <CalendarBlank size={13} weight="duotone" className="text-blue-600" />
            <span>Semaine</span>
          </div>
        </div>

        {/* HUD Métriques Synthétique (Inline KPI Ribbon) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Heures planifiées */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs">
            <Clock size={13} weight="duotone" className="text-blue-600 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium">Heures :</span>
            <span className="font-bold text-slate-800 font-mono">
              <FormattedNumber value={totalWeeklyHours} type="duration" />
            </span>
          </div>

          {/* Collaborateurs */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs">
            <Users size={13} weight="duotone" className="text-indigo-600 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium">Collab :</span>
            <span className="font-bold text-slate-800 font-mono">
              <FormattedNumber value={totalEmployeesCount} type="count" />
            </span>
          </div>

          {/* Créneaux ouverts */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs">
            <WarningCircle
              size={13}
              weight="duotone"
              className={openShiftsCount > 0 ? 'text-amber-500 shrink-0' : 'text-slate-400 shrink-0'}
            />
            <span className="text-[11px] text-slate-400 font-medium">Libres :</span>
            <span className="font-bold text-slate-800 font-mono">{openShiftsCount}</span>
          </div>

          {/* Statut de conformité légale */}
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border shadow-2xs text-xs font-bold',
              violationsCount === 0
                ? 'bg-emerald-50/80 border-emerald-200/90 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            )}
          >
            {violationsCount === 0 ? (
              <CheckCircle size={13} weight="bold" className="text-emerald-600 shrink-0" />
            ) : (
              <Warning size={13} weight="bold" className="text-rose-600 shrink-0" />
            )}
            <span>
              {violationsCount === 0 ? '100% Conforme' : `${violationsCount} Infraction(s)`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
