const API_BASE_URL = 'http://localhost:5000/api';

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Determine if we should set Content-Type to JSON (don't set it for FormData upload)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && !(config.body instanceof FormData) && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Auto logout on 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login') && window.location.reload) {
      window.dispatchEvent(new Event('auth-logout'));
    }
  }

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.message || 'Something went wrong');
  }

  return responseData;
}

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      return res;
    },
    register: async (userData) => {
      return request('/auth/register', {
        method: 'POST',
        body: userData,
      });
    },
    getProfile: async () => {
      return request('/auth/profile');
    },
    updateProfile: async (profileData) => {
      return request('/auth/profile', {
        method: 'PUT',
        body: profileData,
      });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    },
    getCurrentUser: () => {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch (e) {
        return null;
      }
    },
    isAuthenticated: () => {
      return !!localStorage.getItem('token');
    }
  },

  // Reports / Analytics
  reports: {
    getDashboardSummary: async () => {
      return request('/reports/dashboard');
    },
    getFinancialReport: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/reports/financial?${query}`);
    }
  },

  // Products
  products: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      return request(`/products?${query.toString()}`);
    },
    getById: async (id) => {
      return request(`/products/${id}`);
    },
    create: async (productData) => {
      return request('/products', {
        method: 'POST',
        body: productData,
      });
    },
    update: async (id, productData) => {
      return request(`/products/${id}`, {
        method: 'PUT',
        body: productData,
      });
    },
    delete: async (id) => {
      return request(`/products/${id}`, {
        method: 'DELETE',
      });
    },
    duplicate: async (id) => {
      return request(`/products/${id}/duplicate`, {
        method: 'POST',
      });
    },
    // Variations
    addVariation: async (productId, variationData) => {
      return request(`/products/${productId}/variations`, {
        method: 'POST',
        body: variationData,
      });
    },
    updateVariation: async (variationId, variationData) => {
      return request(`/products/variations/${variationId}`, {
        method: 'PUT',
        body: variationData,
      });
    },
    deleteVariation: async (variationId) => {
      return request(`/products/variations/${variationId}`, {
        method: 'DELETE',
      });
    },
    // Media
    uploadMedia: async (productId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request(`/products/${productId}/media`, {
        method: 'POST',
        body: formData,
      });
    },
    deleteMedia: async (mediaId) => {
      return request(`/products/media/${mediaId}`, {
        method: 'DELETE',
      });
    }
  },

  // Categories
  categories: {
    getAll: async () => {
      return request('/products/categories');
    },
    create: async (categoryData) => {
      return request('/products/categories', {
        method: 'POST',
        body: categoryData,
      });
    },
    update: async (id, categoryData) => {
      return request(`/products/categories/${id}`, {
        method: 'PUT',
        body: categoryData,
      });
    },
    delete: async (id) => {
      return request(`/products/categories/${id}`, {
        method: 'DELETE',
      });
    }
  },

  // Orders
  orders: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/orders?${query}`);
    },
    getById: async (id) => {
      return request(`/orders/${id}`);
    },
    updateStatus: async (id, statusData) => {
      return request(`/orders/${id}`, {
        method: 'PUT',
        body: statusData,
      });
    },
    assignSupplier: async (orderId, itemId, vendorId) => {
      return request(`/orders/${orderId}/items/${itemId}/assign-supplier`, {
        method: 'POST',
        body: { vendorId },
      });
    }
  },

  // Customers
  customers: {
    getAll: async () => {
      return request('/customers');
    },
    getById: async (id) => {
      return request(`/customers/${id}`);
    },
    toggleStatus: async (id, isActive) => {
      return request(`/customers/${id}/status`, {
        method: 'PUT',
        body: { isActive }
      });
    }
  },

  // Vendors
  vendors: {
    getAll: async () => {
      return request('/vendors');
    },
    getById: async (id) => {
      return request(`/vendors/${id}`);
    },
    update: async (id, data) => {
      return request(`/vendors/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    payout: async (id, amount, notes) => {
      return request(`/vendors/${id}/payouts`, {
        method: 'POST',
        body: { amount, notes },
      });
    }
  },

  // Discounts
  discounts: {
    getAll: async () => {
      return request('/discounts');
    },
    create: async (discountData) => {
      return request('/discounts', {
        method: 'POST',
        body: discountData,
      });
    },
    update: async (id, discountData) => {
      return request(`/discounts/${id}`, {
        method: 'PUT',
        body: discountData,
      });
    },
    delete: async (id) => {
      return request(`/discounts/${id}`, {
        method: 'DELETE',
      });
    }
  },

  // CMS Content (Pages & Settings)
  cms: {
    getPages: async () => {
      return request('/content/pages');
    },
    createPage: async (pageData) => {
      return request('/content/pages', {
        method: 'POST',
        body: pageData,
      });
    },
    updatePage: async (id, pageData) => {
      return request(`/content/pages/${id}`, {
        method: 'PUT',
        body: pageData,
      });
    },
    deletePage: async (id) => {
      return request(`/content/pages/${id}`, {
        method: 'DELETE',
      });
    },
    getSettings: async () => {
      return request('/content/settings');
    },
    updateSetting: async (settingData) => {
      return request('/content/settings', {
        method: 'POST',
        body: settingData,
      });
    }
  },

  // Services (Repairs, Valuations/Sells, Conversations)
  services: {
    getRepairs: async () => {
      return request('/services/repairs');
    },
    updateRepair: async (id, repairData) => {
      return request(`/services/repairs/${id}`, {
        method: 'PUT',
        body: repairData,
      });
    },
    getSells: async () => {
      return request('/services/sell');
    },
    updateSell: async (id, sellData) => {
      return request(`/services/sell/${id}`, {
        method: 'PUT',
        body: sellData,
      });
    },
    getChats: async () => {
      return request('/services/chats');
    },
    getChatById: async (id) => {
      return request(`/services/chats/${id}`);
    },
    replyToChat: async (id, text) => {
      return request(`/services/chats/${id}`, {
        method: 'POST',
        body: { text },
      });
    }
  }
};
