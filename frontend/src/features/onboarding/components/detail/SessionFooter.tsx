import React from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2, UserCheck, CheckCheck } from 'lucide-react';
import type { OnboardingStatus } from '../../types';

interface Props {
  status?: OnboardingStatus;
  hasPendingDocs: boolean;
  isApproving: boolean;
  onCancel: () => void;
  onClose: () => void;
  onApprove: () => void;
}

export const SessionFooter: React.FC<Props> = ({
  status,
  hasPendingDocs,
  isApproving,
  onCancel,
  onClose,
  onApprove,
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      {/* Action destructive discrète à gauche */}
      <div>
        {status && status !== 'CANCELLED' && status !== 'COMPLETED' ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Annuler le parcours</span>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Actions de droite : Fermer (Outline sobre) + CTA Unique Primaire */}
      <div className="flex items-center gap-2.5">
        <Button variant="outline" size="md" onClick={onClose}>
          Fermer
        </Button>

        {status && status !== 'COMPLETED' && status !== 'CANCELLED' && (
          status === 'READY_FOR_DAY_ONE' ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold">
              <CheckCheck size={15} className="text-emerald-600" />
              <span>Prêt pour le Jour J (Déjà provisionné)</span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={onApprove}
              isLoading={isApproving}
              className="shadow-sm shadow-primary/20"
            >
              <UserCheck size={15} className="mr-2" />
              <span>
                {hasPendingDocs
                  ? 'Valider les pièces & Provisionner'
                  : 'Approuver le dossier & Provisionner au Jour J'}
              </span>
            </Button>
          )
        )}
      </div>
    </div>
  );
};
