import React, { useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DocumentReviewModal } from './DocumentReviewModal';
import { UserCheck, AlertTriangle, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useOnboardingSession,
  useUpdateTaskStatus,
  useReviewDocument,
  useApproveProvision,
  useCancelSession,
  ONBOARDING_QUERY_KEYS,
} from '../hooks/useOnboarding';
import { onboardingApi } from '../api/onboarding.api';
import { buildMagicLink } from '../utils/shareUtils';
import { toast } from 'sonner';
import type { EmployeeDocument } from '../types';

import {
  SessionHeader,
  SessionMilestones,
  SessionTabs,
  type TabKey,
  SessionTasksTab,
  SessionDocumentsTab,
  SessionDataTab,
  SessionAuditTab,
  SessionFooter,
} from './detail';

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string | null;
}

const DOC_TYPE_LABELS: Record<string, string> = {
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

export const SessionDetailModal: React.FC<Props> = ({ open, onClose, sessionId }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('tasks');
  const queryClient = useQueryClient();
  const [reviewingDoc, setReviewingDoc] = useState<EmployeeDocument | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isValidatingAll, setIsValidatingAll] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { data: session, isLoading } = useOnboardingSession(sessionId || undefined);
  const updateTask = useUpdateTaskStatus(sessionId || '');
  const reviewDoc = useReviewDocument(sessionId || '');
  const approveProvision = useApproveProvision(sessionId || '');
  const cancelSession = useCancelSession();

  if (!open || !sessionId) return null;

  // ── Résolution robuste des données candidat ──
  const staging = (session?.stagingData as Record<string, any>) || (session as any)?.staging_data || {};
  const emp = session?.employee || {};

  const clean = (val: any): string => {
    if (!val || typeof val !== 'string') return '';
    const trimmed = val.trim();
    return trimmed === 'undefined' || trimmed === 'null' ? '' : trimmed;
  };

  const fName = clean(staging.candidateFirstName) || clean(staging.candidate_first_name) || clean(emp.firstName) || clean(emp.first_name);
  const lName = clean(staging.candidateLastName) || clean(staging.candidate_last_name) || clean(emp.lastName) || clean(emp.last_name);
  let candidateName = `${fName} ${lName}`.trim();
  if (!candidateName) {
    const direct = clean(staging.candidateName) || clean(staging.fullName) || clean(emp.fullName) || clean(session?.candidateName);
    candidateName = direct || (clean(staging.candidateEmail) ? clean(staging.candidateEmail).split('@')[0] : 'Nouveau Collaborateur');
  }

  const candidateEmail = clean(staging.candidateEmail) || clean(staging.candidate_email) || clean(emp.email);
  const candidatePhone = clean(staging.candidatePhone) || clean(staging.candidate_phone) || clean(emp.phone);
  const templateTitle = session?.template?.name || '';
  const candidateRole = clean(staging.jobTitle) || clean(staging.position) || clean(emp.jobTitle) || clean(emp.position) || '';

  const rawToken = session?.magicToken || (session as any)?.magic_token || '';
  const magicLink = rawToken ? buildMagicLink(rawToken) : '';

  const targetDateStr = session?.targetStartDate || (session as any)?.target_start_date;
  const targetDateFormatted = targetDateStr && !isNaN(new Date(targetDateStr).getTime())
    ? new Date(targetDateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'À définir';

  const progress = Math.min(100, Math.max(0, session?.progressPercent ?? (session as any)?.progress_percent ?? 0));
  const tasksList = (session?.tasks || (session as any)?.onboarding_tasks || []) as any[];
  const docsList = (session?.documents || (session as any)?.employee_documents || []) as any[];
  const auditLogsList = (session?.auditLogs || (session as any)?.audit_logs || []) as any[];

  const completedTasks = tasksList.filter((t: any) => t.status === 'DONE');
  const pendingDocs = docsList.filter((d: any) => (d.status || '').toUpperCase() === 'PENDING');
  const rejectedDocs = docsList.filter((d: any) => (d.status || '').toUpperCase() === 'REJECTED');
  const hasPendingDocs = pendingDocs.length > 0;
  const hasRejectedDocs = rejectedDocs.length > 0;

  const handleToggleTask = (task: any) => {
    updateTask.mutate({ taskId: task.id, status: task.status === 'DONE' ? 'PENDING' : 'DONE' });
  };

  const handleConfirmDocReview = (docId: string, status: 'VALIDATED' | 'REJECTED', reason?: string) => {
    reviewDoc.mutate(
      { docId, payload: { status, rejectionReason: reason } },
      { onSuccess: () => setReviewingDoc(null) }
    );
  };

  const handleValidateAllDocs = async () => {
    if (!sessionId || pendingDocs.length === 0) return;
    setIsValidatingAll(true);
    try {
      for (const doc of pendingDocs) {
        await onboardingApi.reviewDocument(sessionId, doc.id, { status: 'VALIDATED' });
      }
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.session(sessionId) });
      toast.success('Toutes les pièces justificatives ont été validées');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setIsValidatingAll(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (hasRejectedDocs) {
      toast.error("Impossible d'approuver : des pièces justificatives sont rejetées");
      return;
    }
    setIsApproving(true);
    try {
      if (hasPendingDocs && sessionId) {
        for (const doc of pendingDocs) {
          await onboardingApi.reviewDocument(sessionId, doc.id, { status: 'VALIDATED' });
        }
      }
      approveProvision.mutate(undefined, {
        onSuccess: () => {
          setShowApproveConfirm(false);
          setIsApproving(false);
        },
        onError: () => setIsApproving(false),
      });
    } catch (err: any) {
      setIsApproving(false);
      toast.error(err.response?.data?.message || 'Erreur lors du traitement du dossier');
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) return;
    cancelSession.mutate(
      { sessionId, reason: cancelReason.trim() },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          setCancelReason('');
        },
      }
    );
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        position="center"
        size="4xl"
        showCloseButton={false}
        footer={
          <SessionFooter
            status={session?.status}
            hasPendingDocs={hasPendingDocs}
            isApproving={approveProvision.isPending || isApproving}
            onCancel={() => {
              setCancelReason('');
              setCancelDialogOpen(true);
            }}
            onClose={onClose}
            onApprove={() => setShowApproveConfirm(true)}
          />
        }
      >
        {isLoading || !session ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-on-surface-variant">Chargement du dossier...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* 1. En-tête épuré */}
            <SessionHeader
              candidateName={candidateName}
              candidateRole={candidateRole}
              candidateEmail={candidateEmail}
              candidatePhone={candidatePhone}
              templateName={session.template?.name || 'Standard'}
              targetDateFormatted={targetDateFormatted}
              status={session.status}
              magicLink={magicLink}
              onClose={onClose}
            />

            {/* 2. Jalons d'intégration */}
            <SessionMilestones
              progress={progress}
              status={session.status}
              docsCount={docsList.length}
              hasPendingDocs={hasPendingDocs}
              hasRejectedDocs={hasRejectedDocs}
              pendingDocsCount={pendingDocs.length}
            />

            {/* 3. Onglets de navigation au standard LuminaRH */}
            <SessionTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              tasksCount={{ done: completedTasks.length, total: tasksList.length }}
              docsCount={docsList.length}
              hasPendingDocs={hasPendingDocs}
              auditCount={auditLogsList.length}
            />

            {/* 4. Contenu des onglets */}
            {activeTab === 'tasks' && (
              <SessionTasksTab
                tasks={tasksList}
                onToggleTask={handleToggleTask}
                isUpdating={updateTask.isPending}
              />
            )}

            {activeTab === 'docs' && (
              <SessionDocumentsTab
                docs={docsList}
                hasPendingDocs={hasPendingDocs}
                pendingDocsCount={pendingDocs.length}
                onValidateAllDocs={handleValidateAllDocs}
                isValidatingAll={isValidatingAll}
                onReviewDoc={(doc) => setReviewingDoc(doc)}
                docTypeLabels={DOC_TYPE_LABELS}
              />
            )}

            {activeTab === 'data' && <SessionDataTab staging={staging} />}

            {activeTab === 'audit' && <SessionAuditTab auditLogs={auditLogsList} />}
          </div>
        )}
      </Drawer>

      {/* Modal d'examen de document */}
      <DocumentReviewModal
        open={!!reviewingDoc}
        onClose={() => setReviewingDoc(null)}
        document={reviewingDoc}
        onReview={handleConfirmDocReview}
        isLoading={reviewDoc.isPending}
      />

      {/* Confirmation d'approbation & provisionnement */}
      <ConfirmDialog
        open={showApproveConfirm}
        onClose={() => {
          if (!isApproving) setShowApproveConfirm(false);
        }}
        onConfirm={handleConfirmApproval}
        title="Valider l'Onboarding & Provisionner"
        description="Voulez-vous approuver ce dossier et provisionner l'employé dans le système ? Cette étape créera son profil actif, son PIN Kiosque et ses droits."
        confirmLabel={hasPendingDocs ? 'Valider les pièces & Provisionner' : 'Approuver & Provisionner'}
        variant="primary"
        icon={<UserCheck size={24} className="text-primary" />}
        isLoading={approveProvision.isPending || isApproving}
        confirmDisabled={hasRejectedDocs}
      >
        {hasRejectedDocs ? (
          <div className="w-full text-left p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-start gap-2 mt-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>Certaines pièces sont rejetées. Le candidat doit téléverser les documents conformes.</p>
          </div>
        ) : hasPendingDocs ? (
          <div className="w-full text-left p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-start gap-2 mt-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <p>Les {pendingDocs.length} pièce(s) en attente seront validées et le collaborateur sera provisionné.</p>
          </div>
        ) : (
          <div className="w-full text-left p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs flex items-start gap-2 mt-2">
            <Check size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            <p>Toutes les pièces obligatoires sont validées. Le profil employé et le PIN Kiosque vont être générés.</p>
          </div>
        )}
      </ConfirmDialog>

      {/* Confirmation d'annulation */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setCancelReason('');
        }}
        onConfirm={handleConfirmCancel}
        title="Annuler le parcours d'onboarding"
        description="Cette action est irréversible. Le dossier sera annulé et le lien d'accès sera révoqué."
        confirmLabel="Confirmer l'annulation"
        variant="danger"
        isLoading={cancelSession.isPending}
        confirmDisabled={!cancelReason.trim()}
      >
        <div className="w-full text-left mt-3">
          <label className="block text-xs font-semibold text-on-surface mb-1">
            Motif de l'annulation <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Ex : Rétractation du candidat..."
            className="w-full text-xs rounded-xl border border-on-surface/20 bg-surface p-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            autoFocus
          />
        </div>
      </ConfirmDialog>
    </>
  );
};
