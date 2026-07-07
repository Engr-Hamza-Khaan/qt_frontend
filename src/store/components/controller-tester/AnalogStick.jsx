const STICK_RADIUS = 40;
const DEADZONE = 0.08;

function AnalogStick({ label, x = 0, y = 0 }) {
  const magnitude = Math.sqrt(x * x + y * y);
  const clampedX = Math.max(-1, Math.min(1, x));
  const clampedY = Math.max(-1, Math.min(1, y));
  const dotX = clampedX * STICK_RADIUS;
  const dotY = clampedY * STICK_RADIUS;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <div
        className="relative rounded-full border-2 border-white/20 bg-white/5"
        style={{ width: STICK_RADIUS * 2 + 24, height: STICK_RADIUS * 2 + 24 }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-white/10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-full bg-white/10" />
        </div>
        <div
          className="absolute rounded-full border-2 border-white/15"
          style={{
            width: DEADZONE * STICK_RADIUS * 2,
            height: DEADZONE * STICK_RADIUS * 2,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute w-5 h-5 rounded-full bg-neon-purple shadow-[0_0_12px_rgba(176,38,255,0.7)] transition-none"
          style={{
            left: `calc(50% + ${dotX}px - 10px)`,
            top: `calc(50% + ${dotY}px - 10px)`,
          }}
        />
      </div>
      <div className="text-[10px] text-gray-500 tabular-nums text-center">
        X: {x.toFixed(3)} · Y: {y.toFixed(3)}
        {magnitude > DEADZONE && (
          <span className="block text-gray-600">Mag: {magnitude.toFixed(3)}</span>
        )}
      </div>
    </div>
  );
}

export default AnalogStick;
