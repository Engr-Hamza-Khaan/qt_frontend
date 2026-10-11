import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, CheckCircle2, Info, Compass, Sparkles, ArrowRight } from 'lucide-react';

/**
 * StickCalibrationModal
 * Faithful reproduction of dualshock-tools.github.io calibration flow:
 * 1. Range Calibration: Live sampling data, dual stick canvases, progress tracking,
 *    rotation coverage, 15-second unlock timer.
 * 2. Circularity Check: Full 360° circularity error analysis, real-time radial error polygon,
 *    7-9% Sony factory spec benchmark, max error, and live visualizer.
 */
export default function StickCalibrationModal({
  isOpen,
  initialMode = 'range', // 'range' | 'circularity'
  gamepad,
  onClose,
  onSaveRange
}) {
  const [activeTab, setActiveTab] = useState(initialMode); // 'range' | 'circularity'

  // Sync tab with initialMode when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
    }
  }, [isOpen, initialMode]);

  // Current stick inputs
  const axes = gamepad?.axes ?? [0, 0, 0, 0];
  const lx = axes[0] ?? 0;
  const ly = axes[1] ?? 0;
  const rx = axes[2] ?? 0;
  const ry = axes[3] ?? 0;

  // -------------------------------------------------------------
  // RANGE CALIBRATION STATE (matching dualshock-tools.github.io)
  // -------------------------------------------------------------
  const [rangeProgress, setRangeProgress] = useState(0);
  const [canFinishRange, setCanFinishRange] = useState(false);
  const [rangeFinished, setRangeFinished] = useState(false);
  const rangeCanvasLRef = useRef(null);
  const rangeCanvasRRef = useRef(null);

  // Sampling data for range: min and max visited values
  const sampledRangeRef = useRef({
    left: { minX: 0, maxX: 0, minY: 0, maxY: 0, sectors: new Set(), path: [] },
    right: { minX: 0, maxX: 0, minY: 0, maxY: 0, sectors: new Set(), path: [] },
    startTime: Date.now()
  });

  // Reset range state when starting range mode
  useEffect(() => {
    if (isOpen && activeTab === 'range') {
      sampledRangeRef.current = {
        left: { minX: 0, maxX: 0, minY: 0, maxY: 0, sectors: new Set(), path: [] },
        right: { minX: 0, maxX: 0, minY: 0, maxY: 0, sectors: new Set(), path: [] },
        startTime: Date.now()
      };
      setRangeProgress(0);
      setCanFinishRange(false);
      setRangeFinished(false);
    }
  }, [isOpen, activeTab]);

  // Ref to hold freshest axes to prevent RAF restarts on every prop change
  const axesRef = useRef({ lx, ly, rx, ry });
  axesRef.current = { lx, ly, rx, ry };

  // Real-time animation loop for Range Calibration
  useEffect(() => {
    if (!isOpen || activeTab !== 'range') return;

    let animId;
    const updateRangeLoop = () => {
      const { lx: curLx, ly: curLy, rx: curRx, ry: curRy } = axesRef.current;
      const data = sampledRangeRef.current;
      const elapsedSec = (Date.now() - data.startTime) / 1000;

      // Sample Left Stick
      const rL = Math.sqrt(curLx * curLx + curLy * curLy);
      if (rL > 0.4) {
        data.left.minX = Math.min(data.left.minX, curLx);
        data.left.maxX = Math.max(data.left.maxX, curLx);
        data.left.minY = Math.min(data.left.minY, curLy);
        data.left.maxY = Math.max(data.left.maxY, curLy);

        // Angle in degrees [0..359] mapped to 36 sectors (10° each)
        const angleL = Math.round((Math.atan2(curLy, curLx) * 180) / Math.PI + 360) % 360;
        const sectorL = Math.floor(angleL / 10);
        data.left.sectors.add(sectorL);

        // Keep last 80 path points for smooth visualizer trail
        data.left.path.push({ x: curLx, y: curLy });
        if (data.left.path.length > 90) data.left.path.shift();
      }

      // Sample Right Stick
      const rR = Math.sqrt(curRx * curRx + curRy * curRy);
      if (rR > 0.4) {
        data.right.minX = Math.min(data.right.minX, curRx);
        data.right.maxX = Math.max(data.right.maxX, curRx);
        data.right.minY = Math.min(data.right.minY, curRy);
        data.right.maxY = Math.max(data.right.maxY, curRy);

        const angleR = Math.round((Math.atan2(curRy, curRx) * 180) / Math.PI + 360) % 360;
        const sectorR = Math.floor(angleR / 10);
        data.right.sectors.add(sectorR);

        data.right.path.push({ x: curRx, y: curRy });
        if (data.right.path.length > 90) data.right.path.shift();
      }

      // Progress computation: combined sector coverage (up to 72 sectors total)
      const totalSectors = data.left.sectors.size + data.right.sectors.size;
      const sectorPercent = Math.min(100, Math.round((totalSectors / 60) * 100));

      // DualShock-tools spec: Done button unlocks after at most 15 seconds or when sectors >= 90%
      const timePercent = Math.min(100, Math.round((elapsedSec / 15) * 100));
      const currentProgress = Math.max(sectorPercent, Math.min(100, timePercent));
      setRangeProgress(currentProgress);

      if (currentProgress >= 100 || elapsedSec >= 15 || totalSectors >= 54) {
        setCanFinishRange(true);
      }

      // Draw Canvases
      drawRangeCanvas(rangeCanvasLRef.current, curLx, curLy, data.left.path, data.left.sectors, '#38bdf8');
      drawRangeCanvas(rangeCanvasRRef.current, curRx, curRy, data.right.path, data.right.sectors, '#a855f7');

      animId = requestAnimationFrame(updateRangeLoop);
    };

    animId = requestAnimationFrame(updateRangeLoop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, activeTab]);

  const drawRangeCanvas = (canvas, curX, curY, path, sectors, themeColor) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w * 0.42;

    ctx.clearRect(0, 0, w, h);

    // Dark background circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0a1024';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Draw visited sectors slice arcs
    sectors.forEach((sec) => {
      const startAngle = (sec * 10 * Math.PI) / 180;
      const endAngle = ((sec + 1) * 10 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = `${themeColor}22`;
      ctx.fill();
    });

    // Draw sampling trail
    if (path.length > 1) {
      ctx.beginPath();
      ctx.moveTo(cx + path[0].x * radius, cy + path[0].y * radius);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(cx + path[i].x * radius, cy + path[i].y * radius);
      }
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Draw current stick position dot
    const px = cx + curX * radius;
    const py = cy + curY * radius;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = themeColor;
    ctx.stroke();
  };

  const handleFinishRange = () => {
    const data = sampledRangeRef.current;

    // Calculate scale factor from visited spans
    const spanLX = Math.max(0.5, (data.left.maxX - data.left.minX) / 2);
    const spanLY = Math.max(0.5, (data.left.maxY - data.left.minY) / 2);
    const spanRX = Math.max(0.5, (data.right.maxX - data.right.minX) / 2);
    const spanRY = Math.max(0.5, (data.right.maxY - data.right.minY) / 2);

    const clampScale = (v) => Math.max(0.85, Math.min(1.25, Number((1.0 / v).toFixed(3))));

    const calculatedScale = {
      left: { x: clampScale(spanLX), y: clampScale(spanLY) },
      right: { x: clampScale(spanRX), y: clampScale(spanRY) }
    };

    onSaveRange?.(calculatedScale);
    setRangeFinished(true);
  };

  // -------------------------------------------------------------
  // CIRCULARITY TEST STATE
  // -------------------------------------------------------------
  const [selectedCircStick, setSelectedCircStick] = useState('left'); // 'left' | 'right'
  const selectedCircStickRef = useRef(selectedCircStick);
  selectedCircStickRef.current = selectedCircStick;
  const circCanvasRef = useRef(null);

  // 100 angular bins storing outer sampled radius [0..360°]
  const circDataRef = useRef({
    left: new Float32Array(100),
    right: new Float32Array(100)
  });

  const [circStats, setCircStats] = useState({
    avgError: 0,
    maxError: 0,
    samplesCount: 0
  });

  const handleResetCircularity = () => {
    circDataRef.current.left.fill(0);
    circDataRef.current.right.fill(0);
    setCircStats({ avgError: 0, maxError: 0, samplesCount: 0 });
  };

  // Circularity Sampling & Rendering Loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'circularity') return;

    let animId;
    const updateCircLoop = () => {
      const stick = selectedCircStickRef.current;
      const { lx: curLx, ly: curLy, rx: curRx, ry: curRy } = axesRef.current;
      const curX = stick === 'left' ? curLx : curRx;
      const curY = stick === 'left' ? curLy : curRy;
      const r = Math.sqrt(curX * curX + curY * curY);

      const bins = circDataRef.current[stick];

      // Sample outer boundary points when stick is pushed towards perimeter
      if (r > 0.45) {
        const angle = (Math.atan2(curY, curX) * 180) / Math.PI + 180; // [0..360]
        const binIdx = Math.min(99, Math.floor((angle / 360) * 100));
        bins[binIdx] = Math.max(bins[binIdx], r);
      }

      // Compute statistics over populated bins
      let sumError = 0;
      let maxErr = 0;
      let count = 0;
      for (let i = 0; i < 100; i++) {
        if (bins[i] > 0.4) {
          const err = Math.abs(bins[i] - 1.0) * 100;
          sumError += err;
          maxErr = Math.max(maxErr, err);
          count++;
        }
      }

      if (count > 0) {
        setCircStats({
          avgError: Number((sumError / count).toFixed(1)),
          maxError: Number(maxErr.toFixed(1)),
          samplesCount: count
        });
      }

      // Draw Circularity Canvas
      drawCircularityCanvas(circCanvasRef.current, curX, curY, bins);

      animId = requestAnimationFrame(updateCircLoop);
    };

    animId = requestAnimationFrame(updateCircLoop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, activeTab]);

  const drawCircularityCanvas = (canvas, curX, curY, bins) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const refRadius = w * 0.38;

    ctx.clearRect(0, 0, w, h);

    // Outer backdrop
    ctx.beginPath();
    ctx.arc(cx, cy, refRadius * 1.25, 0, Math.PI * 2);
    ctx.fillStyle = '#060a18';
    ctx.fill();

    // Reference boundary circle (1.0 = 100% threshold)
    ctx.beginPath();
    ctx.arc(cx, cy, refRadius, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();
    ctx.setLineDash([]);

    // 0.5 inner reference circle
    ctx.beginPath();
    ctx.arc(cx, cy, refRadius * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Coordinate crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - refRadius * 1.2);
    ctx.lineTo(cx, cy + refRadius * 1.2);
    ctx.moveTo(cx - refRadius * 1.2, cy);
    ctx.lineTo(cx + refRadius * 1.2, cy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Collect all sampled perimeter points
    const sampledPoints = [];
    for (let i = 0; i < 100; i++) {
      if (bins[i] > 0.35) {
        const angleRad = ((i * 3.6 - 180) * Math.PI) / 180;
        sampledPoints.push({
          x: cx + Math.cos(angleRad) * (bins[i] * refRadius),
          y: cy + Math.sin(angleRad) * (bins[i] * refRadius),
          val: bins[i],
          binIdx: i
        });
      }
    }

    if (sampledPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(sampledPoints[0].x, sampledPoints[0].y);
      for (let i = 1; i < sampledPoints.length; i++) {
        const diff = sampledPoints[i].binIdx - sampledPoints[i - 1].binIdx;
        if (diff <= 4) {
          ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
        } else {
          ctx.moveTo(sampledPoints[i].x, sampledPoints[i].y);
        }
      }

      if (sampledPoints.length >= 75) {
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fill();
      }

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // Draw small indicator dots along visited boundary
      for (const p of sampledPoints) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        const err = Math.abs(p.val - 1.0) * 100;
        ctx.fillStyle = err <= 9 ? '#34d399' : err <= 14 ? '#38bdf8' : '#f87171';
        ctx.fill();
      }
    }

    // Draw current live stick pointer
    const curPx = cx + curX * refRadius;
    const curPy = cy + curY * refRadius;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(curPx, curPy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(curPx, curPy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-[#090f23] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header & Navigation Tabs */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('range')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'range'
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Range Calibration
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('circularity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'circularity'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Circularity Check</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[80vh]">
          {activeTab === 'range' ? (
            /* ============================================================ */
            /* TAB 1: RANGE CALIBRATION (matching dualshock-tools.github.io) */
            /* ============================================================ */
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm sm:text-base font-extrabold text-cyan-300 tracking-wide animate-pulse">
                  The controller is now sampling data!
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Rotate the sticks slowly at least 2 times in one direction and 2 times in the other direction to cover the whole range.
                </p>
              </div>

              {/* Dual Stick Live Canvases with Real-time Numbers */}
              <div className="flex items-center justify-center gap-2 sm:gap-6 py-2 bg-black/40 rounded-xl border border-white/5">
                {/* Left Stick Readouts & Canvas */}
                <div className="flex items-center gap-2">
                  <div className="font-mono text-[11px] text-gray-400 min-w-[55px] text-left">
                    <div>LX: <span className="text-cyan-300 font-bold">{lx.toFixed(2)}</span></div>
                    <div>LY: <span className="text-cyan-300 font-bold">{ly.toFixed(2)}</span></div>
                  </div>
                  <canvas ref={rangeCanvasLRef} width={135} height={135} className="rounded-full shadow-inner" />
                </div>

                <div className="h-16 w-[1px] bg-white/10" />

                {/* Right Stick Readouts & Canvas */}
                <div className="flex items-center gap-2">
                  <canvas ref={rangeCanvasRRef} width={135} height={135} className="rounded-full shadow-inner" />
                  <div className="font-mono text-[11px] text-gray-400 min-w-[55px] text-left">
                    <div>RX: <span className="text-purple-300 font-bold">{rx.toFixed(2)}</span></div>
                    <div>RY: <span className="text-purple-300 font-bold">{ry.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Status */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-1.5">
                  <span>Range Calibration Progress</span>
                  <span className="font-mono text-cyan-300">{rangeProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    style={{ width: `${rangeProgress}%` }}
                  />
                </div>
              </div>

              {/* Instruction Alert matching dualshock-tools verbatim */}
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3.5 text-xs text-blue-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-300">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Keep rotating the sticks even if you see no progress!</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  The <b>Done</b> button will unlock after at most 15 seconds. If you press <b>Done</b> without rotating the sticks, the calibration will be incomplete and you will need to repeat it.
                </p>
              </div>

              {/* Finished Success Card */}
              {rangeFinished && (
                <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Stick range calibrated successfully!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('circularity')}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                  >
                    <span>Check Circularity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================ */
            /* TAB 2: CIRCULARITY CHECK (matching dualshock-tools.github.io) */
            /* ============================================================ */
            <div className="space-y-4">
              {/* Stick Selector Pills */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedCircStick('left')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedCircStick === 'left'
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Left Stick
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCircStick('right')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedCircStick === 'right'
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Right Stick
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetCircularity}
                  className="px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Test</span>
                </button>
              </div>

              {/* Sony Benchmark Info Alert matching dualshock-tools */}
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-xs text-purple-200/90 leading-relaxed">
                <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Average circularity error: Aim for 7–9%</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Sony PlayStation controllers come from the factory calibrated to have an average circularity error of nearly 10%, which is what games expect. Too perfect circularity (&lt;3%) can make movements feel stiff in games.
                </p>
              </div>

              {/* Radial Canvas Display */}
              <div className="flex flex-col items-center justify-center p-3 bg-black/40 rounded-xl border border-white/5">
                <canvas ref={circCanvasRef} width={240} height={240} className="rounded-full shadow-2xl" />
                <span className="text-[10px] text-gray-500 mt-2 font-mono">
                  Rotate {selectedCircStick} stick in full 360° circles to trace radial error
                </span>
              </div>

              {/* Live Error Telemetry Scorecard */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Avg Error</div>
                  <div className={`text-base font-black font-mono mt-0.5 ${
                    circStats.avgError >= 6 && circStats.avgError <= 10
                      ? 'text-emerald-400'
                      : circStats.avgError > 12
                      ? 'text-amber-400'
                      : 'text-cyan-300'
                  }`}>
                    {circStats.avgError}%
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Target: 7-9%</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Max Error</div>
                  <div className="text-base font-black font-mono text-purple-300 mt-0.5">
                    {circStats.maxError}%
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Peak deviation</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Coverage</div>
                  <div className="text-base font-black font-mono text-gray-200 mt-0.5">
                    {circStats.samplesCount}%
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Circle sectors</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-black/30 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'range' ? (
            <button
              type="button"
              disabled={!canFinishRange}
              onClick={handleFinishRange}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                canFinishRange
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <span>Done</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all cursor-pointer"
            >
              Done Testing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
