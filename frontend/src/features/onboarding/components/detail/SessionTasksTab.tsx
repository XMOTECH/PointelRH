import React from 'react';
import { Check, ShieldAlert, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  tasks: any[];
  onToggleTask: (task: any) => void;
  isUpdating: boolean;
}

// Configuration visuelle des rôles (Standard SIRH)
const ROLE_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  candidate: {
    label: 'Candidat',
    badgeClass: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20',
  },
  hr_admin: {
    label: 'RH Admin',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  it_admin: {
    label: 'IT & Accès',
    badgeClass: 'bg-sky-500/10 text-sky-800 border-sky-500/20',
  },
  manager: {
    label: 'Manager',
    badgeClass: 'bg-purple-500/10 text-purple-800 border-purple-500/20',
  },
  hse: {
    label: 'HSE & Sécurité',
    badgeClass: 'bg-amber-500/10 text-amber-900 border-amber-500/20',
  },
};

function formatDueDateStatus(dueDateStr?: string, isDone?: boolean) {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return null;

  if (isDone) {
    return {
      label: due.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      isOverdue: false,
      isToday: false,
      badgeClass: 'text-on-surface-variant/70',
    };
  }

  const now = new Date();
  // Normaliser minuit pour comparer les jours
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysLate = Math.abs(diffDays);
    return {
      label: `En retard (${daysLate}j)`,
      isOverdue: true,
      isToday: false,
      badgeClass: 'bg-rose-500/10 text-rose-700 border-rose-500/25 font-bold',
    };
  }

  if (diffDays === 0) {
    return {
      label: "Aujourd'hui",
      isOverdue: false,
      isToday: true,
      badgeClass: 'bg-amber-500/15 text-amber-800 border-amber-500/30 font-bold',
    };
  }

  return {
    label: due.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    isOverdue: false,
    isToday: false,
    badgeClass: 'text-on-surface-variant font-medium',
  };
}

export const SessionTasksTab: React.FC<Props> = ({ tasks, onToggleTask, isUpdating }) => {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-on-surface/10 rounded-xl">
        Aucune tâche configurée pour ce parcours d'onboarding.
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const overdueCount = tasks.filter((t) => {
    if (t.status === 'DONE' || (!t.dueDate && !t.due_date)) return false;
    const due = new Date(t.dueDate || t.due_date);
    return !isNaN(due.getTime()) && due.getTime() < Date.now();
  }).length;

  return (
    <div className="space-y-2.5">
      {/* ── Barre récapitulative compacte (Pattern Linear) ── */}
      <div className="flex items-center justify-between px-1 text-xs text-on-surface-variant">
        <div className="flex items-center gap-3">
          <span>
            Progression : <strong className="text-on-surface">{completedCount}/{tasks.length}</strong>
          </span>
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-rose-600 font-semibold">
              <AlertCircle size={12} />
              {overdueCount} en retard
            </span>
          )}
        </div>
        <span className="text-[11px] text-on-surface-variant/70">
          Cochez pour marquer comme fait
        </span>
      </div>

      {/* ── Table de workflow dense & unifiée (Style Rippling / Linear) ── */}
      <div className="rounded-xl border border-on-surface/10 bg-surface overflow-hidden divide-y divide-on-surface/5 shadow-2xs">
        {tasks.map((task: any) => {
          const isDone = task.status === 'DONE';
          const rawRole = (task.assignedRole || task.assigned_role || 'candidate').toLowerCase();
          const roleInfo = ROLE_CONFIG[rawRole] || {
            label: rawRole,
            badgeClass: 'bg-surface-container text-on-surface-variant border-on-surface/10',
          };
          const dueStatus = formatDueDateStatus(task.dueDate || task.due_date, isDone);
          const prereq = task.prerequisiteTask || task.prerequisite_task;

          return (
            <div
              key={task.id}
              className={cn(
                'group flex items-start justify-between gap-3 p-3 transition-colors',
                isDone
                  ? 'bg-surface/50 opacity-65 hover:opacity-85'
                  : 'hover:bg-surface-container-low/50'
              )}
            >
              {/* Checkbox + Titre & Description */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleTask(task)}
                  disabled={isUpdating}
                  className={cn(
                    'mt-0.5 w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0',
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'border-on-surface-variant/40 hover:border-primary bg-surface'
                  )}
                  title={isDone ? 'Marquer comme non fait' : 'Marquer comme validé'}
                >
                  {isDone && <Check size={12} strokeWidth={3} />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        'text-xs font-semibold leading-snug',
                        isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'
                      )}
                    >
                      {task.title}
                    </p>

                    {prereq && !isDone && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded font-medium">
                        <ShieldAlert size={10} />
                        Prérequis : {prereq.title}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed line-clamp-1 group-hover:line-clamp-none">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Badges de droite : Rôle & Échéance */}
              <div className="flex items-center gap-2 shrink-0 self-center">
                {/* Rôle responsable */}
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                    roleInfo.badgeClass
                  )}
                >
                  {roleInfo.label}
                </span>

                {/* Échéance / Retard */}
                {dueStatus && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border border-transparent font-mono',
                      dueStatus.badgeClass
                    )}
                  >
                    {!dueStatus.isOverdue && <Clock size={10} />}
                    {dueStatus.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
