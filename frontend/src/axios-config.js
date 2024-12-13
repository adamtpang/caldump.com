import axios from 'axios';

// Debug logging for environment
console.log('Environment:', {
  NODE_ENV: import.meta.env.MODE,
  hostname: window.location.hostname,
  VITE_API_URL: import.meta.env.VITE_API_URL
});

// Determine the base URL based on environment
const getBaseURL = () => {
  const hostname = window.location.hostname;

  // For development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }

  // For production
  return 'https://caldumpcom-production.up.railway.app';
};

const baseURL = getBaseURL();
console.log('Using API URL:', baseURL);

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 10000
});

// Add request interceptor for auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}_t=${timestamp}`;

    // Add auth token if available
    const token = localStorage.getItem('caldump_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging
    console.log('Making request:', {
      url: config.baseURL + config.url,
      method: config.method,
      headers: config.headers
    });

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data ? 'present' : 'empty'
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      baseURL: error.config?.baseURL,
      code: error.code,
      name: error.name
    };

    console.error('API Error:', errorDetails);

    // Retry logic for network errors
    if (error.message === 'Network Error' && error.config && !error.config.__isRetryRequest) {
      console.log('Retrying failed request...');
      error.config.__isRetryRequest = true;
      return new Promise(resolve => setTimeout(resolve, 1000))
        .then(() => {
          console.log('Retrying request to:', error.config.url);
          return axiosInstance(error.config);
        });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;