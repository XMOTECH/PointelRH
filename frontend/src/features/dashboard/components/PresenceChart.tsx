import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
// import removed
import { usePresenceTrend } from '../hooks/useDashboard';

interface PresenceTrendItem {
  date: string;
  count: number;
}

export function PresenceChart({ period }: { period: string }) {
  const { data: rawData, isLoading, error } = usePresenceTrend(period);
  
  // Valider et transformer les données correctement
  let data: PresenceTrendItem[] = [];
  
  if (Array.isArray(rawData)) {
    data = rawData;
  } else if (rawData?.data && Array.isArray(rawData.data)) {
    data = rawData.data;
  } else if (typeof rawData === 'object' && rawData !== null) {
    // Si c'est un objet unique, le mettre dans un array
    data = [rawData];
  }
  
  // Valider que chaque item a les bonnes clés pour recharts
  const chartData = (Array.isArray(data) ? data.filter(item => item && typeof item === 'object') : []) as PresenceTrendItem[];
  
  if (isLoading) return <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>;

  if (error || !chartData || chartData.length === 0) {
    return (
      <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          {error ? 'Erreur lors du chargement' : 'Pas de données disponibles'}
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: '400px', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-header)', margin: 0 }}>Tendance de Présence</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Derniers {period === '7d' ? '7' : '30'} jours</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => format(new Date(str), 'dd MMM')}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid var(--border-light)', 
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              fontSize: '12px'
            }} 
            itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--primary)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPresence)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
