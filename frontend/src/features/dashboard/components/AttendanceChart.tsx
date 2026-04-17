import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  total_employees: number;
  present_count: number;
  [key: string]: any;
}

interface AttendanceChartProps {
  data: ChartDataPoint[];
  loading: boolean;
}

export function AttendanceChart({ data: rawData, loading }: AttendanceChartProps) {
  const data = Array.isArray(rawData)
    ? rawData
    : (rawData as any)?.data && Array.isArray((rawData as any).data)
      ? (rawData as any).data
      : [];

  const safeFormat = (dateStr: string, formatStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return format(d, formatStr, { locale: fr });
    } catch {
      return '';
    }
  };

  const chartData = data.map((item: any) => ({
    name: item.date ? safeFormat(item.date, 'EEE') : '',
    expected: item.total_employees || 0,
    actual: item.present_count || 0,
    fullDate: item.date ? safeFormat(item.date, 'dd MMMM yyyy') : '',
  }));

  if (loading) {
    return (
      <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 min-h-[400px] flex items-center justify-center">
        <div className="text-on-surface-variant/50 animate-pulse text-sm">Chargement de l'analyse...</div>
      </div>
    );
  }

  if (!loading && chartData.length === 0) {
    return (
      <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 min-h-[400px] flex items-center justify-center">
        <div className="text-on-surface-variant/50 text-sm">Aucune donnée de tendance disponible</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
        <div>
          <h3 className="text-lg font-display font-bold text-on-surface">Evolution de la Présence</h3>
          <p className="text-[11px] font-medium text-on-surface-variant/50 uppercase tracking-widest mt-1">
            Suivi hebdomadaire : Prévu vs Réel
          </p>
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/20" />
            <span className="text-[10px] font-semibold text-on-surface-variant/60">Prévu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[10px] font-semibold text-on-surface-variant/60">Réel</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(230, 85%, 55%)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="hsl(230, 85%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(220, 15%, 45%)" strokeOpacity={0.08} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 15%, 45%)', opacity: 0.5, fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              labelFormatter={(_value, payload) => {
                if (payload && payload[0]) return payload[0].payload.fullDate;
                return _value;
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid hsla(220, 15%, 45%, 0.1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 700, marginBottom: '4px', color: 'hsl(224, 71%, 4%)' }}
            />
            <Area
              type="monotone"
              dataKey="expected"
              stroke="none"
              fill="hsl(230, 85%, 55%)"
              fillOpacity={0.04}
              isAnimationActive={false}
            />
            <Bar
              dataKey="actual"
              fill="hsl(230, 85%, 55%)"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="hsl(230, 85%, 55%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorActual)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
