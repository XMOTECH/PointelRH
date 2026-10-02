import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Briefcase,
  Coins,
  History,
  Laptop,
  ShieldAlert,
  ArrowRight,
  Check,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { OffboardingStatusBadge } from './OffboardingStatusBadge';
import {
  useOffboardingSession,
  useUpdateOffboardingTask,
  useSaveExitInterview,
  useSaveHandoverNotes,
  useTransitionOffboarding,
} from '../hooks/useOffboarding';
import type { OffboardingTask, OffboardingTaskStatus, OffboardingTaskCategory } from '../types';

interface OffboardingDetailModalProps {
  sessionId: string | null;
  open: boolean;
  onClose: () => void;
}

type TabType = 'checklist' | 'finance' | 'handover' | 'interview' | 'audit';

const categoryConfig: Record<OffboardingTaskCategory, { label: string; icon: React.ReactNode; color: string }> = {
  it: { label: 'Matériel & IT', icon: <Laptop size={15} />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
  security: { label: 'Sécurité & Accès', icon: <ShieldAlert size={15} />, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  hr: { label: 'Ressources Humaines', icon: <FileText size={15} />, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
  finance: { label: 'Finance & Paie', icon: <Coins size={15} />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  manager: { label: 'Management & Équipe', icon: <Briefcase size={15} />, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  logistics: { label: 'Logistique & Équipements', icon: <Clock size={15} />, color: 'text-slate-600 bg-slate-50 dark:bg-slate-900/40' },
  administrative: { label: 'Administratif', icon: <FileText size={15} />, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' },
};

const reasonLabels: Record<string, string> = {
  RESIGNATION: 'Démission',
  DISMISSAL: 'Licenciement',
  END_OF_CONTRACT: 'Fin de CDD',
  TRIAL_PERIOD_TERMINATION: 'Fin période d\'essai',
  MUTUAL_AGREEMENT: 'Rupture conventionnelle',
  RETIREMENT: 'Retraite',
  OTHER: 'Autre',
};

export const OffboardingDetailModal: React.FC<OffboardingDetailModalProps> = ({ sessionId, open, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('checklist');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [interviewFeedback, setInterviewFeedback] = useState('');
  const [handoverNotesState, setHandoverNotesState] = useState('');
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: session, isLoading } = useOffboardingSession(sessionId);
  const updateTaskMutation = useUpdateOffboardingTask();
  const saveInterviewMutation = useSaveExitInterview();
  const saveHandoverMutation = useSaveHandoverNotes();
  const transitionMutation = useTransitionOffboarding();

  // Initialisation des champs texte lors du chargement de la session
  React.useEffect(() => {
    if (session) {
      setInterviewNotes(session.exitInterviewNotes || '');
      setInterviewFeedback(session.reasonsFeedback || '');
      setHandoverNotesState(session.handoverNotes || '');
    }
  }, [session]);

  if (!open) return null;

  const handleTaskStatusChange = async (task: OffboardingTask, newStatus: OffboardingTaskStatus) => {
    setActionError('');
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: { status: newStatus },
      });
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erreur lors de la mise à jour de la tâche.');
    }
  };

  const handleSaveInterview = async () => {
    if (!sessionId) return;
    setActionError('');
    try {
      await saveInterviewMutation.mutateAsync({
        sessionId,
        data: {
          exitInterviewNotes: interviewNotes,
          reasonsFeedback: interviewFeedback,
        },
      });
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'entretien.');
    }
  };

  const handleSaveHandover = async () => {
    if (!sessionId) return;
    setActionError('');
    try {
      await saveHandoverMutation.mutateAsync({
        sessionId,
        notes: handoverNotesState,
      });
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erreur lors de l\'enregistrement des notes.');
    }
  };

  const handleTransition = async (event: any) => {
    if (!sessionId) return;
    setActionError('');
    try {
      await transitionMutation.mutateAsync({ sessionId, event });
      setConfirmCompleteOpen(false);
      setCancelModalOpen(false);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Transition impossible.');
    }
  };

  const tasks = session?.tasks || [];
  const mandatoryTasks = tasks.filter((t) => t.isRequired);
  const mandatoryDone = mandatoryTasks.every(
    (t) => t.status === 'COMPLETED' || t.status === 'WAIVED',
  );

  // Groupement des tâches par catégorie
  const tasksByCategory = tasks.reduce((acc, t) => {
    const cat = t.category || 'administrative';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {} as Record<string, OffboardingTask[]>);

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="sm:max-w-4xl"
      title="Dossier d'Offboarding"
    >
      <p className="text-xs text-on-surface-variant -mt-2 mb-4">
        Gestion complète du départ, checklist inter-services, finances et passation.
      </p>
      {isLoading || !session ? (
        <div className="py-16 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-on-surface-variant font-medium">Chargement du dossier...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {actionError && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* En-tête Collaborateur & Progression */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-on-surface/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shrink-0">
                {session.employee?.firstName?.[0]}
                {session.employee?.lastName?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-on-surface">
                    {session.employee?.firstName} {session.employee?.lastName}
                  </h3>
                  <OffboardingStatusBadge status={session.status} />
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {session.employee?.jobTitle || 'Poste non renseigné'} • {session.employee?.department?.name || 'Département inconnu'} • {session.employee?.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-medium text-on-surface-variant">
                  <span className="px-2 py-0.5 rounded-md bg-surface-container-high">
                    Motif : <strong className="text-on-surface">{reasonLabels[session.departureReason] || session.departureReason}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container-high">
                    Dernier jour : <strong className="text-on-surface">{format(parseISO(session.lastWorkingDate), 'dd MMMM yyyy', { locale: fr })}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container-high">
                    Fin contrat : <strong className="text-on-surface">{format(parseISO(session.contractEndDate), 'dd MMMM yyyy', { locale: fr })}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Barre de progression compacte */}
            <div className="flex flex-col items-end shrink-0 w-full md:w-48">
              <div className="flex items-center justify-between w-full text-xs font-bold text-on-surface mb-1">
                <span>Progression</span>
                <span>{session.progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-on-surface/10 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${session.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-on-surface-variant mt-1">
                {tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'WAIVED').length} sur {tasks.length} tâche(s) réglée(s)
              </span>
            </div>
          </div>

          {/* Navigation par Onglets */}
          <div className="flex items-center gap-1 border-b border-on-surface/10 pb-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'checklist' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <CheckCircle2 size={14} />
              Checklist ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'finance' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Coins size={14} />
              Finances & Solde
              {session.financialSummary?.totalUnpaidAdvanceAmount ? (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              ) : null}
            </button>
            <button
              onClick={() => setActiveTab('handover')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'handover' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Briefcase size={14} />
              Passation & Tâches
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'interview' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <MessageSquare size={14} />
              Entretien de Sortie
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'audit' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <History size={14} />
              Audit ({session.auditLogs?.length || 0})
            </button>
          </div>

          {/* Contenu de l'onglet Actif */}
          <div className="min-h-[300px]">
            {/* 1. Onglet Checklist */}
            {activeTab === 'checklist' && (
              <div className="space-y-6">
                {Object.entries(tasksByCategory).map(([category, catTasks]) => {
                  const conf = categoryConfig[category as OffboardingTaskCategory] || categoryConfig.administrative;
                  return (
                    <div key={category} className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface">
                        <span className={`p-1 rounded-md ${conf.color}`}>{conf.icon}</span>
                        <span>{conf.label}</span>
                        <span className="text-[10px] text-on-surface-variant font-normal">
                          ({catTasks.filter((t) => t.status === 'COMPLETED').length}/{catTasks.length})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {catTasks.map((task) => {
                          const isDone = task.status === 'COMPLETED';
                          const isWaived = task.status === 'WAIVED';
                          const isPending = task.status === 'PENDING' || task.status === 'IN_PROGRESS';
                          const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < Date.now() && isPending;

                          return (
                            <div
                              key={task.id}
                              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                                isDone
                                  ? 'bg-emerald-500/5 border-emerald-500/20'
                                  : isWaived
                                  ? 'bg-slate-500/5 border-slate-500/20 opacity-70'
                                  : isOverdue
                                  ? 'bg-rose-500/5 border-rose-500/30'
                                  : 'bg-surface border-on-surface/10'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleTaskStatusChange(task, isDone ? 'PENDING' : 'COMPLETED')}
                                  disabled={session.status === 'COMPLETED' || session.status === 'CANCELLED'}
                                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                                    isDone
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-on-surface/30 hover:border-primary'
                                  }`}
                                >
                                  {isDone && <Check size={13} strokeWidth={3} />}
                                </button>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-sm font-semibold ${
                                        isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'
                                      }`}
                                    >
                                      {task.title}
                                    </span>
                                    {task.isRequired && (
                                      <span className="text-[10px] font-bold text-rose-500 uppercase">Obligatoire</span>
                                    )}
                                    {isWaived && (
                                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                                        Dispensé
                                      </span>
                                    )}
                                  </div>
                                  {task.description && (
                                    <p className="text-xs text-on-surface-variant mt-0.5">{task.description}</p>
                                  )}
                                  {task.notes && (
                                    <p className="text-xs text-primary font-medium mt-1 bg-primary/5 p-1.5 rounded-lg inline-block">
                                      Note : {task.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {task.dueDate && (
                                  <span
                                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                      isOverdue
                                        ? 'bg-rose-500/10 text-rose-600 font-bold'
                                        : 'bg-surface-container-high text-on-surface-variant'
                                    }`}
                                  >
                                    Échéance : {format(parseISO(task.dueDate), 'dd/MM')}
                                  </span>
                                )}

                                {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
                                  <div className="flex items-center gap-1">
                                    {!isWaived && (
                                      <button
                                        type="button"
                                        title="Dispenser cette tâche"
                                        onClick={() => handleTaskStatusChange(task, 'WAIVED')}
                                        className="text-xs text-on-surface-variant hover:text-slate-800 px-2 py-1 rounded hover:bg-surface-container-high"
                                      >
                                        Dispenser
                                      </button>
                                    )}
                                    {isWaived && (
                                      <button
                                        type="button"
                                        title="Rétablir la tâche"
                                        onClick={() => handleTaskStatusChange(task, 'PENDING')}
                                        className="text-xs text-primary hover:underline px-2 py-1"
                                      >
                                        Rétablir
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Onglet Finances & Solde */}
            {activeTab === 'finance' && (
              <div className="space-y-5">
                {/* Alerte Acomptes non remboursés */}
                {session.financialSummary?.totalUnpaidAdvanceAmount ? (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-800 dark:text-rose-300">
                    <AlertTriangle size={20} className="shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">
                        Attention : Acomptes en cours ({session.financialSummary.totalUnpaidAdvanceAmount.toLocaleString('fr-FR')} FCFA)
                      </h4>
                      <p className="text-xs mt-1">
                        Ce collaborateur a des avances ou prêts non encore remboursés. Cette somme doit être déduite lors de l'établissement du reçu pour Solde de Tout Compte (STC).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Aucun acompte en suspens. La situation financière est saine.</span>
                  </div>
                )}

                {/* Synthèse Congés restants */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-on-surface/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                    Solde de congés payés à indemniser (Indemnité compensatrice)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {session.financialSummary?.leaveBalances?.map((lb) => (
                      <div key={lb.leaveType} className="p-3 bg-surface rounded-xl border border-on-surface/10 flex items-center justify-between">
                        <span className="text-xs font-semibold text-on-surface">{lb.leaveType}</span>
                        <span className="text-sm font-extrabold text-primary font-mono">
                          {lb.remainingDays} jour{lb.remainingDays > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Onglet Passation & Tâches PointelRH */}
            {activeTab === 'handover' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Notes et instructions de passation de service
                  </label>
                  <textarea
                    rows={4}
                    value={handoverNotesState}
                    onChange={(e) => setHandoverNotesState(e.target.value)}
                    disabled={session.status === 'COMPLETED' || session.status === 'CANCELLED'}
                    placeholder="Détaillez les dossiers clients à transférer, accès à partager..."
                    className="w-full text-sm p-3.5 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
                    <Button
                      size="sm"
                      onClick={handleSaveHandover}
                      isLoading={saveHandoverMutation.isPending}
                      className="mt-2"
                    >
                      Enregistrer les notes
                    </Button>
                  )}
                </div>

                {/* Projets et tâches en cours */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-on-surface/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                    Tâches actives assignées à réattribuer ({session.openWorkItems?.tasksCount || 0})
                  </h4>
                  {session.openWorkItems?.tasksCount === 0 ? (
                    <p className="text-xs text-on-surface-variant">Aucune tâche active dans PointelRH.</p>
                  ) : (
                    <div className="space-y-2">
                      {session.openWorkItems?.tasks?.map((t: any) => (
                        <div key={t.id} className="p-2.5 bg-surface rounded-xl border border-on-surface/10 flex items-center justify-between text-xs">
                          <span className="font-semibold text-on-surface">{t.title}</span>
                          <span className="text-amber-600 font-bold capitalize">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Onglet Entretien de Sortie */}
            {activeTab === 'interview' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Compte-rendu de l'entretien de sortie (RH / Direction)
                  </label>
                  <textarea
                    rows={4}
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    disabled={session.status === 'COMPLETED' || session.status === 'CANCELLED'}
                    placeholder="Synthèse de l'échange, ambiance, motifs réels du départ..."
                    className="w-full text-sm p-3.5 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Retours et suggestions du collaborateur
                  </label>
                  <textarea
                    rows={3}
                    value={interviewFeedback}
                    onChange={(e) => setInterviewFeedback(e.target.value)}
                    disabled={session.status === 'COMPLETED' || session.status === 'CANCELLED'}
                    placeholder="Points forts de l'entreprise, axes d'amélioration..."
                    className="w-full text-sm p-3.5 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
                  <Button
                    size="sm"
                    onClick={handleSaveInterview}
                    isLoading={saveInterviewMutation.isPending}
                  >
                    Enregistrer l'Entretien
                  </Button>
                )}
              </div>
            )}

            {/* 5. Onglet Audit */}
            {activeTab === 'audit' && (
              <div className="space-y-3">
                {session.auditLogs?.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-8">Aucun événement enregistré.</p>
                ) : (
                  session.auditLogs?.map((log) => (
                    <div key={log.id} className="p-3 bg-surface-container-low rounded-xl border border-on-surface/10 flex items-start justify-between text-xs">
                      <div>
                        <span className="font-bold text-on-surface">{log.action}</span>
                        {log.fromState && log.toState && (
                          <span className="text-on-surface-variant ml-2">
                            ({log.fromState} <ArrowRight size={10} className="inline mx-1" /> {log.toState})
                          </span>
                        )}
                        {log.details?.reason && (
                          <p className="text-rose-600 mt-0.5">Motif : {log.details.reason}</p>
                        )}
                      </div>
                      <span className="text-on-surface-variant font-mono text-[11px] shrink-0">
                        {format(parseISO(log.createdAt), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Barre d'Action et Transitions Machine à États */}
          <div className="pt-4 border-t border-on-surface/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Annuler la procédure
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button variant="tertiary" onClick={onClose}>
                Fermer
              </Button>

              {session.status === 'INITIATED' && (
                <Button
                  onClick={() => handleTransition({ type: 'START_OFFBOARDING' })}
                  isLoading={transitionMutation.isPending}
                >
                  Démarrer l'Offboarding (Passer en cours)
                </Button>
              )}

              {session.status === 'IN_PROGRESS' && (
                <Button
                  onClick={() => handleTransition({ type: 'SUBMIT_FOR_DOCUMENTS' })}
                  disabled={!mandatoryDone}
                  isLoading={transitionMutation.isPending}
                  title={!mandatoryDone ? 'Toutes les tâches obligatoires doivent être traitées' : ''}
                >
                  Passer en Attente de Documents
                </Button>
              )}

              {session.status === 'PENDING_DOCUMENTS' && (
                <Button
                  variant="primary"
                  onClick={() => setConfirmCompleteOpen(true)}
                  isLoading={transitionMutation.isPending}
                >
                  Clôturer définitivement le départ
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Final Completion */}
      <Modal
        open={confirmCompleteOpen}
        onClose={() => setConfirmCompleteOpen(false)}
        title="Confirmer la clôture définitive de l'Offboarding"
      >
        <p className="text-xs text-on-surface-variant -mt-2 mb-4">
          Cette action est irréversible et finalise le départ du collaborateur.
        </p>
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
            <h4 className="font-bold text-sm">Actions automatiques exécutées :</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Le collaborateur sera marqué comme <strong>Inactif / Déchu</strong> dans PointelRH.</li>
              <li>Son compte d'authentification utilisateur sera désactivé.</li>
              <li>Les certificats et attestations de travail sont archivés.</li>
            </ul>
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="tertiary" onClick={() => setConfirmCompleteOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => handleTransition({ type: 'COMPLETE_OFFBOARDING' })}
              isLoading={transitionMutation.isPending}
            >
              Confirmer la Clôture Définitive
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Annuler la procédure d'Offboarding"
      >
        <p className="text-xs text-on-surface-variant -mt-2 mb-4">
          Indiquez le motif de rétractation ou d'annulation du départ.
        </p>
        <div className="space-y-4 pt-2">
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Ex: Rétractation de démission acceptée, renouvellement de contrat..."
            className="w-full text-sm p-3.5 rounded-xl border border-on-surface/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="tertiary" onClick={() => setCancelModalOpen(false)}>
              Retour
            </Button>
            <Button
              variant="danger"
              onClick={() => handleTransition({ type: 'CANCEL', reason: cancelReason })}
              disabled={!cancelReason.trim()}
              isLoading={transitionMutation.isPending}
            >
              Confirmer l'Annulation
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};
