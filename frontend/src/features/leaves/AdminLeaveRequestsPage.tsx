import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Calendar, Clock } from 'lucide-react';
import { leavesApi, type LeaveRequest } from './api/leaves.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { TabsFilter } from '@/components/common/TabsFilter';
import { EmptyState } from '@/components/common/EmptyState';
import { UserAvatarCell } from '@/components/common/UserAvatarCell';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AdminLeaveRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<LeaveRequest['status'] | 'all'>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-leaves'],
    queryFn: leavesApi.getLeaveRequests,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, rejection_reason }: { id: string; status: LeaveRequest['status']; rejection_reason?: string }) =>
      leavesApi.updateStatus(id, status, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leaves'] });
      toast.success('Statut de la demande mis à jour');
      setRejectingId(null);
      setRejectionReason('');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const filteredRequests = requests?.filter((req: LeaveRequest) =>
    filter === 'all' ? true : req.status === filter
  );

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

  const getTypeName = (req: LeaveRequest) => safeText(req.leave_type, 'Congé');

  const getTypeColor = (req: LeaveRequest) => {
    const lt = req.leave_type;
    return (typeof lt === 'object' && lt && typeof lt.color === 'string' ? lt.color : null) || '#3B82F6';
  };

  const handleReject = (id: string) => {
    if (rejectingId === id) {
      updateStatusMutation.mutate({ id, status: 'rejected', rejection_reason: rejectionReason });
    } else {
      setRejectingId(id);
      setRejectionReason('');
    }
  };

  const pendingCount = requests?.filter((r) => r.status === 'pending').length;

  const tabOptions = [
    { id: 'all', label: 'Toutes les demandes', count: requests?.length },
    { id: 'pending', label: 'En attente', count: pendingCount },
    { id: 'approved', label: 'Approuvées' },
    { id: 'rejected', label: 'Refusées' },
  ];

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header ── */}
      <PageHeader
        title="Gestion des Absences & Congés"
        subtitle="Examinez et validez les demandes d'absence et congés payés déposées par les collaborateurs."
      >
        <TabsFilter
          tabs={tabOptions}
          activeTab={filter}
          onChange={(tab) => setFilter(tab as any)}
        />
      </PageHeader>

      {/* ── 2. Table ── */}
      <Card className="overflow-hidden border-on-surface/10 bg-surface-container-lowest">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low/50 hover:bg-surface-container-low/50 border-b border-on-surface/10">
              <TableHead className="py-3.5 pl-6 font-semibold text-on-surface-variant text-xs">Collaborateur</TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">Nature de l'absence / Dates</TableHead>
              <TableHead className="py-3.5 font-semibold text-on-surface-variant text-xs">Statut</TableHead>
              <TableHead className="py-3.5 pr-6 font-semibold text-on-surface-variant text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <Skeleton.TableRow columns={4} rows={4} />
            ) : filteredRequests?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8">
                  <EmptyState
                    icon={Calendar}
                    title="Aucune demande de congé"
                    description="Aucune demande d'absence ne correspond au filtre actuellement sélectionné."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests?.map((req: LeaveRequest) => {
                const employeeName = req.employee
                  ? `${req.employee.first_name} ${req.employee.last_name}`
                  : (req.employee_name || 'Employé');

                return (
                  <React.Fragment key={req.id}>
                    <TableRow className="hover:bg-surface-container-low/40 border-b border-on-surface/5 last:border-b-0 transition-colors">
                      {/* Collaborateur */}
                      <TableCell className="py-3.5 pl-6">
                        <UserAvatarCell
                          name={employeeName}
                          subtitle="Collaborateur"
                        />
                      </TableCell>

                      {/* Nature de l'absence & Dates */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: getTypeColor(req) }}
                            />
                            <span className="text-xs sm:text-sm font-semibold text-on-surface">
                              {getTypeName(req)}
                            </span>
                            {req.days_count && (
                              <span className="text-[11px] font-semibold bg-surface-container-low px-2 py-0.5 rounded-full text-on-surface-variant flex items-center gap-1">
                                <Clock size={11} />
                                {req.days_count} j
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <Calendar size={12} className="shrink-0 opacity-70" />
                            <span>
                              {format(new Date(req.start_date), 'dd MMM', { locale: fr })} -{' '}
                              {format(new Date(req.end_date), 'dd MMM yyyy', { locale: fr })}
                            </span>
                            {req.half_day && (
                              <span className="text-[10px] bg-surface-container-high px-1.5 py-0.2 rounded font-medium">
                                {req.half_day_period === 'morning' ? 'Matinée' : 'Après-midi'}
                              </span>
                            )}
                          </div>

                          {req.status === 'approved' && req.approver && (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              Approuvé par {req.approver.first_name} {req.approver.last_name}
                              {req.approved_at &&
                                ` le ${format(new Date(req.approved_at), 'dd/MM/yyyy', { locale: fr })}`}
                            </span>
                          )}

                          {req.status === 'rejected' && req.rejection_reason && (
                            <span className="text-[11px] text-rose-700 font-medium">
                              Motif : {req.rejection_reason}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Statut sans tiret du bas */}
                      <TableCell className="py-3.5">
                        <StatusBadge status={req.status} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 pr-6 text-right">
                        {req.status === 'pending' || req.status === 'escalated' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-emerald-700 hover:bg-emerald-50 !px-2.5"
                              onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'approved' })}
                              title="Approuver la demande"
                            >
                              <CheckCircle2 size={16} />
                              <span className="hidden sm:inline text-xs ml-1 font-semibold">Approuver</span>
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-rose-700 hover:bg-rose-50 !px-2.5"
                              onClick={() => handleReject(req.id)}
                              title="Refuser la demande"
                            >
                              <XCircle size={16} />
                              <span className="hidden sm:inline text-xs ml-1 font-semibold">Refuser</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant/60">Traité</span>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Zone de saisie du motif de refus si activée */}
                    {rejectingId === req.id && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-3 px-6 bg-rose-50/50 border-b border-rose-200/60">
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              placeholder="Indiquez le motif du refus (requis pour le collaborateur)..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="flex-1 h-9 px-3 text-xs sm:text-sm rounded-xl border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-on-surface"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleReject(req.id);
                                if (e.key === 'Escape') setRejectingId(null);
                              }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(req.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              Confirmer le refus
                            </Button>
                            <Button
                              variant="tertiary"
                              size="sm"
                              onClick={() => setRejectingId(null)}
                            >
                              Annuler
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
