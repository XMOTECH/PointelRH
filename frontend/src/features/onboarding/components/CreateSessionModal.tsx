import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/features/employees/api/employees.api';
import { useOnboardingTemplates } from '../hooks/useOnboarding';
import type { CreateSessionPayload } from '../types';

const schema = z.object({
  templateId: z.string().min(1, 'Veuillez sélectionner un modèle d\'onboarding'),
  candidateFirstName: z.string().min(1, 'Le prénom est requis'),
  candidateLastName: z.string().min(1, 'Le nom est requis'),
  candidateEmail: z.string().email('Adresse email invalide'),
  candidatePhone: z.string().min(6, 'Numéro de téléphone requis'),
  departmentId: z.string().min(1, 'Le département est requis'),
  scheduleId: z.string().optional(),
  contractType: z.string().min(1, 'Le type de contrat est requis'),
  targetStartDate: z.string().min(1, 'La date de prise de poste est requise'),
  probationDurationMonths: z.number().min(0).max(12),
  baseSalary: z.number().min(0).optional(),
  transportAllowance: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

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
    queryFn: employeesApi.getSchedules,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
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
      baseSalary: 250000,
      transportAllowance: 20800,
    },
  });

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      scheduleId: values.scheduleId || undefined,
    });
    reset();
  };

  const inputClass =
    'w-full h-10 px-3 rounded-lg bg-surface-container-low border border-on-surface/10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-bold text-on-surface-variant mb-1';

  return (
    <Modal open={open} onClose={onClose} title="Initier un nouvel Onboarding">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5 p-2">
        {/* Choix du Template Métier */}
        <div>
          <label className={labelClass}>Modèle de parcours d'intégration (Métier / Site) *</label>
          <select {...register('templateId')} className={inputClass}>
            <option value="">Sélectionnez un modèle...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.templateTasks?.length || 0} tâches)
              </option>
            ))}
          </select>
          {errors.templateId && <p className="text-xs text-red-500 mt-1">{errors.templateId.message}</p>}
        </div>

        {/* Identité du candidat */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Prénom du collaborateur *</label>
            <input {...register('candidateFirstName')} placeholder="Amadou" className={inputClass} />
            {errors.candidateFirstName && <p className="text-xs text-red-500 mt-1">{errors.candidateFirstName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nom de famille *</label>
            <input {...register('candidateLastName')} placeholder="Diallo" className={inputClass} />
            {errors.candidateLastName && <p className="text-xs text-red-500 mt-1">{errors.candidateLastName.message}</p>}
          </div>
        </div>

        {/* Contact (pour Magic Link) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email personnel (envoi Magic Link) *</label>
            <input {...register('candidateEmail')} type="email" placeholder="candidat@email.sn" className={inputClass} />
            {errors.candidateEmail && <p className="text-xs text-red-500 mt-1">{errors.candidateEmail.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Téléphone Mobile (SMS / WhatsApp) *</label>
            <input {...register('candidatePhone')} placeholder="+221 77 123 45 67" className={inputClass} />
            {errors.candidatePhone && <p className="text-xs text-red-500 mt-1">{errors.candidatePhone.message}</p>}
          </div>
        </div>

        {/* Affectation & Contrat */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Département d'affectation *</label>
            <select {...register('departmentId')} className={inputClass}>
              <option value="">Sélectionnez un département...</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.departmentId && <p className="text-xs text-red-500 mt-1">{errors.departmentId.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Type de contrat *</label>
            <select {...register('contractType')} className={inputClass}>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="stage">Stage</option>
              <option value="interim">Intérim / Journalier</option>
            </select>
          </div>
        </div>

        {/* Planning & Date d'embauche */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Planning horaire (ex: 3x8)</label>
            <select {...register('scheduleId')} className={inputClass}>
              <option value="">Horaire standard</option>
              {schedules.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Date de prise de poste prévue (Jour J) *</label>
            <input {...register('targetStartDate')} type="date" className={inputClass} />
            {errors.targetStartDate && <p className="text-xs text-red-500 mt-1">{errors.targetStartDate.message}</p>}
          </div>
        </div>

        {/* Période d'essai & Paie */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Période d'essai (mois)</label>
            <input
              {...register('probationDurationMonths', { valueAsNumber: true })}
              type="number"
              min={0}
              max={12}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Salaire de Base Brut (FCFA)</label>
            <input
              {...register('baseSalary', { valueAsNumber: true })}
              type="number"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Indemnité Transport (FCFA)</label>
            <input
              {...register('transportAllowance', { valueAsNumber: true })}
              type="number"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-on-surface/10">
          <Button variant="tertiary" type="button" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Créer la session & Générer le Magic Link
          </Button>
        </div>
      </form>
    </Modal>
  );
};
