import React, { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, UploadCloud, CreditCard } from 'lucide-react';
import type { UploadedDocMeta } from '../types';

interface Props {
  uploadedCni: UploadedDocMeta | null;
  uploadedRib: UploadedDocMeta | null;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>, docType: 'cni' | 'rib') => void;
  onSubmit: () => void;
  onPrev: () => void;
  isUploading: boolean;
  isSubmitting: boolean;
}

export const DocumentsStep: React.FC<Props> = ({
  uploadedCni,
  uploadedRib,
  onUploadFile,
  onSubmit,
  onPrev,
  isUploading,
  isSubmitting,
}) => {
  const cniInputRef = useRef<HTMLInputElement>(null);
  const ribInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {/* En-tête de section sobre */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-on-surface">
          Pièces justificatives
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Photos ou PDF de vos justificatifs (max 10 Mo par document).
        </p>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={cniInputRef}
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => onUploadFile(e, 'cni')}
      />
      <input
        type="file"
        ref={ribInputRef}
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => onUploadFile(e, 'rib')}
      />

      {/* Cartes d'upload interactives (Style Tenmō / Stripe Identity) */}
      <div className="space-y-3 pt-1">
        
        {/* 1. Carte CNI */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => cniInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && cniInputRef.current?.click()}
          className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
            uploadedCni
              ? 'bg-emerald-50/30 border-emerald-500/30 dark:bg-emerald-500/5'
              : 'bg-white border-slate-200/90 hover:border-primary/40 hover:bg-slate-50/50 dark:bg-surface-container-low dark:border-on-surface/10'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                uploadedCni
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200/70 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20'
              }`}
            >
              {uploadedCni ? <CheckCircle2 size={18} /> : <FileText size={18} />}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-on-surface truncate">
                Pièce d'identité (CNI ou Passeport)
              </p>
              {uploadedCni ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-medium truncate mt-0.5">
                  ✓ {uploadedCni.fileName} · {(uploadedCni.fileSize / 1024).toFixed(0)} Ko
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5 group-hover:text-primary transition-colors">
                  Cliquez pour déposer votre fichier
                </p>
              )}
            </div>
          </div>

          {/* Badge d'état subtil à droite (au lieu d'un gros bouton) */}
          <div className="shrink-0">
            {uploadedCni ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Reçu</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/25 transition-all">
                <UploadCloud size={13} />
                <span>Requis</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Carte RIB */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => ribInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && ribInputRef.current?.click()}
          className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
            uploadedRib
              ? 'bg-emerald-50/30 border-emerald-500/30 dark:bg-emerald-500/5'
              : 'bg-white border-slate-200/90 hover:border-primary/40 hover:bg-slate-50/50 dark:bg-surface-container-low dark:border-on-surface/10'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                uploadedRib
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200/70 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20'
              }`}
            >
              {uploadedRib ? <CheckCircle2 size={18} /> : <CreditCard size={18} />}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-on-surface truncate">
                Justificatif bancaire (RIB ou Wave)
              </p>
              {uploadedRib ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-medium truncate mt-0.5">
                  ✓ {uploadedRib.fileName} · {(uploadedRib.fileSize / 1024).toFixed(0)} Ko
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5 group-hover:text-primary transition-colors">
                  Attestation de compte ou capture d'écran
                </p>
              )}
            </div>
          </div>

          {/* Badge d'état à droite */}
          <div className="shrink-0">
            {uploadedRib ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Reçu</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/80 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/25 transition-all">
                <span>Optionnel</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Barre d'action inférieure : Une seule action primaire évidente */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-on-surface/5">
        <Button
          variant="outline"
          onClick={onPrev}
          className="h-10 px-4 text-xs font-semibold rounded-xl text-slate-700"
        >
          <ArrowLeft size={13} className="mr-1.5" />
          <span>Retour</span>
        </Button>

        <Button
          variant="primary"
          onClick={onSubmit}
          isLoading={isSubmitting || isUploading}
          className="h-10 px-6 text-xs font-bold rounded-xl shadow-sm"
        >
          <span>Valider mon dossier</span>
          <ArrowRight size={14} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
