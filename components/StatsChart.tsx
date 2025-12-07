import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * Props for the StatsChart component.
 */
interface StatsChartProps {
  /** The title of the chart. */
  title: string;
  /** The data points to display in the chart. */
  data: Array<{ name: string; value: number }>;
  /** Optional unit label for tooltips (e.g., "Years", "Sq Km"). */
  unit?: string;
}

/**
 * A chart component using Recharts to display statistical comparison data.
 * Configured as a Bar Chart for side-by-side comparison.
 * Colors are standardized: First entity is Amber, Second is Indigo.
 *
 * @param props - The component props.
 * @returns The rendered chart container.
 */
const StatsChart: React.FC<StatsChartProps> = ({ title, data, unit = '' }) => {
  const colorMap = {
    first: '#d97706', // amber-600 (King A)
    second: '#4f46e5' // indigo-600 (King B)
  };

  if (!data || data.every(d => d.value === 0)) {
      return (
          <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col items-center justify-center text-stone-400">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2">{title}</h3>
              <p className="text-sm italic">Data not available for comparison</p>
          </div>
      );
  }

  return (
    <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col">
      <h3 className="text-xs font-bold text-stone-500 mb-4 uppercase tracking-widest">{title}</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            layout="vertical"
            >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
            <XAxis type="number" hide />
            <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{fontSize: 11, fontWeight: 600, fill: '#57534e'}}
                axisLine={false}
                tickLine={false}
            />
            <Tooltip
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`${value.toLocaleString()} ${unit}`, title]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? colorMap.first : colorMap.second} />
                ))}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;
