import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PlaneTakeoff,
  Calendar,
  Plus,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Hourglass,
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
import { Card } from '@/components/ui/Card';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<string, { label: string; icon: any; badgeClass: string }> = {
  pending: { label: 'En attente', icon: Hourglass, badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { label: 'Approuvé', icon: CheckCircle2, badgeClass: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Refusé', icon: XCircle, badgeClass: 'bg-red-100 text-red-700 border-red-200' },
  escalated: { label: 'Escaladé', icon: AlertTriangle, badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
};

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'Attente' },
  { key: 'approved', label: 'Approuvés' },
  { key: 'rejected', label: 'Refusés' },
];

function BalanceCard({ balance }: { balance: LeaveBalance }) {
  const pct = balance.allocated > 0 ? ((balance.used + balance.pending) / balance.allocated) * 100 : 0;
  const lt = balance.leave_type;
  const color = (typeof lt === 'object' && lt ? lt.color : null) || '#3B82F6';

  return (
    <Card className="premium-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-bold text-sm text-on-surface">{typeof lt === 'object' && lt ? lt.name : 'Congé'}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-black text-on-surface">{balance.remaining}</span>
        <span className="text-xs text-on-surface-variant">/ {balance.allocated} jours</span>
      </div>
      <div className="w-full bg-surface-container-low rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-wider">
        <span>Utilisés : {balance.used}</span>
        <span>En attente : {balance.pending}</span>
      </div>
    </Card>
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
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase italic flex items-center gap-3">
            <PlaneTakeoff size={28} />
            Mes Congés
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">
            Consultez vos soldes et gérez vos demandes de congé.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)} className="gap-2">
          <Plus size={18} />
          Nouvelle demande
        </Button>
      </div>

      {/* Balance Cards */}
      {balances && balances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {balances.map((b: LeaveBalance) => (
            <BalanceCard key={b.id} balance={b} />
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              filter === tab.key
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-outline-variant'
                : 'text-on-surface-variant/40 hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leave Requests List */}
      <div className="space-y-3">
        {filteredLeaves.length === 0 ? (
          <Card className="premium-card p-12 text-center">
            <PlaneTakeoff size={40} className="mx-auto mb-3 text-on-surface-variant/20" />
            <p className="text-on-surface-variant/40 italic">Aucune demande de congé à afficher.</p>
          </Card>
        ) : (
          filteredLeaves.map((leave: LeaveRequest) => {
            const statusCfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            const lt = leave.leave_type;
            const leaveTypeName = typeof lt === 'object' && lt ? lt.name : (lt || 'Congé');
            const leaveColor = (typeof lt === 'object' && lt ? lt.color : null) || '#6B7280';

            return (
              <Card key={leave.id} className="premium-card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Type badge */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: leaveColor }}
                    >
                      <PlaneTakeoff size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-on-surface">
                          {leaveTypeName}
                        </span>
                        {leave.half_day && (
                          <span className="text-[10px] font-bold bg-surface-container-low px-2 py-0.5 rounded-full text-on-surface-variant uppercase">
                            {leave.half_day_period === 'morning' ? 'Matin' : 'Après-midi'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant/60">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(leave.start_date), 'dd MMM', { locale: fr })}
                          {' - '}
                          {format(new Date(leave.end_date), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        {leave.days_count && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {leave.days_count} jour{Number(leave.days_count) > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {leave.reason && (
                        <p className="text-xs text-on-surface-variant/50 mt-1 truncate">{leave.reason}</p>
                      )}
                      {leave.status === 'rejected' && leave.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">
                          Motif : {leave.rejection_reason}
                        </p>
                      )}
                      {leave.status === 'approved' && leave.approver && (
                        <p className="text-[10px] text-on-surface-variant/40 mt-1">
                          Approuvé par {leave.approver.first_name} {leave.approver.last_name}
                          {leave.approved_at && ` le ${format(new Date(leave.approved_at), 'dd/MM/yyyy', { locale: fr })}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={`${statusCfg.badgeClass} flex items-center gap-1`}>
                      <StatusIcon size={12} />
                      {statusCfg.label}
                    </Badge>
                    {leave.status === 'pending' && (
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-600 !p-2"
                        onClick={() => cancelMutation.mutate(leave.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
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
