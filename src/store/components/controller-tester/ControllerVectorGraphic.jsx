import React from 'react';

function getBtn(gamepad, index) {
  return gamepad?.buttons?.[index] ?? { pressed: false, value: 0 };
}

export default function ControllerVectorGraphic({
  gamepad,
  type = 'playstation', // 'playstation' or 'xbox'
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

  const btn0 = getBtn(gamepad, 0); // Cross / A
  const btn1 = getBtn(gamepad, 1); // Circle / B
  const btn2 = getBtn(gamepad, 2); // Square / X
  const btn3 = getBtn(gamepad, 3); // Triangle / Y

  const btnShare = getBtn(gamepad, 8);
  const btnOptions = getBtn(gamepad, 9);
  const btnHome = getBtn(gamepad, 16);
  const btnMute = getBtn(gamepad, 17);
  const l3 = getBtn(gamepad, 10);
  const r3 = getBtn(gamepad, 11);

  // Analog stick offsets (max 8px movement in SVG units)
  const stickMaxOffset = 10;
  const lsX = (axes[0] ?? 0) * stickMaxOffset;
  const lsY = (axes[1] ?? 0) * stickMaxOffset;
  const rsX = (axes[2] ?? 0) * stickMaxOffset;
  const rsY = (axes[3] ?? 0) * stickMaxOffset;

  const isPressed = (btn) => btn.pressed || btn.value > 0.1;

  if (type === 'xbox') {
    return (
      <div className="flex justify-center items-center py-4">
        <svg
          viewBox="0 0 500 360"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Xbox Controller Outer Body Silhouette */}
          <path
            d="M 120 70 C 170 65, 330 65, 380 70 C 440 76, 480 130, 485 220 C 490 280, 450 330, 415 340 C 375 350, 345 280, 320 230 C 290 215, 210 215, 180 230 C 155 280, 125 350, 85 340 C 50 330, 10 280, 15 220 C 20 130, 60 76, 120 70 Z"
            stroke="#ffffff"
            strokeWidth="3.5"
            fill="#091326"
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          />

          {/* Grip Lines */}
          <path
            d="M 85 340 C 115 310, 135 240, 140 180"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M 415 340 C 385 310, 365 240, 360 180"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* LT Trigger Highlight */}
          <path
            d="M 110 65 C 100 40, 130 30, 160 30 C 175 30, 185 45, 180 65 Z"
            stroke={isPressed(l2) ? "#10b981" : "rgba(255,255,255,0.3)"}
            strokeWidth="2.5"
            fill={isPressed(l2) ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.05)"}
          />
          {/* RT Trigger Highlight */}
          <path
            d="M 390 65 C 400 40, 370 30, 340 30 C 325 30, 315 45, 320 65 Z"
            stroke={isPressed(r2) ? "#10b981" : "rgba(255,255,255,0.3)"}
            strokeWidth="2.5"
            fill={isPressed(r2) ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.05)"}
          />

          {/* LB Bumper */}
          <rect
            x="115"
            y="65"
            width="75"
            height="18"
            rx="9"
            stroke={isPressed(l1) ? "#10b981" : "#ffffff"}
            strokeWidth="2.5"
            fill={isPressed(l1) ? "rgba(16,185,129,0.6)" : "none"}
          />
          {/* RB Bumper */}
          <rect
            x="310"
            y="65"
            width="75"
            height="18"
            rx="9"
            stroke={isPressed(r1) ? "#10b981" : "#ffffff"}
            strokeWidth="2.5"
            fill={isPressed(r1) ? "rgba(16,185,129,0.6)" : "none"}
          />

          {/* Center Xbox Guide Button */}
          <circle
            cx="250"
            cy="110"
            r="20"
            stroke={isPressed(btnHome) ? "#10b981" : "#ffffff"}
            strokeWidth="3"
            fill={isPressed(btnHome) ? "#10b981" : "#0f2038"}
          />
          <path
            d="M 240 102 C 245 106, 255 106, 260 102 M 238 120 C 244 114, 256 114, 262 120"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Left Analog Stick (Upper Left on Xbox) */}
          <g transform={`translate(${lsX}, ${lsY})`}>
            <circle
              cx="145"
              cy="140"
              r="34"
              stroke="#ffffff"
              strokeWidth="2.5"
              fill={isPressed(l3) ? "rgba(16,185,129,0.4)" : "#0c182e"}
            />
            <circle
              cx="145"
              cy="140"
              r="22"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              fill="#13243f"
            />
          </g>

          {/* D-Pad (Lower Left on Xbox) */}
          <g transform="translate(145, 230)">
            {/* Center */}
            <rect x="-10" y="-10" width="20" height="20" fill="#091326" />
            {/* Up */}
            <path
              d="M -10 -10 L -10 -30 L 10 -30 L 10 -10 Z"
              stroke={isPressed(dpadUp) ? "#10b981" : "#ffffff"}
              strokeWidth="2"
              fill={isPressed(dpadUp) ? "#10b981" : "rgba(255,255,255,0.05)"}
            />
            {/* Down */}
            <path
              d="M -10 10 L -10 30 L 10 30 L 10 10 Z"
              stroke={isPressed(dpadDown) ? "#10b981" : "#ffffff"}
              strokeWidth="2"
              fill={isPressed(dpadDown) ? "#10b981" : "rgba(255,255,255,0.05)"}
            />
            {/* Left */}
            <path
              d="M -10 -10 L -30 -10 L -30 10 L -10 10 Z"
              stroke={isPressed(dpadLeft) ? "#10b981" : "#ffffff"}
              strokeWidth="2"
              fill={isPressed(dpadLeft) ? "#10b981" : "rgba(255,255,255,0.05)"}
            />
            {/* Right */}
            <path
              d="M 10 -10 L 30 -10 L 30 10 L 10 10 Z"
              stroke={isPressed(dpadRight) ? "#10b981" : "#ffffff"}
              strokeWidth="2"
              fill={isPressed(dpadRight) ? "#10b981" : "rgba(255,255,255,0.05)"}
            />
          </g>

          {/* Action Buttons (Upper Right on Xbox: Y top, X left, B right, A bottom) */}
          <g transform="translate(355, 140)">
            {/* Y Button (Yellow) */}
            <circle
              cx="0"
              cy="-26"
              r="13"
              stroke={isPressed(btn3) ? "#fbbf24" : "#ffffff"}
              strokeWidth="2"
              fill={isPressed(btn3) ? "#fbbf24" : "rgba(255,255,255,0.05)"}
            />
            <text x="0" y="-21" textAnchor="middle" fill={isPressed(btn3) ? "#000" : "#fbbf24"} fontSize="12" fontWeight="bold">Y</text>

            {/* X Button (Blue) */}
            <circle
              cx="-26"
              cy="0"
              r="13"
              stroke={isPressed(btn2) ? "#3b82f6" : "#ffffff"}
              strokeWidth="2"
              fill={isPressed(btn2) ? "#3b82f6" : "rgba(255,255,255,0.05)"}
            />
            <text x="-26" y="5" textAnchor="middle" fill={isPressed(btn2) ? "#fff" : "#60a5fa"} fontSize="12" fontWeight="bold">X</text>

            {/* B Button (Red) */}
            <circle
              cx="26"
              cy="0"
              r="13"
              stroke={isPressed(btn1) ? "#ef4444" : "#ffffff"}
              strokeWidth="2"
              fill={isPressed(btn1) ? "#ef4444" : "rgba(255,255,255,0.05)"}
            />
            <text x="26" y="5" textAnchor="middle" fill={isPressed(btn1) ? "#fff" : "#f87171"} fontSize="12" fontWeight="bold">B</text>

            {/* A Button (Green) */}
            <circle
              cx="0"
              cy="26"
              r="13"
              stroke={isPressed(btn0) ? "#10b981" : "#ffffff"}
              strokeWidth="2"
              fill={isPressed(btn0) ? "#10b981" : "rgba(255,255,255,0.05)"}
            />
            <text x="0" y="31" textAnchor="middle" fill={isPressed(btn0) ? "#000" : "#34d399"} fontSize="12" fontWeight="bold">A</text>
          </g>

          {/* Right Analog Stick (Lower Right on Xbox) */}
          <g transform={`translate(${rsX}, ${rsY})`}>
            <circle
              cx="310"
              cy="210"
              r="34"
              stroke="#ffffff"
              strokeWidth="2.5"
              fill={isPressed(r3) ? "rgba(16,185,129,0.4)" : "#0c182e"}
            />
            <circle
              cx="310"
              cy="210"
              r="22"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              fill="#13243f"
            />
          </g>

          {/* View and Menu Buttons */}
          <circle
            cx="210"
            cy="150"
            r="8"
            stroke={isPressed(btnShare) ? "#10b981" : "#ffffff"}
            strokeWidth="1.5"
            fill={isPressed(btnShare) ? "#10b981" : "none"}
          />
          <circle
            cx="290"
            cy="150"
            r="8"
            stroke={isPressed(btnOptions) ? "#10b981" : "#ffffff"}
            strokeWidth="1.5"
            fill={isPressed(btnOptions) ? "#10b981" : "none"}
          />
        </svg>
      </div>
    );
  }

  // PS5 DualSense Controller Vector
  return (
    <div className="flex justify-center items-center py-2">
      <svg
        viewBox="0 0 500 370"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* PS5 DualSense Body Outline */}
        <path
          d="M 140 75 C 190 70, 310 70, 360 75 C 410 80, 470 120, 485 210 C 495 270, 465 340, 415 355 C 375 365, 350 300, 330 250 C 310 240, 190 240, 170 250 C 150 300, 125 365, 85 355 C 35 340, 5 270, 15 210 C 30 120, 90 80, 140 75 Z"
          stroke="#ffffff"
          strokeWidth="3.5"
          fill="#081024"
          className="drop-shadow-[0_0_15px_rgba(255,255,255,0.12)]"
        />

        {/* DualSense Inner Wing Contours (White Shell line) */}
        <path
          d="M 125 76 C 145 130, 155 200, 155 260 C 145 310, 115 350, 90 350"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2.5"
        />
        <path
          d="M 375 76 C 355 130, 345 200, 345 260 C 355 310, 385 350, 410 350"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2.5"
        />

        {/* Center Touchpad Outline */}
        <path
          d="M 180 85 L 320 85 C 325 85, 330 90, 328 105 L 315 170 C 313 178, 305 182, 295 182 L 205 182 C 195 182, 187 178, 185 170 L 172 105 C 170 90, 175 85, 180 85 Z"
          stroke="#ffffff"
          strokeWidth="2.5"
          fill="rgba(255,255,255,0.04)"
        />

        {/* L2 & R2 Triggers */}
        <path
          d="M 105 70 C 95 40, 130 32, 160 32 C 175 32, 185 45, 180 70 Z"
          stroke={isPressed(l2) ? "#3b82f6" : "rgba(255,255,255,0.3)"}
          strokeWidth="2.5"
          fill={isPressed(l2) ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.05)"}
        />
        <path
          d="M 395 70 C 405 40, 370 32, 340 32 C 325 32, 315 45, 320 70 Z"
          stroke={isPressed(r2) ? "#3b82f6" : "rgba(255,255,255,0.3)"}
          strokeWidth="2.5"
          fill={isPressed(r2) ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.05)"}
        />

        {/* L1 & R1 Shoulders */}
        <rect
          x="105"
          y="70"
          width="70"
          height="16"
          rx="8"
          stroke={isPressed(l1) ? "#3b82f6" : "#ffffff"}
          strokeWidth="2"
          fill={isPressed(l1) ? "rgba(59,130,246,0.6)" : "none"}
        />
        <rect
          x="325"
          y="70"
          width="70"
          height="16"
          rx="8"
          stroke={isPressed(r1) ? "#3b82f6" : "#ffffff"}
          strokeWidth="2"
          fill={isPressed(r1) ? "rgba(59,130,246,0.6)" : "none"}
        />

        {/* D-Pad on Left */}
        <g transform="translate(115, 150)">
          {/* Up */}
          <path
            d="M -7 -8 L -7 -24 L 7 -24 L 7 -8 Z"
            stroke={isPressed(dpadUp) ? "#3b82f6" : "#ffffff"}
            strokeWidth="2"
            fill={isPressed(dpadUp) ? "#3b82f6" : "rgba(255,255,255,0.05)"}
          />
          {/* Down */}
          <path
            d="M -7 8 L -7 24 L 7 24 L 7 8 Z"
            stroke={isPressed(dpadDown) ? "#3b82f6" : "#ffffff"}
            strokeWidth="2"
            fill={isPressed(dpadDown) ? "#3b82f6" : "rgba(255,255,255,0.05)"}
          />
          {/* Left */}
          <path
            d="M -8 -7 L -24 -7 L -24 7 L -8 7 Z"
            stroke={isPressed(dpadLeft) ? "#3b82f6" : "#ffffff"}
            strokeWidth="2"
            fill={isPressed(dpadLeft) ? "#3b82f6" : "rgba(255,255,255,0.05)"}
          />
          {/* Right */}
          <path
            d="M 8 -7 L 24 -7 L 24 7 L 8 7 Z"
            stroke={isPressed(dpadRight) ? "#3b82f6" : "#ffffff"}
            strokeWidth="2"
            fill={isPressed(dpadRight) ? "#3b82f6" : "rgba(255,255,255,0.05)"}
          />
        </g>

        {/* Action Buttons on Right (Triangle, Square, Circle, Cross) */}
        <g transform="translate(385, 150)">
          {/* Triangle (Top) */}
          <circle
            cx="0"
            cy="-22"
            r="12"
            stroke={isPressed(btn3) ? "#34d399" : "#ffffff"}
            strokeWidth="2"
            fill={isPressed(btn3) ? "rgba(52,211,153,0.6)" : "rgba(255,255,255,0.05)"}
          />
          <path d="M 0 -27 L -5 -18 L 5 -18 Z" stroke="#34d399" strokeWidth="1.5" />

          {/* Square (Left) */}
          <circle
            cx="-22"
            cy="0"
            r="12"
            stroke={isPressed(btn2) ? "#f472b6" : "#ffffff"}
            strokeWidth="2"
            fill={isPressed(btn2) ? "rgba(244,114,182,0.6)" : "rgba(255,255,255,0.05)"}
          />
          <rect x="-26" y="-4" width="8" height="8" stroke="#f472b6" strokeWidth="1.5" />

          {/* Circle (Right) */}
          <circle
            cx="22"
            cy="0"
            r="12"
            stroke={isPressed(btn1) ? "#f87171" : "#ffffff"}
            strokeWidth="2"
            fill={isPressed(btn1) ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.05)"}
          />
          <circle cx="22" cy="0" r="4.5" stroke="#f87171" strokeWidth="1.5" />

          {/* Cross (Bottom) */}
          <circle
            cx="0"
            cy="22"
            r="12"
            stroke={isPressed(btn0) ? "#60a5fa" : "#ffffff"}
            strokeWidth="2"
            fill={isPressed(btn0) ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.05)"}
          />
          <path d="M -4 18 L 4 26 M 4 18 L -4 26" stroke="#60a5fa" strokeWidth="1.5" />
        </g>

        {/* Dual Analog Sticks (Symmetrical at bottom center) */}
        {/* Left Stick */}
        <g transform={`translate(${lsX}, ${lsY})`}>
          <circle
            cx="195"
            cy="235"
            r="32"
            stroke="#ffffff"
            strokeWidth="2.5"
            fill={isPressed(l3) ? "rgba(59,130,246,0.5)" : "#0c182e"}
          />
          <circle
            cx="195"
            cy="235"
            r="20"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            fill="#12233f"
          />
        </g>

        {/* Right Stick */}
        <g transform={`translate(${rsX}, ${rsY})`}>
          <circle
            cx="305"
            cy="235"
            r="32"
            stroke="#ffffff"
            strokeWidth="2.5"
            fill={isPressed(r3) ? "rgba(59,130,246,0.5)" : "#0c182e"}
          />
          <circle
            cx="305"
            cy="235"
            r="20"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            fill="#12233f"
          />
        </g>

        {/* PS Center Button */}
        <circle
          cx="250"
          cy="215"
          r="10"
          stroke={isPressed(btnHome) ? "#3b82f6" : "#ffffff"}
          strokeWidth="2"
          fill={isPressed(btnHome) ? "#3b82f6" : "#0d1a33"}
        />

        {/* Mute Button */}
        <rect
          x="243"
          y="238"
          width="14"
          height="7"
          rx="3.5"
          stroke={isPressed(btnMute) ? "#f59e0b" : "rgba(255,255,255,0.4)"}
          strokeWidth="1.5"
          fill={isPressed(btnMute) ? "#f59e0b" : "none"}
        />
      </svg>
    </div>
  );
}
