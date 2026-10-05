import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ExternalLink,
  IdCard,
  CreditCard,
} from 'lucide-react';

import { toast } from 'sonner';
import type { EmployeeDocument } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  document: EmployeeDocument | null;
  onReview: (docId: string, status: 'VALIDATED' | 'REJECTED', reason?: string) => void;
  isLoading?: boolean;
}

const docTypeLabels: Record<string, string> = {
  cni: "Carte Nationale d'Identité (NIN / CNI CEDEAO)",
  passport: 'Passeport Officiel',
  rib: 'Relevé d\'Identité Bancaire (RIB / Compte Wave)',
  medical_certificate: 'Certificat Médical d\'Aptitude (Médecine du travail)',
  ipres_affiliation: 'Attestation d\'affiliation IPRES',
  css_affiliation: 'Attestation Caisse de Sécurité Sociale (CSS)',
  diploma: 'Diplôme ou Certification professionnelle',
  criminal_record: 'Extrait de Casier Judiciaire (Bulletin n°3)',
  contract_signed: 'Contrat de travail paraphé et signé',
  epi_receipt: 'Décharge de remise du paquetage EPI',
  other: 'Autre document justificatif',
};

export const DocumentReviewModal: React.FC<Props> = ({
  open,
  onClose,
  document,
  onReview,
  isLoading,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  if (!document) return null;

  const docTypeKey = (document.documentType || (document as any).document_type || '').toLowerCase();
  const docLabel = docTypeLabels[docTypeKey] || document.documentType || (document as any).document_type;
  const fileName = document.fileName || (document as any).file_name || 'document';
  const fileSizeKo = (((document.fileSize ?? (document as any).file_size ?? 0) / 1024)).toFixed(1);
  const storageKey = document.storageKey || (document as any).storage_key || '';
  const isDataUrl = storageKey.startsWith('data:');
  const isImage =
    document.mimeType?.startsWith('image/') ||
    /\.(jpe?g|png|webp|gif)$/i.test(fileName) ||
    storageKey.startsWith('data:image/');
  const isPdf =
    document.mimeType === 'application/pdf' ||
    /\.pdf$/i.test(fileName) ||
    storageKey.startsWith('data:application/pdf');

  const handleValidate = () => {
    onReview(document.id, 'VALIDATED');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez préciser le motif du rejet pour que le candidat puisse corriger son document.');
      return;
    }
    onReview(document.id, 'REJECTED', rejectionReason.trim());
  };

  const handleDownloadOrOpen = () => {
    if (isDataUrl) {
      const win = window.open();
      if (win) {
        win.document.write(
          isImage
            ? `<img src="${storageKey}" style="max-width:100%;height:auto;margin:auto;display:block;" />`
            : `<iframe src="${storageKey}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      }
    } else {
      toast.info(`Téléchargement de ${fileName}...`);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Examen & Visualisation de la pièce"
      subtitle={`${docLabel} • ${fileName}`}
      className="sm:max-w-4xl"
      zIndex={130}
    >
      <div className="flex flex-col gap-4">
        {/* ── 1. Zone d'Aperçu Visuel du Document ── */}
        <div className="relative w-full min-h-[380px] max-h-[520px] bg-surface-container-low rounded-xl border border-on-surface/10 overflow-hidden flex flex-col items-center justify-center p-3">
          {isDataUrl && isImage ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={storageKey}
                alt={fileName}
                className="max-h-[480px] w-auto object-contain rounded shadow-xs"
              />
            </div>
          ) : isDataUrl && isPdf ? (
            <iframe
              src={storageKey}
              title={fileName}
              className="w-full h-[480px] rounded border border-on-surface/10 bg-white"
            />
          ) : (
            /* Rendu d'inspection haute-fidélité pour les documents numérisés */
            <div className="w-full max-w-xl p-6 bg-surface-container-lowest rounded-xl border border-on-surface/10 shadow-xs flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                {docTypeKey.includes('cni') ? (
                  <IdCard size={36} />
                ) : docTypeKey.includes('rib') ? (
                  <CreditCard size={36} />
                ) : (
                  <FileText size={36} />
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Pièce d'identité & Justificatif officiel
                </span>
                <h3 className="text-base font-bold text-on-surface mt-2">
                  {docLabel}
                </h3>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                  {fileName} ({fileSizeKo} Ko)
                </p>
                <p className="text-[11px] text-on-surface-variant/70 mt-1">
                  Déposé par le candidat le{' '}
                  {new Date(document.createdAt || (document as any).created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="w-full p-3.5 rounded-lg bg-surface-container-low border border-on-surface/5 text-xs text-left space-y-1.5">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Format de fichier :</span>
                  <strong className="text-on-surface uppercase font-mono text-[11px]">
                    {document.mimeType || 'PDF / IMAGE'}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Statut actuel :</span>
                  <strong
                    className={
                      document.status === 'VALIDATED'
                        ? 'text-emerald-700'
                        : document.status === 'REJECTED'
                        ? 'text-rose-600'
                        : 'text-amber-800'
                    }
                  >
                    {document.status === 'VALIDATED'
                      ? 'Validé'
                      : document.status === 'REJECTED'
                      ? 'Rejeté'
                      : 'En attente d\'examen'}
                  </strong>
                </div>
              </div>

              {/* Bouton d'ouverture / téléchargement externe */}
              <button
                type="button"
                onClick={handleDownloadOrOpen}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-on-surface/15 bg-surface hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>Ouvrir le fichier dans un nouvel onglet</span>
              </button>
            </div>
          )}

          {/* Barre d'action rapide sur l'aperçu si dataURL */}
          {isDataUrl && (
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-surface/90 backdrop-blur-xs p-1 rounded-lg border border-on-surface/10 shadow-xs">
              <button
                type="button"
                onClick={handleDownloadOrOpen}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container transition-colors cursor-pointer"
                title="Ouvrir en plein écran"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── 2. Motif du rejet précédent si existant ── */}
        {document.status === 'REJECTED' && (document.rejectionReason || (document as any).rejection_reason) && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-xl text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>
              Motif du rejet précédent :{' '}
              <strong>{document.rejectionReason || (document as any).rejection_reason}</strong>
            </span>
          </div>
        )}

        {/* ── 3. Zone de Rejet ou Barre d'Actions d'Examen ── */}
        {isRejecting ? (
          <div className="flex flex-col gap-2.5 p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/15">
            <label className="text-xs font-semibold text-rose-800">
              Précisez le motif du rejet (notifié au candidat) *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex : Document illisible, photo tronquée, date d'expiration dépassée..."
              className="w-full h-20 p-2.5 text-xs bg-surface-container-lowest rounded-lg border border-rose-500/25 focus:outline-none focus:ring-1 focus:ring-rose-500 text-on-surface resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejecting(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                isLoading={isLoading}
                disabled={!rejectionReason.trim()}
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-on-surface/10">
            <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
              Fermer
            </Button>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsRejecting(true)}
                disabled={isLoading}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <XCircle size={15} className="mr-1.5" />
                Rejeter avec motif
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleValidate}
                isLoading={isLoading}
              >
                <CheckCircle2 size={15} className="mr-1.5" />
                Valider la conformité
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
