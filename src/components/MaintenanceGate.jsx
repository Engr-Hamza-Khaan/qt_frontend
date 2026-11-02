import { useCallback, useEffect, useRef, useState } from 'react';
import MaintenancePage from './MaintenancePage';
import { BACKEND_DOWN_EVENT, checkBackendHealth } from '../utils/backendStatus';

const RETRY_INTERVAL_S = 15;

export default function MaintenanceGate({ children }) {
  const [down, setDown] = useState(false);
  const [checking, setChecking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RETRY_INTERVAL_S);
  const inFlight = useRef(false);
  const downRef = useRef(false);

  const runCheck = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setChecking(true);
    const ok = await checkBackendHealth();
    inFlight.current = false;
    setChecking(false);
    setSecondsLeft(RETRY_INTERVAL_S);
    if (ok) {
      // Backend is back: reload so every page refetches against a healthy server.
      if (downRef.current) window.location.reload();
    } else {
      downRef.current = true;
      setDown(true);
    }
  }, []);

  // Initial check + any request reporting the backend as unreachable.
  useEffect(() => {
    const onDown = () => {
      downRef.current = true;
      setDown(true);
    };
    window.addEventListener(BACKEND_DOWN_EVENT, onDown);
    runCheck();
    return () => window.removeEventListener(BACKEND_DOWN_EVENT, onDown);
  }, [runCheck]);

  // While down: count down and retry automatically.
  useEffect(() => {
    if (!down || checking) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          runCheck();
          return RETRY_INTERVAL_S;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [down, checking, runCheck]);

  if (down) {
    return <MaintenancePage checking={checking} secondsLeft={secondsLeft} onRetry={runCheck} />;
  }
  return children;
}
