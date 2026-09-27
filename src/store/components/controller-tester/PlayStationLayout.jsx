import React from 'react';
import { Target } from 'lucide-react';
import AnalogStickRadar from './AnalogStickRadar';
import TriggerMeter from './TriggerMeter';

function getBtn(gamepad, index) {
  return gamepad?.buttons?.[index] ?? { pressed: false, value: 0 };
}

export default function PlayStationLayout({
  gamepad,
  liveInputLabel = 'LIVE INPUT: PS5 Dualsense Controller',
  onCalibrateClick
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

  const btnOptions = getBtn(gamepad, 9); // Options ≡
  const btnShare = getBtn(gamepad, 8); // Create / Mic
  const btnHome = getBtn(gamepad, 16); // PS Button
  const btnTouchpad = getBtn(gamepad, 17); // Touchpad Click
  const btnMute = getBtn(gamepad, 18); // Mute

  const isBtnActive = (btn) => btn?.pressed || (btn?.value ?? 0) > 0.1;

  return (
    <div className="w-full">
      {/* Top Header Row with LIVE INPUT and Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-gray-200 tracking-wide">
            {liveInputLabel}
          </span>
        </div>

        {/* Triggers Readout */}
        <div className="flex items-center gap-6 sm:gap-12 justify-between sm:justify-end">
          <TriggerMeter label="L2 / LT" value={l2.value} variant="playstation" />
          <TriggerMeter label="R2 / RT" value={r2.value} variant="playstation" />
        </div>
      </div>

      {/* Main Controller Body */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* L1 & R1 Bumpers Row */}
        <div className="flex justify-between items-center px-4 sm:px-16">
          <div
            className={`px-9 py-2.5 rounded-xl text-base font-bold tracking-wider transition-all duration-100 select-none ${
              isBtnActive(l1)
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-105'
                : 'bg-white/15 text-white/90 border border-white/10'
            }`}
          >
            L1
          </div>

          <div
            className={`px-9 py-2.5 rounded-xl text-base font-bold tracking-wider transition-all duration-100 select-none ${
              isBtnActive(r1)
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-105'
                : 'bg-white/15 text-white/90 border border-white/10'
            }`}
          >
            R1
          </div>
        </div>

        {/* Main Center Area: Left Stick | Touchpad + Center Buttons | Right Stick */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left Column: Left Stick */}
          <div className="flex flex-col items-center">
            <AnalogStickRadar
              label="Left Stick"
              x={axes[0] ?? 0}
              y={axes[1] ?? 0}
              size={140}
              isPressed={isBtnActive(l3)}
            />
          </div>

          {/* Center Column: Touchpad + Center Buttons Stack */}
          <div className="flex flex-col items-center gap-3">
            {/* DualSense Touchpad (The highlighted box) */}
            <div
              className={`w-56 sm:w-64 h-24 sm:h-28 rounded-2xl relative flex items-center justify-center transition-all duration-150 border ${
                isBtnActive(btnTouchpad)
                  ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.6)]'
                  : 'bg-[#0a1024]/90 border-white/10 shadow-inner'
              }`}
            >
              {/* Touchpad Center Dot Indicator */}
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isBtnActive(btnTouchpad)
                    ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] scale-125'
                    : 'bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                }`}
              />
            </div>

            {/* PlayStation Logo + "HOME" */}
            <div className="flex flex-col items-center mt-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 ${
                  isBtnActive(btnHome)
                    ? 'bg-blue-600 text-white shadow-[0_0_18px_rgba(59,130,246,0.8)] scale-110'
                    : 'text-white/80'
                }`}
              >
                <img
                  src="/Icons/Console Outline.png"
                  alt="PS Home"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                HOME
              </span>
            </div>

            {/* Options Button (≡ 3 lines) */}
            <div
              className={`w-14 h-8 rounded-full flex items-center justify-center border transition-all duration-150 ${
                isBtnActive(btnOptions)
                  ? 'bg-blue-600/60 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.7)]'
                  : 'bg-white/5 border-white/15 text-white/80'
              }`}
              title="Options"
            >
              <div className="flex flex-col gap-1 items-center justify-center">
                <span className="w-5 h-[2px] bg-current rounded-full" />
                <span className="w-5 h-[2px] bg-current rounded-full" />
                <span className="w-5 h-[2px] bg-current rounded-full" />
              </div>
            </div>

            {/* Mic / Voice Beam Button (\l/) */}
            <div
              className={`w-14 h-7 rounded-full flex items-center justify-center border transition-all duration-150 ${
                isBtnActive(btnShare)
                  ? 'bg-blue-600/60 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.7)]'
                  : 'bg-white/5 border-white/15 text-white/80'
              }`}
              title="Create / Mic"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="6" y1="8" x2="10" y2="19" />
                <line x1="18" y1="8" x2="14" y2="19" />
              </svg>
            </div>

            {/* MUTE Button */}
            <div
              className={`px-6 py-1.5 rounded-full text-xs font-bold tracking-wider border transition-all duration-150 ${
                isBtnActive(btnMute)
                  ? 'bg-amber-600/80 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.7)]'
                  : 'bg-white/5 border-white/15 text-amber-500/80'
              }`}
            >
              MUTE
            </div>
          </div>

          {/* Right Column: Right Stick */}
          <div className="flex flex-col items-center">
            <AnalogStickRadar
              label="Right Stick"
              x={axes[2] ?? 0}
              y={axes[3] ?? 0}
              size={140}
              isPressed={isBtnActive(r3)}
            />
          </div>
        </div>

        {/* L3 and R3 Row */}
        <div className="flex justify-between items-center px-6 sm:px-20 pt-2">
          {/* L3 */}
          <div
            className={`px-8 py-2 rounded-xl text-base font-bold transition-all duration-150 select-none ${
              isBtnActive(l3)
                ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.8)] scale-105'
                : 'bg-white/10 text-white/80 border border-white/10'
            }`}
          >
            L3
          </div>

          {/* R3 */}
          <div
            className={`px-8 py-2 rounded-xl text-base font-bold transition-all duration-150 select-none ${
              isBtnActive(r3)
                ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.8)] scale-105'
                : 'bg-white/10 text-white/80 border border-white/10'
            }`}
          >
            R3
          </div>
        </div>

        {/* Bottom Section: D-Pad on Left | Action Buttons on Right */}
        <div className="flex justify-between items-center px-6 sm:px-20 pt-4">
          {/* D-Pad (Petal / Teardrop shape matching screenshot) */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* D-Pad Up */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-100 ${
                isBtnActive(dpadUp)
                  ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.9)] scale-110'
                  : 'border-2 border-white/30 text-white/70'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 18V6M6 12l6-6 6 6" />
              </svg>
            </div>

            {/* D-Pad Left */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-100 ${
                isBtnActive(dpadLeft)
                  ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.9)] scale-110'
                  : 'border-2 border-white/30 text-white/70'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 12H6M12 6l-6 6 6 6" />
              </svg>
            </div>

            {/* D-Pad Right */}
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-100 ${
                isBtnActive(dpadRight)
                  ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.9)] scale-110'
                  : 'border-2 border-white/30 text-white/70'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 12h12M12 6l6 6-6 6" />
              </svg>
            </div>

            {/* D-Pad Down */}
            <div
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-100 ${
                isBtnActive(dpadDown)
                  ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.9)] scale-110'
                  : 'border-2 border-white/30 text-white/70'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v12M6 12l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Action Buttons (Triangle, Square, Circle with concentric ring, Cross) */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Triangle (Top) */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-100 ${
                isBtnActive(btnTriangle)
                  ? 'bg-emerald-500/50 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.9)] scale-110'
                  : 'border-2 border-white/30 text-white/70'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4L3 20h18L12 4z" />
              </svg>
            </div>

            {/* Square (Left) */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-100 ${
                isBtnActive(btnSquare)
                  ? 'bg-pink-500/50 border-2 border-pink-400 text-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.9)] scale-110'
                  : 'border-2 border-white/30 text-white/70'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </div>

            {/* Circle (Right) - Concentric rings */}
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-100 ${
                isBtnActive(btnCircle)
                  ? 'bg-red-500/50 border-2 border-red-400 text-red-300 shadow-[0_0_20px_rgba(248,113,113,0.9)] scale-110'
                  : 'border-2 border-white/30 text-white/70'
              }`}
            >
              <div className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full border border-current" />
              </div>
            </div>

            {/* Cross (Bottom) */}
            <div
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-100 ${
                isBtnActive(btnCross)
                  ? 'bg-blue-500/50 border-2 border-blue-400 text-blue-300 shadow-[0_0_20px_rgba(96,165,250,0.9)] scale-110'
                  : 'border-2 border-white/30 text-white/70'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* Calibrate Controller Button */}
        <div className="flex justify-center pt-6">
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
