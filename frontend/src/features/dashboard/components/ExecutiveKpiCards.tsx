import { motion } from 'framer-motion';
import { Users, Clock, AlertCircle, CheckCircle, PlaneTakeoff, ListTodo } from 'lucide-react';

interface KpiData {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface ExecutiveKpiCardsProps {
  totals: Record<string, number | undefined>;
  pendingLeavesCount?: number;
  overdueTasksCount?: number;
  loading: boolean;
  sirhLoading?: boolean;
}

export function ExecutiveKpiCards({ totals, pendingLeavesCount = 0, overdueTasksCount = 0, loading, sirhLoading }: ExecutiveKpiCardsProps) {
  const cards: KpiData[] = [
    {
      label: 'Effectif Total',
      value: totals?.total_employees ?? 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/8',
    },
    {
      label: 'Taux de Présence',
      value: `${totals?.attendance_rate ?? 0}%`,
      icon: Clock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: "Présents Aujourd'hui",
      value: totals?.total_present ?? 0,
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/8',
    },
    {
      label: 'Retards',
      value: totals?.total_late ?? 0,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Congés en Attente',
      value: pendingLeavesCount,
      icon: PlaneTakeoff,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Tâches en Retard',
      value: overdueTasksCount,
      icon: ListTodo,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const item = {
    hidden: { y: 16, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isLoading = i < 4 ? loading : sirhLoading;
        return (
          <motion.div variants={item} key={i}>
            <div className="flex flex-col gap-4 p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/40 hover:shadow-ambient transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <p className="text-xs font-space font-semibold text-on-surface-variant/60 uppercase tracking-wider">
                  {card.label}
                </p>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon size={18} className={card.color} strokeWidth={2} />
                </div>
              </div>

              <span className="text-3xl font-display font-bold text-on-surface tracking-tight">
                {isLoading ? (
                  <span className="inline-block w-16 h-8 bg-surface-container-high rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
