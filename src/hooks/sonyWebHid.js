/**
 * sonyWebHid.js
 * WebHID driver for Sony PlayStation DualSense (PS5) and DualShock 4 (PS4) controllers.
 * Reads high-frequency multi-touch touchpad data (1 finger & 2 fingers), click status,
 * and handles both USB and Bluetooth HID reports.
 */

export const SONY_HID_FILTERS = [
  { vendorId: 0x054c, productId: 0x0ce6 }, // PS5 DualSense
  { vendorId: 0x054c, productId: 0x0df2 }, // PS5 DualSense Edge
  { vendorId: 0x054c, productId: 0x05c4 }, // PS4 DualShock 4 v1
  { vendorId: 0x054c, productId: 0x09cc }, // PS4 DualShock 4 v2
  { vendorId: 0x054c, productId: 0x0ba0 }, // PS4 USB Wireless Adapter
  { vendorId: 0x054c }                     // Generic Sony Gamepad
];

let activeDevice = null;
let touchListeners = new Set();
let statusListeners = new Set();
let lastTouchState = {
  touch0: { active: false, id: 0, x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 },
  touch1: { active: false, id: 0, x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 },
  click: false,
  hasTouches: false,
  fingerCount: 0,
  deviceType: 'unknown'
};

function notifyStatus(status, device = null) {
  statusListeners.forEach((fn) => {
    try {
      fn(status, device);
    } catch (e) {
      console.warn('Error in WebHID status listener:', e);
    }
  });
}

function notifyTouches(state) {
  lastTouchState = state;
  touchListeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.warn('Error in WebHID touch listener:', e);
    }
  });
}

function parseTouchBytes(data, offset, isPS4 = false) {
  if (offset + 3 >= data.byteLength) {
    return { active: false, id: 0, x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 };
  }
  const b0 = data.getUint8(offset);
  const b1 = data.getUint8(offset + 1);
  const b2 = data.getUint8(offset + 2);
  const b3 = data.getUint8(offset + 3);

  // Bit 7 of byte 0: 0 = finger is active on pad, 1 (0x80) = finger is lifted / inactive
  const active = (b0 & 0x80) === 0;
  const id = b0 & 0x7f;

  if (!active) {
    return {
      active: false,
      id,
      x: 0,
      y: 0,
      normalizedX: 0.5,
      normalizedY: 0.5
    };
  }

  const x = ((b2 & 0x0f) << 8) | b1;
  const y = (b3 << 4) | ((b2 & 0xf0) >> 4);

  const maxX = 1920;
  const maxY = isPS4 ? 942 : 1080;

  return {
    active: true,
    id,
    x: Math.min(maxX, Math.max(0, x)),
    y: Math.min(maxY, Math.max(0, y)),
    normalizedX: Math.min(1, Math.max(0, x / maxX)),
    normalizedY: Math.min(1, Math.max(0, y / maxY))
  };
}

