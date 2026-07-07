function TriggerBar({ label, value = 0 }) {
  const pct = Math.round(value * 100);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-purple/60 to-neon-purple transition-none"
          style={{ width: `${pct}%`, boxShadow: value > 0.05 ? '0 0 12px rgba(176, 38, 255, 0.5)' : 'none' }}
        />
      </div>
    </div>
  );
}

export default TriggerBar;
