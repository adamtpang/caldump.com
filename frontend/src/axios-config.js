import axios from 'axios';

// Determine API URL based on environment
const isProd = window.location.hostname === 'caldump.com' || window.location.hostname === 'www.caldump.com';
const API_URL = isProd
  ? 'https://caldumpcom-production.up.railway.app'
  : 'http://localhost:8080';

console.log('Environment:', isProd ? 'production' : 'development');
console.log('Using API URL:', API_URL);

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Add request interceptor for auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Log the request URL for debugging
    console.log('Making request to:', config.baseURL + config.url);

    const token = localStorage.getItem('caldump_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_URL };