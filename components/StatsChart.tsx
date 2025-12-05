import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Props for the StatsChart component.
 */
interface StatsChartProps {
  /** The data points to display in the chart. */
  data: Array<{ name: string; value: number }>;
  /** The color theme name for the chart (e.g., 'amber', 'slate'). */
  color: string;
}

/**
 * A chart component using Recharts to display statistical data.
 * Currently configured to show an Area chart.
 *
 * @param props - The component props.
 * @returns The rendered chart container.
 */
const StatsChart: React.FC<StatsChartProps> = ({ data, color }) => {
  // Map tailwind color names to hex for the chart
  const colorMap: Record<string, string> = {
    amber: '#d97706',
    slate: '#475569',
    blue: '#2563eb',
    teal: '#0d9488',
    indigo: '#4f46e5'
  };

  const hexColor = colorMap[color] || '#4f46e5';

  return (
    <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Computational Power Growth (Log Scale)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" tick={{fontSize: 12}} />
          <YAxis tick={{fontSize: 12}} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Area type="monotone" dataKey="value" stroke={hexColor} fill={hexColor} fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;
