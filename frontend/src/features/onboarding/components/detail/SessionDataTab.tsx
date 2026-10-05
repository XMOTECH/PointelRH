import React, { useState } from 'react';
import { 
  UserCheck, 
  Landmark, 
  ShieldAlert, 
  Copy, 
  Check, 
  HelpCircle, 
  PhoneCall, 
  Smartphone,
  Info
} from 'lucide-react';

interface Props {
  staging: Record<string, any>;
}

const MARITAL_STATUS_LABELS: Record<string, string> = {
  single: 'Célibataire',
  married: 'Marié(e)',
  divorced: 'Divorcé(e)',
  widowed: 'Veuf / Veuve',
  pacs: 'Pacsé(e)',
  celibataire: 'Célibataire',
  marie: 'Marié(e)',
  divorce: 'Divorcé(e)',
  veuf: 'Veuf / Veuve',
};

export const SessionDataTab: React.FC<Props> = ({ staging }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const rawMarital = (staging.maritalStatus || staging.marital_status || '').toLowerCase();
  const localizedMarital = MARITAL_STATUS_LABELS[rawMarital] || staging.maritalStatus || staging.marital_status || '—';

  const nationalId = staging.nationalIdNumber || staging.national_id_number || '—';
  const birthDate = staging.birthDate || staging.birth_date || '—';
  const birthPlace = staging.birthPlace || staging.birth_place;
  const childrenCount = staging.childrenCount ?? staging.children_count ?? 0;
  const taxParts = staging.calculatedTaxParts ?? staging.calculated_tax_parts ?? 1.0;

  const bankRib = staging.bankRib || staging.bank_rib;
  const mobileMoney = staging.mobileMoneyNumber || staging.mobile_money_number;
  const paymentMethod = staging.paymentMethod || staging.payment_method || (bankRib ? 'bank_transfer' : mobileMoney ? 'mobile_money' : null);

  const emergencyName = staging.emergencyContactName || staging.emergency_contact_name || '—';
  const emergencyRelation = staging.emergencyContactRelation || staging.emergency_contact_relation;
  const emergencyPhone = staging.emergencyContactPhone || staging.emergency_contact_phone || '—';
  const shoeSize = staging.shoeSize || staging.shoe_size;
  const clothingSize = staging.clothingSize || staging.clothing_size;

  const cardContainerClass = "bg-surface-container-lowest border border-on-surface/10 rounded-xl p-4 flex flex-col gap-3.5 transition-all";
  const rowClass = "flex justify-between items-center py-2 border-b border-on-surface/5 last:border-b-0 text-xs";
  const labelClass = "text-on-surface-variant font-medium";

  return (
    <div className="flex flex-col gap-4 pt-1">
      {/* Grille supérieure : 1. Foyer Fiscal & 2. Règlement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PÔLE 1 : État Civil & Foyer Fiscal */}
        <div className={cardContainerClass}>
          <div className="flex items-center justify-between pb-2 border-b border-on-surface/10">
            <div className="flex items-center gap-2 text-primary">
              <UserCheck size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                État Civil & Foyer Fiscal
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-on-surface-variant/70 uppercase">
              SN / CGI
            </span>
          </div>

          <div className="flex flex-col">
            <div className={rowClass}>
              <span className={labelClass}>Numéro CNI / NIN</span>
              <div className="flex items-center gap-1.5">
                <span className="text-on-surface font-mono font-semibold">
                  {nationalId}
                </span>
                {nationalId !== '—' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(nationalId, 'nin')}
                    title="Copier le NIN"
                    className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container transition-colors"
                  >
                    {copiedKey === 'nin' ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Date & lieu de naissance</span>
              <span className="text-on-surface font-semibold text-right">
                {birthDate} {birthPlace ? <span className="text-on-surface-variant font-normal">({birthPlace})</span> : ''}
              </span>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Situation matrimoniale</span>
              <span className="text-on-surface font-semibold">
                {localizedMarital}
              </span>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Enfants à charge</span>
              <span className="text-on-surface font-mono font-semibold">
                {childrenCount} {childrenCount > 1 ? 'enfants' : 'enfant'}
              </span>
            </div>
          </div>

          {/* Synthèse Fiscale Intégrée */}
          <div className="mt-auto pt-2 border-t border-on-surface/10 flex items-center justify-between bg-primary/[0.03] -mx-4 -mb-4 p-3 rounded-b-xl">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Info size={13} className="text-primary" />
              <span>Parts fiscales IR (art. 124 CGI)</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-primary/10 text-primary border border-primary/20">
              {Number(taxParts).toFixed(1)} {taxParts > 1 ? 'parts' : 'part'}
            </span>
          </div>
        </div>

        {/* PÔLE 2 : Versement & Coordonnées Bancaires */}
        <div className={cardContainerClass}>
          <div className="flex items-center justify-between pb-2 border-b border-on-surface/10">
            <div className="flex items-center gap-2 text-primary">
              <Landmark size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Coordonnées de Règlement Paie
              </h4>
            </div>
            {paymentMethod && (
              <span className="text-[10px] font-semibold text-primary/80 uppercase">
                {paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Virement'}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <div className={rowClass}>
              <span className={labelClass}>Canal de versement</span>
              <span className="text-on-surface font-semibold flex items-center gap-1.5">
                {paymentMethod === 'mobile_money' ? (
                  <>
                    <Smartphone size={13} className="text-blue-500" />
                    Wave / Orange Money
                  </>
                ) : bankRib ? (
                  <>
                    <Landmark size={13} className="text-primary" />
                    Virement Bancaire (UEMOA)
                  </>
                ) : (
                  'Non défini'
                )}
              </span>
            </div>

            {/* Détails Compte / RIB */}
            <div className={rowClass}>
              <span className={labelClass}>{paymentMethod === 'mobile_money' ? 'Numéro de compte' : 'Compte / RIB (24 pos.)'}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-on-surface font-mono font-semibold text-right tracking-tight">
                  {bankRib || mobileMoney || '—'}
                </span>
                {(bankRib || mobileMoney) && (
                  <button
                    type="button"
                    onClick={() => handleCopy(bankRib || mobileMoney, 'rib')}
                    title="Copier les coordonnées"
                    className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container transition-colors"
                  >
                    {copiedKey === 'rib' ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Titularité du compte</span>
              <span className="text-on-surface font-semibold text-right">
                Identique au salarié (Vérifié)
              </span>
            </div>
          </div>

          <div className="mt-auto pt-2 border-t border-on-surface/10 flex items-center justify-between text-[11px] text-on-surface-variant bg-surface-container-low/50 -mx-4 -mb-4 p-3 rounded-b-xl">
            <span>Versement automatisé SEPA / UEMOA</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              Prêt pour émission
            </span>
          </div>
        </div>
      </div>

      {/* PÔLE 3 : Santé, Sécurité & Dotation Terrain (Pleine largeur responsive) */}
      <div className={cardContainerClass}>
        <div className="flex items-center justify-between pb-2 border-b border-on-surface/10">
          <div className="flex items-center gap-2 text-amber-600">
            <ShieldAlert size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Santé, Sécurité au Travail & Équipements (EPI)
            </h4>
          </div>
          <span className="text-[10px] font-semibold text-on-surface-variant/70 uppercase">
            Norme HSE & Conformité
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {/* Sous-bloc : Contact d'urgence */}
          <div className="flex flex-col">
            <div className={rowClass}>
              <span className={labelClass}>Personne à prévenir d'urgence</span>
              <span className="text-on-surface font-semibold">
                {emergencyName} {emergencyRelation ? <span className="text-on-surface-variant font-normal">({emergencyRelation})</span> : ''}
              </span>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Téléphone d'urgence</span>
              <div className="flex items-center gap-2">
                {emergencyPhone !== '—' && (
                  <a
                    href={`tel:${emergencyPhone}`}
                    className="flex items-center gap-1 text-primary hover:underline font-mono font-semibold"
                  >
                    <PhoneCall size={12} />
                    {emergencyPhone}
                  </a>
                )}
                {emergencyPhone === '—' && <span className="text-on-surface-variant">—</span>}
              </div>
            </div>
          </div>

          {/* Sous-bloc : Dotation EPI */}
          <div className="flex flex-col">
            <div className={rowClass}>
              <span className={labelClass}>Pointure chaussures de sécurité</span>
              <span className="text-on-surface font-semibold">
                {shoeSize ? `Taille ${shoeSize}` : <span className="text-on-surface-variant font-normal">Non requise / Non renseignée</span>}
              </span>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Taille combinaison / Vêtements</span>
              <span className="text-on-surface font-semibold">
                {clothingSize ? `Taille ${clothingSize}` : <span className="text-on-surface-variant font-normal">Non requise / Non renseignée</span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

