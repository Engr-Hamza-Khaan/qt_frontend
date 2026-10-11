import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Vibrate, CheckCircle2, Compass } from 'lucide-react';
import AnalogStickRadar from './AnalogStickRadar';
import ControllerVectorGraphic from './ControllerVectorGraphic';
import StickCalibrationModal from './StickCalibrationModal';

export default function CalibrationView({
  gamepad,
  brand = 'playstation',
  onBack,
  onCalibrateCenter,
  onCalibrateRange,
  onTriggerHaptic,
  onSavePermanent
}) {
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [isVibrating, setIsVibrating] = useState(false);
  const [calibrationModal, setCalibrationModal] = useState({
    isOpen: false,
    mode: 'range' // 'range' | 'circularity'
  });
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
    setCalibrationModal({ isOpen: true, mode: 'range' });
  };

  const handleCircularity = () => {
    setCalibrationModal({ isOpen: true, mode: 'circularity' });
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

        {/* 
          HIGHLIGHTED BOX: Controller Silhouette Vector Graphic
          (COMMENTED OUT AS REQUESTED - DO NOT REMOVE)
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
        */}

        {/* Center-Aligned Content: Dual Analog Sticks and Calibration Controls */}
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center space-y-8 py-4">
          {/* Dual Analog Sticks Radars Side-by-Side */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 w-full">
            <AnalogStickRadar
              label="Left Stick"
              x={axes[0] ?? 0}
              y={axes[1] ?? 0}
              size={130}
            />

            <AnalogStickRadar
              label="Right Stick"
              x={axes[2] ?? 0}
              y={axes[3] ?? 0}
              size={130}
            />
          </div>

          {/* Calibration Action Buttons Stack */}
          <div className="w-full max-w-sm flex flex-col gap-3.5">
            {/* Row 1: Calibrate Center & Calibrate Range */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCenter}
                className="px-3 sm:px-4 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-gray-200 transition-all text-center active:scale-95"
              >
                Calibrate Stick Center
              </button>
              <button
                type="button"
                onClick={handleRange}
                className="px-3 sm:px-4 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-gray-200 transition-all text-center active:scale-95"
              >
                Calibrate Stick Range
              </button>
            </div>

            {/* Row 2: Check Circularity Button */}
            <button
              type="button"
              onClick={handleCircularity}
              className="w-full py-2.5 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 text-xs font-medium text-purple-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Check Stick Circularity</span>
            </button>

            {/* Row 3: Haptic Vibration */}
            <button
              type="button"
              onClick={handleVibrate}
              className={`w-full py-2.5 rounded-full border transition-all flex items-center justify-center gap-2 text-xs font-medium active:scale-95 ${
                isVibrating
                  ? 'border-purple-400 bg-purple-600/30 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.7)] scale-[0.98]'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-gray-200'
              }`}
            >
              <Vibrate className={`w-4 h-4 ${isVibrating ? 'animate-bounce text-purple-300' : ''}`} />
              <span>Haptic Vibration</span>
            </button>

            {/* Row 4: Save Changes Permanently (Green Button) */}
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white text-xs sm:text-sm font-semibold transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] flex items-center justify-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes Permanently</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stick Range Calibration & Circularity Modal (DualShock Tools Flow) */}
      <StickCalibrationModal
        isOpen={calibrationModal.isOpen}
        initialMode={calibrationModal.mode}
        gamepad={gamepad}
        onClose={() => setCalibrationModal((prev) => ({ ...prev, isOpen: false }))}
        onSaveRange={(calculatedScale) => {
          onCalibrateRange?.(calculatedScale);
          showToast('Stick range calibrated successfully!');
        }}
      />

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
