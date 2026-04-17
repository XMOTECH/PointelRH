import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboard } from '../hooks/useDashboard';

const COLORS = ['hsl(230, 85%, 55%)', 'hsl(230, 70%, 60%)', 'hsl(217, 91%, 60%)', 'hsl(213, 94%, 68%)', 'hsl(221, 83%, 53%)', 'hsl(230, 76%, 38%)', 'hsl(225, 73%, 57%)', 'hsl(263, 70%, 50%)'];

export function WorkforceSplit() {
  const { data: dashboard } = useDashboard();

  const departments: { name: string; value: number; color: string }[] = ((dashboard as { departments?: { department_name?: string; department_id?: string; total_employees?: number }[] })?.departments || []).map(
    (dept, index: number) => ({
      name: dept.department_name || dept.department_id?.slice(0, 8) || `Dept ${index + 1}`,
      value: dept.total_employees || 0,
      color: COLORS[index % COLORS.length],
    })
  );

  const data = departments.length > 0
    ? departments
    : [{ name: 'Aucune donnée', value: 1, color: '#d1d5db' }];

  const total = departments.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full lg:w-[380px] bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-display font-bold text-on-surface">Répartition par Département</h3>
        <p className="text-[11px] font-medium text-on-surface-variant/50 uppercase tracking-widest mt-1">
          Distribution des effectifs par service
        </p>
      </div>

      {/* Donut */}
      <div className="h-[220px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid hsla(220, 15%, 45%, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              formatter={(value: unknown, name: unknown) => [`${value} employés`, String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-display font-bold text-on-surface">{total}</span>
          <span className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-widest">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-on-surface truncate">{item.name}</span>
              <span className="text-[10px] text-on-surface-variant/50">
                {total > 0 ? Math.round(item.value / total * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
