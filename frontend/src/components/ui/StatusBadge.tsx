import React from 'react';
import { cn } from '../../lib/utils';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';

// Dictionnaire sémantique pour supprimer les tirets du bas et normaliser en français propre
const STATUS_DICTIONARY: Record<string, { label: string; variant: StatusVariant }> = {
  // Onboarding
  DRAFT: { label: 'Brouillon', variant: 'neutral' },
  INVITED: { label: 'Invité (En attente)', variant: 'warning' },
  COLLECTING_DATA: { label: 'Données en cours', variant: 'warning' },
  PENDING_SUBMISSION: { label: 'En attente candidat', variant: 'warning' },
  IN_REVIEW: { label: 'En révision RH', variant: 'info' },
  CHANGES_REQUESTED: { label: 'Modifications requises', variant: 'warning' },
  READY_FOR_DAY_ONE: { label: 'Prêt Jour J', variant: 'success' },
  FIRST_DAY_CHECKIN: { label: 'Présent Jour J', variant: 'success' },
  COMPLETED: { label: 'Terminé', variant: 'success' },
  CANCELLED: { label: 'Annulé', variant: 'neutral' },

  // Offboarding
  RESIGNATION_NOTICE: { label: 'Préavis démission', variant: 'info' },
  DOCUMENTS_PENDING: { label: 'Documents en attente', variant: 'warning' },
  EQUIPMENT_RETURN: { label: 'Restitution matériel', variant: 'warning' },
  SETTLEMENT_CALCULATED: { label: 'Solde tout compte calculé', variant: 'info' },
  EXIT_INTERVIEW_COMPLETED: { label: 'Entretien clôturé', variant: 'success' },
  TERMINATION_COMPLETED: { label: 'Départ finalisé', variant: 'neutral' },

  // Types de départ
  RESIGNATION: { label: 'Démission', variant: 'info' },
  DISMISSAL: { label: 'Licenciement', variant: 'error' },
  MUTUAL_AGREEMENT: { label: 'Rupture conventionnelle', variant: 'primary' },
  END_OF_CONTRACT: { label: 'Fin de contrat', variant: 'neutral' },
  RETIREMENT: { label: 'Retraite', variant: 'success' },

  // Employés & Utilisateurs
  ACTIVE: { label: 'Actif', variant: 'success' },
  INACTIVE: { label: 'Inactif', variant: 'neutral' },
  SUSPENDED: { label: 'Suspendu', variant: 'error' },
  ON_LEAVE: { label: 'En congé', variant: 'info' },

  // Demandes (Congés, Missions, Avances)
  PENDING: { label: 'En attente', variant: 'warning' },
  APPROVED: { label: 'Approuvé', variant: 'success' },
  REJECTED: { label: 'Refusé', variant: 'error' },
  ESCALATED: { label: 'Escaladé', variant: 'info' },
  PAID: { label: 'Payé', variant: 'success' },

  // Planification WFM
  PUBLISHED: { label: 'Publié', variant: 'success' },
  ARCHIVED: { label: 'Archivé', variant: 'neutral' },

  // Pointage & Présence
  ON_TIME: { label: 'À l’heure', variant: 'success' },
  LATE: { label: 'En retard', variant: 'warning' },
  ABSENT: { label: 'Absent', variant: 'error' },
  EARLY_DEPARTURE: { label: 'Départ anticipé', variant: 'warning' },
};

export interface StatusBadgeProps {
  status?: string | null;
  label?: string;
  variant?: StatusVariant;
  dot?: boolean;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label: customLabel,
  variant: customVariant,
  dot = true,
  pulse = false,
  size = 'md',
  className,
}) => {
  if (!status && !customLabel) return null;

  const normalizedKey = (status || '').toUpperCase().trim();
  const matched = STATUS_DICTIONARY[normalizedKey];

  // Suppression absolue de tous les tirets du bas
  const cleanLabel =
    customLabel ||
    matched?.label ||
    (status
      ? status
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase())
      : 'Inconnu');

  const variant = customVariant || matched?.variant || 'neutral';

  const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
    success: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    warning: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    error: {
      badge: 'bg-rose-50 text-rose-800 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    info: {
      badge: 'bg-sky-50 text-sky-800 border-sky-200/80',
      dot: 'bg-sky-500',
    },
    primary: {
      badge: 'bg-primary/10 text-primary border-primary/20',
      dot: 'bg-primary',
    },
    neutral: {
      badge: 'bg-surface-container-high/60 text-on-surface-variant border-on-surface/10',
      dot: 'bg-on-surface-variant/60',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        currentVariant.badge,
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                currentVariant.dot
              )}
            />
          )}
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', currentVariant.dot)} />
        </span>
      )}
      <span className="truncate">{cleanLabel}</span>
    </span>
  );
};
