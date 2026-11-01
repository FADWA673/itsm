/**
 * Bar Chart - Performance des techniciens
 * Affiche les tickets résolus par technicien
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface TechnicianPerformanceChartProps {
  data: {
    name: string;
    resolved: number;
    assigned: number;
  }[];
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

function TechnicianPerformanceChart({ data }: TechnicianPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="name"
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
              {value === 'assigned' ? 'Assigned' : 'Resolved'}
            </span>
          )}
        />
        <Bar dataKey="assigned" fill="#3B82F6" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.6} />
          ))}
        </Bar>
        <Bar dataKey="resolved" fill="#10B981" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default TechnicianPerformanceChart;
