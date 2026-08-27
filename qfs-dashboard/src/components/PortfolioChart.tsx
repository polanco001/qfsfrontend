import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../context/AppContext';

const COLORS = ['#f7931a', '#627eea', '#9945ff', '#26a17b', '#0033ad', '#23292f', '#f5af02', '#00c3ff', '#c0a16b', '#a855f7', '#ef4444', '#10b981', '#f97316', '#ec4899'];

export function PortfolioChart() {
  const { assets, livePrices } = useApp();
  const data = Object.entries(assets)
    .filter(([_, amount]) => amount > 0)
    .map(([asset, amount]) => ({
      name: asset,
      value: amount * (livePrices[asset] || 0),
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No assets to display
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={5}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}