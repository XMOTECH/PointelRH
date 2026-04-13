import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, ListTodo, User, Calendar, Clock, Flame, ArrowRight, ChevronDown, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { tasksApi, type CreateTaskDTO } from '../api/tasks.api';
import api from '../../../lib/axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateTaskDTO & { assigned_to: string }>({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    mission_id: '',
    due_date: '',
    estimated_minutes: undefined,
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => api.get('/api/employees').then(r => r.data?.data ?? r.data),
    enabled: open,
  });

  const { data: missions } = useQuery({
    queryKey: ['missions-list'],
    queryFn: () => api.get('/api/missions').then(r => r.data?.data ?? r.data),
    enabled: open,
  });

  const create = useMutation({
    mutationFn: (data: CreateTaskDTO) => tasksApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success('Tache creee avec succes');
      setForm({ title: '', description: '', priority: 'medium', assigned_to: '', mission_id: '', due_date: '', estimated_minutes: undefined });
      onClose();
    },
    onError: () => toast.error('Erreur lors de la creation'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.assigned_to) {
      toast.error('Titre et employe requis');
      return;
    }
    const payload: CreateTaskDTO = {
      title: form.title.trim(),
      assigned_to: form.assigned_to,
      priority: form.priority,
    };
    if (form.description?.trim()) payload.description = form.description.trim();
    if (form.mission_id) payload.mission_id = form.mission_id;
    if (form.due_date) payload.due_date = form.due_date;
    if (form.estimated_minutes) payload.estimated_minutes = form.estimated_minutes;
    create.mutate(payload);
  };

  const priorities = [
    { value: 'high', label: 'Haute', icon: Flame, color: 'text-red-600 bg-red-50 border-red-200' },
    { value: 'medium', label: 'Moyenne', icon: ArrowRight, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { value: 'low', label: 'Basse', icon: ChevronDown, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  ];

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-surface-container-lowest rounded-[2rem] shadow-premium w-full max-w-lg mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ListTodo size={20} className="text-primary" />
              </div>
              <h2 className="text-lg font-display font-bold text-on-surface">Nouvelle tache</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container transition-all">
              <X size={18} className="text-on-surface-variant" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70 ml-1">
                Titre *
              </label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Preparer le rapport mensuel"
                className="mt-1.5 w-full h-10 px-4 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70 ml-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Details supplementaires..."
                rows={2}
                className="mt-1.5 w-full px-4 py-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            {/* Mission (optional) */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70 ml-1">
                Mission (optionnel)
              </label>
              <div className="relative mt-1.5">
                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                <select
                  value={form.mission_id || ''}
                  onChange={e => setForm(f => ({ ...f, mission_id: e.target.value }))}
                  className="w-full h-10 pl-9 pr-4 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="">Aucune mission</option>
                  {(missions || []).map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.title}{m.location ? ` - ${m.location}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70 ml-1">
                Assigner a *
              </label>
              <div className="relative mt-1.5">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                <select
                  value={form.assigned_to}
                  onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                  className="w-full h-10 pl-9 pr-4 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="">Selectionner un employe</option>
                  {(employees || []).map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70 ml-1">
                Priorite
              </label>
              <div className="flex gap-2 mt-1.5">
                {priorities.map(p => {
                  const Icon = p.icon;
                  const isActive = form.priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, priority: p.value as any }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        isActive ? p.color : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <Icon size={14} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due date + Estimated time row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70 ml-1">
                  Echeance
                </label>
                <div className="relative mt-1.5">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type="date"
                    value={form.due_date || ''}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70 ml-1">
                  Temps estime (min)
                </label>
                <div className="relative mt-1.5">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type="number"
                    min={1}
                    value={form.estimated_minutes || ''}
                    onChange={e => setForm(f => ({ ...f, estimated_minutes: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="60"
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={create.isPending || !form.title.trim() || !form.assigned_to}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {create.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creation...
                  </span>
                ) : (
                  'Creer la tache'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
