import React, { useRef, useCallback } from 'react';

const RADIUS = 44; // half-width of the inner boundary

export default function AnalogStickRadar({
  label,
  x = 0,
  y = 0,
  size = 110,
  deadzone = 0.05,
  onChange,
  onPress,
  isPressed = false
}) {
  const radarRef = useRef(null);

  // Clamp axes between -1 and 1
  const clampedX = Math.max(-1, Math.min(1, x));
  const clampedY = Math.max(-1, Math.min(1, y));

  // Visual coordinates from center
  const dotX = clampedX * RADIUS;
  const dotY = clampedY * RADIUS;

  // Mouse / Touch interaction for testing without hardware
  const handlePointer = useCallback((e) => {
    if (!onChange || !radarRef.current) return;
    const rect = radarRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = (e.clientX - centerX) / RADIUS;
    const rawY = (e.clientY - centerY) / RADIUS;
    const newX = Math.max(-1, Math.min(1, rawX));
    const newY = Math.max(-1, Math.min(1, rawY));
    onChange(Number(newX.toFixed(3)), Number(newY.toFixed(3)));
  }, [onChange]);

  const handlePointerDown = (e) => {
    if (!onChange) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointer(e);
  };

  const handlePointerMove = (e) => {
    if (e.buttons === 1) {
      handlePointer(e);
    }
  };

  const handlePointerUp = () => {
    if (onChange) {
      // return to center if simulated drag released
      onChange(0, 0);
    }
  };

  // Monospace coordinate string
  const coordString = `X: ${clampedX >= 0 ? '+' : ''}${clampedX.toFixed(3)} - Y: ${clampedY >= 0 ? '+' : ''}${clampedY.toFixed(3)}`;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Label */}
      <span className="text-xs font-medium text-gray-300 mb-1.5">{label}</span>

      {/* Circular Radar Visualizer */}
      <div
        ref={radarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={onPress}
        className={`relative rounded-full border border-white/20 bg-[#050b1c] cursor-crosshair transition-shadow ${
          isPressed ? 'ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : ''
        }`}
        style={{ width: size, height: size }}
      >
        {/* Radar Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-white/10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[1px] h-full bg-white/10" />
        </div>

        {/* Deadzone Circle */}
        <div
          className="absolute rounded-full border border-white/15 pointer-events-none"
          style={{
            width: deadzone * RADIUS * 2 + 10,
            height: deadzone * RADIUS * 2 + 10,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Outer subtle guide ring */}
        <div
          className="absolute rounded-full border border-white/10 pointer-events-none"
          style={{
            width: RADIUS * 1.5,
            height: RADIUS * 1.5,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Glowing Active Stick Dot */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-red-500 border border-white/80 shadow-[0_0_10px_rgba(239,68,68,0.9)] pointer-events-none transition-none"
          style={{
            left: `calc(50% + ${dotX}px - 7px)`,
            top: `calc(50% + ${dotY}px - 7px)`,
          }}
        />
      </div>

      {/* Coordinate readout */}
      <div className="text-[11px] font-mono text-gray-400 mt-2 tabular-nums tracking-tight">
        {coordString}
      </div>
    </div>
  );
}
