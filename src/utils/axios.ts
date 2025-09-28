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


export default axiosInstance;
