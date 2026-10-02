import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { UserAvatarCell } from '@/components/common/UserAvatarCell';
import { CreateOffboardingModal } from './components/CreateOffboardingModal';
import { OffboardingDetailModal } from './components/OffboardingDetailModal';
import { useOffboardingStats, useOffboardingSessions } from './hooks/useOffboarding';

const DEPARTURE_REASONS: Record<string, string> = {
  RESIGNATION: 'Démission',
  DISMISSAL: 'Licenciement',
  END_OF_CONTRACT: 'Fin de contrat',
  TRIAL_PERIOD_TERMINATION: 'Fin période d’essai',
  MUTUAL_AGREEMENT: 'Rupture conventionnelle',
  RETIREMENT: 'Retraite',
  OTHER: 'Autre motif',
};

export const OffboardingDashboardPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useOffboardingStats();
  const { data: sessions = [], isLoading: sessionsLoading } = useOffboardingSessions({
    search: search || undefined,
    status: statusFilter || undefined,
    departureReason: reasonFilter || undefined,
  });

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'INITIATED', label: 'Initié' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'PENDING_DOCUMENTS', label: 'Attente documents' },
    { value: 'COMPLETED', label: 'Clôturé' },
    { value: 'CANCELLED', label: 'Annulé' },
  ];

  const reasonOptions = [
    { value: '', label: 'Tous les motifs' },
    { value: 'RESIGNATION', label: 'Démission' },
    { value: 'DISMISSAL', label: 'Licenciement' },
    { value: 'END_OF_CONTRACT', label: 'Fin de contrat' },
    { value: 'TRIAL_PERIOD_TERMINATION', label: 'Fin période d’essai' },
    { value: 'MUTUAL_AGREEMENT', label: 'Rupture conventionnelle' },
    { value: 'RETIREMENT', label: 'Retraite' },
  ];

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header ── */}
      <PageHeader
        title="Offboarding & Départs"
        subtitle="Pilotage des sorties de collaborateurs, passations des dossiers et conformité administrative."
        actions={
          <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus size={18} />
            <span>Initier un départ</span>
          </Button>
        }
      />

      {/* ── 2. KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Départs en cours"
          value={stats?.activeCount ?? 0}
          icon={Users}
          variant="primary"
          subtitle="Procédures ouvertes et actives"
          isLoading={statsLoading}
        />
        <MetricCard
          title="Clôturés ce mois"
          value={stats?.completedThisMonth ?? 0}
          icon={CheckCircle2}
          variant="emerald"
          subtitle="Départs finalisés et archivés"
          isLoading={statsLoading}
        />
        <MetricCard
          title="Tâches en retard"
          value={stats?.overdueTasksCount ?? 0}
          icon={AlertTriangle}
          variant="rose"
          subtitle="Échéances dépassées"
          isLoading={statsLoading}
        />
        <MetricCard
          title="Tâches à traiter"
          value={stats?.totalPendingTasks ?? 0}
          icon={Clock}
          variant="indigo"
          subtitle="Checklists tous services confondus"
          isLoading={statsLoading}
        />
      </div>

      {/* ── 3. Barre de recherche et filtres ── */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Rechercher par nom, prénom ou email..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              options={reasonOptions}
            />
          </div>
        </div>
      </div>

      {/* ── 4. Tableau des départs ── */}
      <Card className="rounded-2xl bg-surface-container-lowest border border-on-surface/10 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-on-surface/10 bg-surface-container-low/50 hover:bg-surface-container-low/50">
              <TableHead className="py-3.5 pl-6 font-semibold text-on-surface-variant text-xs">Collaborateur</TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">Motif de départ</TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">Dernier jour</TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">Fin de contrat</TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">Progression</TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">Statut</TableHead>
              <TableHead className="py-3.5 pr-6 font-semibold text-on-surface-variant text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sessionsLoading ? (
              <Skeleton.TableRow columns={7} rows={4} />
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8">
                  <EmptyState
                    icon={Users}
                    title="Aucune procédure de départ"
                    description="Aucun collaborateur ne correspond aux filtres appliqués."
                    action={{
                      label: 'Initier un départ',
                      onClick: () => setCreateModalOpen(true),
                      icon: Plus,
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session: any) => {
                const emp = session.employee;
                const reasonLabel = DEPARTURE_REASONS[session.departureReason] || session.departureReason?.replace(/_/g, ' ') || 'Non spécifié';

                return (
                  <TableRow
                    key={session.id}
                    className="hover:bg-surface-container-low/40 border-b border-on-surface/5 last:border-b-0 transition-colors"
                  >
                    {/* Collaborateur */}
                    <TableCell className="py-3.5 pl-6">
                      <UserAvatarCell
                        firstName={emp?.firstName}
                        lastName={emp?.lastName}
                        subtitle={emp?.email || emp?.department?.name || 'Collaborateur'}
                        onClick={() => setSelectedSessionId(session.id)}
                      />
                    </TableCell>

                    {/* Motif de départ (sans tiret du bas) */}
                    <TableCell className="py-3.5">
                      <span className="text-xs sm:text-sm font-medium text-on-surface">
                        {reasonLabel}
                      </span>
                    </TableCell>

                    {/* Dernier jour */}
                    <TableCell className="py-3.5 text-xs text-on-surface">
                      {session.lastWorkingDay ? (
                        format(parseISO(session.lastWorkingDay), 'dd MMM yyyy', { locale: fr })
                      ) : (
                        <span className="text-on-surface-variant/50">—</span>
                      )}
                    </TableCell>

                    {/* Fin de contrat */}
                    <TableCell className="py-3.5 text-xs text-on-surface">
                      {session.contractEndDate ? (
                        format(parseISO(session.contractEndDate), 'dd MMM yyyy', { locale: fr })
                      ) : (
                        <span className="text-on-surface-variant/50">—</span>
                      )}
                    </TableCell>

                    {/* Progression */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2.5 w-28">
                        <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${session.progressPercent ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-on-surface">
                          {session.progressPercent ?? 0}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Statut sans tiret du bas */}
                    <TableCell className="py-3.5">
                      <StatusBadge status={session.status} />
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-3.5 pr-6 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedSessionId(session.id)}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        <span>Détails</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Initier un départ */}
      <CreateOffboardingModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Modal Détails Offboarding */}
      <OffboardingDetailModal
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </div>
  );
};
