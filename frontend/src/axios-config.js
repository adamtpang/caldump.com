import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

// Debug log to check the API URL
console.log('API URL from env:', apiUrl);

if (!apiUrl) {
  console.warn('No API URL found in environment variables!');
}

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
    console.log('Making request to:', config.baseURL + config.url, {
      method: config.method,
      params: config.params,
      headers: config.headers
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
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;