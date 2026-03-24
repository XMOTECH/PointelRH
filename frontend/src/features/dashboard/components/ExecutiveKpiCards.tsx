import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';

interface KpiData {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  badge?: string;
}

export function ExecutiveKpiCards({ totals, loading }: { totals: any; loading: boolean }) {
  const cards: KpiData[] = [
    { 
        label: 'EFFECTIF TOTAL', 
        value: totals?.total_employees ?? 0, 
        icon: Users, 
        color: 'primary'
    },
    { 
        label: 'TAUX DE PRÉSENCE', 
        value: `${totals?.attendance_rate ?? 0}%`, 
        icon: Clock, 
        color: 'primary'
    },
    { 
        label: 'PRÉSENTS (AUJOURD\'HUI)', 
        value: totals?.total_present ?? 0, 
        icon: Users, 
        color: 'primary'
    },
    { 
        label: 'RETARDS', 
        value: totals?.total_late ?? 0, 
        icon: AlertCircle, 
        color: 'amber-500'
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {cards.map((card, i) => (
        <motion.div variants={item} key={i}>
          <Card className="flex flex-col h-full bg-surface-container-lowest border-none hover:scale-[1.02] transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] opacity-60">
                {card.label}
              </p>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-on-surface tracking-tight">
                {loading ? '...' : card.value}
              </span>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-between">
              <div/>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
