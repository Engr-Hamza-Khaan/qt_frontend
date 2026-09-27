import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Vibrate, CheckCircle2 } from 'lucide-react';
import AnalogStickRadar from './AnalogStickRadar';
import ControllerVectorGraphic from './ControllerVectorGraphic';

export default function CalibrationView({
  gamepad,
  brand = 'playstation',
  onBack,
  onCalibrateCenter,
  onCalibrateRange,
  onTriggerHaptic,
  onSavePermanent,
  onSimulateAxis
}) {
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [isVibrating, setIsVibrating] = useState(false);
  const axes = gamepad?.axes ?? [0, 0, 0, 0];

  const deviceString = gamepad?.details?.fullId ||
    gamepad?.id ||
    (brand === 'xbox'
      ? 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 02fd)'
      : 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)');

  const showToast = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 2800);
  };

  const handleCenter = () => {
    onCalibrateCenter?.();
    showToast('Stick center zero offset calibrated successfully!');
  };

  const handleRange = () => {
    onCalibrateRange?.();
    showToast('Stick range & deadzone calibrated!');
  };

  const handleVibrate = () => {
    setIsVibrating(true);
    onTriggerHaptic?.(500, 1.0, 1.0);
    showToast('Testing dual-rumble haptic vibration...');
    setTimeout(() => setIsVibrating(false), 500);
  };

  const handleSave = () => {
    const success = onSavePermanent?.();
    if (success !== false) {
      showToast('Changes saved permanently to device configuration!');
    }
  };

  return (
    <div className="w-full">
      {/* Device Info Bar */}
      <div className="text-xs sm:text-sm text-gray-400 mb-6 font-mono break-all">
        <span className="text-gray-300 font-medium">Device: </span>
        <span className="text-gray-400">{deviceString}</span>
      </div>

      {/* Main Glass Panel */}
      <div className={`store-glass-panel p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${
        isVibrating ? 'ring-2 ring-purple-500 shadow-[0_0_35px_rgba(176,38,255,0.6)] animate-pulse' : ''
      }`}>
        {/* Toast Feedback Banner */}
        {feedbackMsg && (
          <div className="absolute top-4 right-4 sm:right-8 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-lg backdrop-blur-md animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column: LIVE INPUT and Interactive Controller Silhouette */}
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center mb-2">
              <span className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider">
                LIVE INPUT
              </span>
            </div>

            <ControllerVectorGraphic
              gamepad={gamepad}
              type={brand}
            />
          </div>

          {/* Right Column: Dual Analog Sticks and Calibration Controls */}
          <div className="flex flex-col items-center justify-center space-y-6 pt-4 lg:pt-0">
            {/* Dual Analog Sticks Radars Side-by-Side */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 w-full">
              <AnalogStickRadar
                label="Left Stick"
                x={axes[0] ?? 0}
                y={axes[1] ?? 0}
                size={115}
                onChange={(nx, ny) => {
                  onSimulateAxis?.(0, nx);
                  onSimulateAxis?.(1, ny);
                }}
              />

              <AnalogStickRadar
                label="Right Stick"
                x={axes[2] ?? 0}
                y={axes[3] ?? 0}
                size={115}
                onChange={(nx, ny) => {
                  onSimulateAxis?.(2, nx);
                  onSimulateAxis?.(3, ny);
                }}
              />
            </div>

            {/* Calibration Action Buttons Stack */}
            <div className="w-full max-w-sm flex flex-col gap-3">
              {/* Row 1: Calibrate Center & Calibrate Range */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCenter}
                  className="px-3 sm:px-4 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-gray-200 transition-all text-center"
                >
                  Calibrate Stick Center
                </button>
                <button
                  type="button"
                  onClick={handleRange}
                  className="px-3 sm:px-4 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-gray-200 transition-all text-center"
                >
                  Calibrate Stick Range
                </button>
              </div>

              {/* Row 2: Haptic Vibration */}
              <button
                type="button"
                onClick={handleVibrate}
                className="w-full py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Haptic Vibration</span>
              </button>

              {/* Row 3: Save Changes Permanently (Green Button) */}
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-3 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white text-xs sm:text-sm font-semibold transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes Permanently</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Controller Tester Button */}
      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Controller Tester</span>
        </button>
      </div>
    </div>
  );
}
