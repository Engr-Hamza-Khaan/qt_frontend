import { API_URL } from './utils';

async function storeRequest(endpoint, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = { ...options, headers };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const storeApi = {
  getHome: () => storeRequest('/store/home'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return storeRequest(`/store/products?${query}`);
  },
  getProduct: (id) => storeRequest(`/store/products/${id}`),
  getPage: (slug) => storeRequest(`/store/pages/${slug}`),
  getCategories: () => storeRequest('/products/categories'),
  validateCoupon: (code, cartAmount, items = []) =>
    storeRequest('/discounts/validate', { method: 'POST', body: { code, cartAmount, items } }),
  checkout: (payload) =>
    storeRequest('/store/checkout', { method: 'POST', body: payload }),
  submitRepair: (data) =>
    storeRequest('/services/repairs', { method: 'POST', body: data }),
  submitSell: (data) =>
    storeRequest('/services/sell', { method: 'POST', body: data }),
  getChatSettings: () => storeRequest('/services/chat-settings'),
  getChatBySession: (sessionId) => storeRequest(`/services/chats/session/${sessionId}`),
  sendChatMessage: (payload) =>
    storeRequest('/services/chats/message', { method: 'POST', body: payload }),
};
