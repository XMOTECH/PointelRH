import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  User,
  ShieldCheck,
  CheckCircle2,
  Save,
  PenTool,
  Clock,
  Sparkles,
} from 'lucide-react';
import { performanceApi } from '../api/performance.api';
import type { PerformanceEvaluation, EvaluationSection } from '../types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EvaluationDetailModalProps {
  evaluationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const EvaluationDetailModal: React.FC<EvaluationDetailModalProps> = ({
  evaluationId,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [evaluation, setEvaluation] = useState<PerformanceEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selfAnswers, setSelfAnswers] = useState<Record<string, any>>({});
  const [selfRating, setSelfRating] = useState<number | undefined>(undefined);

  const [managerAnswers, setManagerAnswers] = useState<Record<string, any>>({});
  const [managerRating, setManagerRating] = useState<number>(3);
  const [sharedNotes, setSharedNotes] = useState<string>('');

  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    if (isOpen && evaluationId) {
      loadEvaluation(evaluationId);
    }
  }, [isOpen, evaluationId]);

  const loadEvaluation = async (id: string) => {
    try {
      setLoading(true);
      const data = await performanceApi.getEvaluation(id);
      setEvaluation(data);

      // Preload answers
      if (data.selfReviewData) {
        setSelfAnswers(data.selfReviewData);
      }
      if (data.selfRating) {
        setSelfRating(data.selfRating);
      }
      if (data.managerReviewData) {
        setManagerAnswers(data.managerReviewData);
      }
      if (data.managerRating) {
        setManagerRating(data.managerRating);
      }
      if (data.sharedNotes) {
        setSharedNotes(data.sharedNotes);
      }
    } catch (err: any) {
      toast.error('Impossible de charger la session d\'évaluation');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !evaluationId) return null;

  const isEmployeeOwner = user?.employee_id === evaluation?.employeeId;
  const isEvaluator = user?.employee_id === evaluation?.evaluatorId;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const sections: EvaluationSection[] =
    (evaluation?.campaign?.template?.sections as any) || [];

  // Handlers
  const handleSaveDraftSelf = async () => {
    if (!evaluation) return;
    try {
      setSubmitting(true);
      await performanceApi.saveDraftSelfReview(evaluation.id, selfAnswers, selfRating);
      toast.success('Brouillon d\'auto-évaluation sauvegardé.');
      loadEvaluation(evaluation.id);
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitSelf = async () => {
    if (!evaluation) return;
    try {
      setSubmitting(true);
      await performanceApi.submitSelfReview(evaluation.id, selfAnswers, selfRating);
      toast.success('Auto-évaluation transmise au manager avec succès !');
      loadEvaluation(evaluation.id);
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitManager = async () => {
    if (!evaluation) return;
    try {
      setSubmitting(true);
      await performanceApi.submitManagerReview(
        evaluation.id,
        managerAnswers,
        managerRating,
        sharedNotes,
      );
      toast.success('Évaluation managériale enregistrée et transmise en calibration/signature !');
      loadEvaluation(evaluation.id);
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSign = async (role: 'EMPLOYEE' | 'MANAGER') => {
    if (!evaluation) return;
    try {
      setSubmitting(true);
      await performanceApi.signEvaluation(evaluation.id, role);
      toast.success(`Signature enregistrée avec succès pour le rôle ${role} !`);
      loadEvaluation(evaluation.id);
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la signature');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-surface-container font-medium text-on-surface-variant">Non démarré</span>;
      case 'SELF_EVALUATION':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-600 font-medium">Auto-évaluation</span>;
      case 'MANAGER_REVIEW':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-600 font-medium">Revue Manager</span>;
      case 'CALIBRATION':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-purple-500/10 text-purple-600 font-medium">En signature</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-600 font-medium">Clôturé & Signé</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] bg-surface rounded-2xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Award size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-on-surface">
                  {evaluation?.employee?.firstName} {evaluation?.employee?.lastName}
                </h3>
                {getStatusBadge(evaluation?.status)}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {evaluation?.campaign?.title} • Poste : {evaluation?.employee?.jobTitle || 'Non renseigné'} • Département : {evaluation?.employee?.department?.name || 'Général'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-outline-variant bg-surface-container-low overflow-x-auto shrink-0">
          {sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === idx
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {sec.title}
            </button>
          ))}
          <button
            onClick={() => setActiveTab(sections.length)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === sections.length
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Synthèse & Signatures
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
              <p className="text-sm">Chargement de la grille d'évaluation...</p>
            </div>
          ) : activeTab < sections.length ? (
            // Questions View
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <h4 className="text-sm font-bold text-on-surface">
                  {sections[activeTab]?.title}
                </h4>
                {sections[activeTab]?.description && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    {sections[activeTab]?.description}
                  </p>
                )}
              </div>

              {sections[activeTab]?.questions.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-on-surface">{q.label}</h5>
                      {q.hint && (
                        <p className="text-xs text-on-surface-variant mt-0.5">{q.hint}</p>
                      )}
                    </div>
                    {q.type === 'RATING_1_5' && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                        Barème 1 à 5
                      </span>
                    )}
                  </div>

                  {/* Rating or Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Colonne Collaborateur */}
                    <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <User size={14} /> Auto-évaluation du collaborateur
                      </div>

                      {q.type === 'RATING_1_5' ? (
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              disabled={!isEmployeeOwner || evaluation?.status !== 'SELF_EVALUATION' && evaluation?.status !== 'NOT_STARTED'}
                              onClick={() => setSelfAnswers({ ...selfAnswers, [q.id]: val })}
                              className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                                selfAnswers[q.id] === val
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white border border-blue-200 text-blue-950 hover:bg-blue-100 disabled:opacity-50'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          rows={2}
                          disabled={!isEmployeeOwner || evaluation?.status !== 'SELF_EVALUATION' && evaluation?.status !== 'NOT_STARTED'}
                          value={selfAnswers[q.id] || ''}
                          onChange={(e) => setSelfAnswers({ ...selfAnswers, [q.id]: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-blue-200 bg-white text-xs text-on-surface resize-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                          placeholder="Votre auto-évaluation..."
                        />
                      )}
                    </div>

                    {/* Colonne Manager */}
                    <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <ShieldCheck size={14} /> Évaluation du Manager
                      </div>

                      {q.type === 'RATING_1_5' ? (
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              disabled={(!isEvaluator && !isAdmin) || evaluation?.status === 'COMPLETED'}
                              onClick={() => setManagerAnswers({ ...managerAnswers, [q.id]: val })}
                              className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                                managerAnswers[q.id] === val
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-white border border-amber-200 text-amber-950 hover:bg-amber-100 disabled:opacity-50'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          rows={2}
                          disabled={(!isEvaluator && !isAdmin) || evaluation?.status === 'COMPLETED'}
                          value={managerAnswers[q.id] || ''}
                          onChange={(e) => setManagerAnswers({ ...managerAnswers, [q.id]: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-amber-200 bg-white text-xs text-on-surface resize-none focus:outline-hidden focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
                          placeholder="Commentaires et appréciation du manager..."
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Synthèse & Signatures Tab
            <div className="space-y-6">
              {/* Score Recap Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-xs font-semibold text-blue-900">Auto-évaluation</span>
                  <div className="text-2xl font-bold text-blue-700 mt-1">
                    {evaluation?.selfRating ? `${evaluation.selfRating} / 5` : 'En attente'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
                  <span className="text-xs font-semibold text-amber-900">Note Manager</span>
                  <div className="text-2xl font-bold text-amber-700 mt-1">
                    {evaluation?.managerRating ? `${evaluation.managerRating} / 5` : 'En attente'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <span className="text-xs font-semibold text-emerald-900">Note Finale Globale</span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">
                    {evaluation?.finalRating ? `${evaluation.finalRating} / 5` : 'Calculée à la signature'}
                  </div>
                </div>
              </div>

              {/* Shared notes */}
              <div className="p-5 rounded-2xl border border-outline-variant bg-surface space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <h4 className="text-sm font-bold text-on-surface">Synthèse des Échanges & Décisions Communes</h4>
                </div>
                <textarea
                  rows={4}
                  disabled={(!isEvaluator && !isAdmin) || evaluation?.status === 'COMPLETED'}
                  value={sharedNotes}
                  onChange={(e) => setSharedNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline bg-surface text-xs text-on-surface resize-none focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
                  placeholder="Points d'accord, engagements mutuels pour l'année à venir, ajustements de salaire ou formations convenues..."
                />
              </div>

              {/* Dual Signature Block */}
              <div className="p-5 rounded-2xl border border-outline-variant bg-surface space-y-4">
                <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <PenTool size={18} className="text-primary" />
                  Double Signature Électronique
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Signature Collaborateur */}
                  <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-3">
                    <span className="text-xs font-semibold text-on-surface-variant block">Collaborateur</span>
                    <p className="text-sm font-bold text-on-surface">
                      {evaluation?.employee?.firstName} {evaluation?.employee?.lastName}
                    </p>
                    {evaluation?.employeeSignedAt ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                        <CheckCircle2 size={16} />
                        Signé le {new Date(evaluation.employeeSignedAt).toLocaleDateString('fr-FR')}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!isEmployeeOwner || evaluation?.status !== 'CALIBRATION' || submitting}
                        onClick={() => handleSign('EMPLOYEE')}
                        className="w-full py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        <PenTool size={14} /> Apposer ma signature
                      </button>
                    )}
                  </div>

                  {/* Signature Manager */}
                  <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-3">
                    <span className="text-xs font-semibold text-on-surface-variant block">Manager / Évaluateur</span>
                    <p className="text-sm font-bold text-on-surface">
                      {evaluation?.evaluator?.firstName} {evaluation?.evaluator?.lastName}
                    </p>
                    {evaluation?.managerSignedAt ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                        <CheckCircle2 size={16} />
                        Signé le {new Date(evaluation.managerSignedAt).toLocaleDateString('fr-FR')}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={(!isEvaluator && !isAdmin) || evaluation?.status !== 'CALIBRATION' || submitting}
                        onClick={() => handleSign('MANAGER')}
                        className="w-full py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        <PenTool size={14} /> Signer en tant que manager
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Clock size={16} />
            <span>Statut : {evaluation?.status}</span>
          </div>

          <div className="flex items-center gap-3">
            {isEmployeeOwner && (evaluation?.status === 'NOT_STARTED' || evaluation?.status === 'SELF_EVALUATION') && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraftSelf}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Save size={14} /> Enregistrer Brouillon
                </button>
                <button
                  type="button"
                  onClick={handleSubmitSelf}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Soumettre l'auto-évaluation
                </button>
              </>
            )}

            {(isEvaluator || isAdmin) && evaluation?.status === 'MANAGER_REVIEW' && (
              <button
                type="button"
                onClick={handleSubmitManager}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Valider l'évaluation managériale
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
