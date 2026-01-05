import { ref, watch  } from 'vue'
import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { es } from '@faker-js/faker'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
  const establishments = ref(JSON.parse(localStorage.getItem('establishments') || '[]'))
  const establishmentActive = ref<number | null>(JSON.parse(localStorage.getItem('establishmentActive') || 'null'))
  const loading = ref(false)
  const router = useRouter()

  const login = async (email: string, password: string) => {
    loading.value = true
    const payload = { email, password}
    try {
      const response = await axiosInstance.post('login', payload)
      const { token: newToken, user: newUser, establishment: newEstablishment } = response.data.data
      token.value = newToken
      user.value = newUser
      establishments.value = newEstablishment
      //se selecciona el primer etablecimiento asignado por defecto
      establishmentActive.value = newEstablishment.length? newEstablishment[0].id: null


      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      localStorage.setItem('establishments', JSON.stringify(newEstablishment))
      localStorage.setItem('establishmentActive', JSON.stringify(establishmentActive.value))
      
      // si no tiene establecimiento asignado hacr un logout de sesion
      if (!newEstablishment || newEstablishment.length === 0) {

        loading.value = false

        Swal.fire({
          icon: 'warning',
          title: 'Usuario sin Establecimiento.',
          text: 'Es Necesario Contactar al Proveedor.',
          confirmButtonColor: '#8e210cff'
        })
         // Limpiar estado y sesión
          token.value = ''
          user.value = {}
          establishments.value = []
          establishmentActive.value = null

          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('establishments')
          localStorage.removeItem('establishmentActive')

          router.push('/login')

        return
      }
      // si el usuarios tiene establecimoento asignado manda a ventas
      establishmentActive.value = newEstablishment[0].id
        localStorage.setItem('establishmentActive',JSON.stringify(establishmentActive.value))
        loading.value = false

        Swal.fire({
          icon: 'success',
          title: `¡Hola ${newUser.name}!`,
          text: 'Bienvenido de nuevo',
          color: '#2E7D32',
          confirmButtonColor: '#2E7D32'
        })
        router.push('/ventas/ventas')

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

  // Sincroniza el establecimiento activo con localStorage 
  // para que Axios lo envíe en cada request (X-Establishment-ID)
  watch(establishmentActive, (val) => {
    if (val !== null) {
      localStorage.setItem('establishmentActive', JSON.stringify(val))
    }
  })


  return { token, user, establishments, establishmentActive, loading, login, logout }
})