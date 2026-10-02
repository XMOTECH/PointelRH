import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = true,
  disabled = false,
  className = '',
  name = 'segmented-control',
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: 'p-0.5 text-xs h-8',
    md: 'p-1 text-xs sm:text-sm h-9',
    lg: 'p-1 text-sm h-11',
  };

  const itemPadding = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  return (
    <div
      role="radiogroup"
      aria-disabled={disabled}
      className={cn(
        'inline-flex items-center rounded-xl bg-slate-100/90 border border-slate-200/80 select-none transition-colors',
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 pointer-events-none' : '',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const optionId = `${name}-${option.value}`;

        return (
          <button
            key={option.value}
            id={optionId}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex items-center justify-center gap-1.5 font-semibold transition-colors duration-150 rounded-lg cursor-pointer text-center',
              fullWidth ? 'flex-1' : '',
              itemPadding[size],
              isSelected
                ? 'text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
            )}
          >
            {/* Pill de fond animé avec Framer Motion */}
            {isSelected && (
              <motion.div
                layoutId={`segmented-active-${name}`}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/70"
                style={{ zIndex: 0 }}
              />
            )}

            {/* Contenu de l'option (icône, libellé, badge) */}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              <span className="truncate">{option.label}</span>
              {option.badge && <span className="shrink-0">{option.badge}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
