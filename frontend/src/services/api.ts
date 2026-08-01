import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import session from '../utils/session';
import notify from '../utils/notifications';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const sessionId = session.getSessionId();
  const visitorId = session.getVisitorId();
  if (sessionId) config.headers['x-session-id'] = sessionId;
  if (visitorId) config.headers['x-visitor-id'] = visitorId;

  const guestId = localStorage.getItem('guestId');
  if (guestId) config.headers['x-guest-id'] = guestId;

  const clerkToken = localStorage.getItem('clerkToken');
  if (clerkToken) {
    config.headers['Authorization'] = `Bearer ${clerkToken}`;
  }

  config.metadata = { ...config.metadata, startTime: Date.now() };
  return config;
});

const statusMessages: Record<number, { title: string; description: string; type: 'error' | 'warning' | 'info' }> = {
  400: {
    title: 'Bad Request',
    description: 'The server couldn\'t understand your request. Please check your input.',
    type: 'warning',
  },
  401: {
    title: 'Authentication Required',
    description: 'Please sign in to continue.',
    type: 'warning',
  },
  403: {
    title: 'Access Denied',
    description: 'You don\'t have permission to perform this action.',
    type: 'error',
  },
  404: {
    title: 'Not Found',
    description: 'The resource you\'re looking for doesn\'t exist.',
    type: 'info',
  },
  408: {
    title: 'Request Timeout',
    description: 'The request took too long. Please try again.',
    type: 'warning',
  },
  409: {
    title: 'Conflict',
    description: 'This action conflicts with existing data.',
    type: 'warning',
  },
  413: {
    title: 'File Too Large',
    description: 'The uploaded file exceeds the size limit.',
    type: 'warning',
  },
  415: {
    title: 'Unsupported Format',
    description: 'The file format is not supported.',
    type: 'warning',
  },
  422: {
    title: 'Validation Error',
    description: 'Please check the highlighted fields and try again.',
    type: 'warning',
  },
  429: {
    title: 'Too Many Requests',
    description: 'You\'re doing that too fast. Please slow down.',
    type: 'warning',
  },
  500: {
    title: 'Server Error',
    description: 'Something went wrong on our end. Our team has been notified.',
    type: 'error',
  },
  502: {
    title: 'Service Unavailable',
    description: 'Our server is temporarily unavailable. Please try again later.',
    type: 'error',
  },
  503: {
    title: 'Maintenance Mode',
    description: 'We\'re currently performing maintenance. Please try again in a few minutes.',
    type: 'info',
  },
};

api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - ((response.config as any).metadata?.startTime || Date.now());
    if (duration > 5000) {
      console.warn(`[API] Slow request: ${response.config.url} took ${duration}ms`);
    }

    const message = response.data?.message;
    if (message && response.config.method !== 'get') {
      notify.success(message, { duration: 2500 });
    }

    return response.data;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url || 'unknown';

    if (status === 401) {
      localStorage.removeItem('clerkToken');
      localStorage.removeItem('guestId');
      session.remove('session_id');

      if (!window.location.pathname.includes('/admin')) {
        notify.warning('Your session has expired. Please sign in again.', {
          description: 'You\'ll be redirected to the home page.',
          duration: 5000,
        });
      }
    } else if (status === 403) {
      notify.error('Access Denied', {
        description: 'You don\'t have permission to perform this action.',
        duration: 5000,
      });
    } else if (status && status >= 500) {
      notify.error('Server Error', {
        description: `Error ${status}: Something went wrong. Our team has been notified.`,
        duration: 6000,
      });
      console.error(`[API] Server error ${status} on ${url}:`, data);
    } else if (status === 429) {
      notify.warning('Rate Limited', {
        description: 'You\'re making too many requests. Please wait a moment.',
        duration: 5000,
      });
    } else if (status === 404) {
      const message = data?.message || 'The requested resource was not found.';
      return Promise.reject(new Error(message));
    } else if (status === 400 || status === 422) {
      const message = data?.message || data?.error || 'Please check your input and try again.';
      notify.warning(message);
      return Promise.reject(new Error(message));
    } else if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        notify.error('Connection Timeout', {
          description: 'The server took too long to respond. Please check your connection.',
        });
      } else if (error.message === 'Network Error') {
        notify.error('Network Error', {
          description: 'Unable to connect to the server. Please check your internet connection.',
        });
      } else {
        notify.error('Connection Failed', {
          description: 'Unable to reach the server. Please try again later.',
        });
      }
    }

    const statusInfo = status ? statusMessages[status] : null;
    const message = data?.message || statusInfo?.description || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Products
export const productAPI = {
  getAll: (params?: Record<string, string>) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  create: (data: FormData) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/products/${id}`),
  getDashboard: () => api.get('/products/dashboard'),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Brands
export const brandAPI = {
  getAll: () => api.get('/brands'),
  create: (data: any) => api.post('/brands', data),
  update: (id: string, data: any) => api.put(`/brands/${id}`, data),
  delete: (id: string) => api.delete(`/brands/${id}`),
};

// Orders
export const orderAPI = {
  getAll: (params?: Record<string, string>) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
  getStats: () => api.get('/orders/stats'),
};

// Banners
export const bannerAPI = {
  getAll: (params?: Record<string, string>) => api.get('/banners', { params }),
  create: (data: any) => api.post('/banners', data),
  update: (id: string, data: any) => api.put(`/banners/${id}`, data),
  delete: (id: string) => api.delete(`/banners/${id}`),
};

// Coupons
export const couponAPI = {
  getAll: () => api.get('/coupons'),
  validate: (code: string) => api.get(`/coupons/validate/${code}`),
  create: (data: any) => api.post('/coupons', data),
  update: (id: string, data: any) => api.put(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// Reviews
export const reviewAPI = {
  getByProduct: (productId: string, params?: Record<string, string>) => api.get(`/reviews/${productId}`, { params }),
  create: (data: any) => api.post('/reviews', data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// Auth
export const authAPI = {
  createGuest: () => api.post('/auth/guest'),
};

// Users
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  deleteMyAccount: () => api.delete('/users/profile'),
  addAddress: (data: any) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: any) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  toggleWishlist: (productId: string) => api.post(`/users/wishlist/${productId}`),
  getWishlist: () => api.get('/users/wishlist'),
  getAll: (params?: Record<string, string>) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

// Search
export const searchAPI = {
  autocomplete: (q: string) => {
    session.trackSearch(q);
    return api.get('/search/autocomplete', { params: { q } });
  },
};

// Upload
export const uploadAPI = {
  images: (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
