const STATUS_STYLES = {
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Refunded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Pending Approval': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  Hidden: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

function Badge({ children, status, variant = 'default', className = '' }) {
  const style = status
    ? STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    : variant === 'danger'
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      : variant === 'success'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
