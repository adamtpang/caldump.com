import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://caldumpcom-production.up.railway.app'
    : 'http://localhost:8080',
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
      method: config.method
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
      status: response.status
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });

    // Retry logic for network errors
    if (error.message === 'Network Error' && error.config && !error.config.__isRetryRequest) {
      console.log('Retrying failed request...');
      error.config.__isRetryRequest = true;
      return new Promise(resolve => setTimeout(resolve, 1000))
        .then(() => axiosInstance(error.config));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;