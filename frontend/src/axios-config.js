import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;
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
    // Never override the baseURL
    if (config.baseURL !== API_URL) {
      config.baseURL = API_URL;
    }

    const token = localStorage.getItem('caldump_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('Making request to:', config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
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
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_URL };