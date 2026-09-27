import { useState, useEffect, useRef, useCallback } from 'react';

const CALIBRATION_KEY = 'qt_controller_calibration';

function loadCalibration() {
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate that it doesn't have stale dummy offsets
      if (
        parsed?.centerOffset?.left?.x === -0.647 ||
        parsed?.centerOffset?.right?.x === -0.647
      ) {
        localStorage.removeItem(CALIBRATION_KEY);
      } else {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load calibration:', err);
  }
  return {
    centerOffset: {
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 }
    },
    deadzone: 0.05,
    rangeScale: {
      left: { x: 1, y: 1 },
      right: { x: 1, y: 1 }
    }
  };
}

export function detectGamepadDetails(id = '') {
  const lower = id.toLowerCase();

  // PS5 DualSense detection
  if (lower.includes('dualsense') || (lower.includes('054c') && lower.includes('0ce6')) || lower.includes('ps5')) {
    return {
      brand: 'playstation',
      modelType: 'ps5',
      name: 'PS5 Dualsense Controller',
      displayName: 'PS5 Dualsense Controller',
      fullId: id || 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'
    };
  }

  // PS4 DualShock detection
  if (lower.includes('dualshock') || (lower.includes('054c') && (lower.includes('05c4') || lower.includes('09cc'))) || lower.includes('ps4')) {
    return {
      brand: 'playstation',
      modelType: 'ps4',
      name: 'PS4 Dualshock Controller',
      displayName: 'PS4 Dualshock Controller',
      fullId: id || 'DualShock 4 Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 05c4)'
    };
  }

  // Xbox detection
  if (lower.includes('xbox') || lower.includes('045e') || lower.includes('xinput')) {
    return {
      brand: 'xbox',
      modelType: 'xbox',
      name: 'Xbox Controller',
      displayName: 'Xbox Controller',
      fullId: id || 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 02fd)'
    };
  }

  // Fallback for PlayStation or Generic
  if (lower.includes('playstation') || lower.includes('sony') || lower.includes('wireless controller')) {
    return {
      brand: 'playstation',
      modelType: 'ps5',
      name: 'PS5 Dualsense Controller',
      displayName: 'PS5 Dualsense Controller',
      fullId: id || 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'
    };
  }

  return {
    brand: 'playstation',
    modelType: 'generic',
    name: 'Game Controller',
    displayName: id ? id.split('(')[0].trim() : 'Game Controller',
    fullId: id || 'Standard Gamepad Controller'
  };
}

function snapshotGamepad(gamepad, calibration) {
  if (!gamepad) return null;

  const rawAxes = [...gamepad.axes];
  const cOffset = calibration?.centerOffset || { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };

  // Apply calibration offsets
  const leftX = (rawAxes[0] ?? 0) - (cOffset.left?.x ?? 0);
  const leftY = (rawAxes[1] ?? 0) - (cOffset.left?.y ?? 0);
  const rightX = (rawAxes[2] ?? 0) - (cOffset.right?.x ?? 0);
  const rightY = (rawAxes[3] ?? 0) - (cOffset.right?.y ?? 0);

  const clamp = (v) => Math.max(-1, Math.min(1, v));

  return {
    index: gamepad.index,
    id: gamepad.id,
    mapping: gamepad.mapping,
    connected: gamepad.connected,
    timestamp: gamepad.timestamp,
    buttons: gamepad.buttons.map((b) => ({
      pressed: b.pressed,
      value: b.value,
    })),
    axes: [
      clamp(leftX),
      clamp(leftY),
      clamp(rightX),
      clamp(rightY),
      ...rawAxes.slice(4)
    ],
    rawAxes,
    details: detectGamepadDetails(gamepad.id)
  };
}

function getConnectedGamepads() {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return [];
  return [...navigator.getGamepads()].filter(Boolean);
}

