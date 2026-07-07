import { DollarSign, Users, ShoppingCart, Clock, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';

function StatsGrid({ cards = {} }) {
  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(cards.totalRevenue),
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Total Customers',
      value: formatNumber(cards.totalCustomers),
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Orders',
      value: formatNumber(cards.totalOrders),
      sub: cards.pendingOrders ? `${cards.pendingOrders} pending` : null,
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Active Suppliers',
      value: formatNumber(cards.totalVendors),
      sub: cards.totalProductsSold ? `${formatNumber(cards.totalProductsSold)} units sold` : null,
      icon: Package,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stat.value}</p>
              {stat.sub && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stat.sub}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full w-3/4`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
