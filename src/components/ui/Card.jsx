function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-shadow duration-300 ${padding ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        {title && (
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
        )}
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

Card.Header = CardHeader;
export default Card;
