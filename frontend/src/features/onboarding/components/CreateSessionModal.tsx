import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Combobox } from '@/components/ui/Combobox';
import { SegmentedControl, type SegmentedOption } from '@/components/ui/SegmentedControl';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/features/employees/api/employees.api';
import { schedulesApi } from '@/features/schedules/api/schedules.api';
import { useOnboardingTemplates } from '../hooks/useOnboarding';
import type { CreateSessionPayload } from '../types';

const schema = z.object({
  templateId: z.string().min(1, 'Sélectionnez un parcours'),
  candidateFirstName: z.string().min(1, 'Prénom requis'),
  candidateLastName: z.string().min(1, 'Nom requis'),
  candidateEmail: z.string().email('Email invalide'),
  candidatePhone: z.string().min(6, 'Téléphone requis'),
  departmentId: z.string().min(1, 'Département requis'),
  scheduleId: z.string().optional(),
  contractType: z.string().min(1, 'Type de contrat requis'),
  targetStartDate: z.string().min(1, 'Date requise'),
  probationDurationMonths: z.coerce.number().min(0).max(12).optional(),
  baseSalary: z.coerce.number().min(0).optional(),
  transportAllowance: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

const CONTRACT_OPTIONS: SegmentedOption<string>[] = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'stage', label: 'Stage' },
  { value: 'interim', label: 'Intérim' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSessionPayload) => void;
  isLoading?: boolean;
}

export const CreateSessionModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const { data: templates = [] } = useOnboardingTemplates();
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: employeesApi.getDepartments,
    enabled: open,
  });
  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules'],
    queryFn: schedulesApi.getSchedules,
    enabled: open,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {

      templateId: '',
      candidateFirstName: '',
      candidateLastName: '',
      candidateEmail: '',
      candidatePhone: '',
      departmentId: '',
      scheduleId: '',
      contractType: 'cdi',
      targetStartDate: new Date().toISOString().split('T')[0],
      probationDurationMonths: 3,
      baseSalary: undefined,
      transportAllowance: 20800,
    },
  });

  // Présélection automatique du premier horaire contractuel s'il existe
  React.useEffect(() => {
    if (open && schedules.length > 0 && !watch('scheduleId')) {
      setValue('scheduleId', schedules[0].id);
    }
  }, [open, schedules, setValue, watch]);

  const templateOptions = useMemo(() => {
    return templates.map((t) => ({
      value: t.id,
      label: t.name,
      badge: `${t.templateTasks?.length || 0} tâches`,
    }));
  }, [templates]);

  const departmentOptions = useMemo(() => {
    return departments.map((d: any) => ({
      value: d.id,
      label: d.name,
    }));
  }, [departments]);

  const scheduleOptions = useMemo(() => {
    return [
      { value: '', label: 'Horaire libre / non assigné' },
      ...schedules.map((s: any) => {
        const startTime = s.start_time || s.startTime || '08:00';
        const endTime = s.end_time || s.endTime || '17:00';
        const days = s.work_days || s.workDays || [1, 2, 3, 4, 5];
        const grace = s.grace_minutes ?? s.graceMinutes ?? 15;
        return {
          value: s.id,
          label: s.name,
          badge: `${startTime} — ${endTime}`,
          description: `${days.length} j/semaine · Tolérance +${grace} min`,
        };
      }),
    ];
  }, [schedules]);

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      scheduleId: values.scheduleId || undefined,
      baseSalary: values.baseSalary ? Number(values.baseSalary) : undefined,
      transportAllowance: values.transportAllowance ? Number(values.transportAllowance) : undefined,
      probationDurationMonths:
        typeof values.probationDurationMonths === 'number'
          ? Number(values.probationDurationMonths)
          : undefined,
    });
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvel onboarding"
      className="sm:max-w-xl overflow-visible"
    >
      <form noValidate onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-1">
        {/* Identité */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prénom *"
            placeholder="Amadou"
            error={errors.candidateFirstName?.message}
            {...register('candidateFirstName')}
          />
          <Input
            label="Nom *"
            placeholder="Diallo"
            error={errors.candidateLastName?.message}
            {...register('candidateLastName')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="email"
            label="Email *"
            placeholder="candidat@email.com"
            error={errors.candidateEmail?.message}
            {...register('candidateEmail')}
          />
          <Input
            label="Téléphone *"
            placeholder="+221 77 000 00 00"
            error={errors.candidatePhone?.message}
            {...register('candidatePhone')}
          />
        </div>

        {/* Parcours & Contrat */}
        <div className="space-y-3 pt-2 border-t border-outline-variant/40">
          <Controller
            control={control}
            name="templateId"
            render={({ field }) => (
              <Combobox
                label="Parcours d'intégration *"
                placeholder="Sélectionner un parcours..."
                searchPlaceholder="Rechercher un parcours..."
                options={templateOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.templateId?.message}
              />
            )}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Contrat *
            </label>
            <Controller
              control={control}
              name="contractType"
              render={({ field }) => (
                <SegmentedControl
                  options={CONTRACT_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  size="sm"
                  name="contract-type-select"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name="departmentId"
              render={({ field }) => (
                <Combobox
                  label="Département *"
                  placeholder="Sélectionner..."
                  searchPlaceholder="Rechercher..."
                  options={departmentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.departmentId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="scheduleId"
              render={({ field }) => (
                <Combobox
                  label="Horaire"
                  placeholder="Standard"
                  searchPlaceholder="Rechercher..."
                  options={scheduleOptions}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="w-1/2 pr-1.5">
            <Input
              type="date"
              label="Date de début *"
              error={errors.targetStartDate?.message}
              {...register('targetStartDate')}
            />
          </div>
        </div>

        {/* Conditions financières */}
        <div className="pt-2 border-t border-outline-variant/40">
          <div className="grid grid-cols-3 gap-2.5">
            <Input
              type="number"
              min={0}
              max={12}
              label="Essai"
              placeholder="3"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              rightIcon={<span className="text-[10px] font-semibold text-on-surface-variant/60">mois</span>}
              error={errors.probationDurationMonths?.message}
              {...register('probationDurationMonths')}
            />

            <Input
              type="number"
              min={0}
              step="any"
              label="Salaire brut"
              placeholder="250 000"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              rightIcon={<span className="text-[10px] font-semibold text-on-surface-variant/60">FCFA</span>}
              error={errors.baseSalary?.message}
              {...register('baseSalary')}
            />

            <Input
              type="number"
              min={0}
              step="any"
              label="Transport"
              placeholder="20 800"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              rightIcon={<span className="text-[10px] font-semibold text-on-surface-variant/60">FCFA</span>}
              error={errors.transportAllowance?.message}
              {...register('transportAllowance')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/50">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 text-xs font-semibold rounded-lg"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isLoading}
            className="h-9 px-4 text-xs font-semibold rounded-lg shadow-sm"
          >
            Créer l'onboarding
          </Button>
        </div>
      </form>
    </Modal>
  );
};
