/**
 * Radial Bar Chart - SLA Compliance
 * Affiche le pourcentage de tickets résolus dans les délais SLA
 */

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface SLAComplianceChartProps {
  percentage: number; // 0-100
  total: number;
  withinSLA: number;
  breached: number;
}

function SLAComplianceChart({ percentage, total, withinSLA, breached }: SLAComplianceChartProps) {
  const data = [
    {
      name: 'SLA Compliance',
      value: percentage,
      fill: percentage >= 90 ? '#10B981' : percentage >= 75 ? '#F59E0B' : '#EF4444',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="60%"
        outerRadius="90%"
        barSize={20}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar
          background
          dataKey="value"
          cornerRadius={10}
          label={{
            position: 'center',
            fill: '#111827',
            fontSize: 32,
            fontWeight: 700,
            formatter: (value: number) => `${value.toFixed(0)}%`,
          }}
        />
        <Legend
          iconSize={0}
          layout="vertical"
          verticalAlign="bottom"
          align="center"
          content={() => (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
                SLA Compliance Rate
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12 }}>
                <div>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>{withinSLA}</span>
                  <span style={{ color: '#9CA3AF' }}> within SLA</span>
                </div>
                <div>
                  <span style={{ color: '#EF4444', fontWeight: 600 }}>{breached}</span>
                  <span style={{ color: '#9CA3AF' }}> breached</span>
                </div>
              </div>
            </div>
          )}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

export default SLAComplianceChart;
