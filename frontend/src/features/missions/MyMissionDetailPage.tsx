import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Target,
  Users,
  FileText,
  File,
  Download,
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
  Plus,
  Paperclip,
  X,
  Briefcase,
  Image as ImageIcon,
  Video,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { missionsApi } from './api/missions.api';
import type { MyMissionDetail, MyMissionTask, MissionDocument, MyMissionCoworker } from './api/missions.api';
import { tasksApi } from '../tasks/api/tasks.api';
import type { CreateMyTaskDTO } from '../tasks/api/tasks.api';
import { cn } from '../../lib/utils';

// ── Constants ───────────────────────────────────────────

const PRIORITY_CONFIG = {
  high: { label: 'Haute', color: 'bg-red-100 text-red-700 border-red-200', icon: Flame },
  medium: { label: 'Moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: ArrowRight },
  low: { label: 'Basse', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ChevronDown },
};

const STATUS_CONFIG = {
  todo: { label: 'A faire', icon: Circle, color: 'text-on-surface-variant' },
  in_progress: { label: 'En cours', icon: Loader2, color: 'text-primary' },
  done: { label: 'Terminee', icon: CheckCircle2, color: 'text-green-600' },
};

const STATUS_FLOW: Record<string, MyMissionTask['status']> = {
  todo: 'in_progress',
  in_progress: 'done',
};

const FILE_ICONS: Record<string, typeof FileText> = {
  image: ImageIcon, pdf: FileText, video: Video, document: File,
};
const FILE_COLORS: Record<string, string> = {
  image: 'bg-blue-100 text-blue-600',
  pdf: 'bg-red-100 text-red-600',
  video: 'bg-purple-100 text-purple-600',
  document: 'bg-amber-100 text-amber-600',
};

// ── Helpers ─────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h${rest}m` : `${h}h`;
}

// ── Sub-components ──────────────────────────────────────

function StatCard({ icon, label, value, subValue, color }: {
  icon: React.ReactNode; label: string; value: string; subValue: string;
  color: 'emerald' | 'blue' | 'amber' | 'indigo';
}) {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    blue: 'bg-blue-500/10 text-blue-600',
    amber: 'bg-amber-500/10 text-amber-600',
    indigo: 'bg-indigo-500/10 text-indigo-600',
  };
  return (
    <div className="premium-card p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors[color])}>{icon}</div>
        <div>
          <p className="text-2xl font-display font-bold text-on-surface">{value}</p>
          <p className="text-xs text-on-surface-variant">{label}</p>
          <p className="text-[10px] text-on-surface-variant/60">{subValue}</p>
        </div>
      </div>
    </div>
  );
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const isVideo = file.type.startsWith('video/');
  const Icon = isImage ? ImageIcon : isPdf ? FileText : isVideo ? Video : File;
  const colorClass = isImage ? 'border-blue-200 bg-blue-50' : isPdf ? 'border-red-200 bg-red-50' : isVideo ? 'border-purple-200 bg-purple-50' : 'border-amber-200 bg-amber-50';
  return (
    <div className={`relative inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${colorClass}`}>
      <Icon size={12} />
      <span className="max-w-[100px] truncate">{file.name}</span>
      <span className="opacity-60">{formatBytes(file.size)}</span>
      <button onClick={onRemove} className="hover:bg-black/10 rounded-full p-0.5"><X size={10} /></button>
    </div>
  );
}

function DocumentCard({ doc }: { doc: MissionDocument }) {
  const Icon = FILE_ICONS[doc.file_type] || File;
  const colorClass = FILE_COLORS[doc.file_type] || 'bg-gray-100 text-gray-600';
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">{doc.file_name}</p>
        <p className="text-[10px] text-on-surface-variant">
          {formatBytes(doc.file_size)}{doc.uploaded_by_name && ` — ${doc.uploaded_by_name}`}
        </p>
      </div>
      <a href={doc.url} target="_blank" rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Telecharger">
        <Download size={14} />
      </a>
    </div>
  );
}

