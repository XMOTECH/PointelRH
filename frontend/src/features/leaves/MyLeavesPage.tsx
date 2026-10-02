import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PlaneTakeoff,
  Calendar,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { leavesApi, type LeaveRequest, type LeaveBalance } from './api/leaves.api';
import { useMyLeaves } from './hooks/useMyLeaves';
import { useMyBalance } from './hooks/useMyBalance';
import { CreateLeaveRequestModal } from './components/CreateLeaveRequestModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'success' | 'error' | 'default' }> = {
  pending: { label: 'En attente', variant: 'warning' },
  approved: { label: 'Approuvé', variant: 'success' },
  rejected: { label: 'Refusé', variant: 'error' },
  escalated: { label: 'Escaladé', variant: 'warning' },
};

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'approved', label: 'Approuvées' },
  { key: 'rejected', label: 'Refusées' },
];

function safeText(val: any, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object' && val !== null) {
    if (typeof val.name === 'string') return val.name;
    if (typeof val.label === 'string') return val.label;
    if (typeof val.title === 'string') return val.title;
  }
  return fallback;
}

function parseDecimal(val: any, fallback = 0): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || fallback;
  if (typeof val === 'object' && val !== null) {
    if (typeof val.toNumber === 'function') return val.toNumber();
    if ('s' in val && 'e' in val && 'd' in val && Array.isArray(val.d)) {
      const numStr = val.d.join('');
      const sign = val.s === -1 ? -1 : 1;
      const exp = val.e;
      const raw = parseFloat(numStr) * Math.pow(10, exp - numStr.length + 1);
      return isNaN(raw) ? fallback : sign * raw;
    }
    if (typeof val.toString === 'function') return parseFloat(val.toString()) || fallback;
  }
  return fallback;
}

function BalanceCard({ balance }: { balance: LeaveBalance }) {
  const allocated = parseDecimal(balance.allocated, 0);
  const used = parseDecimal(balance.used, 0);
  const pending = parseDecimal(balance.pending, 0);
  const remaining = parseDecimal(balance.remaining, 0);

  const pct = allocated > 0 ? Math.min(100, Math.round(((used + pending) / allocated) * 100)) : 0;
  const lt = balance.leave_type;
  const leaveName = safeText(lt, 'Congé');

  return (
    <div className="bg-surface-container-lowest border border-on-surface/15 rounded-2xl p-5 shadow-none flex flex-col justify-between space-y-4">
      <div>
        <div>
          <span className="font-semibold text-sm text-on-surface">{leaveName}</span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-display font-bold text-on-surface">{remaining}</span>
          <span className="text-sm font-medium text-on-surface-variant">/ {allocated} jours</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-on-surface-variant">
          <span>Pris : <strong className="text-on-surface font-medium">{used}j</strong></span>
          <span>En attente : <strong className="text-on-surface font-medium">{pending}j</strong></span>
        </div>
      </div>
    </div>
  );
}

export const MyLeavesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showModal, setShowModal] = useState(false);

  const { data: leaves, isLoading: loadingLeaves } = useMyLeaves();
  const { data: balances, isLoading: loadingBalances } = useMyBalance();

  const cancelMutation = useMutation({
    mutationFn: (id: string) => leavesApi.cancelMyLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-balance'] });
      toast.success('Demande annulée');
    },
    onError: () => toast.error('Erreur lors de l\'annulation'),
  });

  const filteredLeaves = leaves?.filter((l: LeaveRequest) =>
    filter === 'all' ? true : l.status === filter
  ) ?? [];

  if (loadingLeaves || loadingBalances) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Mes Congés</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Consultez vos soldes et gérez l'ensemble de vos demandes de congé.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="rounded-full shadow-sm gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus size={18} />
          Nouvelle demande
        </Button>
      </div>

      {/* Balance Cards Grid */}
      {balances && balances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {balances.map((b: LeaveBalance) => (
            <BalanceCard key={b.id} balance={b} />
          ))}
        </div>
      )}

      {/* Segmented Control Filter Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex p-1 bg-surface-container-low border border-on-surface/10 rounded-full">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === tab.key
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Unifiée Style Admin */}
      <div className="bg-surface-container-lowest border border-on-surface/15 rounded-2xl shadow-none overflow-hidden">
        <div className="px-6 py-4 border-b border-on-surface/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-on-surface">Historique de mes demandes</h2>
          <span className="text-xs text-on-surface-variant font-medium">
            {filteredLeaves.length} demande{filteredLeaves.length > 1 ? 's' : ''}
          </span>
        </div>

        {filteredLeaves.length === 0 ? (
          <div className="text-center py-12">
            <PlaneTakeoff size={40} className="mx-auto text-on-surface-variant/30 mb-3" />
            <p className="text-sm font-medium text-on-surface-variant">Aucune demande de congé à afficher</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-on-surface/10 bg-surface-container-low/30">
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Type de Congé <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Période demandée <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Durée <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Motif / Justificatif <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    Statut <span className="text-on-surface-variant/50 ml-1">↕</span>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-on-surface/10">
                {filteredLeaves.map((leave: LeaveRequest) => {
                  const statusCfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.pending;
                  const lt = leave.leave_type;
                  const leaveTypeName = safeText(lt, 'Congé');
                  const reasonText = safeText(leave.reason, '');
                  const rejectionText = safeText(leave.rejection_reason, '');
                  const approverName = [safeText(leave.approver?.first_name, ''), safeText(leave.approver?.last_name, '')].filter(Boolean).join(' ');
                  const daysCount = parseDecimal(leave.days_count, 0);

                  return (
                    <tr key={leave.id} className="hover:bg-surface-container-low/50 border-b border-on-surface/10 last:border-b-0 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-on-surface whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{leaveTypeName}</span>
                          {leave.half_day && (
                            <span className="text-[10px] font-bold bg-surface-container-low border border-on-surface/10 px-2 py-0.5 rounded-full text-on-surface-variant uppercase">
                              {leave.half_day_period === 'morning' ? 'Matin' : 'Après-midi'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-on-surface-variant shrink-0" />
                          <span>
                            {format(new Date(leave.start_date), 'dd MMM', { locale: fr })}
                            {' → '}
                            {format(new Date(leave.end_date), 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-on-surface whitespace-nowrap">
                        {daysCount > 0 ? `${daysCount} jour${daysCount > 1 ? 's' : ''}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant max-w-[260px] truncate text-xs">
                        {reasonText || (
                          leave.status === 'rejected' && rejectionText ? (
                            <span className="text-rose-600 font-medium">Refus : {rejectionText}</span>
                          ) : (
                            <span className="text-on-surface-variant/40">—</span>
                          )
                        )}
                        {leave.status === 'approved' && approverName && (
                          <span className="block text-[10px] text-on-surface-variant/60 mt-0.5">
                            Validé par {approverName}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={statusCfg.variant}>
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {leave.status === 'pending' ? (
                          <Button
                            variant="tertiary"
                            size="sm"
                            className="hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 !p-1.5 rounded-full"
                            onClick={() => cancelMutation.mutate(leave.id)}
                            disabled={cancelMutation.isPending}
                            title="Annuler la demande"
                          >
                            <X size={15} />
                          </Button>
                        ) : (
                          <span className="text-on-surface-variant/30 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <CreateLeaveRequestModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
            queryClient.invalidateQueries({ queryKey: ['my-balance'] });
          }}
        />
      )}
    </motion.div>
  );
};
