import React from 'react';
import { Target } from 'lucide-react';
import AnalogStickRadar from './AnalogStickRadar';
import TriggerMeter from './TriggerMeter';
import { XboxLogo, ViewWindowsIcon, MenuHamburgerIcon } from './ControllerLogos';

function getBtn(gamepad, index) {
  return gamepad?.buttons?.[index] ?? { pressed: false, value: 0 };
}

export default function XboxLayout({
  gamepad,
  liveInputLabel = 'LIVE INPUT',
  onCalibrateClick,
  onSimulateButton,
  onSimulateAxis
}) {
  const axes = gamepad?.axes ?? [0, 0, 0, 0];

  const lt = getBtn(gamepad, 6);
  const rt = getBtn(gamepad, 7);
  const lb = getBtn(gamepad, 4);
  const rb = getBtn(gamepad, 5);
  const l3 = getBtn(gamepad, 10);
  const r3 = getBtn(gamepad, 11);

  const dpadUp = getBtn(gamepad, 12);
  const dpadDown = getBtn(gamepad, 13);
  const dpadLeft = getBtn(gamepad, 14);
  const dpadRight = getBtn(gamepad, 15);

  const btnA = getBtn(gamepad, 0); // Green
  const btnB = getBtn(gamepad, 1); // Red
  const btnX = getBtn(gamepad, 2); // Blue
  const btnY = getBtn(gamepad, 3); // Yellow

  const btnView = getBtn(gamepad, 8);
  const btnMenu = getBtn(gamepad, 9);
  const btnGuide = getBtn(gamepad, 16);

  const isBtnActive = (btn) => btn.pressed || btn.value > 0.1;

  return (
    <div className="w-full">
      {/* Top Header Row with LIVE INPUT and Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-gray-200 uppercase tracking-wider">
            {liveInputLabel}
          </span>
        </div>

        {/* Triggers Readout */}
        <div className="flex items-center gap-4 sm:gap-8 justify-between sm:justify-end">
          <TriggerMeter label="LT" value={lt.value} variant="xbox" />
          <TriggerMeter label="RT" value={rt.value} variant="xbox" />
        </div>
      </div>

      {/* Main Controller Body */}
      <div className="max-w-2xl mx-auto space-y-8">
        {/* LB & RB Bumpers Row */}
        <div className="flex justify-between items-center px-4 sm:px-12">
          <button
            type="button"
            onClick={() => onSimulateButton?.(4, !lb.pressed)}
            className={`px-8 py-2 rounded-full text-xs font-bold border transition-all duration-150 ${
              isBtnActive(lb)
                ? 'bg-[#107c10] border-emerald-400 text-white shadow-[0_0_15px_rgba(16,124,16,0.8)] scale-105'
                : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
            }`}
          >
            LB
          </button>

          <button
            type="button"
            onClick={() => onSimulateButton?.(5, !rb.pressed)}
            className={`px-8 py-2 rounded-full text-xs font-bold border transition-all duration-150 ${
              isBtnActive(rb)
                ? 'bg-[#107c10] border-emerald-400 text-white shadow-[0_0_15px_rgba(16,124,16,0.8)] scale-105'
                : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
            }`}
          >
            RB
          </button>
        </div>

        {/* Main Grid: Left Stick + L3 + Dpad | Center Xbox buttons | Right Stick + R3 + Action Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 items-center">
          {/* Left Column: Left Stick, L3, D-Pad */}
          <div className="flex flex-col items-center gap-4">
            <AnalogStickRadar
              label="Left Stick"
              x={axes[0] ?? 0}
              y={axes[1] ?? 0}
              isPressed={isBtnActive(l3)}
              onPress={() => onSimulateButton?.(10, !l3.pressed)}
              onChange={(nx, ny) => {
                onSimulateAxis?.(0, nx);
                onSimulateAxis?.(1, ny);
              }}
            />

            <button
              type="button"
              onClick={() => onSimulateButton?.(10, !l3.pressed)}
              className={`px-6 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 ${
                isBtnActive(l3)
                  ? 'bg-[#107c10] border-emerald-400 text-white shadow-[0_0_15px_rgba(16,124,16,0.8)]'
                  : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
              }`}
            >
              L3
            </button>

            {/* D-Pad */}
            <div className="relative w-24 h-24 flex items-center justify-center mt-1">
              <button
                type="button"
                onClick={() => onSimulateButton?.(12, !dpadUp.pressed)}
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-md flex items-center justify-center border text-xs font-bold transition-all ${
                  isBtnActive(dpadUp)
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
                }`}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => onSimulateButton?.(14, !dpadLeft.pressed)}
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center border text-xs font-bold transition-all ${
                  isBtnActive(dpadLeft)
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
                }`}
              >
                ◀
              </button>
              <div className="w-7 h-7 rounded-sm bg-white/5 border border-white/10" />
              <button
                type="button"
                onClick={() => onSimulateButton?.(15, !dpadRight.pressed)}
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center border text-xs font-bold transition-all ${
                  isBtnActive(dpadRight)
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
                }`}
              >
                ▶
              </button>
              <button
                type="button"
                onClick={() => onSimulateButton?.(13, !dpadDown.pressed)}
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-md flex items-center justify-center border text-xs font-bold transition-all ${
                  isBtnActive(dpadDown)
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
                }`}
              >
                ▼
              </button>
            </div>
          </div>

          {/* Center Column: Xbox Guide Button + View + Menu */}
          <div className="flex flex-col items-center justify-center gap-5">
            {/* Xbox Guide Button (Large glowing circle) */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(16, !btnGuide.pressed)}
              className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-200 ${
                isBtnActive(btnGuide)
                  ? 'bg-emerald-500 border-white text-black shadow-[0_0_25px_rgba(16,185,129,0.9)] scale-110'
                  : 'bg-white/10 border-white/30 text-white hover:border-emerald-400 hover:text-emerald-400'
              }`}
              title="Xbox Guide"
            >
              <XboxLogo className="w-8 h-8" />
            </button>

            {/* View Button (Overlapping squares) */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(8, !btnView.pressed)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isBtnActive(btnView)
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                  : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
              }`}
              title="View Button"
            >
              <ViewWindowsIcon className="w-4 h-4" />
            </button>

            {/* Menu Button (Hamburger) */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(9, !btnMenu.pressed)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isBtnActive(btnMenu)
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                  : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
              }`}
              title="Menu Button"
            >
              <MenuHamburgerIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Right Stick, R3, Action Buttons (Y, X, B, A) */}
          <div className="flex flex-col items-center gap-4">
            <AnalogStickRadar
              label="Right Stick"
              x={axes[2] ?? 0}
              y={axes[3] ?? 0}
              isPressed={isBtnActive(r3)}
              onPress={() => onSimulateButton?.(11, !r3.pressed)}
              onChange={(nx, ny) => {
                onSimulateAxis?.(2, nx);
                onSimulateAxis?.(3, ny);
              }}
            />

            <button
              type="button"
              onClick={() => onSimulateButton?.(11, !r3.pressed)}
              className={`px-6 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 ${
                isBtnActive(r3)
                  ? 'bg-[#107c10] border-emerald-400 text-white shadow-[0_0_15px_rgba(16,124,16,0.8)]'
                : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
              }`}
            >
              R3
            </button>

            {/* Action Buttons (Y, X, B, A) */}
            <div className="relative w-24 h-24 flex items-center justify-center mt-1">
              {/* Y Button (Top - Yellow) */}
              <button
                type="button"
                onClick={() => onSimulateButton?.(3, !btnY.pressed)}
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  isBtnActive(btnY)
                    ? 'bg-amber-400 border-amber-300 text-black shadow-[0_0_14px_rgba(251,191,36,0.9)] scale-110'
                    : 'bg-white/5 border-white/20 text-amber-400 hover:border-amber-400/50'
                }`}
              >
                Y
              </button>

              {/* X Button (Left - Blue) */}
              <button
                type="button"
                onClick={() => onSimulateButton?.(2, !btnX.pressed)}
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  isBtnActive(btnX)
                    ? 'bg-blue-500 border-blue-300 text-white shadow-[0_0_14px_rgba(59,130,246,0.9)] scale-110'
                    : 'bg-white/5 border-white/20 text-blue-400 hover:border-blue-400/50'
                }`}
              >
                X
              </button>

              {/* B Button (Right - Red) */}
              <button
                type="button"
                onClick={() => onSimulateButton?.(1, !btnB.pressed)}
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  isBtnActive(btnB)
                    ? 'bg-red-500 border-red-300 text-white shadow-[0_0_14px_rgba(239,68,68,0.9)] scale-110'
                    : 'bg-white/5 border-white/20 text-red-400 hover:border-red-400/50'
                }`}
              >
                B
              </button>

              {/* A Button (Bottom - Green) */}
              <button
                type="button"
                onClick={() => onSimulateButton?.(0, !btnA.pressed)}
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  isBtnActive(btnA)
                    ? 'bg-emerald-500 border-emerald-300 text-white shadow-[0_0_14px_rgba(16,185,129,0.9)] scale-110'
                    : 'bg-white/5 border-white/20 text-emerald-400 hover:border-emerald-400/50'
                }`}
              >
                A
              </button>
            </div>
          </div>
        </div>

        {/* Calibrate Controller Button */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onCalibrateClick}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs sm:text-sm font-medium text-gray-200 transition-all shadow-md group"
          >
            <Target className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            <span>Calibrate Controller</span>
          </button>
        </div>
      </div>
    </div>
  );
}
