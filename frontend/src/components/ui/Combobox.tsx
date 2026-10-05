import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MagnifyingGlass, Check, CaretUpDown, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export interface ComboboxOption<T = any> {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
  data?: T;
}

export interface ComboboxProps<T = any> {
  label?: string;
  options: ComboboxOption<T>[];
  value?: string | null;
  onChange: (value: string, option?: ComboboxOption<T> | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowClear?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function Combobox<T = any>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Rechercher...',
  allowClear = false,
  error,
  disabled = false,
  className,
  required = false,
}: ComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find((opt) => opt.value === value) || null;
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredOptions[highlightedIndex];
      if (item && !item.disabled) {
        onChange(item.value, item);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={cn('relative w-full text-left', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full min-h-[42px] px-3.5 py-2 rounded-xl border bg-white text-left transition-all duration-150',
          'flex items-center justify-between gap-2 cursor-pointer shadow-2xs hover:border-slate-300',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200',
          error ? 'border-rose-400 bg-rose-50/20' : '',
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="text-xs font-semibold text-slate-800 truncate">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 truncate border border-slate-200/60 shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {allowClear && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('', null);
                setIsOpen(false);
              }}
              className="p-1 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X size={13} weight="bold" />
            </span>
          )}
          <CaretUpDown size={15} className="text-slate-400" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative flex items-center">
              <MagnifyingGlass
                size={14}
                className="absolute left-3 text-slate-400 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200/80 bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>
          </div>

          <div ref={listRef} className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50/60">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-4 text-center">
                <p className="text-xs font-medium text-slate-600">Aucun résultat trouvé</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Pour « {searchQuery} »</p>
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(opt.value, opt);
                        setIsOpen(false);
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'px-3 py-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors text-left',
                      isSelected
                        ? 'bg-blue-50/80 text-blue-900'
                        : isHighlighted
                        ? 'bg-slate-50 text-slate-800'
                        : 'text-slate-700 hover:bg-slate-50/80',
                      opt.disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'text-xs truncate block',
                            isSelected ? 'font-bold text-blue-900' : 'font-semibold text-slate-800'
                          )}
                        >
                          {opt.label}
                        </span>
                        {opt.description && (
                          <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected ? (
                        <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check size={12} weight="bold" />
                        </div>
                      ) : (
                        <div className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
