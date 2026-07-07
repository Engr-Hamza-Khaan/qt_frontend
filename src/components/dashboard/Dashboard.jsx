import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';
import StatsGrid from './StatsGrid';
import ChartSection from './ChartSection';
import TableSection from './TableSection';
import LowStockAlerts from './LowStockAlerts';
import InventoryOverview from './InventoryOverview';

function Dashboard() {
  const { data, loading, error } = useFetch(() => api.reports.getDashboardSummary());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm">
        Failed to load dashboard: {error}
      </div>
    );
  }

  const dashboard = data?.data || {};

  const bestSellers = (dashboard.bestSellers || []).map((item) => ({
    title: item.variation?.product?.title || 'Unknown Product',
    quantitySold: item.dataValues?.soldQuantity || item.soldQuantity || 0,
    revenue: item.dataValues?.totalSales || item.totalSales || 0,
  }));

  return (
    <div className="space-y-6">
      <StatsGrid cards={dashboard.cards} />
      <ChartSection salesTrend={dashboard.salesTrend} inventory={dashboard.inventory} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TableSection
            recentOrders={dashboard.recentOrders}
            bestSellers={bestSellers}
          />
        </div>
        <div className="space-y-6">
          <LowStockAlerts alerts={dashboard.lowStockAlerts} />
          <InventoryOverview inventory={dashboard.inventory} cards={dashboard.cards} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
