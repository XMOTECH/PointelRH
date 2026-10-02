import React, { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
  showClear?: boolean;
  shortcut?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher...',
  debounceMs,
  onDebouncedChange,
  showClear = true,
  shortcut,
  className,
  autoFocus,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(value);

  // Synchronisation avec la valeur externe
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce si spécifié
  useEffect(() => {
    if (!debounceMs || !onDebouncedChange) return;
    const timer = setTimeout(() => {
      onDebouncedChange(internalValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onDebouncedChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    onChange(val);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    if (onDebouncedChange) onDebouncedChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative flex items-center w-full min-w-[200px]', className)}>
      <Search
        size={16}
        className="absolute left-3.5 text-on-surface-variant/50 pointer-events-none shrink-0"
      />
      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'h-10 w-full rounded-xl border border-on-surface/10 bg-surface-container-low pl-10 pr-9 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-surface-container-lowest'
        )}
      />
      <div className="absolute right-3 flex items-center gap-1.5">
        {showClear && internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-on-surface-variant/50 hover:text-primary transition-colors cursor-pointer"
            title="Effacer"
          >
            <X size={14} />
          </button>
        )}
        {shortcut && !internalValue && (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant/50 bg-surface-container-high border border-on-surface/10 rounded">
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  );
};
