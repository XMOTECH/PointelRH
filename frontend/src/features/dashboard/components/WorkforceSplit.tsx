import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';

const data = [
  { name: 'Engineering', value: 400, color: '#0041c8' },
  { name: 'Sales', value: 250, color: '#0052CC' },
  { name: 'Design', value: 150, color: '#3b82f6' },
  { name: 'Support', value: 200, color: '#93c5fd' },
];

export function WorkforceSplit() {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="w-full lg:w-[400px] bg-surface-container-lowest border-none p-8">
      <CardHeader className="mb-8 px-0">
        <CardTitle className="text-2xl font-display font-bold text-on-surface">Workforce Split</CardTitle>
        <p className="text-xs font-medium text-on-surface-variant opacity-50 uppercase tracking-widest mt-1">Team allocation across departments</p>
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
              <span className="text-[10px] font-medium text-on-surface-variant opacity-50 tracking-tight">({Math.round(item.value / total * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
