// src/services/api.js
// ── ONE CHANGE from the React+Node version:
//    baseURL: '' (empty string = relative URLs)
//    /api/products → calls your own Next.js API route
//    No more http://localhost:5000

import axios from 'axios';

const api = axios.create({
  baseURL: '',   // ← was 'http://localhost:5000/api' — now empty for Next.js
  headers: { 'Content-Type': 'application/json' },
});

// ── All routes where 401 should NOT force a browser redirect
const SKIP_REDIRECT_URLS = [
  '/api/admin/change-password',
  '/api/auth/change-password',
  '/api/admin/login',
  '/api/auth/login',
  '/api/cart/count',
  '/api/cart',
  '/api/auth/profile',
  '/api/products',
  '/api/categories',
  '/api/blogs',
  '/api/coupons',
  '/api/addresses',
  '/api/orders',
];

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('token')) : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const shouldSkip = SKIP_REDIRECT_URLS.some(url => requestUrl.includes(url));
      if (!shouldSkip) {
        if (typeof window !== 'undefined') {
          if (window.location.pathname.startsWith('/admin')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('admin');
            localStorage.removeItem('adminData');
            window.location.href = '/admin/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==================== ADMIN AUTH ====================
export const adminAuth = {
  login:          (credentials) => api.post('/api/admin/login', credentials),
  logout:         ()            => api.post('/api/admin/logout'),
  getProfile:     ()            => api.get('/api/admin/me'),
  updateProfile:  (data)        => api.put('/api/admin/profile', data),
  changePassword: (data)        => api.put('/api/admin/change-password', data),
};

// ==================== USER AUTH ====================
export const userAuth = {
  checkUser:   (data)      => api.post('/api/auth/check-user', data),
  register:    (data)      => api.post('/api/auth/register', data),
  loginUser:   (data)      => api.post('/api/auth/login', data),
  logout:      ()          => api.post('/api/auth/logout'),
  getProfile:  ()          => api.get('/api/auth/profile'),
  updateProfile: (formData) => {
    const token = localStorage.getItem('token');
    return fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,           // multipart — no Content-Type header needed
    }).then(res => res.json());
  },
  changePassword:     (data) => api.put('/api/auth/change-password', data),
  deleteProfileImage: ()     => api.delete('/api/auth/profile-image'),
};

// ==================== USER MANAGEMENT (ADMIN) ====================
export const userAPI = {
  getAll:       (params)   => api.get('/api/admin/users', { params }),
  getById:      (id)       => api.get(`/api/admin/users/${id}`),
  toggleStatus: (id)       => api.put(`/api/admin/users/${id}/toggle-status`),
  update:       (id, data) => api.put(`/api/admin/users/${id}`, data),
  delete:       (id)       => api.delete(`/api/admin/users/${id}`),
  getStats:     ()         => api.get('/api/admin/users/stats'),
};

// ==================== PUBLIC PRODUCT API ====================
export const productAPI = {
  getAll: (params = {}) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`), // This will work with your route
  getBySlug: (slug) => api.get(`/api/products/${slug}`), // Changed to match the route
  getByCategory: (categoryId, params = {}) => api.get(`/api/products/category/${categoryId}`, { params }),
};

// ==================== ADMIN PRODUCT API ====================
export const adminProductAPI = {
  getAll:       (params)       => api.get('/api/admin/products', { params }),
  getById:      (id)           => api.get(`/api/admin/products/${id}`),
  create:       (formData)     => fetch('/api/admin/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    body: formData,
  }).then(r => r.json()).then(d => ({ data: d })),
  update:       (id, formData) => fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    body: formData,
  }).then(r => r.json()).then(d => ({ data: d })),
  delete:       (id)           => api.delete(`/api/admin/products/${id}`),
  deleteImage:  (id, filename) => api.delete(`/api/admin/products/${id}/images`, { params: { filename } }),
  updateStatus: (id, status)   => api.put(`/api/admin/products/${id}/status`, { status }),
  getStats:     ()             => api.get('/api/admin/products/stats'),
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  getStats: async () => {
    try {
      const [userStats, productStats] = await Promise.all([
        userAPI.getStats(),
        adminProductAPI.getStats(),
      ]);
      return { data: { success: true, stats: { ...userStats.data.stats, ...productStats.data.stats } } };
    } catch {
      return { data: { success: false, message: 'Failed to fetch dashboard stats' } };
    }
  },
};

// ==================== CART ====================
export const cartAPI = {
  getCart:        ()                                  => api.get('/api/cart'),
  getCartCount:   ()                                  => api.get('/api/cart/count'),
  addToCart:      (productId, quantity, variantWeight) =>
    api.post('/api/cart/add', { productId, quantity, variantWeight }),
  updateQuantity: (productId, quantity, variantWeight) =>
    api.put('/api/cart/update', { productId, quantity, variantWeight }),
  removeItem:     (productId, variantWeight)          =>
    api.delete(`/api/cart/remove/${productId}?variantWeight=${variantWeight}`),
  clearCart:      ()                                  => api.delete('/api/cart/clear'),
};

// ==================== ADDRESS ====================
export const addressAPI = {
  getAll:     ()          => api.get('/api/addresses'),
  getOne:     (id)        => api.get(`/api/addresses/${id}`),
  create:     (data)      => api.post('/api/addresses', data),
  update:     (data)      => api.put('/api/addresses', data),
  delete:     (id)        => api.delete(`/api/addresses/${id}`),
  setDefault: (id)        => api.put(`/api/addresses/${id}/default`),
};

// ==================== ORDERS ====================
export const orderAPI = {
  createOrder:       (data)        => api.post('/api/orders', data),
  getMyOrders:       (params = {}) => api.get('/api/orders', { params }),
  getOrderById:      (id)          => api.get(`/api/orders/${id}`),
  cancelOrder:       (id, data)    => api.put(`/api/orders/${id}/cancel`, data),
  getAllOrders:       (params)      => api.get('/api/admin/orders', { params }),
  updateOrderStatus: (id, data)    => api.put(`/api/admin/orders/${id}/status`, data),
  getOrderStats:     ()            => api.get('/api/admin/orders/stats'),
};

// ==================== CATEGORIES ====================
export const categoryAPI = {
  getAll:    (params) => api.get('/api/categories', { params }),
  getById:   (id)     => api.get(`/api/categories/${id}`),
  getBySlug: (slug)   => api.get(`/api/categories/slug/${slug}`),
};

export const adminCategoryAPI = {
  getAll:       (params)       => api.get('/api/categories', { params }),
  getById:      (id)           => api.get(`/api/categories/${id}`),
  create:       (formData)     => fetch('/api/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    body: formData,
  }).then(r => r.json()).then(d => ({ data: d })),
  update:       (id, formData) => fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    body: formData,
  }).then(r => r.json()).then(d => ({ data: d })),
  delete:       (id) => api.delete(`/api/categories/${id}`),
  toggleActive: (id) => api.put(`/api/categories/${id}/toggle-active`),
  deleteImage:  (id) => api.delete(`/api/categories/${id}/image`),
};

export const adminBlogCategoryAPI = {
  getAll:       (params)       => api.get('/api/blogcategories', { params }),
  getById:      (id)           => api.get(`/api/blogcategories/${id}`),
  create:       (formData)     => fetch('/api/blogcategories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    body: formData,
  }).then(r => r.json()).then(d => ({ data: d })),
  update:       (id, formData) => fetch(`/api/blogcategories/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    body: formData,
  }).then(r => r.json()).then(d => ({ data: d })),
  delete:       (id) => api.delete(`/api/blogcategories/${id}`),
  toggleActive: (id) => api.put(`/api/blogcategories/${id}/toggle-active`),
  deleteImage:  (id) => api.delete(`/api/blogcategories/${id}/image`),
};

