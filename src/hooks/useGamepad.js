import { useState, useEffect, useRef, useCallback } from 'react';
import {
  initExistingSonyHidDevice,
  requestSonyWebHid,
  disconnectSonyWebHid,
  subscribeWebHidTouches,
  subscribeWebHidStatus,
  isWebHidSupported,
  triggerSonyHaptic
} from './sonyWebHid';

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

function snapshotGamepad(gamepad, calibration, webHidTouchState) {
  if (!gamepad) return null;

  const rawAxes = [...gamepad.axes];
  const cOffset = calibration?.centerOffset || { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
  const rScale = calibration?.rangeScale || { left: { x: 1, y: 1 }, right: { x: 1, y: 1 } };

  // Apply calibration offsets and range scale
  const leftX = ((rawAxes[0] ?? 0) - (cOffset.left?.x ?? 0)) * (rScale.left?.x ?? 1);
  const leftY = ((rawAxes[1] ?? 0) - (cOffset.left?.y ?? 0)) * (rScale.left?.y ?? 1);
  const rightX = ((rawAxes[2] ?? 0) - (cOffset.right?.x ?? 0)) * (rScale.right?.x ?? 1);
  const rightY = ((rawAxes[3] ?? 0) - (cOffset.right?.y ?? 0)) * (rScale.right?.y ?? 1);

  const clamp = (v) => Math.max(-1, Math.min(1, v));

  // Extract Touches: Priority 1 from WebHID
  const touches = [];
  if (webHidTouchState?.touch0?.active) {
    touches.push({
      index: 0,
      active: true,
      id: webHidTouchState.touch0.id,
      x: webHidTouchState.touch0.x,
      y: webHidTouchState.touch0.y,
      normalizedX: webHidTouchState.touch0.normalizedX,
      normalizedY: webHidTouchState.touch0.normalizedY
    });
  }
  if (webHidTouchState?.touch1?.active) {
    touches.push({
      index: 1,
      active: true,
      id: webHidTouchState.touch1.id,
      x: webHidTouchState.touch1.x,
      y: webHidTouchState.touch1.y,
      normalizedX: webHidTouchState.touch1.normalizedX,
      normalizedY: webHidTouchState.touch1.normalizedY
    });
  }

  // Priority 2: Gamepad API native / experimental touchEvents or touches
  if (touches.length === 0) {
    if (Array.isArray(gamepad.touchEvents) && gamepad.touchEvents.length > 0) {
      for (let i = 0; i < gamepad.touchEvents.length; i++) {
        const t = gamepad.touchEvents[i];
        const rawX = Array.isArray(t.position) ? t.position[0] : (t.position?.x ?? 0);
        const rawY = Array.isArray(t.position) ? t.position[1] : (t.position?.y ?? 0);
        const normX = (rawX >= -1 && rawX <= 1) ? (rawX + 1) / 2 : (rawX / (t.surfaceDimensions?.[0] || 1920));
        const normY = (rawY >= -1 && rawY <= 1) ? (rawY + 1) / 2 : (rawY / (t.surfaceDimensions?.[1] || 1080));
        touches.push({
          index: i,
          active: true,
          id: t.touchId ?? i,
          x: Math.round(normX * 1920),
          y: Math.round(normY * 1080),
          normalizedX: Math.min(1, Math.max(0, normX)),
          normalizedY: Math.min(1, Math.max(0, normY))
        });
      }
    } else if (Array.isArray(gamepad.touches) && gamepad.touches.length > 0) {
      for (let i = 0; i < gamepad.touches.length; i++) {
        const t = gamepad.touches[i];
        const normX = t.normalizedX ?? (t.x !== undefined ? t.x / 1920 : 0.5);
        const normY = t.normalizedY ?? (t.y !== undefined ? t.y / 1080 : 0.5);
        touches.push({
          index: i,
          active: true,
          id: t.id ?? i,
          x: Math.round(normX * 1920),
          y: Math.round(normY * 1080),
          normalizedX: Math.min(1, Math.max(0, normX)),
          normalizedY: Math.min(1, Math.max(0, normY))
        });
      }
    }
  }

  // Clone buttons and inject WebHID touchpad click (Button 17) if clicked via WebHID
  const buttons = gamepad.buttons.map((b) => ({
    pressed: b.pressed,
    value: b.value,
  }));

  if (webHidTouchState?.click) {
    if (buttons[17]) {
      buttons[17] = { pressed: true, value: 1 };
    } else {
      while (buttons.length < 17) {
        buttons.push({ pressed: false, value: 0 });
      }
      buttons[17] = { pressed: true, value: 1 };
    }
  }

  return {
    index: gamepad.index,
    id: gamepad.id,
    mapping: gamepad.mapping,
    connected: gamepad.connected,
    timestamp: gamepad.timestamp,
    buttons,
    axes: [
      clamp(leftX),
      clamp(leftY),
      clamp(rightX),
      clamp(rightY),
      ...rawAxes.slice(4)
    ],
    rawAxes,
    touches,
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
  const [webHidStatus, setWebHidStatus] = useState('disconnected');

  const webHidTouchRef = useRef({
    touch0: { active: false, id: 0, x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 },
    touch1: { active: false, id: 0, x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 },
    click: false,
    hasTouches: false,
    fingerCount: 0
  });

  const rafRef = useRef(null);
  const calibrationRef = useRef(calibration);
  calibrationRef.current = calibration;

  // Auto-connect previously paired WebHID Sony controllers & listen to touch events
  useEffect(() => {
    initExistingSonyHidDevice();
    const unsubStatus = subscribeWebHidStatus((status) => {
      setWebHidStatus(status);
    });
    const unsubTouches = subscribeWebHidTouches((touchState) => {
      webHidTouchRef.current = touchState;
    });
    return () => {
      unsubStatus();
      unsubTouches();
    };
  }, []);

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

        // Add WebHID touches to fingerprint so touch updates render smoothly at 60-120fps
        const wht = webHidTouchRef.current;
        if (wht?.hasTouches || wht?.click) {
          fp += `hid:${wht.touch0.active ? `${wht.touch0.x},${wht.touch0.y}` : ''}|${wht.touch1.active ? `${wht.touch1.x},${wht.touch1.y}` : ''}|${wht.click ? 1 : 0};`;
        }

        if (fp !== prevFingerprint) {
          prevFingerprint = fp;
          const snapshots = connectedRaw.map((gp) => snapshotGamepad(gp, calibrationRef.current, webHidTouchRef.current));
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
      const snapshots = getConnectedGamepads().map((gp) => snapshotGamepad(gp, calibrationRef.current, webHidTouchRef.current));
      setGamepads(snapshots);
      setActiveIndex(e.gamepad.index);
    };

    const onDisconnected = (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
      prevFingerprint = '';
      const snapshots = getConnectedGamepads().map((gp) => snapshotGamepad(gp, calibrationRef.current, webHidTouchRef.current));
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
  const triggerHaptic = useCallback((duration = 500, weakMagnitude = 1.0, strongMagnitude = 1.0) => {
    let triggered = false;

    // 1. Hardware WebHID rumble (direct native support for PS5 DualSense and PS4 DualShock)
    try {
      triggerSonyHaptic(duration, weakMagnitude, strongMagnitude)
        .then((res) => {
          if (res) triggered = true;
        })
        .catch(() => {});
    } catch (e) {
      // ignore
    }

    // 2. Standard Gamepad API vibrationActuator (works for Xbox and supported browser controllers)
    try {
      const connected = getConnectedGamepads();
      const currentGp = connected[activeIndex] || connected[0];
      if (currentGp?.vibrationActuator && typeof currentGp.vibrationActuator.playEffect === 'function') {
        currentGp.vibrationActuator
          .playEffect('dual-rumble', {
            startDelay: 0,
            duration,
            weakMagnitude,
            strongMagnitude
          })
          .then(() => {
            triggered = true;
          })
          .catch((err) => {
            console.warn('vibrationActuator.playEffect error:', err);
          });
        triggered = true;
      } else if (currentGp?.hapticActuators && currentGp.hapticActuators.length > 0) {
        for (const act of currentGp.hapticActuators) {
          if (typeof act.pulse === 'function') {
            act.pulse(strongMagnitude, duration);
            triggered = true;
          }
        }
      }
    } catch (err) {
      console.warn('Vibration API error:', err);
    }
    return triggered;
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

  const calibrateRange = useCallback((customScale) => {
    const newCalibration = {
      ...calibration,
      rangeScale: customScale || {
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
    resetCalibration,
    webHidStatus,
    isWebHidSupported: isWebHidSupported(),
    connectWebHid: requestSonyWebHid,
    disconnectWebHid: disconnectSonyWebHid
  };
}
