import axios from 'axios';

// Default to production URL unless explicitly in development
const isDev = window.location.hostname === 'localhost';
const API_URL = isDev
  ? 'http://localhost:8080'
  : 'https://caldumpcom-production.up.railway.app';

console.log('Environment:', isDev ? 'development' : 'production');
console.log('Using API URL:', API_URL);

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});

// Add request interceptor for auth token and logging
axiosInstance.interceptors.request.use(
  async (config) => {
    // Force the correct API URL
    config.baseURL = API_URL;

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
    console.error('Request error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    if (error.message === 'Network Error') {
      console.error('Network or CORS error:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: error.message
      });
    } else {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_URL };