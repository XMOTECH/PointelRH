import { Briefcase, PlaneTakeoff, Bell } from 'lucide-react';

interface QuickStatsProps {
  activeMissionsCount: number;
  onLeaveTodayCount: number;
  unreadNotificationsCount: number;
  loading: boolean;
}

export function QuickStats({ activeMissionsCount, onLeaveTodayCount, unreadNotificationsCount, loading }: QuickStatsProps) {
  const stats = [
    { icon: Briefcase, label: 'Missions actives', value: activeMissionsCount, color: 'text-primary' },
    { icon: PlaneTakeoff, label: "En congé aujourd'hui", value: onLeaveTodayCount, color: 'text-orange-600' },
    { icon: Bell, label: 'Notifications non-lues', value: unreadNotificationsCount, color: 'text-amber-600' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-2.5 bg-surface-container-low rounded-lg px-4 py-2.5 border border-outline-variant/20"
          >
            <Icon size={15} className={stat.color} strokeWidth={2} />
            <span className="text-xs text-on-surface-variant/70">{stat.label}</span>
            <span className="text-sm font-semibold text-on-surface">
              {loading ? '-' : stat.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
