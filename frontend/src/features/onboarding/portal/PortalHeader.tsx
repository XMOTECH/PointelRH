import React from 'react';
import { LuminaLogo } from '@/components/ui/LuminaLogo';
import { Eye } from 'lucide-react';

interface Props {
  currentStep: number;
  companyName: string;
  showMobilePreview: boolean;
  onToggleMobilePreview: () => void;
}

const STEP_LABELS = ['État civil', 'Paiement & Tailles', 'Documents', 'Finalisation'];

export const PortalHeader: React.FC<Props> = ({
  currentStep,
  companyName: _companyName,
  showMobilePreview: _showMobilePreview,
  onToggleMobilePreview,
}) => {

  return (
    <header className="w-full max-w-5xl flex items-center justify-between py-4 px-2">
      <div className="flex items-center gap-3">
        <LuminaLogo size="sm" />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 font-mono">
          {currentStep <= 3 ? `0${currentStep}/03 · ${STEP_LABELS[currentStep - 1]}` : 'TERMINÉ'}
        </span>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((step) => {
            const isActive = currentStep === step;
            const isDone = currentStep > step;
            return (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'w-4 bg-primary'
                    : isDone
                    ? 'w-1.5 bg-primary/60'
                    : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={onToggleMobilePreview}
          className="lg:hidden ml-1 p-1 rounded-md text-slate-500 border border-slate-200 text-xs flex items-center gap-1"
        >
          <Eye size={13} />
          <span>Aperçu</span>
        </button>
      </div>
    </header>
  );
};
