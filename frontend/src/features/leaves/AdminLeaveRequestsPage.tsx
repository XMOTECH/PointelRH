import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Calendar, Clock, MoreVertical } from 'lucide-react';
import { leavesApi, type LeaveRequest } from './api/leaves.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AdminLeaveRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState<LeaveRequest['status'] | 'all'>('all');
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');

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

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved': return <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">Approuvé</Badge>;
      case 'rejected': return <Badge variant="error">Refusé</Badge>;
      case 'pending': return <Badge variant="warning" className="bg-amber-100 text-amber-700 border-amber-200">En attente</Badge>;
      case 'escalated': return <Badge variant="info" className="bg-indigo-100 text-indigo-700 border-indigo-200">Escaladé</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const getTypeName = (req: LeaveRequest) => {
    const lt = req.leave_type;
    return typeof lt === 'object' && lt ? lt.name : (lt || 'Congé');
  };

  const getTypeColor = (req: LeaveRequest) => {
    const lt = req.leave_type;
    return (typeof lt === 'object' && lt ? lt.color : null) || '#6B7280';
  };

  const handleReject = (id: string) => {
    if (rejectingId === id) {
      updateStatusMutation.mutate({ id, status: 'rejected', rejection_reason: rejectionReason });
    } else {
      setRejectingId(id);
      setRejectionReason('');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase italic">
            Gestion des Congés
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">
            Révision et validation des demandes d'absence des employés.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant">
           {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
             <button
               key={s}
               onClick={() => setFilter(s)}
               className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                 filter === s
                   ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-outline-variant'
                   : 'text-on-surface-variant/40 hover:text-on-surface'
               }`}
             >
               {s === 'all' ? 'Tous' : s === 'pending' ? 'Attente' : s === 'approved' ? 'Validés' : 'Refusés'}
             </button>
           ))}
        </div>
      </div>

      {/* Main Table */}
      <Card className="premium-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low/30 border-b border-outline-variant">
              <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Employé</TableHead>
              <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Type / Dates</TableHead>
              <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Statut</TableHead>
              <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests?.map((req: LeaveRequest) => {
              const employeeName = req.employee
                ? `${req.employee.first_name} ${req.employee.last_name}`
                : (req.employee_name || 'Employé inconnu');

              return (
                <React.Fragment key={req.id}>
                  <TableRow className="group hover:bg-surface-container-low/50 border-b border-outline-variant/30 last:border-0 transition-colors">
                    <TableCell className="py-4">
                       <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: getTypeColor(req) }}
                          >
                             {employeeName[0]}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-on-surface">{employeeName}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTypeColor(req) }} />
                             <span className="text-sm font-semibold text-on-surface">{getTypeName(req)}</span>
                             {req.days_count && (
                               <span className="text-[10px] font-bold bg-surface-container-low px-2 py-0.5 rounded-full text-on-surface-variant flex items-center gap-1">
                                 <Clock size={10} />
                                 {req.days_count}j
                               </span>
                             )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60">
                             <Calendar size={12} />
                             <span>{format(new Date(req.start_date), 'dd MMM', { locale: fr })} - {format(new Date(req.end_date), 'dd MMM yyyy', { locale: fr })}</span>
                             {req.half_day && (
                               <span className="text-[10px] bg-surface-container-low px-1.5 py-0.5 rounded">
                                 {req.half_day_period === 'morning' ? 'Matin' : 'AM'}
                               </span>
                             )}
                          </div>
                          {req.status === 'approved' && req.approver && (
                            <span className="text-[10px] text-on-surface-variant/40">
                              Approuvé par {req.approver.first_name} {req.approver.last_name}
                              {req.approved_at && ` le ${format(new Date(req.approved_at), 'dd/MM/yyyy', { locale: fr })}`}
                            </span>
                          )}
                          {req.status === 'rejected' && req.rejection_reason && (
                            <span className="text-[10px] text-red-600">Motif : {req.rejection_reason}</span>
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="py-4">
                       {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                       {(req.status === 'pending' || req.status === 'escalated') ? (
                         <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="tertiary"
                              size="sm"
                              className="hover:bg-green-50 hover:text-green-600 !p-2"
                              onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'approved' })}
                            >
                               <CheckCircle2 size={18} />
                            </Button>
                            <Button
                              variant="tertiary"
                              size="sm"
                              className="hover:bg-red-50 hover:text-red-600 !p-2"
                              onClick={() => handleReject(req.id)}
                            >
                               <XCircle size={18} />
                            </Button>
                         </div>
                       ) : (
                         <Button variant="tertiary" size="sm" className="btn-ghost !p-2">
                            <MoreVertical size={16} />
                         </Button>
                       )}
                    </TableCell>
                  </TableRow>
                  {/* Rejection reason input */}
                  {rejectingId === req.id && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-2 px-4">
                        <div className="flex items-center gap-2 bg-red-50 rounded-xl p-3 border border-red-200">
                          <input
                            type="text"
                            placeholder="Motif du refus (optionnel)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-red-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleReject(req.id);
                              if (e.key === 'Escape') setRejectingId(null);
                            }}
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            className="!bg-red-600 hover:!bg-red-700 text-white"
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
            })}
            {filteredRequests?.length === 0 && (
              <TableRow>
                 <TableCell colSpan={4} className="h-40 text-center opacity-40 italic">
                    Aucune demande de congé à afficher.
                 </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
