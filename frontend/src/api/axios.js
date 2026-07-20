import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  // Optimize timeout settings
  timeout: 30000, // 30 seconds timeout
  // Optimize response type
  responseType: 'json',
});

// Request Interceptor - optimize by removing unnecessary operations
api.interceptors.request.use(
  (config) => {
    // Only add timestamp if needed for debugging (disabled in production)
    if (process.env.NODE_ENV === 'development') {
      config.metadata = { startTime: Date.now() };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Log request duration in development for performance monitoring
    if (process.env.NODE_ENV === 'development' && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      if (duration > 1000) {
        console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
      }
    }
    return response;
  },
  (error) => {
    // Ignore 401 errors - let React Router/PrivateRoute handle navigation
    return Promise.reject(error);
  }
);

export default api;