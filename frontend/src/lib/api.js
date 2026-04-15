import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth-aware request interceptor: attach token, skip guest calls to protected endpoints
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zen_token');
  if (token && token !== 'guest_token') {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!config.url?.includes('/auth/')) {
    // Guest user hitting protected endpoint — abort silently
    const controller = new AbortController();
    controller.abort();
    config.signal = controller.signal;
  }
  return config;
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_CANCELED') return Promise.reject(error);
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out — please try again';
    }
    return Promise.reject(error);
  }
);

export default api;
