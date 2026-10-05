import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';
import type { CandidateFormData, UploadedDocMeta } from './types';

interface Props {
  currentStep: number;
  formData: CandidateFormData;
  candidateName: string;
  candidateEmail: string;
  contractType: string;
  targetDate: string;
  paymentMode: 'bank' | 'mobile';
  uploadedCni: UploadedDocMeta | null;
  uploadedRib: UploadedDocMeta | null;
  taxParts: number;
  initials: string;
}

const STEP_URLS: Record<number, string> = {
  1: 'luminarh.sn/skyward-logistics/command',
  2: 'luminarh.sn/skyward-logistics/fleet',
  3: 'luminarh.sn/skyward-logistics/roles',
  4: 'luminarh.sn/skyward-logistics/live',
};

const STEP_IMAGES: Record<number, string> = {
  1: '/portal-step1.png',
  2: '/portal-step2.png',
  3: '/portal-step3.png',
  4: '/portal-step4.png',
};

export const PortalLiveMirror: React.FC<Props> = ({ currentStep }) => {
  const currentUrl = useMemo(() => {
    return STEP_URLS[currentStep] || STEP_URLS[1];
  }, [currentStep]);

  const currentImage = useMemo(() => {
    return STEP_IMAGES[currentStep] || STEP_IMAGES[1];
  }, [currentStep]);

  return (
    <div className="h-full w-full min-h-[480px] bg-[#F8FAFC] dark:bg-surface-container-low/30 pt-6 pl-6 sm:pt-8 sm:pl-8 flex flex-col justify-start overflow-hidden relative select-none">
      {/* Trame de fond micro-pointillée subtile (Tenmō style) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* ── Fenêtre de navigateur flottante (Offset Tenmō) ── */}
      <div className="w-full h-full rounded-tl-2xl border-t border-l border-slate-200/90 dark:border-on-surface/10 shadow-xl shadow-slate-900/[0.04] bg-white dark:bg-surface-container-lowest overflow-hidden flex flex-col">
        
        {/* ── 1. Barre de navigation réelle codée (Top Chrome Bar) ── */}
        <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-surface-container-low border-b border-slate-200/80 dark:border-on-surface/10 flex items-center justify-between shrink-0">
          {/* Pastilles macOS à gauche */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
          </div>

          {/* Barre d'adresse URL codée avec cadenas */}
          <div className="flex-1 max-w-[270px] sm:max-w-[320px] mx-auto bg-white dark:bg-surface-container-lowest border border-slate-200/80 dark:border-on-surface/10 rounded-md px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
            <Lock size={11} className="text-slate-400 shrink-0" />
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate">
              {currentUrl}
            </span>
          </div>

          {/* Espace d'équilibrage droit */}
          <div className="w-10 shrink-0" />
        </div>

        {/* ── 2. Zone d'affichage : Image de capture par phase du formulaire ── */}
        <div className="flex-1 w-full bg-slate-50 dark:bg-surface-container-low/40 overflow-y-auto overflow-x-hidden p-2 sm:p-3 relative flex items-start justify-center">
          <div className="w-full rounded-xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-on-surface/10 bg-white dark:bg-surface-container-lowest">
            <img
              key={currentStep}
              src={currentImage}
              alt={`Aperçu phase ${currentStep}`}
              className="w-full h-auto object-contain object-top transition-opacity duration-300 select-none block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