export function useGamepad() {
  const [gamepads, setGamepads] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [calibration, setCalibration] = useState(loadCalibration);

  const rafRef = useRef(null);
  const calibrationRef = useRef(calibration);
  calibrationRef.current = calibration;

  // Poll real gamepads on animation frame
  useEffect(() => {
    let prevFingerprint = '';

    const poll = () => {
      const connectedRaw = getConnectedGamepads();

      if (connectedRaw.length > 0) {
        // Fast fingerprint to avoid React re-render when nothing changed
        let fp = '';
        for (let i = 0; i < connectedRaw.length; i++) {
          const gp = connectedRaw[i];
          fp += `${gp.index}:${gp.buttons.map((b) => `${b.pressed ? 1 : 0}:${b.value.toFixed(2)}`).join(',')}:`;
          fp += `${gp.axes.map((a) => a.toFixed(3)).join(',')};`;
        }

        if (fp !== prevFingerprint) {
          prevFingerprint = fp;
          const snapshots = connectedRaw.map((gp) => snapshotGamepad(gp, calibrationRef.current));
          setGamepads(snapshots);
        }
      } else if (prevFingerprint !== 'empty') {
        prevFingerprint = 'empty';
        setGamepads([]);
      }

      rafRef.current = requestAnimationFrame(poll);
    };

    const onConnected = (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      prevFingerprint = '';
      const snapshots = getConnectedGamepads().map((gp) => snapshotGamepad(gp, calibrationRef.current));
      setGamepads(snapshots);
      setActiveIndex(e.gamepad.index);
    };

    const onDisconnected = (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
      prevFingerprint = '';
      const snapshots = getConnectedGamepads().map((gp) => snapshotGamepad(gp, calibrationRef.current));
      setGamepads(snapshots);
    };

    window.addEventListener('gamepadconnected', onConnected);
    window.addEventListener('gamepaddisconnected', onDisconnected);

    rafRef.current = requestAnimationFrame(poll);

    return () => {
      window.removeEventListener('gamepadconnected', onConnected);
      window.removeEventListener('gamepaddisconnected', onDisconnected);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const activeGamepad = gamepads.find((gp) => gp.index === activeIndex) ?? gamepads[0] ?? null;

  // Trigger vibration / haptic rumble on physical controller
  const triggerHaptic = useCallback((duration = 400, weakMagnitude = 1.0, strongMagnitude = 1.0) => {
    try {
      const connected = getConnectedGamepads();
      const currentGp = connected[activeIndex] || connected[0];
      if (currentGp?.vibrationActuator && typeof currentGp.vibrationActuator.playEffect === 'function') {
        currentGp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration,
          weakMagnitude,
          strongMagnitude
        });
        return true;
      }
    } catch (err) {
      console.warn('Vibration API error:', err);
    }
    return false;
  }, [activeIndex]);

  // Calibration functions
  const calibrateCenter = useCallback(() => {
    if (!activeGamepad) return;
    const raw = activeGamepad.rawAxes || activeGamepad.axes;
    const newCalibration = {
      ...calibration,
      centerOffset: {
        left: { x: raw[0] ?? 0, y: raw[1] ?? 0 },
        right: { x: raw[2] ?? 0, y: raw[3] ?? 0 }
      }
    };
    setCalibration(newCalibration);
  }, [activeGamepad, calibration]);

  const calibrateRange = useCallback(() => {
    const newCalibration = {
      ...calibration,
      rangeScale: {
        left: { x: 1.0, y: 1.0 },
        right: { x: 1.0, y: 1.0 }
      }
    };
    setCalibration(newCalibration);
  }, [calibration]);

  const saveCalibrationPermanently = useCallback(() => {
    try {
      localStorage.setItem(CALIBRATION_KEY, JSON.stringify(calibration));
      return true;
    } catch (err) {
      console.error('Failed to save calibration:', err);
      return false;
    }
  }, [calibration]);

  const resetCalibration = useCallback(() => {
    const defaultCal = {
      centerOffset: { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } },
      deadzone: 0.05,
      rangeScale: { left: { x: 1, y: 1 }, right: { x: 1, y: 1 } }
    };
    setCalibration(defaultCal);
    try {
      localStorage.removeItem(CALIBRATION_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    gamepads,
    activeGamepad,
    activeIndex,
    setActiveIndex,
    hasConnectedController: gamepads.length > 0,
    isSupported: typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function',
    triggerHaptic,
    calibration,
    calibrateCenter,
    calibrateRange,
    saveCalibrationPermanently,
    resetCalibration
  };
}
