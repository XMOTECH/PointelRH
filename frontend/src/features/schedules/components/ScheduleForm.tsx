import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Schedule } from '@/features/employees/types';

export interface ScheduleFormData {
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  work_days: number[];
  break_minutes?: number;
}

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormData) => void;
  isLoading?: boolean;
  initialData?: Schedule | null;
}

const DAYS = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 },
  { label: 'Ven', value: 5 },
  { label: 'Sam', value: 6 },
  { label: 'Dim', value: 7 },
];

const BREAK_OPTIONS = [
  { label: 'Sans pause', value: 0 },
  { label: '30 min de pause', value: 30 },
  { label: '45 min de pause', value: 45 },
  { label: '1h00 de pause', value: 60 },
  { label: '1h30 de pause', value: 90 },
  { label: '2h00 de pause', value: 120 },
];

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}) => {
  const isEditing = Boolean(initialData?.id);

  // Form State
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setStartTime(initialData.start_time || '08:00');
        setEndTime(initialData.end_time || '17:00');
        setGraceMinutes(initialData.grace_minutes ?? 15);
        setWorkDays(
          initialData.work_days && initialData.work_days.length > 0
            ? initialData.work_days
            : [1, 2, 3, 4, 5]
        );
        const gross = timeToMinutes(initialData.end_time || '17:00') - timeToMinutes(initialData.start_time || '08:00');
        setBreakMinutes(gross >= 420 ? 60 : 0);
      } else {
        setName('');
        setStartTime('08:00');
        setEndTime('17:00');
        setBreakMinutes(60);
        setGraceMinutes(15);
        setWorkDays([1, 2, 3, 4, 5]);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  // Escape key & scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  // Net calculation
  const { netDailyHours, weeklyNetHours } = useMemo(() => {
    const startM = timeToMinutes(startTime);
    let endM = timeToMinutes(endTime);
    if (endM <= startM) endM += 1440;
    const grossMinutes = endM - startM;
    const netMinutes = Math.max(0, grossMinutes - breakMinutes);
    const daily = Math.round((netMinutes / 60) * 10) / 10;
    const weekly = Math.round((daily * workDays.length) * 10) / 10;
    return { netDailyHours: daily, weeklyNetHours: weekly };
  }, [startTime, endTime, breakMinutes, workDays.length]);

  const toggleDay = useCallback((val: number) => {
    setWorkDays((prev) => {
      if (prev.includes(val)) {
        if (prev.length <= 1) return prev;
        return prev.filter((d) => d !== val);
      }
      return [...prev, val].sort();
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez saisir un nom');
      return;
    }
    onSubmit({
      name: name.trim(),
      start_time: startTime,
      end_time: endTime,
      grace_minutes: graceMinutes,
      work_days: workDays,
      break_minutes: breakMinutes,
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 py-4.5 border-b border-outline-variant/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-on-surface">
            {isEditing ? 'Modifier l’horaire' : 'Nouvel horaire'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              Nom de l’horaire
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ex: Horaire Standard 40h, Équipe Matin..."
              className={error ? 'border-red-500' : ''}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>

          {/* Horaires & Pause en 1 ligne épurée */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              Horaires & Pause
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <span className="text-[10px] text-on-surface-variant/60 uppercase font-bold block mb-1">
                  Arrivée
                </span>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="font-medium text-center"
                />
              </div>

              <div>
                <span className="text-[10px] text-on-surface-variant/60 uppercase font-bold block mb-1">
                  Départ
                </span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="font-medium text-center"
                />
              </div>

              <div>
                <span className="text-[10px] text-on-surface-variant/60 uppercase font-bold block mb-1">
                  Pause repas
                </span>
                <select
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                  className="w-full h-10 px-2.5 text-xs font-medium rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {BREAK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Jours travaillés */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface-variant">
                Jours travaillés ({workDays.length})
              </label>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setWorkDays([1, 2, 3, 4, 5])}
                  className="text-primary font-medium hover:underline text-[11px]"
                >
                  Lun-Ven
                </button>
                <span className="text-outline-variant">·</span>
                <button
                  type="button"
                  onClick={() => setWorkDays([1, 2, 3, 4, 5, 6])}
                  className="text-primary font-medium hover:underline text-[11px]"
                >
                  Lun-Sam
                </button>
                <span className="text-outline-variant">·</span>
                <button
                  type="button"
                  onClick={() => setWorkDays([1, 2, 3, 4, 5, 6, 7])}
                  className="text-primary font-medium hover:underline text-[11px]"
                >
                  Tous
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((day) => {
                const isSelected = workDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface-variant/50 hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tolérance badgeuse */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface-variant">
                Tolérance de retard au pointage
              </label>
              <span className="text-xs font-bold text-on-surface">
                +{graceMinutes} min
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Stepper minimaliste */}
              <div className="flex items-center h-9 bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden">
                <button
                  type="button"
                  onClick={() => setGraceMinutes((g) => Math.max(0, g - 5))}
                  className="w-8 h-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant"
                >
                  <Minus size={13} />
                </button>
                <span className="px-3 text-xs font-bold text-on-surface min-w-[55px] text-center">
                  +{graceMinutes}m
                </span>
                <button
                  type="button"
                  onClick={() => setGraceMinutes((g) => Math.min(60, g + 5))}
                  className="w-8 h-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Raccourcis sobres */}
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15, 30].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setGraceMinutes(v)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                      graceMinutes === v
                        ? 'bg-on-surface text-surface border-on-surface'
                        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    +{v}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé net en 1 ligne discrète */}
          <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Volume effectif net :</span>
            <span className="font-bold text-on-surface">
              {weeklyNetHours} h / semaine{' '}
              <span className="font-normal text-on-surface-variant/60">
                ({netDailyHours}h / jour · {workDays.length}j)
              </span>
            </span>
          </div>

          {/* ── Footer Actions ── */}
          <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold rounded-lg"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              className="h-9 px-4 text-xs font-semibold rounded-lg shadow-sm"
            >
              {isEditing ? 'Enregistrer les modifications' : 'Créer l’horaire'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