// ==================== COUPONS ====================
export const couponAPI = {
  getAll:       (params)   => api.get('/api/admin/coupons', { params }),
  getById:      (id)       => api.get(`/api/admin/coupons/${id}`),
  create:       (data)     => api.post('/api/admin/coupons', data),
  update:       (id, data) => api.put(`/api/admin/coupons/${id}`, data),
  delete:       (id)       => api.delete(`/api/admin/coupons/${id}`),
  toggle:       (id)       => api.put(`/api/admin/coupons/${id}/toggle`),
  generateCode: ()         => api.get('/api/admin/coupons/generate-code'),
  getAvailable: (cartTotal) => api.get('/api/coupons/available', { params: { cartTotal } }),
  apply:        (code, cartTotal) => api.post('/api/coupons/apply', { code, cartTotal }),
};

// ==================== BLOGS ====================
export const blogAPI = {
  getAll:           (params)   => api.get('/api/admin/blogs', { params }),
  getById:          (id)       => api.get(`/api/admin/blogs/${id}`),
  getStats:         ()         => api.get('/api/admin/blogs/stats'),
  updateStatus:     (id, data) => api.put(`/api/admin/blogs/${id}/status`, data),
  toggleFeatured:   (id)       => api.put(`/api/admin/blogs/${id}/toggle-featured`),
  delete:           (id)       => api.delete(`/api/admin/blogs/${id}`),
  getPublicAll:       (params)   => api.get('/api/blogs', { params }),
  getPublicBySlug:    (slug)     => api.get(`/api/blogs/${slug}`),
  getPublicCategories:()         => api.get('/api/blogs/categories'),
};

// ==================== PASSWORD RESET ====================
export const passwordResetAPI = {
  forgotPassword: (email)                              => api.post('/api/reset-password/forgot', { email }),
  verifyOTP:      (email, otp)                         => api.post('/api/reset-password/verify', { email, otp }),
  resetPassword:  (email, otp, newPassword, resetToken)=> api.post('/api/reset-password/reset', { newPassword, resetToken }),
  resendOTP:      (email)                              => api.post('/api/reset-password/resend', { email }),
};

export default api;