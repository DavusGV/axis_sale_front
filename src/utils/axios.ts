import router from '@/router';
import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL;
console.log('VITE_API_URL cargado en axios.ts:', apiURL); // ¿Es undefined aquí?

const axiosInstance = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


// Interceptor de respuesta: maneja el 401 globalmente
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpia token y otros datos si es necesario
      localStorage.removeItem('token');
      // Redirige al login
      router.push({ name: 'login' }); // O router.push('/login') según tengas tu router
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
