import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { employeesApi } from '@/features/employees/api/employees.api';
import { useOffboardingTemplates, useCreateOffboardingSession } from '../hooks/useOffboarding';
import type { DepartureReason, NoticePeriodType } from '../types';

interface CreateOffboardingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEPARTURE_REASONS: Array<{ value: DepartureReason; label: string }> = [
  { value: 'RESIGNATION', label: 'Démission du salarié' },
  { value: 'DISMISSAL', label: 'Licenciement' },
  { value: 'END_OF_CONTRACT', label: 'Fin de contrat CDD / Mission' },
  { value: 'TRIAL_PERIOD_TERMINATION', label: 'Fin de période d\'essai' },
  { value: 'MUTUAL_AGREEMENT', label: 'Rupture conventionnelle' },
  { value: 'RETIREMENT', label: 'Départ à la retraite' },
  { value: 'OTHER', label: 'Autre motif' },
];

const NOTICE_PERIOD_TYPES: Array<{ value: NoticePeriodType; label: string }> = [
  { value: 'WORKED', label: 'Préavis effectué normalement' },
  { value: 'EXEMPTED_PAID', label: 'Dispensé de préavis (rémunéré)' },
  { value: 'EXEMPTED_UNPAID', label: 'Dispensé de préavis (non rémunéré)' },
  { value: 'NONE', label: 'Aucun préavis' },
];

export const CreateOffboardingModal: React.FC<CreateOffboardingModalProps> = ({ open, onClose, onSuccess }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [departureReason, setDepartureReason] = useState<DepartureReason>('RESIGNATION');
  const [noticePeriodType, setNoticePeriodType] = useState<NoticePeriodType>('WORKED');
  const [notificationDate, setNotificationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lastWorkingDate, setLastWorkingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [contractEndDate, setContractEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [templateId, setTemplateId] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees', 'active'],
    queryFn: () => employeesApi.getEmployees({ status: 'active' }),
    enabled: open,
  });

  const { data: templates = [] } = useOffboardingTemplates();
  const createMutation = useCreateOffboardingSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!employeeId) {
      setErrorMsg('Veuillez sélectionner un collaborateur.');
      return;
    }
    if (!lastWorkingDate || !contractEndDate) {
      setErrorMsg('Veuillez renseigner les dates clés de départ.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        employeeId,
        departureReason,
        noticePeriodType,
        notificationDate,
        lastWorkingDate,
        contractEndDate,
        templateId: templateId || undefined,
        handoverNotes: handoverNotes || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || 'Une erreur est survenue lors de l\'initiation du départ.',
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Initier une procédure de départ (Offboarding)"
    >
      <p className="text-xs text-on-surface-variant -mt-2 mb-4">
        Définissez les dates clés et la checklist pour orchestrer la sortie du collaborateur en conformité.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {errorMsg && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Sélection du collaborateur */}
        <div>
          <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
            Collaborateur concerné *
          </label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={loadingEmployees}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          >
            <option value="">Sélectionnez un employé...</option>
            {employees.map((emp: any) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name || emp.firstName} {emp.last_name || emp.lastName} — {emp.job_title || emp.jobTitle || 'Employé'} ({emp.department?.name || 'Département'})
              </option>
            ))}
          </select>
        </div>

        {/* Motif du départ & Préavis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Motif du départ *
            </label>
            <select
              value={departureReason}
              onChange={(e) => setDepartureReason(e.target.value as DepartureReason)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            >
              {DEPARTURE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Régime de préavis
            </label>
            <select
              value={noticePeriodType}
              onChange={(e) => setNoticePeriodType(e.target.value as NoticePeriodType)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {NOTICE_PERIOD_TYPES.map((np) => (
                <option key={np.value} value={np.value}>
                  {np.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates clés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Date de notification
            </label>
            <input
              type="date"
              value={notificationDate}
              onChange={(e) => setNotificationDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Dernier jour travaillé *
            </label>
            <input
              type="date"
              value={lastWorkingDate}
              onChange={(e) => setLastWorkingDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Fin officielle contrat *
            </label>
            <input
              type="date"
              value={contractEndDate}
              onChange={(e) => setContractEndDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
        </div>

        {/* Modèle de checklist */}
        <div>
          <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
            Modèle de checklist d'offboarding
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Checklist standard par défaut (recommandée)</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} ({tpl.templateTasks?.length || 0} tâches)
              </option>
            ))}
          </select>
        </div>

        {/* Notes initiales */}
        <div>
          <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
            Notes préliminaires de passation (optionnel)
          </label>
          <textarea
            value={handoverNotes}
            onChange={(e) => setHandoverNotes(e.target.value)}
            rows={2}
            placeholder="Ex: Dossiers prioritaires à transférer, contacts remplaçants..."
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-on-surface/10">
          <Button variant="tertiary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Lancer l'Offboarding
          </Button>
        </div>
      </form>
    </Modal>
  );
};
