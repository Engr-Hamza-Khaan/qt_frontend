import React from 'react';
import { Target, Mic, MicOff } from 'lucide-react';
import AnalogStickRadar from './AnalogStickRadar';
import TriggerMeter from './TriggerMeter';
import {
  PlayStationLogo,
  TriangleIcon,
  SquareSymbol,
  CircleSymbol,
  CrossSymbol
} from './ControllerLogos';

function getBtn(gamepad, index) {
  return gamepad?.buttons?.[index] ?? { pressed: false, value: 0 };
}

export default function PlayStationLayout({
  gamepad,
  liveInputLabel = 'LIVE INPUT',
  onCalibrateClick,
  onSimulateButton,
  onSimulateAxis
}) {
  const axes = gamepad?.axes ?? [0, 0, 0, 0];

  const l2 = getBtn(gamepad, 6);
  const r2 = getBtn(gamepad, 7);
  const l1 = getBtn(gamepad, 4);
  const r1 = getBtn(gamepad, 5);
  const l3 = getBtn(gamepad, 10);
  const r3 = getBtn(gamepad, 11);

  const dpadUp = getBtn(gamepad, 12);
  const dpadDown = getBtn(gamepad, 13);
  const dpadLeft = getBtn(gamepad, 14);
  const dpadRight = getBtn(gamepad, 15);

  const btnCross = getBtn(gamepad, 0); // ✕
  const btnCircle = getBtn(gamepad, 1); // ○
  const btnSquare = getBtn(gamepad, 2); // □
  const btnTriangle = getBtn(gamepad, 3); // △

  const btnShare = getBtn(gamepad, 8);
  const btnOptions = getBtn(gamepad, 9);
  const btnHome = getBtn(gamepad, 16);
  const btnMute = getBtn(gamepad, 17);

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
          <TriggerMeter label="L2 / LT" value={l2.value} variant="playstation" />
          <TriggerMeter label="R2 / RT" value={r2.value} variant="playstation" />
        </div>
      </div>

      {/* Main Controller Body Grid */}
      <div className="max-w-2xl mx-auto space-y-8">
        {/* L1 & R1 Bumpers Row */}
        <div className="flex justify-between items-center px-4 sm:px-12">
          <button
            type="button"
            onClick={() => onSimulateButton?.(4, !l1.pressed)}
            className={`px-8 py-2 rounded-full text-xs font-bold border transition-all duration-150 ${
              isBtnActive(l1)
                ? 'bg-[#00439c] border-blue-400 text-white shadow-[0_0_15px_rgba(0,112,209,0.7)] scale-105'
                : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
            }`}
          >
            L1
          </button>

          <button
            type="button"
            onClick={() => onSimulateButton?.(5, !r1.pressed)}
            className={`px-8 py-2 rounded-full text-xs font-bold border transition-all duration-150 ${
              isBtnActive(r1)
                ? 'bg-[#00439c] border-blue-400 text-white shadow-[0_0_15px_rgba(0,112,209,0.7)] scale-105'
                : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
            }`}
          >
            R1
          </button>
        </div>

        {/* Sticks Row */}
        <div className="flex justify-between items-center px-2 sm:px-8">
          {/* Left Stick Radar */}
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

          {/* Right Stick Radar */}
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
        </div>

        {/* L3, Center Buttons, R3 Row */}
        <div className="flex justify-between items-center px-4 sm:px-12">
          {/* L3 Button */}
          <button
            type="button"
            onClick={() => onSimulateButton?.(10, !l3.pressed)}
            className={`px-6 py-2 rounded-full text-xs font-bold border transition-all duration-150 ${
              isBtnActive(l3)
                ? 'bg-[#00439c] border-blue-400 text-white shadow-[0_0_15px_rgba(0,112,209,0.7)]'
                : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
            }`}
          >
            L3
          </button>

          {/* Center PS Home & MUTE */}
          <div className="flex flex-col items-center gap-3">
            {/* PS Home Button */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(16, !btnHome.pressed)}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-150 ${
                isBtnActive(btnHome)
                  ? 'bg-[#00439c] border-blue-400 text-white shadow-[0_0_15px_rgba(0,112,209,0.8)] scale-110'
                  : 'bg-white/5 border-white/20 text-gray-400 hover:text-white hover:border-white/40'
              }`}
              title="PS Button"
            >
              <PlayStationLogo className="w-5 h-5" />
            </button>

            {/* MUTE Button */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(17, !btnMute.pressed)}
              className={`px-5 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-150 flex items-center gap-1.5 ${
                isBtnActive(btnMute)
                  ? 'bg-amber-600/80 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                  : 'bg-white/5 border-white/20 text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>MUTE</span>
            </button>
          </div>

          {/* R3 Button */}
          <button
            type="button"
            onClick={() => onSimulateButton?.(11, !r3.pressed)}
            className={`px-6 py-2 rounded-full text-xs font-bold border transition-all duration-150 ${
              isBtnActive(r3)
                ? 'bg-[#00439c] border-blue-400 text-white shadow-[0_0_15px_rgba(0,112,209,0.7)]'
                : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
            }`}
          >
            R3
          </button>
        </div>

        {/* D-Pad and Action Buttons Row */}
        <div className="flex justify-between items-center px-4 sm:px-12 pt-2">
          {/* D-Pad (Left side) */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Up */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(12, !dpadUp.pressed)}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-md flex items-center justify-center border text-xs font-bold transition-all ${
                isBtnActive(dpadUp)
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                  : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
              }`}
            >
              ▲
            </button>
            {/* Left */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(14, !dpadLeft.pressed)}
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md flex items-center justify-center border text-xs font-bold transition-all ${
                isBtnActive(dpadLeft)
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                  : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
              }`}
            >
              ◀
            </button>
            {/* Center cross junction */}
            <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10" />
            {/* Right */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(15, !dpadRight.pressed)}
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md flex items-center justify-center border text-xs font-bold transition-all ${
                isBtnActive(dpadRight)
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                  : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
              }`}
            >
              ▶
            </button>
            {/* Down */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(13, !dpadDown.pressed)}
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-md flex items-center justify-center border text-xs font-bold transition-all ${
                isBtnActive(dpadDown)
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                  : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
              }`}
            >
              ▼
            </button>
          </div>

          {/* Action Buttons (Right side - Triangle, Square, Circle, Cross) */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Triangle (Top) */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(3, !btnTriangle.pressed)}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isBtnActive(btnTriangle)
                  ? 'bg-emerald-500/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.8)] scale-110'
                  : 'bg-white/5 border-white/20 text-gray-300 hover:border-emerald-500/50'
              }`}
            >
              <TriangleIcon className="w-4 h-4" color={isBtnActive(btnTriangle) ? '#34d399' : '#9ca3af'} />
            </button>

            {/* Square (Left) */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(2, !btnSquare.pressed)}
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isBtnActive(btnSquare)
                  ? 'bg-pink-500/40 border-pink-400 text-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.8)] scale-110'
                  : 'bg-white/5 border-white/20 text-gray-300 hover:border-pink-500/50'
              }`}
            >
              <SquareSymbol className="w-4 h-4" color={isBtnActive(btnSquare) ? '#f472b6' : '#9ca3af'} />
            </button>

            {/* Circle (Right) */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(1, !btnCircle.pressed)}
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isBtnActive(btnCircle)
                  ? 'bg-red-500/40 border-red-400 text-red-300 shadow-[0_0_12px_rgba(248,113,113,0.8)] scale-110'
                  : 'bg-white/5 border-white/20 text-gray-300 hover:border-red-500/50'
              }`}
            >
              <CircleSymbol className="w-4 h-4" color={isBtnActive(btnCircle) ? '#f87171' : '#9ca3af'} />
            </button>

            {/* Cross (Bottom) */}
            <button
              type="button"
              onClick={() => onSimulateButton?.(0, !btnCross.pressed)}
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isBtnActive(btnCross)
                  ? 'bg-blue-500/40 border-blue-400 text-blue-300 shadow-[0_0_12px_rgba(96,165,250,0.8)] scale-110'
                  : 'bg-white/5 border-white/20 text-gray-300 hover:border-blue-500/50'
              }`}
            >
              <CrossSymbol className="w-4 h-4" color={isBtnActive(btnCross) ? '#60a5fa' : '#9ca3af'} />
            </button>
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
