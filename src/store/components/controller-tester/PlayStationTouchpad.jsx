import React, { useState, useRef, useCallback } from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';

/**
 * PlayStationTouchpad
 * Responsive 1-finger and 2-finger multi-touch touchpad for Sony PlayStation controllers
 * (DualSense PS5 & DualShock 4 PS4).
 *
 * Supports direct dragging on the touchpad: wherever touched/dragged on screen or physical controller,
 * it visualizes the exact coordinates with zero clutter.
 */
export default function PlayStationTouchpad({
  gamepad,
  webHidStatus = 'disconnected',
  onConnectWebHid,
  isBtnActive
}) {
  const padRef = useRef(null);

  // Screen-based interactive touch points
  const [screenTouches, setScreenTouches] = useState([]);
  const isPointerDownRef = useRef(false);

  // Physical controller touchpad click (Button 17)
  const btnTouchpad = gamepad?.buttons?.[17] ?? { pressed: false, value: 0 };
  const isPhysicallyPressed = isBtnActive ? isBtnActive(btnTouchpad) : (btnTouchpad.pressed || btnTouchpad.value > 0.1);

  // Hardware touches from gamepad (from WebHID or browser Gamepad API)
  const hardwareTouches = (gamepad?.touches ?? []).filter((t) => t.active);
  const hasHardwareTouches = hardwareTouches.length > 0;

  // Active touches: hardware touches take priority if active, else screen touches
  const activeTouches = hasHardwareTouches ? hardwareTouches : screenTouches;

  const fingerCount = activeTouches.length;
  const isDualTouch = fingerCount >= 2;
  const isSingleTouch = fingerCount === 1;

  // Convert client coordinate (clientX, clientY) to exact pad relative coordinates
  const getPadRelativeCoords = useCallback((clientX, clientY) => {
    if (!padRef.current) return { normalizedX: 0.5, normalizedY: 0.5, x: 960, y: 540 };
    const rect = padRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const clampedY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const normX = clampedX / rect.width;
    const normY = clampedY / rect.height;
    return {
      normalizedX: normX,
      normalizedY: normY,
      x: Math.round(normX * 1920),
      y: Math.round(normY * 1080)
    };
  }, []);

  // Multi-Touch Handlers for Touchscreens (Mobile / Tablet / Touch Laptops)
  const handleTouchStart = (e) => {
    e.preventDefault();
    updateTouchList(e.targetTouches);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    updateTouchList(e.targetTouches);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    updateTouchList(e.targetTouches);
  };

  const updateTouchList = (targetTouches) => {
    const touches = [];
    for (let i = 0; i < Math.min(2, targetTouches.length); i++) {
      const t = targetTouches[i];
      const coords = getPadRelativeCoords(t.clientX, t.clientY);
      touches.push({
        index: i,
        id: t.identifier ?? i,
        active: true,
        ...coords
      });
    }
    setScreenTouches(touches);
  };

  // Direct Mouse / Pointer Dragging Handlers
  const handlePointerDown = (e) => {
    if (e.pointerType === 'touch') return; // Handled by native touch
    isPointerDownRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
    const coords = getPadRelativeCoords(e.clientX, e.clientY);
    setScreenTouches([
      {
        index: 0,
        id: 0,
        active: true,
        ...coords
      }
    ]);
  };

  const handlePointerMove = (e) => {
    if (!isPointerDownRef.current || e.pointerType === 'touch') return;
    const coords = getPadRelativeCoords(e.clientX, e.clientY);
    setScreenTouches([
      {
        index: 0,
        id: 0,
        active: true,
        ...coords
      }
    ]);
  };

  const handlePointerUp = (e) => {
    if (e.pointerType === 'touch') return;
    isPointerDownRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {
      // ignore
    }
    setScreenTouches([]);
  };

  // Distance between 2 fingers in percentage
  let touchDistance = null;
  if (isDualTouch && activeTouches[0] && activeTouches[1]) {
    const dx = (activeTouches[1].normalizedX - activeTouches[0].normalizedX) * 100;
    const dy = (activeTouches[1].normalizedY - activeTouches[0].normalizedY) * 100;
    touchDistance = Math.round(Math.sqrt(dx * dx + dy * dy));
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      {/* Top Touchpad Header & Status Bar */}
      <div className="w-full flex items-center justify-between text-[11px] font-semibold text-gray-300 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider text-gray-400 font-bold text-xs">Touchpad</span>
          {isPhysicallyPressed && (
            <span className="bg-blue-500/25 text-blue-300 border border-blue-400/50 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
              CLICK
            </span>
          )}
        </div>

        {/* Dynamic Status / Hardware Connection */}
        <div className="flex items-center gap-2">
          {isDualTouch ? (
            <span className="bg-purple-500/20 text-purple-300 border border-purple-400/50 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              2 FINGERS
            </span>
          ) : isSingleTouch ? (
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              1 FINGER
            </span>
          ) : null}

          {webHidStatus === 'connected' ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3" />
              <span>Hardware Active</span>
            </div>
          ) : onConnectWebHid ? (
            <button
              type="button"
              onClick={onConnectWebHid}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-300 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-400/40 px-2 py-0.5 rounded-md transition-all shadow-[0_0_8px_rgba(59,130,246,0.3)]"
              title="Connect your physical DualSense or DualShock 4 via WebHID"
            >
              <Smartphone className="w-3 h-3" />
              <span>Enable Touchpad</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Touchpad Box Surface (Direct Dragging Surface) */}
      <div
        ref={padRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`w-64 sm:w-72 h-28 sm:h-32 rounded-2xl relative cursor-crosshair select-none overflow-hidden transition-all duration-150 border touch-none ${
          isPhysicallyPressed
            ? 'bg-blue-900/40 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.65)] scale-[0.98]'
            : isDualTouch
            ? 'bg-gradient-to-b from-[#111936] to-[#070b18] border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.35)]'
            : isSingleTouch
            ? 'bg-gradient-to-b from-[#111936] to-[#070b18] border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.35)]'
            : 'bg-[#080d1d]/90 border-white/15 hover:border-white/30 shadow-inner'
        }`}
        title="PlayStation Touchpad (Drag anywhere or touch on controller)"
      >
        {/* DualSense Signature Top Lightbar Rim */}
        <div
          className={`absolute top-0 inset-x-0 h-[3px] transition-all duration-200 ${
            isPhysicallyPressed
              ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,1)]'
              : isDualTouch
              ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 shadow-[0_0_10px_rgba(192,132,252,0.8)]'
              : isSingleTouch
              ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
              : 'bg-white/20'
          }`}
        />

        {/* Micro-Dot Touch Matrix Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        />

        {/* Idle Center Indicator when no finger is on the pad */}
        {fingerCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-150 ${
                isPhysicallyPressed
                  ? 'bg-white shadow-[0_0_14px_rgba(255,255,255,1)] scale-125'
                  : 'bg-white/40 shadow-[0_0_6px_rgba(255,255,255,0.2)]'
              }`}
            />
            <span className="text-[10px] tracking-wider text-gray-500 font-medium mt-1 select-none">
              TOUCHPAD
            </span>
          </div>
        )}

        {/* Connecting Laser Line Between Finger 1 and Finger 2 */}
        {isDualTouch && activeTouches[0] && activeTouches[1] && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <linearGradient id="touchBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <line
              x1={`${activeTouches[0].normalizedX * 100}%`}
              y1={`${activeTouches[0].normalizedY * 100}%`}
              x2={`${activeTouches[1].normalizedX * 100}%`}
              y2={`${activeTouches[1].normalizedY * 100}%`}
              stroke="url(#touchBeam)"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              className="drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]"
            />
          </svg>
        )}

        {/* Active Finger Touch Markers (Track exact dragged location) */}
        {activeTouches.map((touch, i) => {
          const isFinger1 = i === 0;
          const leftPercent = touch.normalizedX * 100;
          const topPercent = touch.normalizedY * 100;

          return (
            <div
              key={touch.id ?? i}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 transition-all duration-75"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`
              }}
            >
              {/* Outer Pulsing Wave Ring */}
              <div
                className={`w-9 h-9 -top-1 -left-1 absolute rounded-full animate-ping opacity-60 ${
                  isFinger1 ? 'bg-cyan-400' : 'bg-pink-500'
                }`}
              />

              {/* Glowing Touch Ring */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform duration-75 ${
                  isFinger1
                    ? 'bg-cyan-500/90 border-white text-black shadow-[0_0_18px_rgba(6,182,212,1)]'
                    : 'bg-pink-500/90 border-white text-white shadow-[0_0_18px_rgba(236,72,153,1)]'
                }`}
              >
                <span className="text-[11px] font-black leading-none">{i + 1}</span>
              </div>

              {/* Floating Coordinate Pill */}
              <div
                className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight shadow-md border ${
                  isFinger1
                    ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400/50'
                    : 'bg-pink-950/90 text-pink-200 border-pink-400/50'
                }`}
              >
                F{i + 1}: {Math.round(leftPercent)}%, {Math.round(topPercent)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Coordinate & Telemetry Readout */}
      <div className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs">
        {fingerCount === 0 ? (
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px]">Touch or drag anywhere on pad</span>
            <span className="text-[10px] text-gray-500">0 Fingers</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeTouches.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span
                  className={`font-bold text-[11px] flex items-center gap-1.5 ${
                    idx === 0 ? 'text-cyan-300' : 'text-pink-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-cyan-400' : 'bg-pink-400'}`} />
                  Finger {idx + 1}:
                </span>
                <span className="font-mono text-gray-200 text-[11px]">
                  X: {t.x ?? Math.round(t.normalizedX * 1920)} | Y: {t.y ?? Math.round(t.normalizedY * 1080)}
                </span>
              </div>
            ))}
            {touchDistance !== null && (
              <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-purple-300">
                <span>Multi-touch Spread:</span>
                <span className="font-mono">{touchDistance}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
