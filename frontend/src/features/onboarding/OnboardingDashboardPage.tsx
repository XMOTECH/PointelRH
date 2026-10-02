import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { SearchInput } from '@/components/common/SearchInput';
import { TabsFilter } from '@/components/common/TabsFilter';
import { EmptyState } from '@/components/common/EmptyState';
import { UserAvatarCell } from '@/components/common/UserAvatarCell';
import { CreateSessionModal } from './components/CreateSessionModal';
import { SessionDetailModal } from './components/SessionDetailModal';
import {
  UserPlus,
  Users,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Calendar,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useOnboardingSessions, useCreateSession } from './hooks/useOnboarding';
import { toast } from 'sonner';

export const OnboardingDashboardPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data: sessions = [], isLoading } = useOnboardingSessions(selectedStatus);
  const createSession = useCreateSession();

  // Metrics computation
  const totalCount = sessions.length;
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
    { id: 'INVITED', label: 'Invitations' },
    { id: 'IN_REVIEW', label: 'À réviser', count: inReviewCount },
    { id: 'READY_FOR_DAY_ONE', label: 'Prêts Jour J', count: readyDayOneCount },
    { id: 'COMPLETED', label: 'Titularisés', count: completedCount },
  ];

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header ── */}
      <PageHeader
        title="Onboarding & Intégration"
        subtitle="Pilotage des parcours d'intégration, vérification documentaire et activation automatisée des collaborateurs."
        actions={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus size={18} />
            <span>Nouvel Onboarding</span>
          </Button>
        }
      />

      {/* ── 2. Metric KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Dossiers en cours"
          value={totalCount}
          icon={Users}
          variant="primary"
          subtitle="Total des parcours actifs"
          isLoading={isLoading}
        />
        <MetricCard
          title="À Réviser (RH / HSE)"
          value={inReviewCount}
          icon={AlertCircle}
          variant="amber"
          subtitle="Vérification requise"
          isLoading={isLoading}
        />
        <MetricCard
          title="Prêts Jour J"
          value={readyDayOneCount}
          icon={FileCheck2}
          variant="emerald"
          subtitle="Dossiers prêts pour activation"
          isLoading={isLoading}
        />
        <MetricCard
          title="Titularisés"
          value={completedCount}
          icon={CheckCircle2}
          variant="indigo"
          subtitle="Intégrations finalisées"
          isLoading={isLoading}
        />
      </div>

      {/* ── 3. Barre de filtrage & Recherche ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
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

      {/* ── 4. Tableau Principal ── */}
      <Card className="overflow-hidden border-on-surface/10 bg-surface-container-lowest">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low/50 hover:bg-surface-container-low/50 border-b border-on-surface/10">
              <TableHead className="py-3.5 pl-6 font-semibold text-on-surface-variant text-xs">
                Candidat / Collaborateur
              </TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">
                Modèle de parcours
              </TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">
                Jour J d'embauche
              </TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">
                Progression
              </TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">
                Statut
              </TableHead>
              <TableHead className="py-3.5 pr-6 font-semibold text-on-surface-variant text-xs text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <Skeleton.TableRow columns={6} rows={4} />
            ) : filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8">
                  <EmptyState
                    icon={Users}
                    title="Aucun dossier d'onboarding trouvé"
                    description="Initiez un nouveau parcours d'intégration pour préparer l'arrivée d'un nouveau collaborateur."
                    action={{
                      label: 'Nouvel Onboarding',
                      onClick: () => setIsCreateModalOpen(true),
                      icon: UserPlus,
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => {
                const staging =
                  (session.stagingData as Record<string, any>) || (session as any).staging_data || {};
                const name =
                  `${staging.candidateFirstName || staging.candidate_first_name || ''} ${
                    staging.candidateLastName || staging.candidate_last_name || ''
                  }`.trim() ||
                  (session.employee?.firstName
                    ? `${session.employee?.firstName} ${session.employee?.lastName || ''}`.trim()
                    : '') ||
                  'Candidat';
                const email =
                  staging.candidateEmail || staging.candidate_email || session.employee?.email || '—';
                const phone =
                  staging.candidatePhone || staging.candidate_phone || '';

                const targetDateStr = session.targetStartDate || (session as any).target_start_date;
                const targetDateFormatted =
                  targetDateStr && !isNaN(new Date(targetDateStr).getTime())
                    ? new Date(targetDateStr).toLocaleDateString('fr-FR')
                    : 'À définir';

                const progress = session.progressPercent ?? (session as any).progress_percent ?? 0;
                const token = session.magicToken || (session as any).magic_token;

                return (
                  <TableRow
                    key={session.id}
                    className="hover:bg-surface-container-low/40 transition-colors border-b border-on-surface/5 last:border-b-0"
                  >
                    {/* Candidat (Avatar + Nom + Contact) */}
                    <TableCell className="py-3.5 pl-6">
                      <UserAvatarCell
                        name={name}
                        subtitle={`${email}${phone ? ` • ${phone}` : ''}`}
                        onClick={() => setSelectedSessionId(session.id)}
                      />
                    </TableCell>

                    {/* Modèle de parcours */}
                    <TableCell className="py-3.5">
                      <span className="text-xs sm:text-sm font-medium text-on-surface">
                        {session.template?.name || 'Standard'}
                      </span>
                    </TableCell>

                    {/* Date d'embauche */}
                    <TableCell className="py-3.5">
                      <span className="text-xs text-on-surface flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-on-surface-variant/70 shrink-0" />
                        {targetDateFormatted}
                      </span>
                    </TableCell>

                    {/* Progression */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2.5 w-32">
                        <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-on-surface">
                          {progress}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Statut sans tiret du bas */}
                    <TableCell className="py-3.5">
                      <StatusBadge status={session.status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {token && session.status !== 'CANCELLED' && session.status !== 'COMPLETED' && (
                          <>
                            <button
                              type="button"
                              title="Copier le lien d'intégration candidat"
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              onClick={() => {
                                const url = `${window.location.origin}/onboarding/portal/${token}`;
                                navigator.clipboard.writeText(url);
                                toast.success('Lien Magic Link copié !');
                              }}
                            >
                              <Copy size={15} />
                            </button>
                            <a
                              href={`/onboarding/portal/${token}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Ouvrir le portail candidat dans un nouvel onglet"
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <ExternalLink size={15} />
                            </a>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedSessionId(session.id)}
                        >
                          Voir dossier
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
            onSuccess: () => setIsCreateModalOpen(false),
          });
        }}
        isLoading={createSession.isPending}
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
