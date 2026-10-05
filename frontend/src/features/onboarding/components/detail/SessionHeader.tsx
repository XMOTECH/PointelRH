import React, { useState } from 'react';
import { OnboardingStatusBadge } from '../OnboardingStatusBadge';
import { X, Calendar, Mail, Phone, Copy, Check, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import type { OnboardingStatus } from '../../types';

interface Props {
  candidateName: string;
  candidateRole: string;
  candidateEmail: string;
  candidatePhone: string;
  templateName: string;
  targetDateFormatted: string;
  status: OnboardingStatus;
  magicLink: string;
  onClose: () => void;
}

export const SessionHeader: React.FC<Props> = ({
  candidateName,
  candidateRole,
  candidateEmail,
  candidatePhone,
  templateName,
  targetDateFormatted,
  status,
  magicLink,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    toast.success('Lien d\'accès candidat copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  // Initiales (max 2 lettres)
  const initials = candidateName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'RH';

  // Dédoublonnage intelligent
  const isDuplicate =
    candidateRole &&
    templateName &&
    candidateRole.trim().toLowerCase() === templateName.trim().toLowerCase();
  const displayRole = candidateRole && !isDuplicate ? candidateRole : null;
  const displayTemplate = templateName || (!displayRole ? 'Collaborateur' : null);

  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-on-surface/10">
      <div className="flex items-start gap-3.5 min-w-0">
        {/* Avatar circulaire raffiné avec tokens LuminaRH */}
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-bold text-sm tracking-wider shrink-0 shadow-xs">
          {initials}
        </div>

        <div className="min-w-0 flex flex-col gap-1">
          {/* Ligne 1 : Nom complet + Badge Statut officiel */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold text-on-surface tracking-tight truncate">
              {candidateName}
            </h2>
            <OnboardingStatusBadge status={status} />
          </div>

          {/* Ligne 2 : Poste & Modèle d'onboarding (Dédoublonnés) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
            {displayRole && (
              <span className="font-semibold text-on-surface flex items-center gap-1">
                <Briefcase size={12} className="text-primary/70" />
                {displayRole}
              </span>
            )}
            {displayRole && displayTemplate && (
              <span className="text-on-surface-variant/40">•</span>
            )}
            {displayTemplate && (
              <span className="text-on-surface-variant font-medium">
                {displayTemplate}
              </span>
            )}
            <span className="text-on-surface-variant/40">•</span>
            <span className="inline-flex items-center gap-1 text-on-surface font-medium">
              <Calendar size={12} className="text-primary" />
              Prise de poste : <strong className="font-semibold">{targetDateFormatted}</strong>
            </span>
          </div>

          {/* Ligne 3 : Coordonnées cliquables (mailto / tel) */}
          {(candidateEmail || candidatePhone) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant mt-0.5">
              {candidateEmail && (
                <a
                  href={`mailto:${candidateEmail}`}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors font-mono"
                  title="Envoyer un email"
                >
                  <Mail size={12} className="text-on-surface-variant/60" />
                  {candidateEmail}
                </a>
              )}
              {candidateEmail && candidatePhone && (
                <span className="text-on-surface-variant/30">•</span>
              )}
              {candidatePhone && (
                <a
                  href={`tel:${candidatePhone}`}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors font-mono"
                  title="Appeler le candidat"
                >
                  <Phone size={12} className="text-on-surface-variant/60" />
                  {candidatePhone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions En-tête : Bouton Copier le lien + Fermer */}
      <div className="flex items-center gap-2 shrink-0">
        {magicLink && status !== 'CANCELLED' && status !== 'COMPLETED' && (
          <button
            type="button"
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              copied
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-on-surface/10 bg-surface-container-lowest hover:bg-surface-container text-on-surface hover:border-on-surface/20 shadow-xs'
            }`}
            title="Copier le lien d'accès sécurisé pour le candidat"
          >
            {copied ? (
              <Check size={13} className="text-emerald-700" />
            ) : (
              <Copy size={13} className="text-primary" />
            )}
            <span>{copied ? 'Lien copié' : 'Copier lien candidat'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

