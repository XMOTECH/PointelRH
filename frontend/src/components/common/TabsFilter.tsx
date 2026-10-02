import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TabOption {
  id: string;
  label?: string;
  count?: number;
  icon?: LucideIcon;
}

export interface TabsFilterProps {
  tabs: (TabOption | string)[];
  activeTab: string;
  onChange: (tabId: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const TabsFilter: React.FC<TabsFilterProps> = ({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-on-surface/5 overflow-x-auto max-w-full no-scrollbar',
        className
      )}
    >
      {tabs.map((tabItem) => {
        const tab: TabOption =
          typeof tabItem === 'string'
            ? { id: tabItem, label: tabItem }
            : tabItem;

        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        // Suppression systématique de tous les tirets du bas
        const displayLabel = (tab.label || tab.id)
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase());

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-150 whitespace-nowrap cursor-pointer select-none',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs border border-on-surface/5'
                : 'text-on-surface-variant hover:text-primary'
            )}
          >
            {Icon && <Icon size={size === 'sm' ? 14 : 16} className={isActive ? 'text-primary' : 'opacity-60'} />}
            <span>{displayLabel}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-container-high text-on-surface-variant/80'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
