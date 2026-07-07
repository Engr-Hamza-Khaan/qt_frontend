import { AXIS_LABELS } from './gamepadLabels';

function AxisReadout({ gamepad }) {
  if (!gamepad) return null;

  return (
    <div className="space-y-2">
      {gamepad.axes.map((value, i) => (
        <div key={i} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 text-gray-400">{AXIS_LABELS[i] ?? `Axis ${i}`}</span>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden relative">
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
            <div
              className="absolute top-0 bottom-0 rounded-full bg-neon-purple/70"
              style={{
                left: value >= 0 ? '50%' : `${50 + value * 50}%`,
                width: `${Math.abs(value) * 50}%`,
              }}
            />
          </div>
          <span className="w-14 text-right tabular-nums text-gray-500">{value.toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}

export default AxisReadout;
