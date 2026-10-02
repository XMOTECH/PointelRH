import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { OnboardingStatusBadge } from './OnboardingStatusBadge';
import { DocumentReviewModal } from './DocumentReviewModal';
import {
  Clock,
  Copy,
  ExternalLink,
  FileText,
  ShieldAlert,
  UserCheck,
  Check,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';
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
import { toast } from 'sonner';
import type { EmployeeDocument } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string | null;
}

export const SessionDetailModal: React.FC<Props> = ({ open, onClose, sessionId }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'docs' | 'data' | 'audit'>('tasks');
  const queryClient = useQueryClient();
  const [reviewingDoc, setReviewingDoc] = useState<EmployeeDocument | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
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

  const staging = (session?.stagingData as Record<string, any>) || (session as any)?.staging_data || {};
  const candidateName =
    `${staging.candidateFirstName || staging.candidate_first_name || ''} ${staging.candidateLastName || staging.candidate_last_name || ''}`.trim() ||
    session?.employee?.firstName
      ? `${session?.employee?.firstName} ${session?.employee?.lastName || ''}`.trim()
      : 'Candidat';

  const rawToken = session?.magicToken || (session as any)?.magic_token || '';
  const magicLink = rawToken
    ? `${window.location.origin}/onboarding/portal/${rawToken}`
    : '';

  const targetDateStr = session?.targetStartDate || (session as any)?.target_start_date;
  const targetDateFormatted = targetDateStr && !isNaN(new Date(targetDateStr).getTime())
    ? new Date(targetDateStr).toLocaleDateString('fr-FR')
    : 'À définir';

  const progress = session?.progressPercent ?? (session as any)?.progress_percent ?? 0;

  const tasksList = (session?.tasks || (session as any)?.onboarding_tasks || []) as any[];
  const docsList = (session?.documents || (session as any)?.employee_documents || []) as any[];
  const auditLogsList = (session?.auditLogs || (session as any)?.audit_logs || []) as any[];

  const pendingDocs = docsList.filter(
    (d: any) => (d.status || '').toUpperCase() === 'PENDING'
  );
  const rejectedDocs = docsList.filter(
    (d: any) => (d.status || '').toUpperCase() === 'REJECTED'
  );
  const hasPendingDocs = pendingDocs.length > 0;
  const hasRejectedDocs = rejectedDocs.length > 0;

  const copyMagicLink = () => {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink);
    setCopiedLink(true);
    toast.success('Lien Magic Link copié dans le presse-papier !');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleTask = (task: any) => {
    const nextStatus = task.status === 'DONE' ? 'PENDING' : 'DONE';
    updateTask.mutate({ taskId: task.id, status: nextStatus });
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
      toast.success('Toutes les pièces justificatives ont été validées avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la validation des pièces');
    } finally {
      setIsValidatingAll(false);
    }
  };

  const handleApproveProvision = () => {
    setShowApproveConfirm(true);
  };

  const handleConfirmApproval = async () => {
    if (hasRejectedDocs) {
      toast.error('Impossible d\'approuver : des pièces justificatives sont rejetées.');
      return;
    }

    setIsApproving(true);
    try {
      // Validate any pending documents before triggering provisioning FSM transition
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
        onError: () => {
          setIsApproving(false);
        },
      });
    } catch (err: any) {
      setIsApproving(false);
      const msg = err.response?.data?.message || 'Erreur lors du traitement du dossier';
      toast.error(msg);
    }
  };

  const handleCancelSession = () => {
    setCancelReason('');
    setCancelDialogOpen(true);
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
      <Modal open={open} onClose={onClose} title="Dossier d'Onboarding Collaborateur" className="sm:max-w-4xl">
        {isLoading || !session ? (
          <div className="py-16 text-center text-on-surface-variant">Chargement du dossier...</div>
        ) : (
          <div className="flex flex-col gap-6 p-2">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container-low border border-on-surface/10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl">
                  {candidateName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-on-surface">{candidateName}</h3>
                    <OnboardingStatusBadge status={session.status} />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Modèle : <strong>{session.template?.name || 'Standard'}</strong> • Prise de poste prévue le{' '}
                    <strong>{targetDateFormatted}</strong>
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col items-end gap-1.5 min-w-[160px]">
                <div className="flex justify-between w-full text-xs font-bold text-on-surface-variant">
                  <span>Progression globale</span>
                  <span className="text-primary font-mono">{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Magic Link Bar */}
            {session.status !== 'CANCELLED' && session.status !== 'COMPLETED' && magicLink && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-primary/10 border-2 border-primary/25 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 text-xs text-primary font-medium min-w-0">
                  <div className="p-2.5 bg-primary/15 rounded-xl text-primary shrink-0">
                    <ExternalLink size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-on-surface text-sm">Lien Magic Link (Portail Candidat Sécurisé)</p>
                      <span className="text-[10px] bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full">
                        Accès sans login
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate font-mono mt-0.5 select-all">
                      {magicLink}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant={copiedLink ? 'secondary' : 'secondary'} onClick={copyMagicLink}>
                    {copiedLink ? <Check size={14} className="mr-1.5 text-emerald-600" /> : <Copy size={14} className="mr-1.5" />}
                    {copiedLink ? 'Lien copié !' : 'Copier le lien'}
                  </Button>
                  <a
                    href={magicLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-8 px-3.5 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <ExternalLink size={13} className="mr-1.5" />
                    Ouvrir le portail
                  </a>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-on-surface/10 gap-6 text-sm font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'tasks' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Checklist des Tâches ({tasksList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('docs')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'docs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Pièces Justificatives ({docsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('data')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'data' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Données Déclarées & Fiscalité
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Piste d'Audit ({auditLogsList.length})
              </button>
            </div>

            {/* Tab 1: Tâches DAG */}
            {activeTab === 'tasks' && (
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {tasksList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-on-surface-variant border border-dashed border-on-surface/10 rounded-xl">
                    Aucune tâche configurée pour cette session.
                  </div>
                ) : (
                  tasksList.map((task: any) => {
                    const isDone = task.status === 'DONE';
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                          isDone
                            ? 'bg-surface-container-low/50 border-on-surface/5 opacity-80'
                            : 'bg-surface-container-lowest border-on-surface/10 hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task)}
                            disabled={updateTask.isPending}
                            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isDone ? 'bg-primary border-primary text-white' : 'border-on-surface-variant hover:border-primary'
                            }`}
                          >
                            {isDone && <Check size={14} />}
                          </button>
                          <div>
                            <p className={`text-sm font-semibold ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-on-surface-variant mt-0.5">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="default" className="text-[10px] uppercase font-bold">
                                Rôle : {task.assignedRole || task.assigned_role || 'collaborateur'}
                              </Badge>
                              {(task.dueDate || task.due_date) && (
                                <span className="text-[11px] text-on-surface-variant flex items-center gap-1 font-mono">
                                  <Clock size={12} /> Échéance : {new Date(task.dueDate || task.due_date).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                              {(task.prerequisiteTask || task.prerequisite_task) && (
                                <span className="text-[10px] text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                  <ShieldAlert size={11} /> Prérequis : {(task.prerequisiteTask || task.prerequisite_task).title}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 2: Pièces justificatives */}
            {activeTab === 'docs' && (
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {hasPendingDocs && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/15">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-on-surface font-semibold">
                        {pendingDocs.length} pièce(s) justificative(s) en attente d'examen
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleValidateAllDocs}
                      isLoading={isValidatingAll}
                    >
                      <CheckCheck size={14} className="mr-1.5" />
                      Tout valider ({pendingDocs.length})
                    </Button>
                  </div>
                )}

                {docsList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-on-surface-variant border border-dashed border-on-surface/10 rounded-xl">
                    Aucun document téléversé pour le moment.
                  </div>
                ) : (
                  docsList.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-on-surface/10 bg-surface-container-lowest"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-surface-container-low text-primary">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface uppercase tracking-wide">
                            {doc.documentType || doc.document_type}
                          </p>
                          <p className="text-xs text-on-surface-variant font-mono">{doc.fileName || doc.file_name}</p>
                          {(doc.rejectionReason || doc.rejection_reason) && (
                            <p className="text-xs text-red-500 mt-1">Rejet : {doc.rejectionReason || doc.rejection_reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            doc.status === 'VALIDATED'
                              ? 'success'
                              : doc.status === 'REJECTED'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {doc.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setReviewingDoc(doc)}
                        >
                          Examiner
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Données déclarées */}
            {activeTab === 'data' && (
              <div className="grid grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1 text-xs">
                <div className="p-4 rounded-xl bg-surface-container-low border border-on-surface/5 flex flex-col gap-2.5">
                  <h5 className="font-bold text-primary uppercase tracking-wider text-[11px] mb-1">
                    État Civil & Fiscalité (Sénégal)
                  </h5>
                  <div>
                    <span className="text-on-surface-variant">Numéro CNI / NIN :</span>{' '}
                    <strong className="text-on-surface font-mono">
                      {staging.nationalIdNumber || staging.national_id_number || '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Date de naissance :</span>{' '}
                    <strong className="text-on-surface">
                      {staging.birthDate || staging.birth_date || '—'}
                    </strong>{' '}
                    ({staging.birthPlace || staging.birth_place || '—'})
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Situation matrimoniale :</span>{' '}
                    <strong className="text-on-surface capitalize">
                      {staging.maritalStatus || staging.marital_status || '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Enfants à charge déclarés :</span>{' '}
                    <strong className="text-on-surface">
                      {staging.childrenCount ?? staging.children_count ?? '—'}
                    </strong>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg text-primary font-bold">
                    Parts Fiscales Calculées pour l'IR : {staging.calculatedTaxParts ?? staging.calculated_tax_parts ?? 1.0} parts
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-on-surface/5 flex flex-col gap-2.5">
                  <h5 className="font-bold text-primary uppercase tracking-wider text-[11px] mb-1">
                    Contact d'Urgence & Équipements Usine
                  </h5>
                  <div>
                    <span className="text-on-surface-variant">Personne à prévenir :</span>{' '}
                    <strong className="text-on-surface">
                      {staging.emergencyContactName || staging.emergency_contact_name || '—'}
                    </strong>{' '}
                    ({staging.emergencyContactRelation || staging.emergency_contact_relation || '—'})
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Téléphone d'urgence :</span>{' '}
                    <strong className="text-on-surface font-mono">
                      {staging.emergencyContactPhone || staging.emergency_contact_phone || '—'}
                    </strong>
                  </div>
                  <hr className="border-on-surface/5 my-1" />
                  <div>
                    <span className="text-on-surface-variant">Pointure chaussures de sécurité :</span>{' '}
                    <strong className="text-on-surface">
                      {staging.shoeSize || staging.shoe_size || 'Non renseigné'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Taille vêtements / combinaison :</span>{' '}
                    <strong className="text-on-surface">
                      {staging.clothingSize || staging.clothing_size || 'Non renseigné'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Paiement / RIB / Wave :</span>{' '}
                    <strong className="text-on-surface font-mono">
                      {staging.bankRib || staging.bank_rib || staging.mobileMoneyNumber || staging.mobile_money_number || '—'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Audit Logs */}
            {activeTab === 'audit' && (
              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {auditLogsList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-on-surface-variant border border-dashed border-on-surface/10 rounded-xl">
                    Aucun journal d'audit pour le moment.
                  </div>
                ) : (
                  auditLogsList.map((log: any) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-surface-container-low border border-on-surface/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-primary">{log.action}</span>
                        <span className="text-on-surface-variant ml-2">par {log.actorId || log.actor_id || 'Système'}</span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        {new Date(log.createdAt || log.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Actions footer */}
            <div className="flex items-center justify-between pt-4 border-t border-on-surface/10">
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelSession}
                disabled={session.status === 'CANCELLED' || session.status === 'COMPLETED'}
              >
                Annuler l'onboarding
              </Button>

              <div className="flex items-center gap-3">
                <Button variant="tertiary" onClick={onClose}>
                  Fermer
                </Button>
                {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
                  <Button
                    variant="primary"
                    onClick={handleApproveProvision}
                    isLoading={approveProvision.isPending}
                  >
                    <UserCheck size={16} className="mr-2" />
                    Approuver la Revue & Provisionner au Jour J
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <DocumentReviewModal
        open={!!reviewingDoc}
        onClose={() => setReviewingDoc(null)}
        document={reviewingDoc}
        onReview={handleConfirmDocReview}
        isLoading={reviewDoc.isPending}
      />

      {/* Confirm Approve & Provision Dialog */}
      <ConfirmDialog
        open={showApproveConfirm}
        onClose={() => {
          if (!isApproving) setShowApproveConfirm(false);
        }}
        onConfirm={handleConfirmApproval}
        title="Valider l'Onboarding & Provisionner"
        description="Voulez-vous approuver définitivement ce dossier et provisionner l'employé dans le système ? Cette étape créera son profil actif, son code PIN Kiosque et son solde initial de congés."
        confirmLabel={hasPendingDocs ? 'Valider les pièces & Provisionner' : 'Approuver & Provisionner'}
        variant="primary"
        icon={<UserCheck size={24} className="text-primary" />}
        isLoading={approveProvision.isPending || isApproving}
        confirmDisabled={hasRejectedDocs}
      >
        {hasRejectedDocs ? (
          <div className="w-full text-left p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-start gap-2.5 mt-2">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Pièces justificatives rejetées</p>
              <p className="mt-0.5">
                Certaines pièces sont rejetées. Le candidat doit téléverser les documents conformes avant que le dossier ne puisse être approuvé.
              </p>
            </div>
          </div>
        ) : hasPendingDocs ? (
          <div className="w-full text-left p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-start gap-2.5 mt-2">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">{pendingDocs.length} pièce(s) en attente d'examen</p>
              <p className="mt-0.5">
                En confirmant, les pièces déposées (CNI, RIB) seront validées automatiquement et le collaborateur sera provisionné dans le système.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full text-left p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs flex items-start gap-2.5 mt-2">
            <Check size={18} className="shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="font-bold">Toutes les pièces obligatoires sont validées</p>
              <p className="mt-0.5">
                Le dossier est conforme. Le compte utilisateur, le profil employé, le PIN Kiosque et le solde initial de congés vont être générés.
              </p>
            </div>
          </div>
        )}
      </ConfirmDialog>

      {/* Confirm Cancel Session Dialog with Reason input */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setCancelReason('');
        }}
        onConfirm={handleConfirmCancel}
        title="Annuler le parcours d'onboarding"
        description="Cette action est irréversible. Le dossier sera marqué comme annulé et le lien d'accès du candidat sera révoqué."
        confirmLabel="Confirmer l'annulation"
        variant="danger"
        isLoading={cancelSession.isPending}
        confirmDisabled={!cancelReason.trim()}
      >
        <div className="w-full text-left mt-3">
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
            Motif de l'annulation <span className="text-red-500">*</span>
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Ex : Rétractation du candidat, report d'embauche..."
            className="w-full text-sm rounded-xl border border-outline-variant bg-surface-container-low p-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            autoFocus
          />
        </div>
      </ConfirmDialog>
    </>
  );
};
