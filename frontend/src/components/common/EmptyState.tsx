import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { FolderSearch } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?:
    | {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
      }
    | React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto animate-in fade-in duration-300',
        className
      )}
    >
      {/* Icône directe et propre sans boîte de fond */}
      <div className="text-on-surface-variant/40 mb-3">
        <Icon size={36} />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-on-surface font-display tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
          {action &&
            (React.isValidElement(action) ? (
              action
            ) : typeof action === 'object' && 'label' in action ? (
              <Button
                variant="primary"
                onClick={action.onClick}
                className="flex items-center gap-2"
              >
                {action.icon && <action.icon size={16} />}
                <span>{action.label}</span>
              </Button>
            ) : null)}

          {secondaryAction}
        </div>
      )}
    </div>
  );
};
