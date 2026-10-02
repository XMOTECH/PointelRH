import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoreHorizontal, MoreVertical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ActionMenuItem {
  id?: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  divider?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerIcon?: 'horizontal' | 'vertical';
  align?: 'left' | 'right';
  className?: string;
  buttonClassName?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  triggerIcon = 'horizontal',
  align = 'right',
  className,
  buttonClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const Icon = triggerIcon === 'horizontal' ? MoreHorizontal : MoreVertical;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          'p-1.5 text-on-surface-variant/70 hover:text-primary transition-colors cursor-pointer',
          isOpen && 'text-primary',
          buttonClassName
        )}
        title="Actions"
      >
        <Icon size={18} />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1.5 w-48 rounded-xl bg-surface-container-lowest border border-on-surface/10 py-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, idx) => (
            <React.Fragment key={item.id || idx}>
              {item.divider && <div className="my-1 border-t border-on-surface/5" />}
              <button
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick();
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors text-left cursor-pointer',
                  item.variant === 'danger'
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-on-surface hover:bg-surface-container-low',
                  item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                )}
              >
                {item.icon && <item.icon size={15} className="shrink-0" />}
                <span className="truncate">{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
