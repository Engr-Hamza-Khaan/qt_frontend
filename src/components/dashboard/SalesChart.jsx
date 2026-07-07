import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';
import { formatNumber } from '../../utils/formatters';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

function SalesChart({ inventory = {} }) {
  const totalStock = parseInt(inventory.totalStock || inventory.dataValues?.totalStock || 0, 10);
  const totalSkus = parseInt(inventory.totalSkus || inventory.dataValues?.totalSkus || 0, 10);

  const data = [
    { name: 'In Stock', value: totalStock, color: COLORS[0] },
    { name: 'Active SKUs', value: totalSkus, color: COLORS[1] },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <Card.Header title="Inventory Snapshot" subtitle="Current stock overview" />
      <div className="h-48">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            No inventory data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                cornerRadius={4}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [formatNumber(value), name]} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="space-y-3 mt-2">
        {[
          { label: 'Total Units in Stock', value: formatNumber(totalStock), color: COLORS[0] },
          { label: 'Active SKU Count', value: formatNumber(totalSkus), color: COLORS[1] },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default SalesChart;
