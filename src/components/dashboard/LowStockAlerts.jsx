import { AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';

function LowStockAlerts({ alerts = [] }) {
  return (
    <Card padding={false}>
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Low Stock Alerts</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Items at or below threshold</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2 max-h-[320px] overflow-y-auto">
        {alerts.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="All stocked up"
            description="No products are currently below their low stock threshold."
          />
        ) : (
          alerts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {item.product?.title || 'Unknown Product'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  SKU: {item.sku || '—'} · Threshold: {item.lowStockThreshold}
                </p>
              </div>
              <div className="text-right ml-3">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{item.stockQuantity}</p>
                <p className="text-[10px] text-slate-400 uppercase">units left</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default LowStockAlerts;
