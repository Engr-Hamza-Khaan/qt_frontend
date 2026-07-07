const SESSION_KEY = 'qt_chat_session_id';
const MESSAGES_KEY = 'qt_chat_messages';
const CUSTOMER_KEY = 'qt_chat_customer';

export function getOrCreateSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getStoredMessages() {
  try {
    const raw = sessionStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages) {
  sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function getStoredCustomer() {
  try {
    const raw = sessionStorage.getItem(CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomer(customer) {
  sessionStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}
