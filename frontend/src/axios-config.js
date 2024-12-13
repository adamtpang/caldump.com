import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
  // For development
  if (window.location.hostname === 'localhost') {
    return import.meta.env.VITE_API_URL || 'http://localhost:8080';
  }
  // For production
  return 'https://caldumpcom-production.up.railway.app';
};

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  // Add timeout
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

    console.log('Making request to:', config.baseURL + config.url);
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
      status: response.status
    });
    return response;
  },
  (error) => {
    // Detailed error logging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      baseURL: error.config?.baseURL
    });

    // Retry logic for network errors
    if (error.message === 'Network Error' && error.config && !error.config.__isRetryRequest) {
      error.config.__isRetryRequest = true;
      return new Promise(resolve => setTimeout(resolve, 1000))
        .then(() => axiosInstance(error.config));
    }

    return Promise.reject(error);
  }
);

// Log the API URL being used
console.log('API URL:', getBaseURL());

export default axiosInstance;