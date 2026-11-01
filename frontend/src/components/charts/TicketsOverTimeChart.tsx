/**
 * Line Chart - Évolution des tickets dans le temps
 * Affiche les tickets créés et résolus par jour/semaine
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TicketsOverTimeChartProps {
  data: {
    date: string;
    created: number;
    resolved: number;
  }[];
}

function TicketsOverTimeChart({ data }: TicketsOverTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#6B7280' }}
          stroke="#9CA3AF"
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6B7280' }}
          stroke="#9CA3AF"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: 4 }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => (
            <span style={{ fontSize: 14, color: '#374151', marginLeft: 8 }}>
              {value === 'created' ? 'Tickets Created' : 'Tickets Resolved'}
            </span>
          )}
        />
        <Line
          type="monotone"
          dataKey="created"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: '#3B82F6', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="resolved"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default TicketsOverTimeChart;
