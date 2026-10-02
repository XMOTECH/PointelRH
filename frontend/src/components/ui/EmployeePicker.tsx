import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MagnifyingGlass,
  Check,
  CaretUpDown,
  X,
  User,
  Briefcase,
  Buildings,
} from '@phosphor-icons/react';
import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import { cleanLabel } from '@/features/schedules/utils/planning.utils';

export interface EmployeePickerOption {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  departmentName?: string | null;
  avatarUrl?: string | null;
  totalWeeklyHours?: number | null;
  maxWeeklyHours?: number | null;
}

export interface EmployeePickerProps {
  label?: string;
  value?: string | null;
  onChange: (employeeId: string, employee?: EmployeePickerOption | null) => void;
  employees: EmployeePickerOption[];
  placeholder?: string;
  allowClear?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export const EmployeePicker: React.FC<EmployeePickerProps> = ({
  label,
  value,
  onChange,
  employees,
  placeholder = 'Sélectionner un collaborateur...',
  allowClear = false,
  error,
  disabled = false,
  className,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Collaborateur actuellement sélectionné
  const selectedEmployee = useMemo(() => {
    if (!value) return null;
    return employees.find((emp) => emp.id === value) || null;
  }, [value, employees]);

  // Filtrage insensible à la casse et aux accents
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const query = searchQuery.toLowerCase().trim();
    return employees.filter((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const job = (emp.jobTitle || '').toLowerCase();
      const dept = (emp.departmentName || '').toLowerCase();
      return fullName.includes(query) || job.includes(query) || dept.includes(query);
    });
  }, [employees, searchQuery]);

  // Réinitialiser l'index surligné quand le filtre change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredEmployees.length]);

  // Focus automatique du champ de recherche à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Fermeture au clic extérieur
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

  // Navigation clavier (<kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Entrée</kbd>, <kbd>Échap</kbd>)
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
      setHighlightedIndex((prev) => (prev < filteredEmployees.length - 1 ? prev + 1 : prev));
      scrollHighlightedIntoView(highlightedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      scrollHighlightedIntoView(highlightedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredEmployees[highlightedIndex]) {
        handleSelect(filteredEmployees[highlightedIndex]);
      }
    }
  };

  const scrollHighlightedIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-employee-item]');
    const targetItem = items[index] as HTMLElement;
    if (targetItem) {
      targetItem.scrollIntoView({ block: 'nearest' });
    }
  };

  const handleSelect = (emp: EmployeePickerOption) => {
    onChange(emp.id, emp);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', null);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full text-left', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* ── Bouton Déclencheur (Trigger) ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full h-10 px-3 py-1.5 rounded-xl border bg-white text-left transition-all duration-150',
          'flex items-center justify-between gap-2 cursor-pointer shadow-2xs hover:border-slate-300',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200',
          error ? 'border-rose-400 bg-rose-50/20' : '',
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedEmployee ? (
            <>
              <Avatar
                firstName={selectedEmployee.firstName}
                lastName={selectedEmployee.lastName}
                src={selectedEmployee.avatarUrl}
                size="xs"
                className="shrink-0"
              />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </span>
                {selectedEmployee.jobTitle && (
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 truncate border border-slate-200/60 shrink-0">
                    {cleanLabel(selectedEmployee.jobTitle)}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
                <User size={13} />
              </div>
              <span className="text-xs font-normal">{placeholder}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {allowClear && selectedEmployee && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              title="Désassigner"
            >
              <X size={13} weight="bold" />
            </span>
          )}
          <CaretUpDown size={15} className="text-slate-400" />
        </div>
      </button>

      {/* ── Popover Déroulant (Searchable Menu) ── */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Champ de recherche instantanée */}
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
                placeholder="Rechercher par nom, prénom ou poste..."
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

          {/* Liste déroulante des collaborateurs */}
          <div ref={listRef} className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50/60">
            {filteredEmployees.length === 0 ? (
              <div className="py-6 px-4 text-center">
                <User size={24} className="mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-medium text-slate-600">Aucun collaborateur trouvé</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Aucun résultat pour « {searchQuery} »
                </p>
              </div>
            ) : (
              filteredEmployees.map((emp, index) => {
                const isSelected = emp.id === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={emp.id}
                    data-employee-item
                    onClick={() => handleSelect(emp)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'px-2.5 py-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors text-left',
                      isSelected
                        ? 'bg-blue-50/80 text-blue-900'
                        : isHighlighted
                        ? 'bg-slate-50 text-slate-800'
                        : 'text-slate-700 hover:bg-slate-50/80'
                    )}
                  >
                    {/* Identité : Avatar + Nom + Détails */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar
                        firstName={emp.firstName}
                        lastName={emp.lastName}
                        src={emp.avatarUrl}
                        size="xs"
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'text-xs truncate',
                              isSelected ? 'font-bold text-blue-900' : 'font-semibold text-slate-800'
                            )}
                          >
                            {emp.firstName} {emp.lastName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {emp.jobTitle && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Briefcase size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{cleanLabel(emp.jobTitle)}</span>
                            </span>
                          )}
                          {emp.departmentName && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Buildings size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{cleanLabel(emp.departmentName)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Partie droite : Volume horaire hebdo + Checkmark */}
                    <div className="flex items-center gap-2 shrink-0">
                      {typeof emp.totalWeeklyHours === 'number' && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {emp.totalWeeklyHours}h
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

      {error && (
        <p className="text-[11px] font-medium text-rose-600 mt-1 flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