function CoworkerRow({ coworker }: { coworker: MyMissionCoworker }) {
  return (
    <div className="flex items-center gap-3 p-2">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
        {coworker.first_name[0]}{coworker.last_name[0]}
      </div>
      <div>
        <p className="text-sm font-medium text-on-surface">{coworker.first_name} {coworker.last_name}</p>
        <p className="text-[10px] text-on-surface-variant capitalize">{coworker.role || 'Employe'}</p>
      </div>
    </div>
  );
}

function CreateTaskModal({ missionId, onClose }: { missionId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateMyTaskDTO>({ title: '' });

  const create = useMutation({
    mutationFn: () => tasksApi.createMyTask(missionId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Tache creee');
      onClose();
    },
    onError: () => toast.error('Impossible de creer la tache'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-outline-variant">
          <h2 className="text-lg font-display font-bold text-on-surface">Nouvelle tache</h2>
          <p className="text-xs text-on-surface-variant mt-1">Ajouter une tache sur cette mission</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Titre *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full h-10 px-3 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Ex: Verifier les equipements" />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Description</label>
            <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full h-20 px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              placeholder="Details..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Priorite</label>
              <select value={form.priority || 'medium'} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
                className="w-full h-10 px-3 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest outline-none">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Echeance</label>
              <input type="date" value={form.due_date || ''} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full h-10 px-3 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Estimation (minutes)</label>
            <input type="number" value={form.estimated_minutes || ''} onChange={e => setForm(f => ({ ...f, estimated_minutes: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full h-10 px-3 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest outline-none" placeholder="60" />
          </div>
        </div>
        <div className="p-5 border-t border-outline-variant flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all">Annuler</button>
          <button onClick={() => form.title.trim() && create.mutate()} disabled={!form.title.trim() || create.isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-on-primary hover:brightness-110 transition-all disabled:opacity-40">
            {create.isPending ? 'Creation...' : 'Creer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TaskCard({ task, missionId }: { task: MyMissionTask; missionId: string }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priority = PRIORITY_CONFIG[task.priority];
  const status = STATUS_CONFIG[task.status];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;
  const nextStatus = STATUS_FLOW[task.status];
  const isDone = task.status === 'done';
  const progress = task.estimated_minutes ? Math.min(100, Math.round((task.actual_minutes / task.estimated_minutes) * 100)) : null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['my-mission', missionId] });
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
  };

  const updateStatus = useMutation({
    mutationFn: (s: MyMissionTask['status']) => tasksApi.updateMyTaskStatus(task.id, s),
    onSuccess: () => { invalidate(); toast.success('Statut mis a jour'); },
  });

  const addComment = useMutation({
    mutationFn: ({ content, files }: { content: string; files: File[] }) =>
      tasksApi.addMyComment(task.id, content, files.length > 0 ? files : undefined),
    onSuccess: () => { invalidate(); setComment(''); setAttachments([]); toast.success('Commentaire ajoute'); },
    onError: () => toast.error('Impossible d\'ajouter le commentaire'),
  });

  const logTime = useMutation({
    mutationFn: (minutes: number) => tasksApi.logTime(task.id, minutes),
    onSuccess: () => { invalidate(); toast.success('Temps enregistre'); },
  });

  const handleTimerToggle = () => {
    if (timerRunning) {
      if (timerRef[0]) clearInterval(timerRef[0]);
      timerRef[1](null);
      setTimerRunning(false);
      logTime.mutate(Math.max(1, Math.round(timerSeconds / 60)));
      setTimerSeconds(0);
    } else {
      setTimerRunning(true);
      timerRef[1](setInterval(() => setTimerSeconds(s => s + 1), 1000));
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim() || attachments.length > 0) {
      addComment.mutate({ content: comment.trim() || '(piece jointe)', files: attachments });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - attachments.length);
    const ok = files.filter(f => f.size <= 20 * 1024 * 1024);
    if (ok.length < files.length) toast.error('Fichier(s) trop volumineux (max 20 MB)');
    setAttachments(prev => [...prev, ...ok]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const timerDisplay = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className={`premium-card overflow-hidden ${isDone ? 'opacity-60' : ''}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={() => nextStatus && updateStatus.mutate(nextStatus)} disabled={isDone || updateStatus.isPending}
            className={`mt-0.5 shrink-0 transition-all duration-200 ${status.color} ${!isDone ? 'hover:scale-110 cursor-pointer' : ''}`}>
            <StatusIcon size={22} className={task.status === 'in_progress' ? 'animate-spin' : ''} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-on-surface text-sm ${isDone ? 'line-through' : ''}`}>{task.title}</h3>
              <span className={`status-badge text-[10px] border ${priority.color}`}><PriorityIcon size={10} />{priority.label}</span>
            </div>
            {task.description && <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{task.description}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {task.due_date && (
                <span className={`flex items-center gap-1 text-xs ${!isDone && new Date(task.due_date) < new Date() ? 'text-red-600 font-semibold' : 'text-on-surface-variant'}`}>
                  <Calendar size={12} />{format(new Date(task.due_date), 'dd MMM', { locale: fr })}
                </span>
              )}
              {task.creator_name && <span className="text-xs text-on-surface-variant">par {task.creator_name}</span>}
              {task.actual_minutes > 0 && (
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <Clock size={12} />{formatMinutes(task.actual_minutes)}{task.estimated_minutes && ` / ${formatMinutes(task.estimated_minutes)}`}
                </span>
              )}
              {task.comments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-on-surface-variant"><MessageSquare size={12} />{task.comments.length}</span>
              )}
            </div>
            {progress !== null && !isDone && (
              <div className="mt-2 h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isDone && (
              <button onClick={handleTimerToggle}
                className={`p-2 rounded-lg transition-all text-xs font-medium flex items-center gap-1 ${timerRunning ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}>
                <Timer size={14} />{timerRunning ? timerDisplay : ''}
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-all">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-outline-variant">
            <div className="p-4 space-y-3">
              {task.comments.length > 0 && (
                <div className="space-y-2">
                  {task.comments.map(c => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{c.employee_name?.charAt(0) || '?'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-on-surface">{c.employee_name}</span>
                          <span className="text-[10px] text-on-surface-variant">{format(new Date(c.created_at), 'dd/MM HH:mm', { locale: fr })}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{c.content}</p>
                        {c.attachments && c.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {c.attachments.map(a => {
                              const Icon = FILE_ICONS[a.file_type] || File;
                              const clr = FILE_COLORS[a.file_type] || 'bg-gray-100 text-gray-600';
                              return (
                                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium ${clr} hover:brightness-95 transition-all`}>
                                  <Icon size={12} /><span className="max-w-[120px] truncate">{a.file_name}</span>
                                  <span className="opacity-60">{formatBytes(a.file_size)}</span><Download size={10} className="opacity-60" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isDone && (
                <div className="space-y-2">
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {attachments.map((file, i) => <FilePreview key={`${file.name}-${i}`} file={file} onRemove={() => setAttachments(p => p.filter((_, j) => j !== i))} />)}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx" onChange={handleFileSelect} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={attachments.length >= 5}
                      className="h-8 w-8 shrink-0 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-all disabled:opacity-40">
                      <Paperclip size={14} />
                    </button>
                    <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                      placeholder="Commentaire ou rapport..." className="flex-1 h-8 px-3 text-xs rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    <button onClick={handleSubmitComment} disabled={(!comment.trim() && attachments.length === 0) || addComment.isPending}
                      className="h-8 w-8 shrink-0 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40">
                      {addComment.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ───────────────────────────────────────────

export function MyMissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { data: mission, isLoading } = useQuery({
    queryKey: ['my-mission', id],
    queryFn: () => missionsApi.getMyMission(id!).then(r => r.data?.data ?? r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-6 w-40 bg-surface-container rounded-lg animate-pulse" />
        <div className="h-10 w-80 bg-surface-container rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-surface-container rounded-xl animate-pulse" />)}
        </div>
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-surface-container rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle size={48} className="text-on-surface-variant/40" />
        <p className="text-on-surface-variant font-medium">Mission non trouvee</p>
        <button onClick={() => navigate('/my-missions')} className="text-sm text-primary font-medium hover:underline">Retour</button>
      </div>
    );
  }

  const m = mission as MyMissionDetail;
  const allTasks = m.my_tasks || [];
  const filteredTasks = taskFilter === 'all' ? allTasks : allTasks.filter(t => t.status === taskFilter);
  const todoCount = allTasks.filter(t => t.status === 'todo').length;
  const ipCount = allTasks.filter(t => t.status === 'in_progress').length;
  const doneCount = allTasks.filter(t => t.status === 'done').length;

  const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-primary/10 text-primary' },
    draft: { label: 'Brouillon', color: 'bg-surface-container text-on-surface-variant' },
    completed: { label: 'Terminee', color: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'Annulee', color: 'bg-red-100 text-red-700' },
  };
  const badge = STATUS_BADGE[m.status] || STATUS_BADGE.draft;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/my-missions')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Retour a mes missions
      </button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-on-surface">{m.title}</h1>
          <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', badge.color)}>{badge.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
          {m.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" />{m.location}</span>}
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-primary" />
            {format(new Date(m.start_date), 'dd MMMM yyyy', { locale: fr })}
            {m.end_date && ` — ${format(new Date(m.end_date), 'dd MMM yyyy', { locale: fr })}`}
          </span>
          {m.department && <span className="flex items-center gap-1.5"><Briefcase size={14} />{m.department.name}</span>}
        </div>
        {m.description && <p className="text-sm text-on-surface-variant/70 max-w-3xl">{m.description}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Target size={18} />} label="Progression" value={`${m.stats.progression_percentage}%`}
          subValue={`${m.stats.completed_tasks}/${m.stats.total_tasks} taches totales`} color="emerald" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Mes taches" value={`${m.stats.my_tasks_completed}/${m.stats.my_tasks_total}`}
          subValue="Completees par moi" color="blue" />
        <StatCard icon={<FileText size={18} />} label="Documents" value={`${m.documents.length}`}
          subValue="Fichiers partages" color="amber" />
        <StatCard icon={<Users size={18} />} label="Coequipiers" value={`${m.coworkers.length}`}
          subValue="Autres membres" color="indigo" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-on-surface">Mes taches</h2>
            {m.status === 'active' && (
              <button onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:brightness-110 transition-all">
                <Plus size={14} /> Nouvelle tache
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
            {[
              { key: 'all' as const, label: 'Toutes', count: allTasks.length },
              { key: 'todo' as const, label: 'A faire', count: todoCount },
              { key: 'in_progress' as const, label: 'En cours', count: ipCount },
              { key: 'done' as const, label: 'Terminees', count: doneCount },
            ].map(tab => (
              <button key={tab.key} onClick={() => setTaskFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${taskFilter === tab.key ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Task list */}
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles size={28} className="text-on-surface-variant/30 mb-3" />
              <p className="text-sm text-on-surface-variant">
                {taskFilter === 'all' ? 'Aucune tache assignee' : `Aucune tache "${STATUS_CONFIG[taskFilter as keyof typeof STATUS_CONFIG]?.label}"`}
              </p>
              {m.status === 'active' && taskFilter === 'all' && (
                <button onClick={() => setShowCreateTask(true)} className="text-sm text-primary font-medium mt-2 hover:underline">
                  Creer ma premiere tache
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map(task => <TaskCard key={task.id} task={task} missionId={m.id} />)}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right: Coworkers + Documents */}
        <div className="space-y-6">
          {/* Coworkers */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-display font-bold text-on-surface mb-3 flex items-center gap-2">
              <Users size={16} className="text-primary" /> Coequipiers ({m.coworkers.length})
            </h3>
            {m.coworkers.length > 0 ? (
              <div className="space-y-1">
                {m.coworkers.map(c => <CoworkerRow key={c.id} coworker={c} />)}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant/50 italic py-4 text-center">Vous etes le seul assigne</p>
            )}
          </div>

          {/* Documents */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-display font-bold text-on-surface mb-3 flex items-center gap-2">
              <FileText size={16} className="text-primary" /> Documents ({m.documents.length})
            </h3>
            {m.documents.length > 0 ? (
              <div className="grid gap-2">
                {m.documents.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
              </div>
            ) : (
              <div className="text-center py-6">
                <File size={24} className="mx-auto text-on-surface-variant/30 mb-2" />
                <p className="text-xs text-on-surface-variant/50">Aucun document partage</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create task modal */}
      <AnimatePresence>
        {showCreateTask && <CreateTaskModal missionId={id!} onClose={() => setShowCreateTask(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
