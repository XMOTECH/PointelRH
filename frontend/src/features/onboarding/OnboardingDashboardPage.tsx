import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { TabsFilter } from '@/components/common/TabsFilter';
import { EmptyState } from '@/components/common/EmptyState';
import { UserPlus } from 'lucide-react';
import { useOnboardingSessions, useCreateSession } from './hooks/useOnboarding';
import { useOnboardingExecutiveAnalytics } from './hooks/useOnboardingExecutiveAnalytics';
import { CreateSessionModal } from './components/CreateSessionModal';
import { ShareInviteModal } from './components/ShareInviteModal';
import { SessionDetailModal } from './components/SessionDetailModal';
import { OnboardingTableRow } from './components/OnboardingTableRow';
import { OnboardingMetricsGrid } from './components/OnboardingMetricsGrid';
import { OnboardingRiskRadar } from './components/OnboardingRiskRadar';
import { OnboardingUpcomingHorizon } from './components/OnboardingUpcomingHorizon';
import { OnboardingExecutiveCharts } from './components/OnboardingExecutiveCharts';
import type { OnboardingSession } from './types';

export const OnboardingDashboardPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [justCreatedSession, setJustCreatedSession] = useState<OnboardingSession | null>(null);

  const { data: sessions = [], isLoading } = useOnboardingSessions(selectedStatus);
  const createSession = useCreateSession();

  // Calcul des métriques exécutives DRH
  const analytics = useOnboardingExecutiveAnalytics(sessions);

  // Metrics computation
  const totalCount = sessions.length;
  const invitedCount = sessions.filter((s) => s.status === 'INVITED').length;
  const inReviewCount = sessions.filter((s) => s.status === 'IN_REVIEW').length;
  const readyDayOneCount = sessions.filter((s) => s.status === 'READY_FOR_DAY_ONE').length;
  const completedCount = sessions.filter((s) => s.status === 'COMPLETED').length;

  const filteredSessions = sessions.filter((s) => {
    const staging = (s.stagingData as Record<string, any>) || (s as any).staging_data || {};
    const fullName = `${staging.candidateFirstName || staging.candidate_first_name || ''} ${
      staging.candidateLastName || staging.candidate_last_name || ''
    }`.toLowerCase();
    const email = (staging.candidateEmail || staging.candidate_email || s.employee?.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const tabOptions = [
    { id: 'ALL', label: 'Tous les dossiers', count: sessions.length },
    { id: 'INVITED', label: 'Invitations', count: invitedCount },
    { id: 'IN_REVIEW', label: 'À réviser', count: inReviewCount },
    { id: 'READY_FOR_DAY_ONE', label: 'Prêts Jour J', count: readyDayOneCount },
    { id: 'COMPLETED', label: 'Terminés', count: completedCount },
  ];

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header (Style Linear / Stripe : Titre pur sans bla-bla) ── */}
      <PageHeader
        title="Onboarding"
        actions={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus size={16} />
            <span>Nouveau parcours</span>
          </Button>
        }
      />

      {/* ── 2. Metric KPI Cards Stratégiques DRH ── */}
      <OnboardingMetricsGrid
        totalCount={totalCount}
        inReviewCount={inReviewCount}
        readyDayOneCount={readyDayOneCount}
        completedCount={completedCount}
        isLoading={isLoading}
        analytics={analytics}
      />

      {/* ── 3. Cockpit Décisionnel DRH (Tour des Risques & Radar Horizon 14j) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar des Arrivées Chronologiques */}
        <OnboardingUpcomingHorizon
          arrivals={analytics.upcomingArrivals}
          onSelectSession={(id) => setSelectedSessionId(id)}
        />

        {/* Tour de Contrôle des Risques & Bloquants */}
        <OnboardingRiskRadar
          alerts={analytics.riskAlerts}
          onSelectSession={(id) => setSelectedSessionId(id)}
        />
      </div>

      {/* ── 4. Graphiques & Analytique Stratégique (Style Tremor) ── */}
      <OnboardingExecutiveCharts
        distribution={analytics.departmentDistribution}
        averageCompletionRate={analytics.averageCompletionRate}
        timeToOnboard={analytics.averageTimeToOnboardDays}
      />

      {/* ── 5. Barre de filtrage & Recherche ── */}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
        <TabsFilter
          tabs={tabOptions}
          activeTab={selectedStatus}
          onChange={setSelectedStatus}
        />


        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher par candidat, email..."
          />
        </div>
      </div>

      {/* ── 4. Tableau Principal Épuré ── */}
      <Card className="overflow-hidden border-on-surface/10 bg-surface-container-lowest">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low/50 hover:bg-surface-container-low/50 border-b border-on-surface/10">
              <TableHead className="py-3 pl-6 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                Candidat / Collaborateur
              </TableHead>
              <TableHead className="py-3 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                Modèle de parcours
              </TableHead>
              <TableHead className="py-3 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                Jour J d'embauche
              </TableHead>
              <TableHead className="py-3 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                Progression
              </TableHead>
              <TableHead className="py-3 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                Statut
              </TableHead>
              <TableHead className="py-3 pr-6 text-right font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-b border-on-surface/5">
                  <TableCell className="py-3.5 pl-6"><Skeleton className="h-10 w-48 rounded-lg" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-2 w-28" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="py-3.5 pr-6 text-right"><Skeleton className="h-7 w-16 ml-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12">
                  <EmptyState
                    title="Aucun dossier d'onboarding"
                    description={
                      searchQuery
                        ? 'Aucun résultat ne correspond à votre recherche.'
                        : 'Créez un nouveau parcours pour inviter un collaborateur.'
                    }
                    action={{
                      label: 'Nouvel Onboarding',
                      onClick: () => setIsCreateModalOpen(true),
                      icon: UserPlus,
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => (
                <OnboardingTableRow
                  key={session.id}
                  session={session}
                  onSelect={(id) => setSelectedSessionId(id)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Création */}
      <CreateSessionModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => {
          createSession.mutate(data, {
            onSuccess: (createdSession) => {
              setIsCreateModalOpen(false);
              setJustCreatedSession(createdSession);
            },
          });
        }}
        isLoading={createSession.isPending}
      />

      {/* Modal Partage & Confirmation immédiate après création */}
      <ShareInviteModal
        open={!!justCreatedSession}
        onClose={() => setJustCreatedSession(null)}
        session={justCreatedSession}
        onViewDetails={(sessionId) => {
          setSelectedSessionId(sessionId);
        }}
      />

      {/* Modal 360° Détail */}
      <SessionDetailModal
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        sessionId={selectedSessionId}
      />
    </div>
  );
};
