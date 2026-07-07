import { useState, useEffect, useRef } from 'react';

function snapshotGamepad(gamepad) {
  if (!gamepad) return null;
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
    axes: [...gamepad.axes],
  };
}

function getConnectedGamepads() {
  return [...(navigator.getGamepads?.() ?? [])].filter(Boolean);
}

export function useGamepad() {
  const [gamepads, setGamepads] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const syncConnected = () => {
      const connected = getConnectedGamepads().map(snapshotGamepad);
      setGamepads(connected);
      setActiveIndex((prev) => {
        if (connected.length === 0) return 0;
        if (connected.some((gp) => gp.index === prev)) return prev;
        return connected[0].index;
      });
    };

    const poll = () => {
      const connected = getConnectedGamepads().map(snapshotGamepad);
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

  const activeGamepad = gamepads.find((gp) => gp.index === activeIndex) ?? gamepads[0] ?? null;

  return {
    gamepads,
    activeGamepad,
    activeIndex,
    setActiveIndex,
    isSupported: typeof navigator.getGamepads === 'function',
  };
}
