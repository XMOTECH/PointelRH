import { Users, Clock, UserMinus, Activity } from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';

interface DashboardTotals {
  total_present: number;
  total_late: number;
  total_absent: number;
  total_employees: number;
}

export function KpiCards({ totals, loading }: { totals: DashboardTotals | undefined; loading: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Présences"
        value={totals?.total_present ?? 0}
        icon={Users}
        variant="emerald"
        subtitle="En temps réel"
        isLoading={loading}
      />
      <MetricCard
        title="Retards"
        value={totals?.total_late ?? 0}
        icon={Clock}
        variant="amber"
        subtitle="Aujourd'hui"
        isLoading={loading}
      />
      <MetricCard
        title="Absences"
        value={totals?.total_absent ?? 0}
        icon={UserMinus}
        variant="rose"
        subtitle="Aujourd'hui"
        isLoading={loading}
      />
      <MetricCard
        title="Effectif Total"
        value={totals?.total_employees ?? 0}
        icon={Activity}
        variant="primary"
        subtitle="Collaborateurs actifs"
        isLoading={loading}
      />
    </div>
  );
}
