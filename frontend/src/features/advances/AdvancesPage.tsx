import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Check, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '../../lib/axios';
import { toast } from 'sonner';

interface Employee {
  first_name: string;
  last_name: string;
  department?: { name: string };
}

interface AdvanceRequest {
  id: string;
  amount: number;
  type: string;
  reason: string | null;
  status: string;
  createdAt: string;
  employee: Employee;
}

export function AdvancesPage() {
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await api.get('/api/employees/advances');
      } catch {
        res = await api.get('/api/advances');
      }
      setRequests(res.data?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setActioning(id);
    try {
      try {
        await api.patch(`/api/employees/advances/${id}/status`, { status });
      } catch {
        await api.patch(`/api/advances/${id}/status`, { status });
      }
      toast.success(status === 'approved' ? 'Demande approuvée' : 'Demande rejetée');
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors du traitement');
    } finally {
      setActioning(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Acceptée</Badge>;
      case 'rejected': return <Badge variant="error">Refusée</Badge>;
      default: return <Badge variant="warning">En attente</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8"
    >
      <div>
        <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase flex items-center gap-3">
          <HeartHandshake className="text-primary" size={32} />
          Validation des Acomptes & Prêts Sociaux
        </h1>
        <p className="text-on-surface-variant mt-1 font-medium">
          Validez les demandes d'aide financière et d'acomptes de fin de mois soumises par les collaborateurs.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant/40 text-sm italic">
            Chargement des demandes...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant/40 text-sm italic">
            Aucune demande d'acompte ou de prêt en attente de traitement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[10px] font-space font-semibold text-on-surface-variant/50 uppercase tracking-[0.15em] bg-surface-container-low/20">
                  <th className="px-6 py-4">Collaborateur</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Motif</th>
                  <th className="px-6 py-4">Date de Demande</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-container-low/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-on-surface text-sm">
                        {req.employee?.first_name || (req.employee as any)?.firstName}{' '}
                        {req.employee?.last_name || (req.employee as any)?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-on-surface-variant/80">
                      {req.employee?.department?.name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default" className="text-[10px]">
                        {req.type === 'advance' ? 'Acompte' : 'Prêt'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface text-sm">
                      {Number(req.amount || 0).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant/80 max-w-[200px] truncate" title={req.reason || undefined}>
                      {req.reason || <span className="text-on-surface-variant/40 italic">Aucun</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant/60">
                      {new Date(req.createdAt || (req as any).created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAction(req.id, 'approved')}
                            disabled={actioning !== null}
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-40"
                            title="Approuver la demande"
                          >
                            {actioning === req.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'rejected')}
                            disabled={actioning !== null}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40"
                            title="Rejeter la demande"
                          >
                            {actioning === req.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant/40 italic font-medium">Traité</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
