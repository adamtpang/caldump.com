import axios from 'axios';

// Debug environment variables
console.log('Environment variables:', {
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  BASE_URL: import.meta.env.BASE_URL,
});

// Determine the API URL with fallbacks
const determineApiUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  const productionUrl = 'https://caldumpcom-production.up.railway.app';
  const developmentUrl = 'http://localhost:5000';

  if (envApiUrl) {
    console.log('Using API URL from environment:', envApiUrl);
    return envApiUrl;
  }

  if (import.meta.env.MODE === 'production') {
    console.log('Using production fallback URL:', productionUrl);
    return productionUrl;
  }

  console.log('Using development fallback URL:', developmentUrl);
  return developmentUrl;
};

const apiUrl = determineApiUrl();

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Debug log for each request
    console.log('Making request to:', config.baseURL + config.url, {
      method: config.method,
      params: config.params,
      headers: config.headers,
      mode: import.meta.env.MODE,
    });

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
      baseURL: error.config?.baseURL,
      mode: import.meta.env.MODE
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;