import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { PieChart, Layers } from 'lucide-react';
import type { DepartmentDistribution } from '../hooks/useOnboardingExecutiveAnalytics';

interface Props {
  distribution: DepartmentDistribution[];
  averageCompletionRate: number;
  timeToOnboard: number;
}

// Couleurs harmonisées LuminaRH
const BAR_COLORS = [
  '#1A3D66', // Primary LuminaRH
  '#2A5A8F', // Primary light
  '#FBC02D', // Accent Gold
  '#059669', // Emerald
  '#6366F1', // Indigo
];

export const OnboardingExecutiveCharts: React.FC<Props> = ({
  distribution,
  averageCompletionRate,
  timeToOnboard,
}) => {
  // Préparer les données pour le BarChart horizontal
  const chartData = distribution.length > 0
    ? distribution
    : [
        { name: 'Cadre & Siège', count: 2, percentage: 67 },
        { name: 'Opérations Usine', count: 1, percentage: 33 },
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Bar Chart Répartition par Département / Usine (Style Tremor) */}
      <div className="lg:col-span-2 rounded-xl border border-on-surface/10 bg-surface-container-lowest p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-on-surface/5">
          <div className="flex items-center gap-2 text-primary">
            <Layers size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Répartition des Onboardings par Pôle
            </h4>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant">
            Volume par département
          </span>
        </div>

        <div className="h-44 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant, #5A6E85)', fontWeight: 500 }}
                width={130}
              />
              <Tooltip
                cursor={{ fill: 'rgba(26, 61, 102, 0.04)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface border border-on-surface/10 p-2.5 rounded-lg shadow-md text-xs">
                        <p className="font-bold text-on-surface">{data.name}</p>
                        <p className="text-primary font-mono mt-0.5">
                          {data.count} collaborateur(s) ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-on-surface/5 flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>Capacité d'accueil opérationnelle</span>
          <span className="font-semibold text-on-surface">100% planifié</span>
        </div>
      </div>

      {/* 2. Jauge de Vélocité RH & Taux de Remplissage (Style Tremor Card) */}
      <div className="rounded-xl border border-on-surface/10 bg-surface-container-lowest p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-on-surface/5">
          <div className="flex items-center gap-2 text-primary">
            <PieChart size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Vélocité & Efficacité
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Performant
          </span>
        </div>

        {/* Donut / Progression globale */}
        <div className="py-3 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Anneau SVG haute précision */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="7"
                className="text-surface-container"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray={238.76}
                strokeDashoffset={238.76 - (238.76 * averageCompletionRate) / 100}
                strokeLinecap="round"
                className="text-primary transition-all duration-700 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold font-display text-on-surface tracking-tight">
                {averageCompletionRate}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Complétion
              </span>
            </div>
          </div>
        </div>

        {/* Détails statistiques en bas */}
        <div className="pt-2 border-t border-on-surface/5 flex items-center justify-between text-xs">
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase font-medium">Délai moyen</p>
            <p className="font-bold text-on-surface font-mono">{timeToOnboard} jours</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant uppercase font-medium">Objectif SLA</p>
            <p className="font-bold text-emerald-700 font-mono">&lt; 3.0 jours</p>
          </div>
        </div>
      </div>
    </div>
  );
};
