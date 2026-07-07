import { Package, TrendingUp, Clock } from 'lucide-react';
import Card from '../ui/Card';
import { formatNumber } from '../../utils/formatters';

function InventoryOverview({ inventory = {}, cards = {} }) {
  const totalStock = parseInt(inventory.totalStock || inventory.dataValues?.totalStock || 0, 10);
  const totalSkus = parseInt(inventory.totalSkus || inventory.dataValues?.totalSkus || 0, 10);

  const metrics = [
    { icon: Package, label: 'Total Stock Units', value: formatNumber(totalStock), color: 'text-blue-500' },
    { icon: TrendingUp, label: 'Products Sold', value: formatNumber(cards.totalProductsSold), color: 'text-emerald-500' },
    { icon: Clock, label: 'Pending Orders', value: formatNumber(cards.pendingOrders), color: 'text-amber-500' },
    { icon: Package, label: 'Active SKUs', value: formatNumber(totalSkus), color: 'text-purple-500' },
  ];

  return (
    <Card>
      <Card.Header title="Quick Stats" subtitle="Real-time inventory metrics" />
      <div className="space-y-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-sm text-slate-600 dark:text-slate-400">{m.label}</span>
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">{m.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default InventoryOverview;
