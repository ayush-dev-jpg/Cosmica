// src/services/api.js
// Central Axios instance — all API calls go through this
// Automatically attaches JWT token to every request

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',         
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,           // 30 second timeout
});

// Request interceptor — attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cosmica_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (expired token) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cosmica_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
