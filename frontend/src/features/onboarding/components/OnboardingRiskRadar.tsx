import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { RiskAlert } from '../hooks/useOnboardingExecutiveAnalytics';

interface Props {
  alerts: RiskAlert[];
  onSelectSession: (sessionId: string) => void;
}

export const OnboardingRiskRadar: React.FC<Props> = ({ alerts, onSelectSession }) => {
  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
              Conformité 100% Maîtrisée
            </h4>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
              Aucun dossier bloquant pour les prises de poste imminentes.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded-md">
          Risque Zéro
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-500/20 bg-surface-container-lowest overflow-hidden shadow-2xs flex flex-col">
      {/* En-tête de la tour de contrôle */}
      <div className="px-4 py-2.5 bg-rose-500/5 border-b border-rose-500/15 flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-700">
          <ShieldAlert size={15} />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Tour de Contrôle des Risques ({alerts.length})
          </h4>
        </div>
        <span className="text-[10px] font-medium text-rose-700/80">
          Bloquants identifiés avant Jour J
        </span>
      </div>

      {/* Liste des alertes prioritaires */}
      <div className="divide-y divide-on-surface/5">
        {alerts.slice(0, 3).map((alert) => {
          const isCritical = alert.severity === 'critical';
          const Icon = isCritical ? AlertCircle : AlertTriangle;

          return (
            <div
              key={alert.id}
              onClick={() => onSelectSession(alert.sessionId)}
              className="p-3 hover:bg-surface-container-low/50 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    isCritical
                      ? 'bg-rose-500/10 text-rose-700'
                      : 'bg-amber-500/10 text-amber-800'
                  }`}
                >
                  <Icon size={13} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface truncate">
                      {alert.candidateName}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      ({alert.role})
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-rose-800 dark:text-rose-300 mt-0.5">
                    {alert.title}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/80 truncate">
                    {alert.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isCritical
                      ? 'bg-rose-500/15 text-rose-700'
                      : 'bg-amber-500/15 text-amber-800'
                  }`}
                >
                  {alert.daysRemaining <= 0
                    ? alert.daysRemaining === 0
                      ? 'Aujourd\'hui'
                      : `En retard (${Math.abs(alert.daysRemaining)}j)`
                    : `J-${alert.daysRemaining}`}
                </span>
                <ArrowRight
                  size={13}
                  className="text-on-surface-variant/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
