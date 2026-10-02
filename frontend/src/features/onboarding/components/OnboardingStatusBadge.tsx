import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { OnboardingStatus } from '../types';

interface Props {
  status: OnboardingStatus;
  className?: string;
}

const statusConfig: Record<
  OnboardingStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }
> = {
  DRAFT: { label: 'Brouillon', variant: 'default' },
  INVITED: { label: 'Invitation envoyée', variant: 'info' },
  COLLECTING_DATA: { label: 'Candidat en saisie', variant: 'warning' },
  IN_REVIEW: { label: 'À vérifier (RH/HSE)', variant: 'warning' },
  PROVISIONING: { label: 'Provisionnement...', variant: 'info' },
  READY_FOR_DAY_ONE: { label: 'Prêt Jour J (Actif)', variant: 'success' },
  IN_ORIENTATION: { label: 'Période d\'essai', variant: 'info' },
  COMPLETED: { label: 'Titularisé (Clôturé)', variant: 'success' },
  CANCELLED: { label: 'Annulé', variant: 'error' },
};

export const OnboardingStatusBadge: React.FC<Props> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, variant: 'default' };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
