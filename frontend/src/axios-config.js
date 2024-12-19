import axios from 'axios';

// Default to production URL unless explicitly in development
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isDev
  ? 'http://localhost:8080'
  : 'https://caldumpcom-production.up.railway.app';

console.log('Environment:', isDev ? 'development' : 'production');
console.log('Hostname:', window.location.hostname);
console.log('Using API URL:', API_URL);

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: true // Enable CORS credentials
});

// Add request interceptor for auth token and logging
axiosInstance.interceptors.request.use(
  async (config) => {
    const fullUrl = config.baseURL + config.url;
    console.log('Making request to:', fullUrl, {
      method: config.method,
      params: config.params
    });

    const token = localStorage.getItem('caldump_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', {
      error: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_URL };