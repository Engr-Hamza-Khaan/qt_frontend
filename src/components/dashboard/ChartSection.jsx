import RevenueChart from './RevenueChart';
import SalesChart from './SalesChart';

function ChartSection({ salesTrend = [], inventory = {} }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <RevenueChart salesTrend={salesTrend} />
      </div>
      <SalesChart inventory={inventory} />
    </div>
  );
}

export default ChartSection;
