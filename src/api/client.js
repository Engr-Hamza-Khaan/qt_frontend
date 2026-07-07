const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = { ...options, headers };

  if (config.body && !(config.body instanceof FormData) && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/admin/login')) {
      window.dispatchEvent(new Event('auth-logout'));
    }
  }

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.message || 'Something went wrong');
  }

  return responseData;
}

function extractUser(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    vendorProfile: data.vendorProfile,
  };
}

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      const payload = res.data || res;
      const token = payload.token;
      if (token) {
        const user = extractUser(payload);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      throw new Error('Login failed — no token received');
    },
    register: async (userData) => {
      return request('/auth/register', { method: 'POST', body: userData });
    },
    getProfile: async () => {
      const res = await request('/auth/profile');
      return res.data || res;
    },
    updateProfile: async (profileData) => {
      return request('/auth/profile', { method: 'PUT', body: profileData });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    },
    getCurrentUser: () => {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch {
        return null;
      }
    },
    isAuthenticated: () => !!localStorage.getItem('token'),
  },

  reports: {
    getDashboardSummary: async () => request('/reports/dashboard'),
    getFinancialReport: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/reports/financial?${query}`);
    },
  },

  products: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, val);
      });
      return request(`/products?${query.toString()}`);
    },
    getById: async (id) => request(`/products/${id}`),
    create: async (productData) => request('/products', { method: 'POST', body: productData }),
    update: async (id, productData) => request(`/products/${id}`, { method: 'PUT', body: productData }),
    delete: async (id) => request(`/products/${id}`, { method: 'DELETE' }),
    duplicate: async (id) => request(`/products/${id}/duplicate`, { method: 'POST' }),
    addVariation: async (productId, variationData) =>
      request(`/products/${productId}/variations`, { method: 'POST', body: variationData }),
    updateVariation: async (variationId, variationData) =>
      request(`/products/variations/${variationId}`, { method: 'PUT', body: variationData }),
    deleteVariation: async (variationId) =>
      request(`/products/variations/${variationId}`, { method: 'DELETE' }),
    uploadMedia: async (productId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request(`/products/${productId}/media`, { method: 'POST', body: formData });
    },
    deleteMedia: async (mediaId) => request(`/products/media/${mediaId}`, { method: 'DELETE' }),
  },

  categories: {
    getAll: async () => request('/products/categories'),
    create: async (categoryData) =>
      request('/products/categories', { method: 'POST', body: categoryData }),
    update: async (id, categoryData) =>
      request(`/products/categories/${id}`, { method: 'PUT', body: categoryData }),
    delete: async (id) => request(`/products/categories/${id}`, { method: 'DELETE' }),
  },

  orders: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/orders?${query}`);
    },
    getById: async (id) => request(`/orders/${id}`),
    updateStatus: async (id, statusData) =>
      request(`/orders/${id}`, { method: 'PUT', body: statusData }),
    delete: async (id) => request(`/orders/${id}`, { method: 'DELETE' }),
    assignSupplier: async (orderId, itemId, vendorId) =>
      request(`/orders/${orderId}/items/${itemId}/assign-supplier`, {
        method: 'POST',
        body: { vendorId },
      }),
  },

  customers: {
    getAll: async () => request('/customers'),
    getById: async (id) => request(`/customers/${id}`),
    toggleStatus: async (id, isActive) =>
      request(`/customers/${id}/status`, { method: 'PUT', body: { isActive } }),
    delete: async (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  },

  vendors: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/vendors?${query}`);
    },
    getById: async (id) => request(`/vendors/${id}`),
    create: async (data) => request('/vendors', { method: 'POST', body: data }),
    update: async (id, data) => request(`/vendors/${id}`, { method: 'PUT', body: data }),
    delete: async (id) => request(`/vendors/${id}`, { method: 'DELETE' }),
    payout: async (id, amount, notes) =>
      request(`/vendors/${id}/payouts`, { method: 'POST', body: { amount, notes } }),
    getPortalDashboard: async () => request('/vendors/portal/dashboard'),
  },

  discounts: {
    getAll: async () => request('/discounts'),
    create: async (discountData) => request('/discounts', { method: 'POST', body: discountData }),
    update: async (id, discountData) =>
      request(`/discounts/${id}`, { method: 'PUT', body: discountData }),
    delete: async (id) => request(`/discounts/${id}`, { method: 'DELETE' }),
  },

  services: {
    getRepairs: async () => request('/services/repairs'),
    updateRepair: async (id, repairData) =>
      request(`/services/repairs/${id}`, { method: 'PUT', body: repairData }),
    getSells: async () => request('/services/sell'),
    updateSell: async (id, sellData) =>
      request(`/services/sell/${id}`, { method: 'PUT', body: sellData }),
    getChats: async () => request('/services/chats'),
    getChatById: async (id) => request(`/services/chats/${id}`),
    replyToChat: async (id, text) =>
      request(`/services/chats/${id}`, { method: 'POST', body: { text } }),
  },
};
