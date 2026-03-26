import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useDashboard } from '../hooks/useDashboard';

const COLORS = ['#0041c8', '#0052CC', '#3b82f6', '#93c5fd', '#60a5fa', '#1e40af', '#2563eb', '#7c3aed'];

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
    <Card className="w-full lg:w-[400px] bg-surface-container-lowest border-none p-8">
      <CardHeader className="mb-8 px-0">
        <CardTitle className="text-2xl font-display font-bold text-on-surface">Répartition par Département</CardTitle>
        <p className="text-xs font-medium text-on-surface-variant opacity-50 uppercase tracking-widest mt-1">Distribution des effectifs par service</p>
      </CardHeader>
      
      <div className="h-[250px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-display font-bold text-on-surface">{total}</span>
          <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Total</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface leading-none">{item.name}</span>
              <span className="text-[10px] font-medium text-on-surface-variant opacity-50 tracking-tight">({total > 0 ? Math.round(item.value / total * 100) : 0}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
