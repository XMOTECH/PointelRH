import React from 'react';
import { MetricCard } from '@/components/common/MetricCard';
import { Users, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import type { ExecutiveAnalytics } from '../hooks/useOnboardingExecutiveAnalytics';

interface Props {
  totalCount: number;
  inReviewCount: number;
  readyDayOneCount: number;
  completedCount: number;
  isLoading: boolean;
  analytics: ExecutiveAnalytics;
}

export const OnboardingMetricsGrid: React.FC<Props> = ({
  totalCount,
  inReviewCount,
  readyDayOneCount,
  completedCount: _completedCount,
  isLoading,
  analytics,
}) => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Volume actif & Arrivées imminentes */}
      <MetricCard
        title="Dossiers en cours"
        value={totalCount}
        icon={Users}
        variant="primary"
        subtitle={`${analytics.startsThisWeekCount} arrivée(s) cette semaine`}
        isLoading={isLoading}
      />

      {/* 2. Risques & Points de blocage RH */}
      <MetricCard
        title="À vérifier / Risques"
        value={inReviewCount}
        icon={AlertCircle}
        variant={analytics.criticalRisksCount > 0 ? 'rose' : 'amber'}
        subtitle={
          analytics.criticalRisksCount > 0
            ? `${analytics.criticalRisksCount} risque(s) bloquant(s)`
            : 'Aucun blocage critique'
        }
        isLoading={isLoading}
      />

      {/* 3. Taux de préparation Jour J (Conformité) */}
      <MetricCard
        title="Prêts Jour J"
        value={readyDayOneCount}
        icon={ShieldCheck}
        variant="emerald"
        subtitle={`${analytics.readyBeforeDayOneRate}% prêts avant l'arrivée`}
        isLoading={isLoading}
      />

      {/* 4. Vélocité & Time-to-Onboard (Analytics Direction) */}
      <MetricCard
        title="Time-to-Onboard"
        value={`${analytics.averageTimeToOnboardDays}j`}
        icon={Clock}
        variant="indigo"
        subtitle={`Complétion moyenne : ${analytics.averageCompletionRate}%`}
        isLoading={isLoading}
      />
    </div>
  );
};
