import router from '@/router';
import axios from 'axios';
import { useSuscripcionStore } from '@/stores/suscripcionStore';

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
    const establishmentActive = localStorage.getItem('establishmentActive')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // Agregar el encabezado personalizado si establishmentActive existe
    if (establishmentActive) {
      config.headers['X-Establishment-ID'] = JSON.parse(establishmentActive)
    }
    return config
  },
  (error) => Promise.reject(error)
)


// Interceptor de respuesta: maneja el 401 y el 402 globalmente
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 402 con este codigo significa suscripcion bloqueada, se manda a la
    // pantalla de acceso limitado sin cerrar la sesion del usuario
    if (error.response && error.response.status === 402 &&
        error.response.data?.code === 'SUSCRIPCION_BLOQUEADA') {
      const suscripcionStore = useSuscripcionStore()
      suscripcionStore.marcarBloqueado(error.response.data?.data ?? {})

      if (router.currentRoute.value.name !== 'acceso-limitado') {
        router.push({ name: 'acceso-limitado' })
      }

      return Promise.reject(error)
    }

    if (error.response && error.response.status === 401) {
      // Limpia token y otros datos si es necesario
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('establishments');
      localStorage.removeItem('establishmentActive');
      // Redirige al login
      router.push({ name: 'login' }); // O router.push('/login') según tengas tu router
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
