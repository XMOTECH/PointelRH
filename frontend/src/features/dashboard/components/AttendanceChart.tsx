import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  total_employees: number;
  present_count: number;
  [key: string]: unknown;
}

interface AttendanceChartProps {
  data: ChartDataPoint[];
  loading: boolean;
}

export function AttendanceChart({ data: rawData, loading }: AttendanceChartProps) {
  const data = Array.isArray(rawData)
    ? rawData
    : (rawData as Record<string, unknown>)?.data && Array.isArray((rawData as Record<string, unknown>).data)
      ? ((rawData as Record<string, unknown>).data as ChartDataPoint[])
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

  const chartData = data.map((item: ChartDataPoint) => ({
    name: item.date ? safeFormat(item.date, 'EEE') : '',
    expected: item.total_employees || 0,
    actual: item.present_count || 0,
    fullDate: item.date ? safeFormat(item.date, 'dd MMMM yyyy') : '',
  }));

  if (loading) {
    return (
      <div className="flex-1 bg-surface-container-lowest rounded-2xl border border-on-surface/15 p-6 min-h-[400px] flex items-center justify-center shadow-none">
        <div className="text-on-surface-variant/50 animate-pulse text-sm">Chargement de l'analyse...</div>
      </div>
    );
  }

  if (!loading && chartData.length === 0) {
    return (
      <div className="flex-1 bg-surface-container-lowest rounded-2xl border border-on-surface/15 p-6 min-h-[400px] flex items-center justify-center shadow-none">
        <div className="text-on-surface-variant/50 text-sm">Aucune donnée de tendance disponible</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-surface-container-lowest rounded-2xl border border-on-surface/15 p-6 min-w-0 shadow-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
        <div>
          <h3 className="text-lg font-bold text-on-surface uppercase tracking-tight">Évolution de la Présence</h3>
          <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-[0.2em] mt-1">
            Suivi temps réel : Prévu vs Réel
          </p>
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FBC02D]" />
            <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Prévu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Réel</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1A3D66" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1A3D66" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.15} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#5A6E85', opacity: 0.7, fontSize: 11, fontWeight: 700 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              labelFormatter={(_value, payload) => {
                if (payload && payload[0]) return payload[0].payload.fullDate;
                return _value;
              }}
              contentStyle={{
                backgroundColor: '#0F2540',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                fontSize: '12px',
                color: '#ffffff',
              }}
              labelStyle={{ fontWeight: 800, marginBottom: '4px', color: '#ffffff', textTransform: 'uppercase' }}
            />
            <Area
              type="monotone"
              dataKey="expected"
              stroke="#FBC02D"
              strokeDasharray="4 4"
              fill="none"
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Bar
              dataKey="actual"
              fill="#1A3D66"
              radius={[6, 6, 0, 0]}
              barSize={24}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#1A3D66"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActual)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
