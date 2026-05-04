import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // your Django backend
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access"); // check your key name
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;