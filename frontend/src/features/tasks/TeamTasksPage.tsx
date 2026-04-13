import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  Flame,
  ArrowRight,
  ChevronDown,
  MessageSquare,
  Trash2,
  Timer,
  Users,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { tasksApi, type Task } from './api/tasks.api';
import { CreateTaskModal } from './components/CreateTaskModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PRIORITY_CONFIG = {
  high: { label: 'Haute', color: 'bg-red-100 text-red-700 border-red-200', icon: Flame, dotColor: 'bg-red-500' },
  medium: { label: 'Moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: ArrowRight, dotColor: 'bg-amber-500' },
  low: { label: 'Basse', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ChevronDown, dotColor: 'bg-blue-500' },
};

const STATUS_CONFIG = {
  todo: { label: 'A faire', icon: Circle, color: 'text-on-surface-variant', bg: 'bg-gray-100' },
  in_progress: { label: 'En cours', icon: Loader2, color: 'text-primary', bg: 'bg-blue-50' },
  done: { label: 'Terminee', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
};

function formatMinutes(m: number): string {
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h${rest}m` : `${h}h`;
}

function TeamTaskRow({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  const queryClient = useQueryClient();
  const priority = PRIORITY_CONFIG[task.priority];
  const status = STATUS_CONFIG[task.status];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: Task['status'] } }) => tasksApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
    },
  });

  const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();
  const progress = task.estimated_minutes ? Math.min(100, Math.round((task.actual_minutes / task.estimated_minutes) * 100)) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`premium-card p-4 ${task.status === 'done' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Status icon */}
        <div className={`w-9 h-9 rounded-xl ${status.bg} flex items-center justify-center shrink-0`}>
          <StatusIcon size={18} className={`${status.color} ${task.status === 'in_progress' ? 'animate-spin' : ''}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-sm text-on-surface truncate ${task.status === 'done' ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            <span className={`status-badge text-[10px] border ${priority.color}`}>
              <PriorityIcon size={10} />
              {priority.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[9px] font-bold text-primary">
                  {task.assignee_name?.charAt(0) || '?'}
                </span>
              </div>
              {task.assignee_name}
            </span>
            {task.mission_title && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <Briefcase size={10} />
                {task.mission_title}
              </span>
            )}
            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-on-surface-variant'}`}>
                <Calendar size={11} />
                {format(new Date(task.due_date), 'dd MMM', { locale: fr })}
              </span>
            )}
            {task.actual_minutes > 0 && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Timer size={11} />
                {formatMinutes(task.actual_minutes)}
                {task.estimated_minutes && ` / ${formatMinutes(task.estimated_minutes)}`}
              </span>
            )}
            {task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <MessageSquare size={11} />
                {task.comments.length}
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        {progress !== null && task.status !== 'done' && (
          <div className="w-20 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-on-surface-variant">{progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Status selector */}
        <select
          value={task.status}
          onChange={e => updateTask.mutate({ id: task.id, data: { status: e.target.value as Task['status'] } })}
          className="h-8 px-2 text-xs rounded-lg border border-outline-variant bg-surface-container-lowest outline-none cursor-pointer"
        >
          <option value="todo">A faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminee</option>
        </select>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-lg text-on-surface-variant/40 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export function TeamTasksPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['team-tasks'],
    queryFn: () => tasksApi.getTasks().then(r => r.data?.data ?? r.data),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success('Tache supprimee');
    },
  });

  const allTasks: Task[] = tasks || [];

  const filteredTasks = allTasks.filter(t => {
    const matchSearch = !searchTerm ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchPriority = !priorityFilter || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const todoCount = allTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = allTasks.filter(t => t.status === 'in_progress').length;
  const doneCount = allTasks.filter(t => t.status === 'done').length;

  // Group by employee
  const byEmployee = filteredTasks.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.assignee_name || 'Non assigne';
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-64 bg-surface-container rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-container rounded-xl animate-pulse" />)}
        </div>
        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-surface-container rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ListTodo size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-on-surface">Taches Equipe</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {allTasks.length} tache(s) au total
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary text-sm group"
        >
          <Plus size={18} className="transition-transform group-hover:rotate-90" />
          Nouvelle tache
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="premium-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Circle size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">{todoCount}</p>
            <p className="text-xs text-on-surface-variant">A faire</p>
          </div>
        </div>
        <div className="premium-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Loader2 size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">{inProgressCount}</p>
            <p className="text-xs text-on-surface-variant">En cours</p>
          </div>
        </div>
        <div className="premium-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">{doneCount}</p>
            <p className="text-xs text-on-surface-variant">Terminees</p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre ou employe..."
            className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-xs font-semibold rounded-xl border border-outline-variant bg-surface-container-lowest outline-none cursor-pointer"
        >
          <option value="">Tous statuts</option>
          <option value="todo">A faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminee</option>
        </select>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="h-10 px-3 text-xs font-semibold rounded-xl border border-outline-variant bg-surface-container-lowest outline-none cursor-pointer"
        >
          <option value="">Toutes priorites</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
      </div>

      {/* Tasks grouped by employee */}
      {Object.keys(byEmployee).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
            <Users size={28} className="text-on-surface-variant/40" />
          </div>
          <p className="text-on-surface-variant font-medium">Aucune tache trouvee</p>
          <p className="text-sm text-on-surface-variant/60 mt-1">
            Creez une nouvelle tache pour votre equipe.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byEmployee).map(([name, employeeTasks]) => {
            const done = employeeTasks.filter(t => t.status === 'done').length;
            const total = employeeTasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{name.charAt(0)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-on-surface">{name}</h3>
                    <span className="text-xs text-on-surface-variant">
                      {done}/{total} terminees
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-on-surface-variant">{pct}%</span>
                  </div>
                </div>
                <div className="grid gap-2 pl-9">
                  <AnimatePresence mode="popLayout">
                    {employeeTasks.map(task => (
                      <TeamTaskRow key={task.id} task={task} onDelete={id => deleteTask.mutate(id)} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateTaskModal open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </motion.div>
  );
}
