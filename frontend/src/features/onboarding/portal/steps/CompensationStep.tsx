import React from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import type { CandidateFormData } from '../types';

interface Props {
  formData: CandidateFormData;
  paymentMode: 'bank' | 'mobile';
  setPaymentMode: (mode: 'bank' | 'mobile') => void;
  onChange: (field: keyof CandidateFormData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const inputClass =
  'w-full h-10 px-3 rounded-xl bg-white dark:bg-surface-container-low border border-slate-200 dark:border-on-surface/10 text-sm text-slate-800 dark:text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors';
const labelClass = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

export const CompensationStep: React.FC<Props> = ({
  formData,
  paymentMode,
  setPaymentMode,
  onChange,
  onNext,
  onPrev,
}) => {
  const handleProceed = () => {
    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim()) {
      toast.error('Le contact d\'urgence est requis pour votre sécurité sur site');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-on-surface">
          Paiement & Tailles
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Coordonnées de versement du salaire et mensurations de dotation.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        {/* Payment Mode Selector */}
        <div>
          <label className={labelClass}>Mode de versement du salaire *</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/70 dark:bg-surface-container-low rounded-xl">
            <button
              type="button"
              onClick={() => setPaymentMode('bank')}
              className={`flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                paymentMode === 'bank'
                  ? 'bg-white dark:bg-surface-container-lowest text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard size={14} />
              <span>Virement (RIB)</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('mobile')}
              className={`flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                paymentMode === 'mobile'
                  ? 'bg-white dark:bg-surface-container-lowest text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone size={14} />
              <span>Wave / OM</span>
            </button>
          </div>
        </div>

        {paymentMode === 'bank' ? (
          <div>
            <label className={labelClass}>Relevé d'identité bancaire (RIB)</label>
            <input
              value={formData.bankRib}
              onChange={(e) => onChange('bankRib', e.target.value)}
              placeholder="SN012 01001 012345678901 45"
              className={inputClass}
            />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Numéro Wave ou Orange Money</label>
            <input
              value={formData.mobileMoneyNumber}
              onChange={(e) => onChange('mobileMoneyNumber', e.target.value)}
              placeholder="+221 77 000 00 00"
              className={inputClass}
            />
          </div>
        )}

        {/* Tailles EPI */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Pointure de chaussures</label>
            <select
              value={formData.shoeSize}
              onChange={(e) => onChange('shoeSize', e.target.value)}
              className={inputClass}
            >
              {['39', '40', '41', '42', '43', '44', '45', '46'].map((sz) => (
                <option key={sz} value={sz}>
                  Taille {sz}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Taille vêtements de travail</label>
            <select
              value={formData.clothingSize}
              onChange={(e) => onChange('clothingSize', e.target.value)}
              className={inputClass}
            >
              {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact d'urgence */}
        <div className="pt-2 border-t border-slate-100 dark:border-on-surface/5">
          <label className={labelClass}>Contact d'urgence sur site *</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              value={formData.emergencyContactName}
              onChange={(e) => onChange('emergencyContactName', e.target.value)}
              placeholder="Nom complet"
              className={inputClass}
            />
            <input
              value={formData.emergencyContactPhone}
              onChange={(e) => onChange('emergencyContactPhone', e.target.value)}
              placeholder="Téléphone"
              className={inputClass}
            />
            <input
              value={formData.emergencyContactRelation}
              onChange={(e) => onChange('emergencyContactRelation', e.target.value)}
              placeholder="Lien (Parent...)"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-on-surface/5">
        <Button variant="outline" onClick={onPrev} className="h-9 px-4 text-xs font-semibold rounded-xl">
          <ArrowLeft size={13} className="mr-1" />
          <span>Retour</span>
        </Button>
        <Button variant="primary" onClick={handleProceed} className="h-9 px-5 text-xs font-semibold rounded-xl shadow-sm">
          <span>Continuer</span>
          <ArrowRight size={14} className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
