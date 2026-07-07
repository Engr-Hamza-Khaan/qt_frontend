import { MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

function TableSection({ recentOrders = [], bestSellers = [] }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
            case "Paid":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "Pending":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Cancelled":
            case "Failed":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "Processing":
            case "Shipped":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            default:
                return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Recent Orders List */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-lg">
                <div className='p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h3 className='text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider'>
                                Recent Customer Orders
                            </h3>
                            <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                                Real-time transaction queue feed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table container */}
                <div className="overflow-x-auto">
                    <table className='w-full text-left'>
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 bg-slate-50/20 dark:bg-slate-950/10">
                                <th className='p-4'>Order ID</th>
                                <th className='p-4'>Customer</th>
                                <th className='p-4'>Amount</th>
                                <th className='p-4'>Status</th>
                                <th className='p-4'>Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">
                                        No recent orders logged.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className='hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-xs'>
                                        <td className='p-4 font-bold text-blue-500'>
                                            #{order.orderNumber}
                                        </td>
                                        <td className='p-4'>
                                            <div className="font-semibold text-slate-800 dark:text-white">
                                                {order.customer?.name || 'Guest User'}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {order.customer?.email}
                                            </div>
                                        </td>
                                        <td className='p-4 font-bold text-slate-800 dark:text-white'>
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td className='p-4'>
                                            <span className={`${getStatusColor(order.orderStatus)} font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className='p-4 text-slate-500'>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Products Leaderboard */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-lg flex flex-col">
                <div className='p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'>
                    <h3 className='text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider'>
                        Best Sellers
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                        Top-performing catalog items.
                    </p>
                </div>

                <div className='p-4 space-y-3 flex-1 overflow-y-auto max-h-[400px]'>
                    {bestSellers.length === 0 ? (
                        <div className="py-10 text-center text-slate-400 text-xs">
                            No product sales recorded yet.
                        </div>
                    ) : (
                        bestSellers.map((product, index) => (
                            <div key={index} className='flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 hover:scale-[1.01] transition-transform'>
                                <div className="flex-1 min-w-0 pr-2">
                                    <h4 className='text-xs font-bold text-slate-800 dark:text-white truncate'>
                                        {product.title}
                                    </h4>
                                    <p className='text-[10px] text-slate-500 mt-0.5'>
                                        {product.quantitySold} units dispatched
                                    </p>
                                </div>
                                <div className='text-right text-xs'>
                                    <p className='font-bold text-slate-800 dark:text-white'>
                                        {formatCurrency(product.revenue || 0)}
                                    </p>
                                    <div className='flex items-center gap-0.5 text-emerald-500 font-semibold justify-end mt-0.5'>
                                        <TrendingUp className="w-3 h-3" />
                                        <span className="text-[10px]">Leader</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default TableSection;
