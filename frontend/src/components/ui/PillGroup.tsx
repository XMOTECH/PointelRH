import React from 'react';
import { cn } from '@/lib/utils';

export interface PillOption<T = any> {
  value: T;
  label: React.ReactNode;
  sublabel?: string;
  dotColor?: string;
  badge?: React.ReactNode;
}

export interface PillGroupProps<T = any> {
  options: PillOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'subtle' | 'outline' | 'solid';
  className?: string;
  disabled?: boolean;
}

export function PillGroup<T = any>({
  options,
  value,
  onChange,
  size = 'sm',
  variant = 'outline',
  className = '',
  disabled = false,
}: PillGroupProps<T>) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px] gap-1 rounded-md',
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    md: 'px-3 py-1.5 text-xs sm:text-sm gap-2 rounded-xl',
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {options.map((opt, idx) => {
        const isSelected = value !== undefined && opt.value === value;

        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center font-medium transition-all duration-150 cursor-pointer select-none border',
              sizeClasses[size],
              isSelected
                ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
              disabled ? 'opacity-40 pointer-events-none' : ''
            )}
          >
            {opt.dotColor && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: opt.dotColor }}
              />
            )}
            <span className="truncate">{opt.label}</span>
            {opt.sublabel && (
              <span className={cn('text-[10px] font-normal font-mono', isSelected ? 'text-blue-600/80' : 'text-slate-400')}>
                {opt.sublabel}
              </span>
            )}
            {opt.badge}
          </button>
        );
      })}
    </div>
  );
}
