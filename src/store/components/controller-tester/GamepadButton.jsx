function GamepadButton({ label, pressed, value, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-14 h-14 text-sm',
  };

  const isActive = pressed || value > 0.1;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center font-bold
          border-2 transition-all duration-75 select-none
          ${isActive
            ? 'bg-neon-purple/40 border-neon-purple text-white shadow-[0_0_20px_rgba(176,38,255,0.6)] scale-110'
            : 'bg-white/5 border-white/20 text-gray-400'}
        `}
      >
        {label}
      </div>
      {value > 0 && value < 1 && (
        <span className="text-[10px] text-gray-500 tabular-nums">{value.toFixed(2)}</span>
      )}
    </div>
  );
}

export default GamepadButton;
