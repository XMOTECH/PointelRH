import React from 'react';
import { Calendar, UserCheck, ArrowRight } from 'lucide-react';

import type { UpcomingArrival } from '../hooks/useOnboardingExecutiveAnalytics';

interface Props {
  arrivals: UpcomingArrival[];
  onSelectSession: (sessionId: string) => void;
}

export const OnboardingUpcomingHorizon: React.FC<Props> = ({ arrivals, onSelectSession }) => {
  return (
    <div className="rounded-xl border border-on-surface/10 bg-surface-container-lowest overflow-hidden shadow-2xs flex flex-col">
      {/* En-tête de la frise */}
      <div className="px-4 py-2.5 bg-surface-container-low/60 border-b border-on-surface/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Calendar size={15} />
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            Radar des Arrivées (Horizon 14 jours)
          </h4>
        </div>
        <span className="text-[10px] font-mono font-semibold text-primary">
          {arrivals.length} arrivée(s) prévue(s)
        </span>
      </div>

      {arrivals.length === 0 ? (
        <div className="p-6 text-center text-xs text-on-surface-variant">
          Aucune prise de poste programmée dans les 14 prochains jours.
        </div>
      ) : (
        <div className="divide-y divide-on-surface/5">
          {arrivals.slice(0, 4).map((arrival) => {
            const isToday = arrival.daysRemaining === 0;

            return (
              <div
                key={arrival.id}
                onClick={() => onSelectSession(arrival.sessionId)}
                className="p-3 hover:bg-surface-container-low/50 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Badge date compact style calendrier */}
                  <div
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 border ${
                      isToday
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 font-bold'
                        : 'bg-surface-container border-on-surface/10 text-on-surface'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant leading-none">
                      {arrival.targetDateFormatted.split(' ')[1] || 'J'}
                    </span>
                    <span className="text-xs font-bold font-mono leading-tight">
                      {arrival.targetDateFormatted.split(' ')[0] || ''}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface truncate">
                        {arrival.candidateName}
                      </span>
                      {arrival.isReady && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                          <UserCheck size={10} />
                          Prêt Jour J
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {arrival.role} • <span className="font-medium text-on-surface/80">{arrival.department}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-[11px] font-mono font-bold block ${
                        isToday
                          ? 'text-amber-800'
                          : arrival.daysRemaining <= 3
                          ? 'text-primary'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {isToday ? "Aujourd'hui !" : `Dans ${arrival.daysRemaining}j`}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {arrival.progress}% complété
                    </span>
                  </div>

                  <ArrowRight
                    size={13}
                    className="text-on-surface-variant/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
