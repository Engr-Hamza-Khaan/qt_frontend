import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, DollarSign, TrendingUp, ShoppingBag, Wallet, RefreshCw, ArrowRight,
  Calendar, Filter, X, RotateCcw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LowStockAlerts from '../dashboard/LowStockAlerts';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

const REFRESH_INTERVAL_MS = 30000;

function getStatusColor(status) {
  switch (status) {
    case 'Completed':
    case 'Paid':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'Cancelled':
    case 'Failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }
}

function getLedgerColor(type) {
  if (type === 'Sale Credit') return 'text-emerald-600 dark:text-emerald-400';
  if (type === 'Payout Debit') return 'text-red-600 dark:text-red-400';
  return 'text-slate-600 dark:text-slate-400';
}

function VendorPortal() {
  const { user } = useAuth();
  const [preset, setPreset] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => api.vendors.getPortalDashboard({ preset, startDate, endDate }),
    [preset, startDate, endDate]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      refetch().catch(() => { });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  if (loading && !data) {
    return <LoadingSpinner size="lg" className="min-h-[400px]" />;
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 text-sm">
        {error}
      </div>
    );
  }

  const portal = data?.data || {};
  const vendor = portal.vendor || {};
  const summary = portal.summary || {};
  const trends = (portal.monthlyTrends || []).map((item) => ({
    date: item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
    earnings: parseFloat(item.earnings || item.dataValues?.earnings || 0),
  }));

  const bestSellers = (portal.bestSellers || []).map((item) => ({
    title: item.variation?.product?.title || 'Unknown Product',
    quantitySold: item.dataValues?.soldQuantity || item.soldQuantity || 0,
    revenue: item.dataValues?.totalEarnings || item.totalEarnings || 0,
  }));

  const stats = [
    { title: 'Total Products', value: formatNumber(summary.totalProducts), icon: Package, color: 'from-blue-500 to-indigo-600' },
    { title: 'Inventory Units', value: formatNumber(summary.totalInventory), icon: ShoppingBag, color: 'from-purple-500 to-pink-600' },
    { title: 'Units Sold', value: formatNumber(summary.totalSold), icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
    { title: 'Total Earnings', value: formatCurrency(summary.totalEarnings), icon: DollarSign, color: 'from-amber-500 to-orange-600' },
    { title: 'Current Balance', value: formatCurrency(summary.currentBalance), icon: Wallet, color: 'from-cyan-500 to-blue-600' },
    { title: 'Total Paid Out', value: formatCurrency(summary.totalPaid), icon: DollarSign, color: 'from-slate-500 to-slate-600' },
  ];

  const getTrendSubtitle = () => {
    if (preset === '7d') return 'Last 7 days';
    if (preset === '30d') return 'Last 30 days';
    if (preset === 'this_month') return 'This month';
    if (preset === 'this_year') return 'This year';
    if (preset === 'all') return 'All time';
    if (preset === 'custom') {
      if (startDate && endDate) return `${startDate} to ${endDate}`;
      if (startDate) return `From ${startDate}`;
      if (endDate) return `Until ${endDate}`;
      return 'Custom date range';
    }
    return 'Earnings trend';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {vendor.companyName || user?.vendorProfile?.companyName || 'Vendor Portal'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {vendor.user?.name || user?.name} — live supplier dashboard
          </p>
          {vendor.status && (
            <div className="mt-2">
              <Badge status={vendor.status}>{vendor.status}</Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Manage Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
          Could not refresh latest data: {error}
        </div>
      )}

      {/* Date Range Filter Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold text-sm">
          <Calendar className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Date Range Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'this_year', label: 'This Year' },
            { id: 'all', label: 'All Time' },
            { id: 'custom', label: 'Custom Range' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPreset(p.id);
                if (p.id !== 'custom') {
                  setStartDate('');
                  setEndDate('');
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${preset === p.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 lg:pl-4">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Clear custom dates"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <Card.Header title="Earnings Trend" subtitle={`${getTrendSubtitle()} — auto-refreshes every 30s`} />
            <div className="h-72">
              {trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  No earnings data yet. Sales credits appear here when orders are assigned to you.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs ${v}`} />
                    <Tooltip formatter={(v) => [formatCurrency(v), 'Earnings']} />
                    <Bar dataKey="earnings" fill="url(#earningsGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <defs>
                      <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Orders</h3>
                <p className="text-sm text-slate-500 mt-0.5">Orders with items assigned to your supplier account</p>
              </div>
              <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="p-4">Order</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Your Items</th>
                    <th className="p-4">Your Earnings</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(portal.recentOrders || []).length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 text-sm">
                        No assigned orders yet. Admin will assign your products to customer orders.
                      </td>
                    </tr>
                  ) : (
                    portal.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition text-sm">
                        <td className="p-4 font-bold text-blue-600">#{order.orderNumber}</td>
                        <td className="p-4">
                          <p className="font-medium text-slate-800 dark:text-white">{order.customer?.name || 'Guest'}</p>
                          <p className="text-xs text-slate-400">{order.customer?.email}</p>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{order.itemCount}</td>
                        <td className="p-4 font-bold text-slate-800 dark:text-white">
                          {formatCurrency(order.vendorSubtotal)}
                        </td>
                        <td className="p-4">
                          <span className={`${getStatusColor(order.orderStatus)} text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Payment Ledger</h3>
              <p className="text-sm text-slate-500 mt-0.5">Recent sale credits and payout debits</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Balance After</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(portal.recentLedger || []).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">
                        No ledger entries yet.
                      </td>
                    </tr>
                  ) : (
                    portal.recentLedger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition text-sm">
                        <td className="p-4">
                          <span className={`font-semibold ${getLedgerColor(entry.type)}`}>{entry.type}</span>
                        </td>
                        <td className={`p-4 font-bold ${getLedgerColor(entry.type)}`}>
                          {entry.type === 'Payout Debit' ? '−' : '+'}
                          {formatCurrency(entry.amount)}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {formatCurrency(entry.balanceAfter)}
                        </td>
                        <td className="p-4 text-slate-500 text-xs">{entry.referenceId || entry.notes || '—'}</td>
                        <td className="p-4 text-slate-500">{formatDate(entry.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <LowStockAlerts alerts={portal.lowStockAlerts || []} />

          <Card padding={false}>
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Best Sellers</h3>
              <p className="text-sm text-slate-500 mt-0.5">Top products by units sold</p>
            </div>
            <div className="p-4 space-y-3">
              {bestSellers.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No sales recorded yet.</p>
              ) : (
                bestSellers.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{product.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{product.quantitySold} units sold</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(product.revenue)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default VendorPortal;
