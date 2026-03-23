import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://fintrack-x68g.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ft_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ft_token');
      localStorage.removeItem('ft_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data)   => api.post('/auth/signup', data),
  login:  (data)   => api.post('/auth/login', data),
  me:     ()       => api.get('/auth/me'),
  update: (data)   => api.put('/auth/profile', data),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionsAPI = {
  list:   (params) => api.get('/transactions', { params }),
  create: (data)   => api.post('/transactions', data),
  update: (id, d)  => api.put(`/transactions/${id}`, d),
  delete: (id)     => api.delete(`/transactions/${id}`),
  get:    (id)     => api.get(`/transactions/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  summary:    (params) => api.get('/analytics/summary', { params }),
  monthly:    (params) => api.get('/analytics/monthly', { params }),
  categories: (params) => api.get('/analytics/categories', { params }),
};

export default api;