function handleInputReport(event) {
  const { reportId, data } = event;
  const byteLength = data.byteLength;
  const productId = activeDevice?.productId || 0;
  const isPS4 = productId === 0x05c4 || productId === 0x09cc || productId === 0x0ba0;

  let touch0Offset = -1;
  let touch1Offset = -1;
  let clickPressed = false;

  if (isPS4) {
    // DualShock 4
    if (reportId === 0x01 && byteLength >= 42) {
      // DS4 USB Report 0x01: common is 32 bytes, byte 32=num_touch, byte 33=timestamp, byte 34=points[0]
      touch0Offset = 34;
      touch1Offset = 38;
      const b6 = data.getUint8(6);
      clickPressed = Boolean(b6 & 0x02);
    } else if (reportId === 0x11 && byteLength >= 44) {
      // DS4 Bluetooth Report 0x11
      touch0Offset = 36;
      touch1Offset = 40;
      const b8 = data.getUint8(8);
      clickPressed = Boolean(b8 & 0x02);
    }
  } else {
    // DualSense (PS5)
    if (reportId === 0x01 && byteLength >= 40) {
      // DualSense USB Report 0x01
      touch0Offset = 32;
      touch1Offset = 36;
      const buttons2 = data.getUint8(9);
      clickPressed = Boolean(buttons2 & 0x02);
    } else if (reportId === 0x31 && byteLength >= 41) {
      // DualSense Bluetooth Report 0x31
      touch0Offset = 33;
      touch1Offset = 37;
      const buttons2 = data.getUint8(10);
      clickPressed = Boolean(buttons2 & 0x02);
    }
  }

  // Fallback heuristic if reportId is different or device sends alternate offset
  if (touch0Offset === -1 && byteLength >= 40) {
    touch0Offset = isPS4 ? 34 : 32;
    touch1Offset = isPS4 ? 38 : 36;
  }

  if (touch0Offset !== -1) {
    const t0 = parseTouchBytes(data, touch0Offset, isPS4);
    const t1 = parseTouchBytes(data, touch1Offset, isPS4);

    const hasTouches = t0.active || t1.active;
    const fingerCount = (t0.active ? 1 : 0) + (t1.active ? 1 : 0);

    notifyTouches({
      touch0: t0,
      touch1: t1,
      click: clickPressed,
      hasTouches,
      fingerCount,
      deviceType: isPS4 ? 'ps4' : 'ps5'
    });
  }
}

export function isWebHidSupported() {
  return typeof navigator !== 'undefined' && 'hid' in navigator;
}

export async function initExistingSonyHidDevice() {
  if (!isWebHidSupported()) return null;
  try {
    const devices = await navigator.hid.getDevices();
    const sonyDevice = devices.find((d) => d.vendorId === 0x054c);
    if (sonyDevice && !activeDevice) {
      if (!sonyDevice.opened) {
        await sonyDevice.open();
      }
      activeDevice = sonyDevice;
      sonyDevice.oninputreport = handleInputReport;

      // In case Bluetooth DualSense needs full mode trigger
      try {
        if (typeof sonyDevice.receiveFeatureReport === 'function') {
          await sonyDevice.receiveFeatureReport(0x05);
        }
      } catch (e) {
        // Bluetooth feature report trigger is optional
      }

      notifyStatus('connected', sonyDevice);
      return sonyDevice;
    }
  } catch (err) {
    console.warn('Failed to auto-open existing WebHID device:', err);
  }
  return null;
}

