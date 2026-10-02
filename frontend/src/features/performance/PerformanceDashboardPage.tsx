import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Users,
  Star,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { performanceApi } from './api/performance.api';
import type {
  PerformanceCampaign,
  PerformanceEvaluation,
  PerformanceGlobalStats,
} from './types';
import { CampaignModal } from './components/CampaignModal';
import { EvaluationDetailModal } from './components/EvaluationDetailModal';
import { ObjectivesTab } from './components/ObjectivesTab';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const PerformanceDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isManager = user?.role === 'manager';

  const [activeTab, setActiveTab] = useState<'campaigns' | 'evaluations' | 'objectives'>(
    isAdmin || isManager ? 'campaigns' : 'evaluations',
  );

  const [stats, setStats] = useState<PerformanceGlobalStats | null>(null);
  const [campaigns, setCampaigns] = useState<PerformanceCampaign[]>([]);
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsData, campaignsData, evaluationsData] = await Promise.all([
        performanceApi.getGlobalStats().catch(() => null),
        performanceApi.getCampaigns().catch(() => []),
        performanceApi.getEvaluations().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setCampaigns(campaignsData);
      setEvaluations(evaluationsData);
    } catch {
      toast.error('Erreur lors du chargement des données de performance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant">
            <Clock size={12} /> Non démarré
          </span>
        );
      case 'SELF_EVALUATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600">
            <Clock size={12} /> Auto-évaluation
          </span>
        );
      case 'MANAGER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600">
            <Clock size={12} /> Revue Manager
          </span>
        );
      case 'CALIBRATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600">
            <Clock size={12} /> En signature
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 size={12} /> Signé & Clôturé
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-xs">
            <Award size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">
              Performance & Évaluations
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Pilotage des campagnes d'entretiens annuels, revues d'objectifs (OKRs) et calibration des talents
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCampaignModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Lancer une Campagne
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Taux de complétion */}
        <div className="p-5 rounded-2xl bg-surface border border-outline-variant shadow-xs space-y-3">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-semibold uppercase tracking-wider">Taux de Complétion</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-on-surface">
              {stats?.completionRate ?? 0}%
            </span>
            <span className="text-xs text-on-surface-variant">des entretiens clôturés</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${stats?.completionRate ?? 0}%` }}
            />
          </div>
        </div>

        {/* Campagnes Actives */}
        <div className="p-5 rounded-2xl bg-surface border border-outline-variant shadow-xs space-y-3">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-semibold uppercase tracking-wider">Campagnes</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-on-surface">
              {stats?.totalCampaigns ?? campaigns.length}
            </span>
            <span className="text-xs text-on-surface-variant">actives ou archivées</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Exercices annuels & bilans périodiques
          </p>
        </div>

        {/* Évaluations en cours */}
        <div className="p-5 rounded-2xl bg-surface border border-outline-variant shadow-xs space-y-3">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-semibold uppercase tracking-wider">Entretiens en Cours</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-on-surface">
              {stats?.activeEvaluations ?? 0}
            </span>
            <span className="text-xs text-on-surface-variant">à traiter</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Auto-évaluations & revues managers
          </p>
        </div>

        {/* Note Moyenne */}
        <div className="p-5 rounded-2xl bg-surface border border-outline-variant shadow-xs space-y-3">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-semibold uppercase tracking-wider">Note Moyenne</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Star size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-on-surface">
              {stats?.averageRating ? `${stats.averageRating} / 5` : '-'}
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Moyenne générale de l'entreprise
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-outline-variant pb-px">
        {(isAdmin || isManager) && (
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'campaigns'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Calendar size={16} /> Campagnes RH ({campaigns.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'evaluations'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Award size={16} /> Sessions d'Entretien ({evaluations.length})
        </button>

        <button
          onClick={() => setActiveTab('objectives')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'objectives'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <TrendingUp size={16} /> Objectifs & OKRs
        </button>
      </div>

      {/* Content depending on Tab */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-on-surface-variant">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
          <p className="text-xs">Chargement du module de performance...</p>
        </div>
      ) : activeTab === 'campaigns' ? (
        // Tab 1 : Campagnes
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant">
              <Calendar size={40} className="mx-auto text-on-surface-variant/40 mb-3" />
              <p className="text-sm font-semibold text-on-surface">Aucune campagne d'évaluation</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Lancez la première campagne annuelle pour déclencher les entretiens de l'équipe.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-5 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-xs hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Campagne {camp.year}
                      </span>
                      <h3 className="text-base font-bold text-on-surface mt-1.5">{camp.title}</h3>
                      {camp.description && (
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                          {camp.description}
                        </p>
                      )}
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      {camp.status}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-outline-variant grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Début :</span>
                      <span className="font-medium text-on-surface">
                        {new Date(camp.startDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Clôture :</span>
                      <span className="font-medium text-on-surface">
                        {new Date(camp.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                      <Users size={14} /> {camp._count?.evaluations ?? camp.evaluations?.length ?? 0} participants
                    </span>
                    <button
                      onClick={() => setActiveTab('evaluations')}
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Voir les fiches <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'evaluations' ? (
        // Tab 2 : Évaluations
        <div className="space-y-4">
          {evaluations.length === 0 ? (
            <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant">
              <Award size={40} className="mx-auto text-on-surface-variant/40 mb-3" />
              <p className="text-sm font-semibold text-on-surface">Aucun entretien assigné</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Vos fiches d'évaluation apparaîtront dès le lancement de la campagne RH.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold text-[11px] border-b border-outline-variant">
                  <tr>
                    <th className="px-5 py-3.5">Collaborateur</th>
                    <th className="px-5 py-3.5">Campagne</th>
                    <th className="px-5 py-3.5">Évaluateur (Manager)</th>
                    <th className="px-5 py-3.5">Statut</th>
                    <th className="px-5 py-3.5">Note Finale</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-on-surface">
                          {ev.employee?.firstName} {ev.employee?.lastName}
                        </div>
                        <div className="text-[11px] text-on-surface-variant">
                          {ev.employee?.jobTitle || ev.employee?.email}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-on-surface">
                        {ev.campaign?.title}
                      </td>

                      <td className="px-5 py-4 text-on-surface-variant">
                        {ev.evaluator?.firstName} {ev.evaluator?.lastName}
                      </td>

                      <td className="px-5 py-4">
                        {getStatusBadge(ev.status)}
                      </td>

                      <td className="px-5 py-4 font-bold text-on-surface">
                        {ev.finalRating ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <Star size={14} className="fill-emerald-600" />
                            {ev.finalRating} / 5
                          </span>
                        ) : (
                          <span className="text-on-surface-variant">-</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedEvaluationId(ev.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                        >
                          Accéder <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Tab 3 : Objectifs
        <ObjectivesTab />
      )}

      {/* Modals */}
      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSuccess={loadAllData}
      />

      <EvaluationDetailModal
        evaluationId={selectedEvaluationId}
        isOpen={!!selectedEvaluationId}
        onClose={() => setSelectedEvaluationId(null)}
        onRefresh={loadAllData}
      />
    </div>
  );
};
