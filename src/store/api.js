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
  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text ? text.slice(0, 200) : res.statusText };
    }
  }

  if (!res.ok) throw new Error(data?.message || `Request failed with status ${res.status}`);
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
  getSearchSuggestions: (query = '', limit = 8) =>
    storeRequest(`/store/search/suggest?q=${encodeURIComponent(query)}&limit=${limit}`),
  getPopularSearches: () => storeRequest('/store/search/popular'),
  trackSearch: (term, resultsCount = 0) =>
    storeRequest('/store/search/track', { method: 'POST', body: { term, resultsCount } }),
  getTermsAndConditions: () => storeRequest('/settings/terms-and-conditions'),
  getPopup: () => storeRequest('/settings/popup'),
  submitPopupLead: (data) =>
    storeRequest('/settings/popup/lead', { method: 'POST', body: data }),
  getLandingPage: () => storeRequest('/settings/landing-page'),
};
