import { STANDARD_BUTTON_LABELS } from './gamepadLabels';

function ButtonGrid({ gamepad }) {
  if (!gamepad) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {gamepad.buttons.map((btn, i) => {
        const isActive = btn.pressed || btn.value > 0.1;
        const label = STANDARD_BUTTON_LABELS[i] ?? `Button ${i}`;
        return (
          <div
            key={i}
            className={`
              px-3 py-2 rounded-lg text-xs border transition-all duration-75
              ${isActive
                ? 'bg-neon-purple/25 border-neon-purple/60 text-white'
                : 'bg-white/5 border-white/10 text-gray-500'}
            `}
          >
            <div className="font-medium truncate">{label}</div>
            <div className="tabular-nums text-[10px] mt-0.5 opacity-70">
              {btn.value.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ButtonGrid;
