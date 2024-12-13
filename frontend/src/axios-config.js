import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  // Use Railway URL directly
  baseURL: 'https://caldumpcom-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
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

    console.log('Making request to:', config.url);
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
      data: response.data
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
    return Promise.reject(error);
  }
);

export default axiosInstance;