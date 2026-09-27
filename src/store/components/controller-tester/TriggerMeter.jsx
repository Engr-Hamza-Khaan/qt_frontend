import React from 'react';

export default function TriggerMeter({ label, value = 0, variant = 'playstation' }) {
  const percentage = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const isFilled = percentage > 0;

  const barColor = variant === 'xbox' 
    ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    : 'bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]';

  return (
    <div className="w-full max-w-[240px] sm:max-w-[280px]">
      <div className="flex justify-between items-center text-xs text-gray-400 font-medium mb-1.5">
        <span className="tracking-wide uppercase text-[11px] text-gray-300 font-semibold">{label}</span>
        <span className="tabular-nums text-gray-400 font-mono text-[11px]">{percentage}%</span>
      </div>
      <div className="h-1.5 sm:h-2 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
        <div
          className={`h-full rounded-full transition-all duration-75 ${isFilled ? barColor : 'bg-transparent'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
