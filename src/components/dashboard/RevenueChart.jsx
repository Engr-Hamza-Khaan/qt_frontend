import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from 'recharts';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

function RevenueChart({ salesTrend = [] }) {
  const data = salesTrend.map((item) => {
    const dateVal = item.date || item.dataValues?.date;
    const revenue = parseFloat(item.revenue || item.dataValues?.revenue || 0);
    const orders = parseInt(item.orders || item.dataValues?.orders || 0, 10);
    return {
      date: dateVal ? new Date(dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      Revenue: revenue,
      Orders: orders,
    };
  });

  return (
    <Card>
      <Card.Header
        title="Sales Trend"
        subtitle="Revenue and order volume — last 30 days"
      />
      <div className="h-80">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            No sales data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `Rs ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
                formatter={(value, name) => [
                  name === 'Revenue' ? formatCurrency(value) : value,
                  name,
                ]}
              />
              <Bar dataKey="Revenue" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export default RevenueChart;
