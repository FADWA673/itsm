/**
 * Pie Chart - Répartition des tickets par statut
 * Affiche la distribution : Open, In Progress, Resolved, Closed
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TicketsByStatusChartProps {
  data: {
    status: string;
    count: number;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#3B82F6',           // Bleu
  ASSIGNED: '#8B5CF6',       // Violet
  IN_PROGRESS: '#F59E0B',    // Orange
  WAITING_FOR_USER: '#6B7280', // Gris
  RESOLVED: '#10B981',       // Vert
  CLOSED: '#6B7280',         // Gris foncé
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_USER: 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

function TicketsByStatusChart({ data }: TicketsByStatusChartProps) {
  // Transformer les données pour le graphique
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    status: item.status,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label pour afficher le pourcentage
  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#9CA3AF'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value} tickets`, 'Count']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ fontSize: 14, color: '#374151' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default TicketsByStatusChart;
