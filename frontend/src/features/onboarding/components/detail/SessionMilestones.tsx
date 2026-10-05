import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { OnboardingStatus } from '../../types';

interface Props {
  progress: number;
  status: OnboardingStatus;
  docsCount: number;
  hasPendingDocs: boolean;
  hasRejectedDocs: boolean;
  pendingDocsCount: number;
}

export const SessionMilestones: React.FC<Props> = ({
  progress,
  status,
  docsCount,
  hasPendingDocs,
  hasRejectedDocs,
  pendingDocsCount,
}) => {
  const isCandidateStepDone = progress >= 50 || docsCount > 0;
  const isReviewStepDone = (status === 'READY_FOR_DAY_ONE' || status === 'COMPLETED') && !hasPendingDocs && !hasRejectedDocs;
  const isProvisionStepDone = status === 'READY_FOR_DAY_ONE' || status === 'COMPLETED';

  // Définition des 3 étapes
  const steps = [
    {
      id: 1,
      title: 'Dossier Candidat',
      subtitle: isCandidateStepDone ? 'Complété' : 'En saisie candidat',
      isCompleted: isCandidateStepDone,
      isCurrent: !isCandidateStepDone,
      hasError: false,
    },
    {
      id: 2,
      title: 'Revue Administrative RH',
      subtitle: hasRejectedDocs
        ? 'Pièce(s) rejetée(s)'
        : isReviewStepDone
        ? 'Validé'
        : hasPendingDocs
        ? `${pendingDocsCount} pièce(s) à valider`
        : 'En attente de pièces',
      isCompleted: isReviewStepDone,
      isCurrent: isCandidateStepDone && !isReviewStepDone,
      hasError: hasRejectedDocs,
    },
    {
      id: 3,
      title: 'Activation Jour J',
      subtitle: isProvisionStepDone ? 'Profil & PIN actifs' : 'À provisionner',
      isCompleted: isProvisionStepDone,
      isCurrent: isReviewStepDone && !isProvisionStepDone,
      hasError: false,
    },
  ];

  return (
    <div className="py-2">
      <div className="flex items-center w-full">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Point d'étape + Libellé */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Pastille numérotée / validée */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shrink-0 ${
                    step.hasError
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : step.isCompleted
                      ? 'bg-primary text-white shadow-2xs'
                      : step.isCurrent
                      ? 'border-2 border-primary text-primary bg-surface shadow-2xs'
                      : 'border border-on-surface/20 text-on-surface-variant bg-surface'
                  }`}
                >
                  {step.hasError ? (
                    <AlertCircle size={13} strokeWidth={2.5} />
                  ) : step.isCompleted ? (
                    <Check size={13} strokeWidth={3} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Textes de l'étape */}
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold tracking-tight truncate ${
                      step.hasError
                        ? 'text-rose-600 font-bold'
                        : step.isCompleted || step.isCurrent
                        ? 'text-on-surface font-bold'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`text-[11px] leading-tight truncate ${
                      step.hasError
                        ? 'text-rose-600 font-medium'
                        : step.isCurrent
                        ? 'text-primary font-medium'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {step.subtitle}
                  </p>
                </div>
              </div>

              {/* Trait de liaison (Rail continu) */}
              {!isLast && (
                <div className="flex-1 mx-3 h-px min-w-[24px]">
                  <div
                    className={`h-full w-full transition-all ${
                      steps[idx + 1].isCompleted || step.isCompleted
                        ? 'bg-primary/40'
                        : 'bg-on-surface/10'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
