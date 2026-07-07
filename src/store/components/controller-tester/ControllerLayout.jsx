import GamepadButton from './GamepadButton';
import AnalogStick from './AnalogStick';
import TriggerBar from './TriggerBar';

function getButton(gamepad, index) {
  return gamepad?.buttons[index] ?? { pressed: false, value: 0 };
}

function ControllerLayout({ gamepad }) {
  if (!gamepad) return null;

  const axes = gamepad.axes;
  const l2 = getButton(gamepad, 6);
  const r2 = getButton(gamepad, 7);

  return (
    <div className="space-y-8">
      {/* Triggers */}
      <div className="flex gap-6">
        <TriggerBar label="L2 / LT" value={l2.value} />
        <TriggerBar label="R2 / RT" value={r2.value} />
      </div>

      {/* Main controller body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Left side: stick + d-pad + bumpers */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <GamepadButton label="L1" {...getButton(gamepad, 4)} />
            <GamepadButton label="R1" {...getButton(gamepad, 5)} />
          </div>
          <AnalogStick label="Left Stick" x={axes[0] ?? 0} y={axes[1] ?? 0} />
          <GamepadButton label="L3" {...getButton(gamepad, 10)} size="sm" />
          <div className="grid grid-cols-3 gap-1">
            <div />
            <GamepadButton label="↑" {...getButton(gamepad, 12)} size="sm" />
            <div />
            <GamepadButton label="←" {...getButton(gamepad, 14)} size="sm" />
            <GamepadButton label="↓" {...getButton(gamepad, 13)} size="sm" />
            <GamepadButton label="→" {...getButton(gamepad, 15)} size="sm" />
          </div>
        </div>

        {/* Center: menu buttons */}
        <div className="flex flex-col items-center gap-4">
          <GamepadButton label="Select" {...getButton(gamepad, 8)} size="sm" />
          <GamepadButton label="Home" {...getButton(gamepad, 16)} size="sm" />
          <GamepadButton label="Start" {...getButton(gamepad, 9)} size="sm" />
        </div>

        {/* Right side: face buttons + right stick */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative" style={{ width: 120, height: 120 }}>
            <div className="absolute left-1/2 top-0 -translate-x-1/2">
              <GamepadButton label="Y" {...getButton(gamepad, 3)} />
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <GamepadButton label="X" {...getButton(gamepad, 2)} />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <GamepadButton label="B" {...getButton(gamepad, 1)} />
            </div>
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
              <GamepadButton label="A" {...getButton(gamepad, 0)} />
            </div>
          </div>
          <AnalogStick label="Right Stick" x={axes[2] ?? 0} y={axes[3] ?? 0} />
          <GamepadButton label="R3" {...getButton(gamepad, 11)} size="sm" />
        </div>
      </div>
    </div>
  );
}

export default ControllerLayout;
