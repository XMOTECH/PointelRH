import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColorItem {
  label: string;
  value: string;
}

export interface ColorPickerBarProps {
  colors: ColorItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const ColorPickerBar: React.FC<ColorPickerBarProps> = ({
  colors,
  value,
  onChange,
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)} role="radiogroup" aria-label="Sélection de couleur">
      {colors.map((c) => {
        const isSelected = value.toLowerCase() === c.value.toLowerCase();

        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(c.value)}
            title={c.label}
            className={cn(
              'rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer shadow-2xs focus:outline-none',
              sizeMap[size],
              isSelected
                ? 'scale-110 ring-2 ring-blue-600 ring-offset-2'
                : 'hover:scale-105 opacity-85 hover:opacity-100'
            )}
            style={{ backgroundColor: c.value }}
          >
            {isSelected && <Check size={13} className="text-white drop-shadow-xs" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
};
