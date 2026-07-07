import { Inbox } from 'lucide-react';

function EmptyState({ icon: Icon = Inbox, title = 'No data found', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
