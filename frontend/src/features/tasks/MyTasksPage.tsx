import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Timer,
  Flame,
  ArrowRight,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { tasksApi, type Task } from './api/tasks.api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PRIORITY_CONFIG = {
  high: { label: 'Haute', color: 'bg-red-100 text-red-700 border-red-200', icon: Flame, dotColor: 'bg-red-500' },
  medium: { label: 'Moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: ArrowRight, dotColor: 'bg-amber-500' },
  low: { label: 'Basse', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ChevronDown, dotColor: 'bg-blue-500' },
};

const STATUS_CONFIG = {
  todo: { label: 'A faire', icon: Circle, color: 'text-on-surface-variant' },
  in_progress: { label: 'En cours', icon: Loader2, color: 'text-primary' },
  done: { label: 'Terminee', icon: CheckCircle2, color: 'text-green-600' },
};

const STATUS_FLOW: Record<string, Task['status']> = {
  todo: 'in_progress',
  in_progress: 'done',
};

function formatMinutes(m: number): string {
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h${rest}m` : `${h}h`;
}

function TaskCard({ task }: { task: Task }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useState<NodeJS.Timeout | null>(null);

  const priority = PRIORITY_CONFIG[task.priority];
  const status = STATUS_CONFIG[task.status];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  const nextStatus = STATUS_FLOW[task.status];

  const updateStatus = useMutation({
    mutationFn: (newStatus: Task['status']) => tasksApi.updateMyTaskStatus(task.id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Statut mis a jour');
    },
  });

  const addComment = useMutation({
    mutationFn: (content: string) => tasksApi.addComment(task.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      setComment('');
      toast.success('Commentaire ajoute');
    },
  });

  const logTime = useMutation({
    mutationFn: (minutes: number) => tasksApi.logTime(task.id, minutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Temps enregistre');
    },
  });

  const handleTimerToggle = () => {
    if (timerRunning) {
      // Stop timer
      if (timerRef[0]) clearInterval(timerRef[0]);
      timerRef[1](null);
      setTimerRunning(false);
      const minutes = Math.max(1, Math.round(timerSeconds / 60));
      logTime.mutate(minutes);
      setTimerSeconds(0);
    } else {
      // Start timer
      setTimerRunning(true);
      const interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
      timerRef[1](interval);
    }
  };

  const timerDisplay = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`;
  const progress = task.estimated_minutes ? Math.min(100, Math.round((task.actual_minutes / task.estimated_minutes) * 100)) : null;

  const isDone = task.status === 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`premium-card overflow-hidden ${isDone ? 'opacity-60' : ''}`}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Status toggle button */}
          <button
            onClick={() => nextStatus && updateStatus.mutate(nextStatus)}
            disabled={isDone || updateStatus.isPending}
            className={`mt-0.5 shrink-0 transition-all duration-200 ${status.color} ${!isDone ? 'hover:scale-110 cursor-pointer' : ''}`}
            title={nextStatus ? `Passer a: ${STATUS_CONFIG[nextStatus].label}` : 'Terminee'}
          >
            <StatusIcon size={22} className={task.status === 'in_progress' ? 'animate-spin' : ''} />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-on-surface text-sm ${isDone ? 'line-through' : ''}`}>
                {task.title}
              </h3>
              <span className={`status-badge text-[10px] border ${priority.color}`}>
                <PriorityIcon size={10} />
                {priority.label}
              </span>
            </div>

            {task.description && (
              <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{task.description}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {task.mission_title && (
                <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <Briefcase size={11} />
                  {task.mission_title}
                </span>
              )}
              {task.due_date && (
                <span className={`flex items-center gap-1 text-xs ${
                  !isDone && new Date(task.due_date) < new Date() ? 'text-red-600 font-semibold' : 'text-on-surface-variant'
                }`}>
                  <Calendar size={12} />
                  {format(new Date(task.due_date), 'dd MMM', { locale: fr })}
                </span>
              )}
              {task.creator_name && (
                <span className="text-xs text-on-surface-variant">
                  par {task.creator_name}
                </span>
              )}
              {task.actual_minutes > 0 && (
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <Clock size={12} />
                  {formatMinutes(task.actual_minutes)}
                  {task.estimated_minutes && ` / ${formatMinutes(task.estimated_minutes)}`}
                </span>
              )}
              {task.comments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <MessageSquare size={12} />
                  {task.comments.length}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {progress !== null && !isDone && (
              <div className="mt-2 h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!isDone && (
              <button
                onClick={handleTimerToggle}
                className={`p-2 rounded-lg transition-all text-xs font-medium flex items-center gap-1 ${
                  timerRunning
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
                title={timerRunning ? 'Arreter le chrono' : 'Demarrer le chrono'}
              >
                <Timer size={14} />
                {timerRunning ? timerDisplay : ''}
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-all"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-outline-variant"
          >
            <div className="p-4 space-y-3">
              {/* Comments */}
              {task.comments.length > 0 && (
                <div className="space-y-2">
                  {task.comments.map(c => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">
                          {c.employee_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-on-surface">{c.employee_name}</span>
                          <span className="text-[10px] text-on-surface-variant">
                            {format(new Date(c.created_at), 'dd/MM HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              {!isDone && (
                <div className="flex gap-2">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && comment.trim() && addComment.mutate(comment.trim())}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 h-8 px-3 text-xs rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <button
                    onClick={() => comment.trim() && addComment.mutate(comment.trim())}
                    disabled={!comment.trim() || addComment.isPending}
                    className="h-8 w-8 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40"
                  >
                    <Send size={12} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function MyTasksPage() {
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => tasksApi.getMyTasks().then(r => r.data?.data ?? r.data),
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-surface-container rounded-lg animate-pulse" />
        <div className="grid gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-surface-container rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const allTasks = tasks || [];
  const filteredTasks = filter === 'all' ? allTasks : allTasks.filter((t: Task) => t.status === filter);

  const todoCount = allTasks.filter((t: Task) => t.status === 'todo').length;
  const inProgressCount = allTasks.filter((t: Task) => t.status === 'in_progress').length;
  const doneCount = allTasks.filter((t: Task) => t.status === 'done').length;
  const totalTime = allTasks.reduce((acc: number, t: Task) => acc + t.actual_minutes, 0);

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
            <h1 className="text-2xl font-display font-bold text-on-surface">Mes Taches</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Gerez vos taches quotidiennes
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Circle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-on-surface">{todoCount}</p>
              <p className="text-xs text-on-surface-variant">A faire</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Loader2 size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-on-surface">{inProgressCount}</p>
              <p className="text-xs text-on-surface-variant">En cours</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-on-surface">{doneCount}</p>
              <p className="text-xs text-on-surface-variant">Terminees</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Timer size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-on-surface">{formatMinutes(totalTime)}</p>
              <p className="text-xs text-on-surface-variant">Temps total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
        {[
          { key: 'all' as const, label: 'Toutes', count: allTasks.length },
          { key: 'todo' as const, label: 'A faire', count: todoCount },
          { key: 'in_progress' as const, label: 'En cours', count: inProgressCount },
          { key: 'done' as const, label: 'Terminees', count: doneCount },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === tab.key
                ? 'bg-surface-container-lowest shadow-sm text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-on-surface-variant/40" />
          </div>
          <p className="text-on-surface-variant font-medium">
            {filter === 'all' ? 'Aucune tache' : `Aucune tache "${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label}"`}
          </p>
          <p className="text-sm text-on-surface-variant/60 mt-1">
            Vos taches apparaitront ici quand votre manager vous en assignera.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task: Task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
