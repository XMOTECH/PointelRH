import { motion } from 'framer-motion';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface KpiData {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

interface ExecutiveKpiCardsProps {
  totals: Record<string, number | undefined>;
  pendingLeavesCount?: number;
  overdueTasksCount?: number;
  loading: boolean;
  sirhLoading?: boolean;
}

export function ExecutiveKpiCards({ totals, loading }: ExecutiveKpiCardsProps) {
  const cards: KpiData[] = [
    {
      label: 'Effectif Total',
      value: totals?.total_employees ?? 0,
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Taux de Présence',
      value: `${totals?.attendance_rate ?? 0}%`,
      icon: Clock,
      color: 'text-emerald-600',
    },
    {
      label: "Présents Aujourd'hui",
      value: totals?.total_present ?? 0,
      icon: CheckCircle,
      color: 'text-primary',
    },
    {
      label: 'Retards',
      value: totals?.total_late ?? 0,
      icon: AlertCircle,
      color: 'text-amber-600',
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isLoading = loading;
        return (
          <motion.div variants={item} key={card.label}>
            <div className="flex flex-col justify-between gap-4 p-6 bg-surface-container-lowest rounded-2xl border border-on-surface/15 shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-[0.2em]">
                  {card.label}
                </span>
                <Icon size={20} className={card.color} strokeWidth={2} />
              </div>

              <span className="text-3xl font-mono tabular-nums font-extrabold text-on-surface tracking-tight">
                {isLoading ? (
                  <span className="inline-block w-20 h-9 bg-surface-container-high rounded-xl animate-pulse" />
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
