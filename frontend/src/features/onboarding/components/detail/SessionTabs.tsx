import React from 'react';
import { cn } from '@/lib/utils';
import { CheckSquare, FileText, UserCheck, History } from 'lucide-react';

export type TabKey = 'tasks' | 'docs' | 'data' | 'audit';

interface Props {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  tasksCount: { done: number; total: number };
  docsCount: number;
  hasPendingDocs: boolean;
  auditCount: number;
}

export const SessionTabs: React.FC<Props> = ({
  activeTab,
  onChange,
  tasksCount,
  docsCount,
  hasPendingDocs,
  auditCount,
}) => {
  const tabs = [
    {
      id: 'tasks' as TabKey,
      label: 'Tâches',
      icon: CheckSquare,
      badge: `${tasksCount.done}/${tasksCount.total}`,
      isWarningBadge: false,
    },
    {
      id: 'docs' as TabKey,
      label: 'Documents',
      icon: FileText,
      badge: docsCount > 0 ? `${docsCount}` : undefined,
      isWarningBadge: hasPendingDocs,
    },
    {
      id: 'data' as TabKey,
      label: 'Fiscalité & Profil',
      icon: UserCheck,
      badge: undefined,
      isWarningBadge: false,
    },
    {
      id: 'audit' as TabKey,
      label: 'Audit',
      icon: History,
      badge: auditCount > 0 ? `${auditCount}` : undefined,
      isWarningBadge: false,
    },
  ];

  return (
    <div className="w-full grid grid-cols-4 gap-1 p-1 bg-surface-container-low rounded-xl border border-on-surface/5 select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer py-1.5 px-2 text-xs truncate',
              isActive
                ? 'bg-surface-container-lowest text-primary font-bold shadow-xs border border-on-surface/5'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest/50'
            )}
          >
            <Icon size={14} className={isActive ? 'text-primary shrink-0' : 'opacity-60 shrink-0'} />
            <span className="truncate">{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 transition-colors',
                  tab.isWarningBadge
                    ? 'bg-amber-500/20 text-amber-800'
                    : isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-container-high text-on-surface-variant/80'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
