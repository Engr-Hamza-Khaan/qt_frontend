import { API_URL } from '../store/utils';

export const BACKEND_DOWN_EVENT = 'backend-down';
const HEALTH_TIMEOUT_MS = 8000;
const DOWN_STATUSES = [502, 503, 504];

export function reportBackendDown() {
  window.dispatchEvent(new Event(BACKEND_DOWN_EVENT));
}

export function isBackendDownStatus(status) {
  return DOWN_STATUSES.includes(status);
}

export async function checkBackendHealth() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/health`, { signal: controller.signal, cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
