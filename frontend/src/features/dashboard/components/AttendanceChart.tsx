import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';

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
  // Unwrap data if it's nested in a 'data' property from the API
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
    } catch (e) {
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
      <Card className="flex-1 bg-surface-container-lowest border-none p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-on-surface-variant opacity-50 animate-pulse">Chargement de l'analyse...</div>
      </Card>
    );
  }
  if (!loading && chartData.length === 0) {
    return (
      <Card className="flex-1 bg-surface-container-lowest border-none p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-on-surface-variant opacity-50">Aucune donnée de tendance disponible</div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 bg-surface-container-lowest border-none p-8 min-w-0">
      <CardHeader className="flex flex-row justify-between items-center mb-10 px-0">
        <div>
          <CardTitle className="text-2xl font-display font-bold text-on-surface">Evolution de la Présence</CardTitle>
          <p className="text-xs font-medium text-on-surface-variant opacity-50 uppercase tracking-widest mt-1">Weekly performance tracking: Expected vs Actual</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/20" />
            <span className="text-[10px] font-bold text-on-surface-variant opacity-60">Expected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-on-surface-variant opacity-60">Actual</span>
          </div>
        </div>
      </CardHeader>
      
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0041c8" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#0041c8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#191b25" strokeOpacity={0.05} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#191b25', opacity: 0.4, fontSize: 10, fontWeight: 700 }} 
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            labelFormatter={(value, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate;
              }
              return value;
            }}
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#191b25' }}
          />
          {/* L'ombre/fond represente l'attendu */}
          <Area 
              type="monotone" 
              dataKey="expected" 
              stroke="none" 
              fill="#0041c8" 
              fillOpacity={0.03} 
              isAnimationActive={false}
          />
          {/* L'histogramme represente le reel */}
          <Bar 
              dataKey="actual" 
              fill="#0041c8" 
              radius={[4, 4, 0, 0]} 
              barSize={32}
          />
          {/* On garde une ligne pour la tendance du reel par dessus */}
          <Area 
              type="monotone" 
              dataKey="actual" 
              stroke="#0041c8" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorActual)" 
          />
        </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
