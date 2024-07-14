import axios from 'axios';
import { handleRefreshToken } from './authServices';

const httpClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await handleRefreshToken();
      const token = localStorage.getItem('accessToken');
      if (token) {
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
      }
      return httpClient(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default httpClient;
