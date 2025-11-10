import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8002',
    headers: {
        'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // TypeScript sẽ kiểm tra xem 'headers' có tồn tại không
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;