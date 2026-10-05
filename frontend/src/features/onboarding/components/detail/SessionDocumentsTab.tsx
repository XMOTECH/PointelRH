import React from 'react';
import { FileText, Eye, Check, XCircle, CreditCard, IdCard, AlertCircle } from 'lucide-react';
import type { EmployeeDocument } from '../../types';

interface Props {
  docs: any[];
  hasPendingDocs: boolean;
  pendingDocsCount: number;
  onValidateAllDocs?: () => void;
  isValidatingAll?: boolean;
  onReviewDoc: (doc: EmployeeDocument) => void;
  docTypeLabels: Record<string, string>;
}

function getDocIcon(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('cni') || t.includes('passport') || t.includes('identity')) {
    return <IdCard size={18} className="text-primary" />;
  }
  if (t.includes('rib') || t.includes('bank') || t.includes('wave')) {
    return <CreditCard size={18} className="text-emerald-700" />;
  }
  return <FileText size={18} className="text-on-surface-variant" />;
}

export const SessionDocumentsTab: React.FC<Props> = ({
  docs,
  hasPendingDocs,
  pendingDocsCount,
  onReviewDoc,
  docTypeLabels,
}) => {
  if (docs.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-on-surface/10 rounded-xl">
        Aucune pièce justificative déposée pour le moment par le candidat.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── 1. Statut épuré (Sans point clignotant ni badge bonbon) ── */}
      {hasPendingDocs ? (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface-container-low border border-on-surface/5 text-xs">
          <span className="font-semibold text-on-surface">
            {pendingDocsCount} pièce{pendingDocsCount > 1 ? 's' : ''} justificative{pendingDocsCount > 1 ? 's' : ''} en attente de vérification
          </span>
          <span className="text-[11px] text-on-surface-variant font-normal">
            Cliquez sur « Examiner » pour prévisualiser le document original
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-low border border-on-surface/5 text-xs text-emerald-800">
          <Check size={14} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Toutes les pièces justificatives sont vérifiées et validées.
          </span>
        </div>
      )}

      {/* ── 2. Tableau de documents aligné (Typographie pure, zéro badge ovale) ── */}
      <div className="rounded-xl border border-on-surface/10 bg-surface overflow-hidden divide-y divide-on-surface/5 shadow-2xs">
        {/* En-tête des colonnes */}
        <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-surface-container-low/40 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
          <div className="col-span-7">Pièce justificative & Fichier</div>
          <div className="col-span-3 text-center">État</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* Lignes de documents */}
        {docs.map((doc: any) => {
          const docTypeKey = (doc.documentType || doc.document_type || '').toLowerCase();
          const docLabel = docTypeLabels[docTypeKey] || doc.documentType || doc.document_type;
          const isDocValidated = doc.status === 'VALIDATED';
          const isDocRejected = doc.status === 'REJECTED';
          const rejectionReason = doc.rejectionReason || doc.rejection_reason;

          return (
            <div
              key={doc.id}
              className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-surface-container-low/30 transition-colors"
            >
              {/* Colonne 1: Icône + Titre + Fichier */}
              <div className="col-span-7 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                  {getDocIcon(docTypeKey)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-on-surface truncate">
                    {docLabel}
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-mono truncate mt-0.5">
                    {doc.fileName || doc.file_name}
                  </p>
                  {rejectionReason && (
                    <p className="text-[11px] text-rose-600 font-medium mt-0.5 flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      Rejet : {rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Colonne 2: Typographie pure (Sans badge bonbon) */}
              <div className="col-span-3 text-center">
                {isDocValidated ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                    <Check size={13} strokeWidth={2.5} />
                    <span>Validé</span>
                  </span>
                ) : isDocRejected ? (
                  <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
                    <XCircle size={13} />
                    <span>Rejeté</span>
                  </span>
                ) : (
                  <span className="text-on-surface-variant font-medium text-xs">
                    À vérifier
                  </span>
                )}
              </div>

              {/* Colonne 3: Bouton Examiner & Visualiser */}
              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onReviewDoc(doc)}
                  className="h-7.5 px-3 rounded-lg border border-on-surface/15 bg-surface hover:bg-surface-container text-on-surface text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Eye size={12} className="text-on-surface-variant" />
                  <span>Examiner</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
