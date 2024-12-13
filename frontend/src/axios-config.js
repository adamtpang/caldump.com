import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

// Debug log to check the API URL
console.log('API URL:', apiUrl);

const axiosInstance = axios.create({
  baseURL: apiUrl || 'https://caldumpcom-production.up.railway.app', // Fallback URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Debug log for each request
    console.log('Making request to:', config.baseURL + config.url);

    const token = localStorage.getItem('caldump_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.config) {
      console.error('Failed request URL:', error.config.baseURL + error.config.url);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;