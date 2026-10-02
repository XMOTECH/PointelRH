import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, FileText, AlertCircle } from 'lucide-react';
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
  cni: 'Carte Nationale d\'Identité (NIN / CNI CEDEAO)',
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

  const handleValidate = () => {
    onReview(document.id, 'VALIDATED');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez préciser le motif du rejet pour que le candidat puisse corriger son document.');
      return;
    }
    onReview(document.id, 'REJECTED', rejectionReason);
  };

  return (
    <Modal open={open} onClose={onClose} title="Examen de la pièce justificative" zIndex={130}>
      <div className="flex flex-col gap-6 p-2">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low border border-on-surface/10">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FileText size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-on-surface">
              {docTypeLabels[document.documentType || (document as any).document_type] ||
                document.documentType ||
                (document as any).document_type}
            </h4>
            <p className="text-xs text-on-surface-variant font-mono mt-1">
              {document.fileName || (document as any).file_name || 'Document'}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Déposé le{' '}
              {new Date(document.createdAt || (document as any).created_at).toLocaleDateString('fr-FR')} •{' '}
              {(((document.fileSize ?? (document as any).file_size ?? 0) / 1024)).toFixed(1)} Ko
            </p>
          </div>
        </div>

        {document.status === 'REJECTED' && (document.rejectionReason || (document as any).rejection_reason) && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>Motif du précédent rejet : <strong>{document.rejectionReason || (document as any).rejection_reason}</strong></span>
          </div>
        )}

        {isRejecting ? (
          <div className="flex flex-col gap-3 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
            <label className="text-xs font-bold text-red-700">
              Précisez le motif du rejet (notifié au candidat) *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Document illisible, photo tronquée, date d'expiration dépassée..."
              className="w-full h-24 p-3 text-xs bg-surface-container-lowest rounded-lg border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 text-on-surface"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="tertiary"
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
              >
                Confirmer le Rejet
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="tertiary"
              onClick={onClose}
              disabled={isLoading}
            >
              Fermer
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsRejecting(true)}
              disabled={isLoading}
            >
              <XCircle size={16} className="mr-2" />
              Rejeter avec motif
            </Button>
            <Button
              variant="primary"
              onClick={handleValidate}
              isLoading={isLoading}
            >
              <CheckCircle2 size={16} className="mr-2" />
              Valider le document
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
