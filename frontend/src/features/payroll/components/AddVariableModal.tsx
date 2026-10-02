import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { useAddPayrollVariable } from '../hooks/usePayroll';
import type { Payslip } from '../types';

interface AddVariableModalProps {
  open: boolean;
  onClose: () => void;
  month: number;
  year: number;
  payslips?: Payslip[];
}

export const AddVariableModal: React.FC<AddVariableModalProps> = ({
  open,
  onClose,
  month,
  year,
  payslips = [],
}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState<'PRIME' | 'INDEMNITE' | 'RETENUE' | 'AVANCE'>('PRIME');
  const [code, setCode] = useState('PRIME_RENDEMENT');
  const [label, setLabel] = useState('Prime de Rendement');
  const [amount, setAmount] = useState<number>(50000);
  const [isTaxable, setIsTaxable] = useState(true);
  const [isSubjectToSocial, setIsSubjectToSocial] = useState(true);
  const [notes, setNotes] = useState('');

  const addVariable = useAddPayrollVariable();

  const handleTypeChange = (newType: 'PRIME' | 'INDEMNITE' | 'RETENUE' | 'AVANCE') => {
    setType(newType);
    if (newType === 'PRIME') {
      setCode('PRIME_PERF');
      setLabel('Prime de Performance');
      setIsTaxable(true);
      setIsSubjectToSocial(true);
    } else if (newType === 'INDEMNITE') {
      setCode('INDEMNITE_DEPLACEMENT');
      setLabel('Indemnité de déplacement');
      setIsTaxable(false);
      setIsSubjectToSocial(false);
    } else if (newType === 'RETENUE') {
      setCode('RETENUE_DIVERS');
      setLabel('Retenue sur salaire');
      setIsTaxable(false);
      setIsSubjectToSocial(false);
    } else if (newType === 'AVANCE') {
      setCode('ACOMPTE_SALAIRE');
      setLabel('Acompte exceptionnel');
      setIsTaxable(false);
      setIsSubjectToSocial(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    await addVariable.mutateAsync({
      employeeId,
      month,
      year,
      dto: {
        type,
        code,
        label,
        amount: Number(amount),
        isTaxable,
        isSubjectToSocial,
        notes: notes || undefined,
      },
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter une Variable de Paie (Prime / Retenue)"
      className="sm:max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Employee selector */}
        <div className="space-y-1.5">
          <Label htmlFor="employee">Collaborateur concerné</Label>
          <select
            id="employee"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
          >
            <option value="">Sélectionnez un employé...</option>
            {payslips.map((p) => (
              <option key={p.employeeId} value={p.employeeId}>
                {p.employee?.firstName} {p.employee?.lastName} ({p.employee?.department?.name || 'Général'})
              </option>
            ))}
          </select>
        </div>

        {/* Type selector */}
        <div className="space-y-1.5">
          <Label>Nature de la rubrique</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['PRIME', 'INDEMNITE', 'RETENUE', 'AVANCE'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  type === t
                    ? 'border-primary bg-primary text-on-primary shadow-sm'
                    : 'border-outline-variant/20 bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Label & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="label">Libellé affiché</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex: Prime de Panier"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code">Code rubrique</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ex: PRIME_PANIER"
              required
            />
          </div>
        </div>

        {/* Montant (FCFA) */}
        <div className="space-y-1.5">
          <Label htmlFor="amount">Montant (FCFA)</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step={500}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
            className="font-mono text-base font-bold"
          />
        </div>

        {/* Fiscal & Social options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-surface-container-low/30 rounded-xl border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold cursor-pointer">Imposable (CGI)</Label>
              <p className="text-[10px] text-on-surface-variant">Soumis à l'Impôt sur le Revenu</p>
            </div>
            <Switch checked={isTaxable} onCheckedChange={setIsTaxable} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold cursor-pointer">Soumis Cotisations</Label>
              <p className="text-[10px] text-on-surface-variant">Soumis IPRES / CSS</p>
            </div>
            <Switch checked={isSubjectToSocial} onCheckedChange={setIsSubjectToSocial} />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Commentaire ou justificatif (optionnel)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ex: Accord direction générale du 15..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={addVariable.isPending}>
            {addVariable.isPending ? 'Enregistrement...' : 'Enregistrer la Variable'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
