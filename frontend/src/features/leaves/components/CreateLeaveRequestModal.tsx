import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { leavesApi, type CreateLeaveRequestDTO } from '../api/leaves.api';
import { useLeaveTypes } from '../hooks/useLeaveTypes';
import { useMyBalance } from '../hooks/useMyBalance';
import { Button } from '@/components/ui/Button';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

function countBusinessDays(start: string, end: string): number {
  if (!start || !end) return 0;
  let count = 0;
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export const CreateLeaveRequestModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { data: leaveTypes } = useLeaveTypes();
  const { data: balances } = useMyBalance();

  const [form, setForm] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    half_day: false,
    half_day_period: 'morning' as 'morning' | 'afternoon',
    reason: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);

  const selectedType = leaveTypes?.find((t) => t.id === form.leave_type_id);
  const selectedBalance = balances?.find((b) => b.leave_type_id === form.leave_type_id);

  const daysCount = useMemo(() => {
    if (form.half_day) return 0.5;
    return countBusinessDays(form.start_date, form.end_date);
  }, [form.start_date, form.end_date, form.half_day]);

  const insufficientBalance = selectedBalance && daysCount > 0 && daysCount > selectedBalance.remaining;

  const createMutation = useMutation({
    mutationFn: (data: CreateLeaveRequestDTO | FormData) => leavesApi.createMyLeave(data),
    onSuccess: () => {
      toast.success('Demande de congé soumise avec succès');
      onSuccess();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Erreur lors de la soumission';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leave_type_id || !form.start_date || !form.end_date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (attachment) {
      const fd = new FormData();
      fd.append('leave_type_id', form.leave_type_id);
      fd.append('start_date', form.start_date);
      fd.append('end_date', form.end_date);
      if (form.half_day) {
        fd.append('half_day', '1');
        fd.append('half_day_period', form.half_day_period);
      }
      if (form.reason) fd.append('reason', form.reason);
      fd.append('attachment', attachment);
      createMutation.mutate(fd);
    } else {
      const payload: CreateLeaveRequestDTO = {
        leave_type_id: form.leave_type_id,
        start_date: form.start_date,
        end_date: form.end_date,
      };
      if (form.half_day) {
        payload.half_day = true;
        payload.half_day_period = form.half_day_period;
      }
      if (form.reason) payload.reason = form.reason;
      createMutation.mutate(payload);
    }
  };

  const update = (key: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Sync dates for half-day
      if (key === 'half_day' && value && next.start_date) {
        next.end_date = next.start_date;
      }
      if (key === 'start_date' && next.half_day) {
        next.end_date = value;
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">Nouvelle demande de congé</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type de congé */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Type de congé *
            </label>
            <select
              value={form.leave_type_id}
              onChange={(e) => update('leave_type_id', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Sélectionner un type</option>
              {leaveTypes?.map((t) => {
                const bal = balances?.find((b) => b.leave_type_id === t.id);
                return (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.max_days_per_year !== null && bal
                      ? ` (${bal.remaining} jours restants)`
                      : t.max_days_per_year === null
                        ? ' (illimité)'
                        : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Demi-journée */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.half_day}
              onChange={(e) => update('half_day', e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="text-sm text-on-surface font-medium">Demi-journée</span>
          </label>

          {form.half_day && (
            <div className="flex gap-3">
              {(['morning', 'afternoon'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => update('half_day_period', period)}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                    form.half_day_period === period
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {period === 'morning' ? 'Matin' : 'Après-midi'}
                </button>
              ))}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Date début *
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Date fin *
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => update('end_date', e.target.value)}
                min={form.start_date || new Date().toISOString().split('T')[0]}
                disabled={form.half_day}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Days count display */}
          {daysCount > 0 && (
            <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant">
              <span className="text-sm text-on-surface-variant">Jours ouvrés demandés</span>
              <span className="text-lg font-black text-primary">{daysCount}</span>
            </div>
          )}

          {/* Insufficient balance warning */}
          {insufficientBalance && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 border border-red-200">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">
                Solde insuffisant ({selectedBalance?.remaining} jours restants)
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Motif
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => update('reason', e.target.value)}
              rows={3}
              placeholder="Raison de votre demande (optionnel)"
              className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Attachment */}
          {selectedType?.requires_attachment && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Justificatif requis *
              </label>
              <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary transition-colors">
                <Upload size={18} className="text-on-surface-variant" />
                <span className="text-sm text-on-surface-variant">
                  {attachment ? attachment.name : 'Cliquez pour joindre un fichier (PDF, JPG, PNG)'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={
                createMutation.isPending ||
                !form.leave_type_id ||
                !form.start_date ||
                !form.end_date ||
                (selectedType?.requires_attachment && !attachment)
              }
            >
              {createMutation.isPending ? 'Envoi...' : 'Soumettre'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
