import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

import axiosInstance from '@/utils/axios'
import Swal from 'sweetalert2'
import { decodePermissions } from '@/utils/permissions/decoderPermission'

export const useAuthStore = defineStore('auth', () => {

  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
  const roles = ref(JSON.parse(localStorage.getItem('roles') || '[]'))

  const establishments = ref(JSON.parse(localStorage.getItem('establishments') || '[]'))
  const establishmentActive = ref<number | null>(
    JSON.parse(localStorage.getItem('establishmentActive') || 'null')
  )
  const permissions = ref(new Set())
  const loading = ref(false)
  const router = useRouter()

  
  const decoder = (rolesData: any[]) => {
    roles.value = rolesData
    permissions.value = new Set(decodePermissions(rolesData))
  }

  const clearSession = () => {
    token.value = ''
    user.value = {}
    roles.value = []
    permissions.value = new Set()
    establishments.value = []
    establishmentActive.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('roles')
    localStorage.removeItem('establishments')
    localStorage.removeItem('establishmentActive')
  }


  // Inicializar permisos al recargar la página
  decoder(roles.value)


  const login = async (email: string, password: string) => {
    loading.value = true

    try {
      const response = await axiosInstance.post('login', { email, password })

      const {
        token: newToken,
        user: newUser,
        establishment: newEstablishment,
        roles: newRoles
      } = response.data.data


      // validar que el usuario tenga al menos un establecimiento asignado
      if (!newEstablishment || newEstablishment.length === 0) {

        loading.value = false

        Swal.fire({
          icon: 'warning',
          title: 'Usuario sin Establecimiento.',
          text: 'Es Necesario Contactar al Proveedor.',
          confirmButtonColor: '#8e210cff'
        })

        clearSession()
        router.push('/login')
        return
      }

      token.value = newToken
      user.value = newUser
      establishments.value = newEstablishment
      establishmentActive.value = newEstablishment[0].id
      // Decodificar permisos y actualizar el store
      decoder(newRoles || [])
      
      // guardar en localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      localStorage.setItem('roles', JSON.stringify(newRoles || []))
      localStorage.setItem('establishments', JSON.stringify(newEstablishment))
      localStorage.setItem('establishmentActive', JSON.stringify(establishmentActive.value))

      loading.value = false

      Swal.fire({
        icon: 'success',
        title: `¡Hola ${newUser.name}!`,
        text: 'Bienvenido de nuevo',
        color: '#2E7D32',
        confirmButtonColor: '#2E7D32'
      })

      router.push('/ventas/ventas')

    } catch (error: any) {

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
    } catch (error: any) {
      console.error('Error al cerrar sesion en el servidor:', error)
    } finally {
      clearSession()
      router.push('/login')
    }
  }

 
  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get('perfil')
      const updatedUser = res.data.data.user

      user.value = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (e) {
      console.error('Error al refrescar usuario:', e)
    }
  }

  //watcher para sincronizar el establecimiento activo con localStorage

  watch(establishmentActive, (val) => {
    if (val !== null) {
      localStorage.setItem('establishmentActive', JSON.stringify(val))
    }
  })


  return {
    token,
    user,
    roles,
    permissions,
    establishments,
    establishmentActive,
    loading,
    login,
    logout,
    refreshUser
  }
})