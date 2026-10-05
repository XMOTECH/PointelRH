import React from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { CandidateFormData } from '../types';

interface Props {
  formData: CandidateFormData;
  onChange: (field: keyof CandidateFormData, value: any) => void;
  onNext: () => void;
}

const inputClass =
  'w-full h-10 px-3 rounded-xl bg-white dark:bg-surface-container-low border border-slate-200 dark:border-on-surface/10 text-sm text-slate-800 dark:text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors';
const labelClass = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

export const IdentityStep: React.FC<Props> = ({ formData, onChange, onNext }) => {
  const handleProceed = () => {
    if (!formData.nationalIdNumber.trim()) {
      toast.error('Veuillez renseigner votre NIN CNI');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-on-surface">
          État civil
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Informations pour votre déclaration légale IPRES et CSS.
        </p>
      </div>

      <div className="space-y-3.5 pt-1">
        <div>
          <label className={labelClass}>Numéro d'identification nationale (NIN) *</label>
          <input
            value={formData.nationalIdNumber}
            onChange={(e) => onChange('nationalIdNumber', e.target.value)}
            placeholder="Ex: 1 755 1995 01234"
            className={inputClass}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date de naissance *</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => onChange('birthDate', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Lieu de naissance *</label>
            <input
              value={formData.birthPlace}
              onChange={(e) => onChange('birthPlace', e.target.value)}
              placeholder="Dakar, Thiès..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Situation matrimoniale *</label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => onChange('maritalStatus', e.target.value)}
              className={inputClass}
            >
              <option value="single">Célibataire (1.0 part)</option>
              <option value="married">Marié(e) (1.5 parts)</option>
              <option value="divorced">Divorcé(e)</option>
              <option value="widowed">Veuf / Veuve</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Nombre d'enfants à charge</label>
            <input
              type="number"
              min={0}
              max={15}
              value={formData.childrenCount}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                onChange('childrenCount', isNaN(v) ? 0 : Math.max(0, Math.min(15, v)));
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Adresse de résidence actuelle *</label>
          <input
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Commune, Ville (ex: Cité Keur Gorgui, Dakar)"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-on-surface/5">
        <Button
          variant="primary"
          onClick={handleProceed}
          className="h-9 px-5 text-xs font-semibold rounded-xl shadow-sm"
        >
          <span>Continuer</span>
          <ArrowRight size={14} className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
