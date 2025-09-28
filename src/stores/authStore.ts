import { ref } from 'vue'
import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
  const loading = ref(false)
  const router = useRouter()

  const login = async (email: string, password: string) => {
    loading.value = true
    const payload = {
      email,
      password
    }
    try {
      const response = await axiosInstance.post('login', payload)
      const { token: newToken, user: newUser } = response.data.data
      token.value = newToken
      user.value = newUser
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      loading.value = false
      Swal.fire({
        icon: 'success',
        title: `¡Hola ${user.value.name}!`,
        text: 'Bienvenido a RoomEasy',
        color: '#2E7D32',
        confirmButtonColor: '#2E7D32'
      })
      router.push('/ventas')
    } catch (error) {
      loading.value = false
      if (error.response && error.response.status === 401) {
        Swal.fire({
          icon: 'info',
          title: 'Credenciales incorrectas',
          text: 'Por favor, verifica tu email y contraseña'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: 'Ocurrió un error inesperado. Por favor, intenta nuevamente'
        })
      }
      console.error('Error al iniciar sesión:', error)
    }
  }

  const logout = async () => {
    try {
      await axiosInstance.post('logout', {}, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      token.value = ''
      user.value = {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cerrar sesión',
        text: 'Ocurrió un error inesperado. Por favor, intenta nuevamente'
      })
      console.error('Error al cerrar sesión:', error)
    }
  }

  return { token, user, loading, login, logout }
})