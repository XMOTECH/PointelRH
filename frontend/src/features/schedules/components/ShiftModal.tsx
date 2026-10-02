import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  SunHorizon,
  Sun,
  SunDim,
  MoonStars,
  User,
  Users,
  Sparkle,
  Trash,
  WarningCircle,
  Check,
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Modal,
  Input,
  SegmentedControl,
  PillGroup,
  LiveDurationBadge,
  ColorPickerBar,
  EmployeePicker,
  type EmployeePickerOption,
} from '@/components/ui';
import { cleanLabel } from '../utils/planning.utils';
import type { ShiftTemplate, ComplianceViolation } from '../types';

const schema = z.object({
  employeeId: z.string().optional().nullable(),
  date: z.string().min(1, 'Date requise'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm requis'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm requis'),
  breakMinutes: z.number().min(0).max(240),
  jobTitle: z.string().optional().nullable(),
  color: z.string(),
  notes: z.string().optional().nullable(),
  isUnassigned: z.boolean(),
});

export type ShiftFormData = z.infer<typeof schema>;

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShiftFormData) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  employees: EmployeePickerOption[];
  templates?: ShiftTemplate[];
  initialData?: Partial<ShiftFormData> & { id?: string; employeeName?: string; violations?: ComplianceViolation[] };
}

const COLOR_OPTIONS = [
  { label: 'Bleu Royal', value: '#3B82F6' },
  { label: 'Émeraude', value: '#10B981' },
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Orange Ambré', value: '#F59E0B' },
  { label: 'Rose Rubis', value: '#EC4899' },
  { label: 'Cyan Lagon', value: '#06B6D4' },
];

const STANDARD_PRESETS = [
  {
    label: 'Matin',
    sublabel: '08:00 - 16:30',
    start: '08:00',
    end: '16:30',
    pause: 30,
    color: '#3B82F6',
    icon: SunHorizon,
    badgeClass: 'bg-amber-50 hover:bg-amber-100/90 text-amber-900 border-amber-200/90 hover:border-amber-300',
    iconClass: 'text-amber-500',
  },
  {
    label: 'Journée',
    sublabel: '09:00 - 17:00',
    start: '09:00',
    end: '17:00',
    pause: 30,
    color: '#6366F1',
    icon: Sun,
    badgeClass: 'bg-blue-50 hover:bg-blue-100/90 text-blue-900 border-blue-200/90 hover:border-blue-300',
    iconClass: 'text-blue-600',
  },
  {
    label: 'Soir',
    sublabel: '14:00 - 22:30',
    start: '14:00',
    end: '22:30',
    pause: 30,
    color: '#10B981',
    icon: SunDim,
    badgeClass: 'bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border-emerald-200/90 hover:border-emerald-300',
    iconClass: 'text-emerald-600',
  },
  {
    label: 'Nuit',
    sublabel: '22:00 - 06:00',
    start: '22:00',
    end: '06:00',
    pause: 30,
    color: '#8B5CF6',
    icon: MoonStars,
    badgeClass: 'bg-purple-50 hover:bg-purple-100/90 text-purple-900 border-purple-200/90 hover:border-purple-300',
    iconClass: 'text-purple-600',
  },
];

