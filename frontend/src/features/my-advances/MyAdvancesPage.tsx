import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Plus, Clock, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import api from '../../lib/axios';
import { toast } from 'sonner';

interface AdvanceRequest {
  id: string;
  amount: number;
  type: string;
  reason: string | null;
  status: string;
  repaid: boolean;
  createdAt: string;
}

export function MyAdvancesPage() {
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('advance');
  const [reason, setReason] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/api/employee/my-advances');
      setRequests(res.data?.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/employee/my-advances', {
        amount: numAmount,
        type,
        reason: reason || undefined,
      });
      toast.success('Votre demande a été soumise avec succès');
      setAmount('');
      setReason('');
      fetchRequests();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la soumission';
      toast.error(msg);
    } finally {
      setSubmitting(false);
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
          Demandes d'Acomptes & Prêts Sociaux
        </h1>
        <p className="text-on-surface-variant mt-1 font-medium">
          Sollicitez des avances sur salaire ou des aides de manière confidentielle et sécurisée.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <Card className="bg-surface-container-lowest h-fit border border-outline-variant/40">
          <CardHeader className="border-b border-outline-variant/20">
            <CardTitle className="text-md flex items-center gap-2">
              <Plus size={18} className="text-primary" />
              Nouvelle Demande
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Type d'aide</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                >
                  <option value="advance">Acompte sur salaire (Fin de mois)</option>
                  <option value="loan">Prêt d'aide sociale (Urgence / Fêtes)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Montant demandé (FCFA)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 50000"
                  required
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Motif / Justification (Optionnel)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Expliquez brièvement votre demande (visible uniquement par le service RH)"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                />
              </div>

              <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Soumettre la Demande
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface-container-lowest border border-outline-variant/40">
            <CardHeader className="border-b border-outline-variant/20">
              <CardTitle className="text-md flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                Historique des Demandes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center text-on-surface-variant/40 text-sm italic">
                  Chargement de l'historique...
                </div>
              ) : requests.length === 0 ? (
                <div className="py-16 text-center text-on-surface-variant/40 text-sm italic">
                  Aucune demande effectuée pour le moment.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {requests.map((req) => (
                    <div key={req.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors hover:bg-surface-container-low/20">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-bold text-on-surface">
                            {req.amount.toLocaleString('fr-FR')} FCFA
                          </span>
                          <Badge variant="default" className="text-[10px]">
                            {req.type === 'advance' ? 'Acompte' : 'Prêt'}
                          </Badge>
                        </div>
                        {req.reason && (
                          <p className="text-xs text-on-surface-variant/80 italic font-medium">
                            "{req.reason}"
                          </p>
                        )}
                        <p className="text-[10px] text-on-surface-variant/40">
                          Demandé le {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(req.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legal Help Alert */}
          <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
            <HelpCircle className="text-primary shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Réglementation Sociale (Sénégal)</h4>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                Les acomptes sur salaires sont limités à 50% de la rémunération de base. Les prêts sociaux font l'objet d'un échéancier de retenues sur salaire convenu d'un commun accord avec la Direction des Ressources Humaines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
