import axios from 'axios';

// API URLs
const PRODUCTION_URL = 'https://caldumpcom-production.up.railway.app';
const DEVELOPMENT_URL = 'http://localhost:5000';

// More robust production check
const isProduction = () => {
  const hostname = window.location.hostname;
  return hostname === 'caldump.com' ||
         hostname === 'www.caldump.com' ||
         hostname.includes('vercel.app');
};

const baseURL = isProduction() ? PRODUCTION_URL : DEVELOPMENT_URL;

console.log('Current hostname:', window.location.hostname);
console.log('Using API URL:', baseURL, 'isProduction:', isProduction());

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});

// Add a request interceptor to add the auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Force reload by adding timestamp
    const timestamp = new Date().getTime();
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}_t=${timestamp}`;

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