const PAUSE_OPTIONS = [
  { value: 0, label: 'Sans pause' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 heure' },
];

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isLoading,
  isDeleting,
  employees,
  templates = [],
  initialData,
}) => {
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeId: initialData?.employeeId || null,
      date: initialData?.date || new Date().toISOString().split('T')[0],
      startTime: initialData?.startTime || '08:00',
      endTime: initialData?.endTime || '16:30',
      breakMinutes: initialData?.breakMinutes ?? 30,
      jobTitle: initialData?.jobTitle || '',
      color: initialData?.color || '#3B82F6',
      notes: initialData?.notes || '',
      isUnassigned: initialData?.isUnassigned || false,
    },
  });

  const isUnassigned = watch('isUnassigned');
  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');
  const watchedBreak = watch('breakMinutes');
  const watchedEmployeeId = watch('employeeId');
  const watchedDate = watch('date');

  // Sous-titre élégant avec la date en français
  const formattedSubtitle = useMemo(() => {
    try {
      if (!watchedDate) return '';
      const d = new Date(watchedDate + 'T12:00:00Z');
      return format(d, 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return watchedDate;
    }
  }, [watchedDate]);

  // Si l'utilisateur choisit un employé qui a un poste, on pré-remplit le poste
  const handleSelectEmployee = (empId: string, employee?: EmployeePickerOption | null) => {
    setValue('employeeId', empId);
    const emp = employee || employees.find((e) => e.id === empId);
    if (emp?.jobTitle && !watch('jobTitle')) {
      setValue('jobTitle', cleanLabel(emp.jobTitle));
    }
  };

  const handleApplyPreset = (preset: { start: string; end: string; pause: number; color?: string; role?: string }) => {
    setValue('startTime', preset.start);
    setValue('endTime', preset.end);
    setValue('breakMinutes', preset.pause);
    if (preset.color) setValue('color', preset.color);
    if (preset.role) setValue('jobTitle', preset.role);
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="sm:max-w-2xl"
      title={isEditing ? 'Modifier le créneau' : 'Nouveau créneau'}
      subtitle={formattedSubtitle}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── 1. Alertes de conformité légale si présentes ── */}
        {initialData?.violations && initialData.violations.length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
              <WarningCircle size={15} weight="duotone" className="shrink-0 text-rose-600" />
              <span>Avertissement de conformité légale :</span>
            </div>
            {initialData.violations.map((v, i) => (
              <p key={i} className="text-[11px] text-rose-700 ml-4 font-medium">
                • {cleanLabel(v.message)}
              </p>
            ))}
          </div>
        )}

        {/* ── 2. Mode d'attribution (Segmented Control moderne) ── */}
        <div>
          <SegmentedControl<'assigned' | 'unassigned'>
            name="shift-assignment-mode"
            value={isUnassigned ? 'unassigned' : 'assigned'}
            onChange={(val) => {
              const unassigned = val === 'unassigned';
              setValue('isUnassigned', unassigned);
              if (unassigned) setValue('employeeId', null);
            }}
            options={[
              {
                value: 'assigned',
                label: 'Collaborateur assigné',
                icon: <User size={15} weight="duotone" />,
              },
              {
                value: 'unassigned',
                label: 'Créneau ouvert (Vacant)',
                icon: <Users size={15} weight="duotone" />,
              },
            ]}
          />
        </div>

        {/* ── 3. Sélecteur Collaborateur ou Date ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          {/* Sélection Collaborateur */}
          <div>
            {isUnassigned ? (
              <>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Collaborateur
                </label>
                <div className="h-10 px-3.5 flex items-center text-xs font-medium text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  Créneau disponible pour prise de poste libre
                </div>
              </>
            ) : (
              <EmployeePicker
                label="Collaborateur"
                value={watchedEmployeeId || ''}
                onChange={(empId, emp) => handleSelectEmployee(empId, emp)}
                employees={employees}
                placeholder="Sélectionner un collaborateur..."
                error={errors.employeeId?.message}
                allowClear
              />
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date
            </label>
            <div className="relative">
              <Input
                type="date"
                {...register('date')}
                className={`text-xs ${errors.date ? 'border-rose-500' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* ── 4. Presets rapides WFM (1-Clic pour remplir) ── */}
        <div className="pt-0.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkle size={13} weight="duotone" className="text-blue-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Modèles rapides
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {/* Modèles personnalisés de l'entreprise s'ils existent */}
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() =>
                  handleApplyPreset({
                    start: tmpl.startTime,
                    end: tmpl.endTime,
                    pause: tmpl.breakMinutes,
                    color: tmpl.color || undefined,
                    role: tmpl.jobTitle || undefined,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 transition-all duration-150 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Sparkle size={14} weight="duotone" className="text-blue-600 shrink-0" />
                <span>{cleanLabel(tmpl.name)}</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">({tmpl.startTime}-{tmpl.endTime})</span>
              </button>
            ))}

            {/* Presets universels si aucun modèle custom */}
            {templates.length === 0 &&
              STANDARD_PRESETS.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      handleApplyPreset({
                        start: p.start,
                        end: p.end,
                        pause: p.pause,
                        color: p.color,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-150 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${p.badgeClass}`}
                  >
                    <IconComponent size={15} weight="duotone" className={p.iconClass} />
                    <span>{p.label}</span>
                    <span className="text-[10px] opacity-75 font-mono font-normal">({p.sublabel})</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* ── 5. Horaires de début et de fin ── */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Heure de début
              </label>
              <Input
                type="time"
                {...register('startTime')}
                className={`text-xs ${errors.startTime ? 'border-rose-500' : ''}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Heure de fin
              </label>
              <Input
                type="time"
                {...register('endTime')}
                className={`text-xs ${errors.endTime ? 'border-rose-500' : ''}`}
              />
            </div>
          </div>

          {/* Badge dynamique de temps effectif net avec contrôle légal */}
          <LiveDurationBadge
            startTime={watchedStartTime}
            endTime={watchedEndTime}
            breakMinutes={watchedBreak}
          />
        </div>

        {/* ── 6. Pause non rémunérée (Pills en 1-Clic) ── */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pause non rémunérée
          </label>
          <Controller
            name="breakMinutes"
            control={control}
            render={({ field }) => (
              <PillGroup<number>
                options={PAUSE_OPTIONS}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                size="sm"
              />
            )}
          />
        </div>

        {/* ── 7. Métier / Poste & Palette de couleur ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Poste / Rôle sur le créneau
            </label>
            <Input
              {...register('jobTitle')}
              placeholder="Ex: Cuisinier, Chauffeur, Serveur..."
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Couleur visuelle
            </label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="pt-1">
                  <ColorPickerBar
                    colors={COLOR_OPTIONS}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                  />
                </div>
              )}
            />
          </div>
        </div>

        {/* ── 8. Notes & Instructions ── */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes & instructions particulières (optionnel)
          </label>
          <Input
            {...register('notes')}
            placeholder="Ex: Renfort service midi, inventaire mensuel..."
            className="text-xs"
          />
        </div>

        {/* ── 9. Barre d'action inférieure (Style SaaS moderne & contrasté) ── */}
        <div className="flex items-center justify-between pt-4 pb-0.5 border-t border-slate-100 mt-2">
          <div>
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting || isLoading}
                className="h-9 px-3 rounded-xl border border-rose-200/90 bg-rose-50/70 hover:bg-rose-100/90 active:bg-rose-200 text-rose-700 font-semibold text-xs transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs hover:border-rose-300"
              >
                {isDeleting ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                ) : (
                  <Trash size={15} weight="duotone" className="text-rose-600 shrink-0" />
                )}
                <span>Supprimer</span>
              </button>
            ) : <div />}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="h-9 px-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs transition-all duration-150 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Annuler</span>
              <kbd className="hidden sm:inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-100/90 border border-slate-200/90 px-1.5 py-0.5 rounded shadow-2xs">
                Échap
              </kbd>
            </button>
            <button
              type="submit"
              disabled={isLoading || isDeleting}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs hover:shadow-sm active:scale-[0.99] transition-all duration-150 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Check size={14} weight="bold" className="text-white shrink-0" />
              )}
              <span>{isEditing ? 'Enregistrer les modifications' : 'Créer le créneau'}</span>
              <kbd className="hidden sm:inline-flex items-center text-[10px] font-bold text-blue-100 bg-blue-700/70 border border-blue-500/50 px-1.5 py-0.5 rounded shadow-2xs">
                ↵
              </kbd>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
