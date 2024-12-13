import axios from 'axios';

const isDevelopment = window.location.hostname === 'localhost';
const apiUrl = isDevelopment
  ? 'http://localhost:5000'
  : 'https://caldumpcom-production.up.railway.app';

console.log('Using API URL:', apiUrl, 'isDevelopment:', isDevelopment);

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
axiosInstance.interceptors.request.use(
  async (config) => {
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
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;