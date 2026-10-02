import React, { useState, useMemo } from 'react';
import {
  Sparkle,
  Plus,
  Trash,
  Clock,
  Briefcase,
  Check,
  CaretLeft,
  Eye,
} from '@phosphor-icons/react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PillGroup } from '@/components/ui/PillGroup';
import { ColorPickerBar } from '@/components/ui/ColorPickerBar';
import { ShiftCard } from './ShiftCard';
import { cleanLabel } from '../utils/planning.utils';
import type { ShiftTemplate } from '../types';

const COLOR_OPTIONS = [
  { label: 'Bleu Royal', value: '#3B82F6' },
  { label: 'Émeraude', value: '#10B981' },
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Orange Ambré', value: '#F59E0B' },
  { label: 'Rose Rubis', value: '#EC4899' },
  { label: 'Cyan Lagon', value: '#06B6D4' },
];

const PAUSE_OPTIONS = [
  { label: '0m', value: 0 },
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  templates: ShiftTemplate[];
  onCreateTemplate: (data: Partial<ShiftTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  isCreating?: boolean;
}

function formatTemplateDuration(start: string, end: string, pause: number = 0): string {
  try {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
    if (diff < 0) diff += 24 * 60;
    diff -= pause;
    if (diff <= 0) return '0 h';
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    if (minutes === 0) return `${hours} h`;
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  } catch {
    return '';
  }
}

export const ShiftTemplatesDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  templates,
  onCreateTemplate,
  onDeleteTemplate,
  isCreating = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:30');
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [color, setColor] = useState('#3B82F6');
  const [jobTitle, setJobTitle] = useState('');

  const liveNetDuration = useMemo(() => {
    return formatTemplateDuration(startTime, endTime, breakMinutes);
  }, [startTime, endTime, breakMinutes]);

  if (!isOpen) return null;

  const handleCreate = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;

    onCreateTemplate({
      name: name.trim(),
      startTime,
      endTime,
      breakMinutes,
      color,
      jobTitle: jobTitle.trim() || null,
    });

    setName('');
    setJobTitle('');
    setIsAdding(false);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="sm:max-w-xl"
      title={isAdding ? 'Nouveau modèle de créneau' : 'Modèles de créneaux'}
      subtitle={
        isAdding
          ? 'Définissez les horaires types et la couleur pour planifier en 1 clic'
          : 'Trames horaires réutilisables lors de la composition du planning'
      }
    >
      <div className="space-y-4 pt-1">
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* MODE 1 : FORMULAIRE DE CRÉATION                                */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {isAdding ? (
          <form id="template-create-form" onSubmit={handleCreate} className="space-y-3.5">
            {/* Barre de retour vers la liste */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <CaretLeft size={14} weight="bold" />
                <span>Retour aux modèles existants</span>
              </button>

              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
                {liveNetDuration} nettes
              </span>
            </div>

            {/* Identité : Nom + Poste */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom du modèle *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Service Matin, Soirée, Renfort..."
                  required
                  autoFocus
                  className="text-xs h-10 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Poste / Rôle pré-rempli (optionnel)
                </label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Serveur, Cuisinier..."
                  className="text-xs h-10 bg-white"
                />
              </div>
            </div>

            {/* Horaires : Début & Fin */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Heure de début *
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="text-xs h-10 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Heure de fin *
                </label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="text-xs h-10 bg-white"
                />
              </div>
            </div>

            {/* Pause non rémunérée */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Pause non rémunérée
                </label>
                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  {breakMinutes} min
                </span>
              </div>
              <PillGroup
                options={PAUSE_OPTIONS}
                value={breakMinutes}
                onChange={setBreakMinutes}
                size="sm"
              />
            </div>

            {/* Couleur distinctive */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Couleur distinctive
              </label>
              <ColorPickerBar
                colors={COLOR_OPTIONS}
                value={color}
                onChange={setColor}
                size="sm"
              />
            </div>

            {/* ── Aperçu en direct (Live WYSIWYG Preview) ── */}
            <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Eye size={13} weight="bold" className="text-blue-600" />
                  Aperçu sur la grille de planning
                </span>
                <span className="font-normal font-sans text-slate-400 text-[10px]">
                  Rendu visuel exact
                </span>
              </div>

              <div className="max-w-xs">
                <ShiftCard
                  shift={{
                    id: 'live-preview',
                    type: 'shift',
                    status: 'CONFIRMED',
                    startTime,
                    endTime,
                    breakMinutes,
                    jobTitle: jobTitle.trim() || undefined,
                    color,
                    title: name.trim() || 'Nom du modèle',
                  }}
                  draggable={false}
                  fallbackRole={jobTitle.trim() || 'Poste à définir'}
                  className="pointer-events-none shadow-xs"
                />
              </div>
            </div>

            {/* ── Actions du formulaire (Unique Footer Pro) ── */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Annuler</span>
                <kbd className="hidden sm:inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                  Échap
                </kbd>
              </button>

              <button
                type="submit"
                disabled={isCreating || !name.trim()}
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs hover:shadow-sm active:scale-[0.99] transition-all duration-150 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Check size={14} weight="bold" />
                )}
                <span>Enregistrer le modèle</span>
                <kbd className="hidden sm:inline-flex items-center text-[10px] font-bold text-blue-100 bg-blue-700/70 border border-blue-500/50 px-1.5 py-0.5 rounded shadow-2xs">
                  ↵
                </kbd>
              </button>
            </div>
          </form>
        ) : (
          /* ══════════════════════════════════════════════════════════════ */
          /* MODE 2 : LISTE DES MODÈLES EXISTANTS                           */
          /* ══════════════════════════════════════════════════════════════ */
          <>
            {/* Bandeau d'action supérieur */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Sparkle size={16} weight="duotone" />
                </div>
                <p className="text-xs text-slate-600 font-medium leading-tight truncate">
                  {templates.length > 0
                    ? `${templates.length} modèle${templates.length > 1 ? 's' : ''} disponible${templates.length > 1 ? 's' : ''} pour la planification rapide`
                    : 'Définissez vos trames horaires standards'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-2xs hover:shadow-xs transition-all duration-150 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
              >
                <Plus size={13} weight="bold" />
                <span>Nouveau modèle</span>
              </button>
            </div>

            {/* Liste ou État zéro */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-0.5">
              {templates.length === 0 ? (
                /* État Zéro Pro (Empty State inspirant) */
                <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="h-11 w-11 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-blue-600 mx-auto mb-2.5">
                    <Sparkle size={20} weight="duotone" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Aucun modèle pour le moment
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Créez vos créneaux types (Matin, Soirée, Coupure...) pour pré-remplir votre planning en un clic.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="mt-3.5 h-8 px-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:text-blue-600 text-slate-700 font-semibold text-xs shadow-2xs transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} weight="bold" className="text-blue-600" />
                    <span>Créer mon premier modèle</span>
                  </button>
                </div>
              ) : (
                templates.map((tmpl) => {
                  const duration = formatTemplateDuration(tmpl.startTime, tmpl.endTime, tmpl.breakMinutes);
                  const cleanJob = tmpl.jobTitle ? cleanLabel(tmpl.jobTitle) : null;

                  return (
                    <div
                      key={tmpl.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs transition-all duration-150 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Pastille / Barre de couleur */}
                        <div
                          className="w-2.5 h-7 rounded-full shrink-0"
                          style={{ backgroundColor: tmpl.color || '#3B82F6' }}
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">
                              {cleanLabel(tmpl.name)}
                            </span>
                            {cleanJob && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                                <Briefcase size={10} className="text-slate-400" />
                                <span className="truncate">{cleanJob}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 text-[11px] text-slate-500 font-mono mt-0.5">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Clock size={12} weight="duotone" className="text-blue-600 shrink-0" />
                              {tmpl.startTime} — {tmpl.endTime}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{duration} nettes</span>
                            {tmpl.breakMinutes > 0 && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-400">Pause {tmpl.breakMinutes}m</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteTemplate(tmpl.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Supprimer ce modèle"
                      >
                        <Trash size={14} weight="duotone" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer de la liste */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-xs shadow-2xs transition-all duration-150 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Fermer</span>
                <kbd className="hidden sm:inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                  Échap
                </kbd>
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