export async function requestSonyWebHid() {
  if (!isWebHidSupported()) {
    throw new Error('WebHID is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
  }

  try {
    notifyStatus('connecting');
    const devices = await navigator.hid.requestDevice({ filters: SONY_HID_FILTERS });
    if (!devices || devices.length === 0) {
      notifyStatus(activeDevice ? 'connected' : 'disconnected', activeDevice);
      return null;
    }

    const device = devices[0];
    if (!device.opened) {
      await device.open();
    }

    activeDevice = device;
    device.oninputreport = handleInputReport;

    // Enable Bluetooth DualSense full sensor mode
    try {
      if (typeof device.receiveFeatureReport === 'function') {
        await device.receiveFeatureReport(0x05);
      }
    } catch (e) {
      // ignore
    }

    notifyStatus('connected', device);
    return device;
  } catch (err) {
    console.error('Failed to request Sony WebHID device:', err);
    notifyStatus('disconnected');
    throw err;
  }
}

export async function disconnectSonyWebHid() {
  if (activeDevice) {
    try {
      activeDevice.oninputreport = null;
      if (activeDevice.opened) {
        await activeDevice.close();
      }
    } catch (e) {
      console.warn('Error closing WebHID device:', e);
    }
    activeDevice = null;
    notifyStatus('disconnected');
    notifyTouches({
      touch0: { active: false, id: 0, x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 },
      touch1: { active: false, id: 0, x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 },
      click: false,
      hasTouches: false,
      fingerCount: 0,
      deviceType: 'unknown'
    });
  }
}

export function subscribeWebHidTouches(callback) {
  touchListeners.add(callback);
  callback(lastTouchState);
  return () => {
    touchListeners.delete(callback);
  };
}

export function subscribeWebHidStatus(callback) {
  statusListeners.add(callback);
  callback(activeDevice ? 'connected' : 'disconnected', activeDevice);
  return () => {
    statusListeners.delete(callback);
  };
}

export function getActiveWebHidDevice() {
  return activeDevice;
}

export function getLastWebHidTouchState() {
  return lastTouchState;
}

/**
 * Triggers hardware rumble/vibration on Sony PS5 DualSense and PS4 DualShock controllers
 * via raw WebHID output reports.
 */
export async function triggerSonyHaptic(duration = 500, weakMagnitude = 1.0, strongMagnitude = 1.0) {
  // If no device currently active, attempt to open any existing paired device
  if (!activeDevice || !activeDevice.opened) {
    await initExistingSonyHidDevice();
  }

  if (!activeDevice || !activeDevice.opened) return false;

  const productId = activeDevice.productId || 0;
  const isPS4 = productId === 0x05c4 || productId === 0x09cc || productId === 0x0ba0;

  try {
    const weak = Math.min(255, Math.max(0, Math.round(weakMagnitude * 255)));
    const strong = Math.min(255, Math.max(0, Math.round(strongMagnitude * 255)));

    if (!isPS4) {
      // PS5 DualSense
      // USB Output Report 0x02 (47 bytes)
      // byte 0: valid_flag0 = 0x03 (motor_right | motor_left enable)
      // byte 1: valid_flag1 = 0x00
      // byte 2: motor_right (weak motor, 0..255)
      // byte 3: motor_left (strong motor, 0..255)
      const buffer = new Uint8Array(47);
      buffer[0] = 0x03; // Enable rumble motors
      buffer[1] = 0x00;
      buffer[2] = weak;
      buffer[3] = strong;

      try {
        await activeDevice.sendReport(0x02, buffer);
      } catch (err) {
        // Bluetooth DualSense Report 0x31
        try {
          const btBuffer = new Uint8Array(77);
          btBuffer[0] = 0x02;
          btBuffer[1] = 0x03;
          btBuffer[3] = weak;
          btBuffer[4] = strong;
          await activeDevice.sendReport(0x31, btBuffer);
        } catch (e2) {
          console.warn('DualSense BT rumble error:', e2);
        }
      }

      // Automatically stop vibration after duration
      setTimeout(async () => {
        if (activeDevice && activeDevice.opened) {
          const stopBuffer = new Uint8Array(47);
          stopBuffer[0] = 0x03;
          stopBuffer[2] = 0;
          stopBuffer[3] = 0;
          try {
            await activeDevice.sendReport(0x02, stopBuffer);
          } catch (e) {
            // ignore
          }
        }
      }, duration);

      return true;
    } else {
      // PS4 DualShock 4
      // USB Output Report 0x05
      // byte 0: 0x01 (enable rumble)
      // byte 3: motor_right (weak)
      // byte 4: motor_left (strong)
      const buffer = new Uint8Array(31);
      buffer[0] = 0x01;
      buffer[3] = weak;
      buffer[4] = strong;

      try {
        await activeDevice.sendReport(0x05, buffer);
      } catch (err) {
        // Bluetooth DS4 Report 0x11
        try {
          const btBuf = new Uint8Array(77);
          btBuf[0] = 0xc0 | 0x04;
          btBuf[2] = 0x01;
          btBuf[4] = weak;
          btBuf[5] = strong;
          await activeDevice.sendReport(0x11, btBuf);
        } catch (e2) {
          console.warn('DS4 BT rumble error:', e2);
        }
      }

      // Automatically stop vibration after duration
      setTimeout(async () => {
        if (activeDevice && activeDevice.opened) {
          const stopBuffer = new Uint8Array(31);
          stopBuffer[0] = 0x01;
          stopBuffer[3] = 0;
          stopBuffer[4] = 0;
          try {
            await activeDevice.sendReport(0x05, stopBuffer);
          } catch (e) {
            // ignore
          }
        }
      }, duration);

      return true;
    }
  } catch (err) {
    console.warn('Failed to send WebHID rumble report:', err);
  }
  return false;
}
