import React from 'react';

function getBtn(gamepad, index) {
  return gamepad?.buttons?.[index] ?? { pressed: false, value: 0 };
}

export default function ControllerVectorGraphic({
  gamepad,
  className = "w-full max-w-[340px] sm:max-w-[400px] h-auto"
}) {
  const axes = gamepad?.axes ?? [0, 0, 0, 0];

  const l2 = getBtn(gamepad, 6);
  const r2 = getBtn(gamepad, 7);
  const l1 = getBtn(gamepad, 4);
  const r1 = getBtn(gamepad, 5);

  const dpadUp = getBtn(gamepad, 12);
  const dpadDown = getBtn(gamepad, 13);
  const dpadLeft = getBtn(gamepad, 14);
  const dpadRight = getBtn(gamepad, 15);

  const btnCross = getBtn(gamepad, 0); // Cross / A
  const btnCircle = getBtn(gamepad, 1); // Circle / B
  const btnSquare = getBtn(gamepad, 2); // Square / X
  const btnTriangle = getBtn(gamepad, 3); // Triangle / Y

  const l3 = getBtn(gamepad, 10);
  const r3 = getBtn(gamepad, 11);

  // Analog stick max offset in percentage for the visual stick puck
  const stickMoveRange = 10; // pixels
  const lsX = (axes[0] ?? 0) * stickMoveRange;
  const lsY = (axes[1] ?? 0) * stickMoveRange;
  const rsX = (axes[2] ?? 0) * stickMoveRange;
  const rsY = (axes[3] ?? 0) * stickMoveRange;

  const isPressed = (btn) => btn.pressed || btn.value > 0.1;

  return (
    <div className={`relative flex items-center justify-center select-none py-2 ${className}`}>
      {/* Base Controller Tester Outline Image */}
      <img
        src="/Icons/Controller Tester Outline.png"
        alt="Controller Tester Outline"
        className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_0_18px_rgba(255,255,255,0.18)]"
      />

      {/* --- LIVE INTERACTIVE OVERLAYS --- */}

      {/* L1 / L2 Shoulder Indicator */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(l1) || isPressed(l2)
            ? 'bg-blue-500/50 ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] opacity-100 scale-110'
            : 'opacity-0'
        }`}
        style={{
          top: '16.5%',
          left: '18%',
          width: '12%',
          height: '5%',
        }}
      />

      {/* R1 / R2 Shoulder Indicator */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(r1) || isPressed(r2)
            ? 'bg-blue-500/50 ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] opacity-100 scale-110'
            : 'opacity-0'
        }`}
        style={{
          top: '16.5%',
          right: '18%',
          width: '12%',
          height: '5%',
        }}
      />

      {/* D-Pad Up */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(dpadUp)
            ? 'bg-blue-500/60 ring-2 ring-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] opacity-100'
            : 'opacity-0'
        }`}
        style={{
          top: '31%',
          left: '19.2%',
          width: '6.5%',
          height: '7.5%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* D-Pad Left */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(dpadLeft)
            ? 'bg-blue-500/60 ring-2 ring-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] opacity-100'
            : 'opacity-0'
        }`}
        style={{
          top: '41%',
          left: '14%',
          width: '7.5%',
          height: '6.5%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* D-Pad Right */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(dpadRight)
            ? 'bg-blue-500/60 ring-2 ring-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] opacity-100'
            : 'opacity-0'
        }`}
        style={{
          top: '41%',
          left: '24.5%',
          width: '7.5%',
          height: '6.5%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* D-Pad Down */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(dpadDown)
            ? 'bg-blue-500/60 ring-2 ring-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] opacity-100'
            : 'opacity-0'
        }`}
        style={{
          top: '47.5%',
          left: '19.2%',
          width: '6.5%',
          height: '7.5%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Action Button: Triangle (Top) */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(btnTriangle)
            ? 'bg-emerald-500/60 ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] opacity-100'
            : 'opacity-0'
        }`}
        style={{
          top: '32%',
          right: '18.8%',
          width: '7%',
          height: '7%',
          transform: 'translate(50%, -50%)',
        }}
      />

      {/* Action Button: Square (Left) */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(btnSquare)
            ? 'bg-pink-500/60 ring-2 ring-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.9)] opacity-100'
            : 'opacity-0'
        }`}
        style={{
          top: '41%',
          right: '25.5%',
          width: '7%',
          height: '7%',
          transform: 'translate(50%, -50%)',
        }}
      />

      {/* Action Button: Circle (Right) */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(btnCircle)
            ? 'bg-red-500/60 ring-2 ring-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)] opacity-100'
            : 'opacity-0'
        }`}
        style={{
          top: '41%',
          right: '12.5%',
          width: '7%',
          height: '7%',
          transform: 'translate(50%, -50%)',
        }}
      />

      {/* Action Button: Cross (Bottom) */}
      <div
        className={`absolute rounded-full transition-all duration-100 pointer-events-none ${
          isPressed(btnCross)
            ? 'bg-blue-500/60 ring-2 ring-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)] opacity-100'
            : 'opacity-0'
        }`}
        style={{
          top: '49.5%',
          right: '18.8%',
          width: '7%',
          height: '7%',
          transform: 'translate(50%, -50%)',
        }}
      />

      {/* Left Analog Stick Puck */}
      <div
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          top: '57.8%',
          left: '33.8%',
          width: '13%',
          height: '13%',
          transform: `translate(calc(-50% + ${lsX}px), calc(-50% + ${lsY}px))`,
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-colors duration-100 ${
            isPressed(l3)
              ? 'bg-blue-500/50 border-2 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)]'
              : 'border border-blue-400/40 bg-blue-500/20'
          }`}
        />
        {/* Center red glowing point */}
        <div className="absolute w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
      </div>

      {/* Right Analog Stick Puck */}
      <div
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          top: '57.8%',
          left: '65.2%',
          width: '13%',
          height: '13%',
          transform: `translate(calc(-50% + ${rsX}px), calc(-50% + ${rsY}px))`,
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-colors duration-100 ${
            isPressed(r3)
              ? 'bg-blue-500/50 border-2 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)]'
              : 'border border-blue-400/40 bg-blue-500/20'
          }`}
        />
        {/* Center red glowing point */}
        <div className="absolute w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
      </div>
    </div>
  );
}
