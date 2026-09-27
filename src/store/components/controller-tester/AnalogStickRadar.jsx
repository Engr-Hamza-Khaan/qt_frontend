import React, { useRef } from 'react';

export default function AnalogStickRadar({
  label,
  x = 0,
  y = 0,
  size = 140,
  deadzone = 0.05,
  isPressed = false
}) {
  const radarRef = useRef(null);

  // Clamp axes between -1 and 1
  const clampedX = Math.max(-1, Math.min(1, x));
  const clampedY = Math.max(-1, Math.min(1, y));

  // Dynamic radius based on radar size
  const r = (size / 2) - 12;

  // Visual coordinates from center
  const dotX = clampedX * r;
  const dotY = clampedY * r;

  // Monospace coordinate string matching screenshot
  const coordString = `X: ${clampedX.toFixed(3)} - Y: ${clampedY.toFixed(3)}`;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Label */}
      <span className="text-xs font-semibold text-gray-300 mb-2">{label}</span>

      {/* Circular Radar Visualizer */}
      <div
        ref={radarRef}
        className={`relative rounded-full border border-white/20 bg-[#060b1e]/90 transition-shadow ${
          isPressed ? 'ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.7)]' : ''
        }`}
        style={{ width: size, height: size }}
      >
        {/* Radar Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-white/15" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[1px] h-full bg-white/15" />
        </div>

        {/* Deadzone Inner Ring */}
        <div
          className="absolute rounded-full border border-white/10 pointer-events-none"
          style={{
            width: r * 0.8,
            height: r * 0.8,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Outer Guide Ring */}
        <div
          className="absolute rounded-full border border-white/15 pointer-events-none"
          style={{
            width: r * 1.5,
            height: r * 1.5,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Glowing Active Stick Dot (White matching screenshot) */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)] pointer-events-none transition-none"
          style={{
            left: `calc(50% + ${dotX}px - 7px)`,
            top: `calc(50% + ${dotY}px - 7px)`,
          }}
        />
      </div>

      {/* Coordinate readout */}
      <div className="text-[11px] font-mono text-gray-400 mt-2.5 tabular-nums tracking-tight">
        {coordString}
      </div>
    </div>
  );
}
