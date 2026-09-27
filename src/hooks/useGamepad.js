import { useState, useEffect, useRef, useCallback } from 'react';

const CALIBRATION_KEY = 'qt_controller_calibration';

function loadCalibration() {
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY);
    if (raw) return JSON.parse(raw);
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
      name: 'PS5 DualSense Controller',
      displayName: 'PS5 DualSense Controller',
      fullId: id || 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'
    };
  }
  
  // PS4 DualShock detection
  if (lower.includes('dualshock') || (lower.includes('054c') && (lower.includes('05c4') || lower.includes('09cc'))) || lower.includes('ps4')) {
    return {
      brand: 'playstation',
      modelType: 'ps4',
      name: 'PS4 DualShock Controller',
      displayName: 'PS4 DualShock Controller',
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
  
  // Generic or PlayStation-like fallback
  if (lower.includes('playstation') || lower.includes('sony')) {
    return {
      brand: 'playstation',
      modelType: 'ps5',
      name: 'PS5 DualSense Controller',
      displayName: 'PS5 DualSense Controller',
      fullId: id || 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'
    };
  }

  return {
    brand: 'playstation',
    modelType: 'generic',
    name: 'Game Controller',
    displayName: id ? id.split('(')[0].trim() : 'Game Controller',
    fullId: id || 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'
  };
}

function snapshotGamepad(gamepad, calibration) {
  if (!gamepad) return null;

  const rawAxes = [...gamepad.axes];
  // Apply calibration offsets
  const leftX = (rawAxes[0] ?? 0) - (calibration?.centerOffset?.left?.x ?? 0);
  const leftY = (rawAxes[1] ?? 0) - (calibration?.centerOffset?.left?.y ?? 0);
  const rightX = (rawAxes[2] ?? 0) - (calibration?.centerOffset?.right?.x ?? 0);
  const rightY = (rawAxes[3] ?? 0) - (calibration?.centerOffset?.right?.y ?? 0);

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
  return [...(navigator.getGamepads?.() ?? [])].filter(Boolean);
}

export function useGamepad() {
  const [gamepads, setGamepads] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [calibration, setCalibration] = useState(loadCalibration);
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulatedBrand, setSimulatedBrand] = useState('playstation'); // 'playstation' or 'xbox'
  const [simulatedState, setSimulatedState] = useState(() => ({
    buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
    axes: [-0.647, -0.176, -0.647, -0.176]
  }));

  const rafRef = useRef(null);
  const calibrationRef = useRef(calibration);
  calibrationRef.current = calibration;

  // Poll real gamepads
  useEffect(() => {
    const syncConnected = () => {
      const connected = getConnectedGamepads().map((gp) => snapshotGamepad(gp, calibrationRef.current));
      setGamepads(connected);
      setActiveIndex((prev) => {
        if (connected.length === 0) return 0;
        if (connected.some((gp) => gp.index === prev)) return prev;
        return connected[0].index;
      });
    };

    const poll = () => {
      const connected = getConnectedGamepads().map((gp) => snapshotGamepad(gp, calibrationRef.current));
      setGamepads(connected);
      rafRef.current = requestAnimationFrame(poll);
    };

    window.addEventListener('gamepadconnected', syncConnected);
    window.addEventListener('gamepaddisconnected', syncConnected);
    syncConnected();
    rafRef.current = requestAnimationFrame(poll);

    return () => {
      window.removeEventListener('gamepadconnected', syncConnected);
      window.removeEventListener('gamepaddisconnected', syncConnected);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const realActiveGamepad = gamepads.find((gp) => gp.index === activeIndex) ?? gamepads[0] ?? null;

  // When simulated or in preview mode, construct fallback gamepad snapshot
  const activeGamepad = realActiveGamepad || (isSimulated ? {
    index: 0,
    id: simulatedBrand === 'xbox' 
      ? 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 02fd)' 
      : 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)',
    mapping: 'standard',
    connected: true,
    buttons: simulatedState.buttons,
    axes: simulatedState.axes,
    rawAxes: simulatedState.axes,
    details: detectGamepadDetails(
      simulatedBrand === 'xbox' 
        ? 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 02fd)' 
        : 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'
    )
  } : null);

  // Trigger vibration / haptic rumble
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

  // Simulator controls
  const setSimulatedButton = useCallback((buttonIndex, pressed, value = pressed ? 1 : 0) => {
    setSimulatedState((prev) => {
      const nextButtons = [...prev.buttons];
      nextButtons[buttonIndex] = { pressed, value };
      return { ...prev, buttons: nextButtons };
    });
  }, []);

  const setSimulatedAxis = useCallback((axisIndex, val) => {
    setSimulatedState((prev) => {
      const nextAxes = [...prev.axes];
      nextAxes[axisIndex] = val;
      return { ...prev, axes: nextAxes };
    });
  }, []);

  return {
    gamepads,
    activeGamepad,
    activeIndex,
    setActiveIndex,
    hasConnectedController: gamepads.length > 0,
    isSupported: typeof navigator.getGamepads === 'function',
    triggerHaptic,
    calibration,
    calibrateCenter,
    calibrateRange,
    saveCalibrationPermanently,
    resetCalibration,
    isSimulated,
    setIsSimulated,
    simulatedBrand,
    setSimulatedBrand,
    setSimulatedButton,
    setSimulatedAxis,
    simulatedState
  };
}
