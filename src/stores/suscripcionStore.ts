import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchEstadoSuscripcion } from '@/api/suscripcion'

export type EstadoSuscripcion = 'libre' | 'al_dia' | 'por_vencer' | 'vencido' | 'bloqueado'

export interface DatosSuscripcion {
  tiene_suscripcion: boolean
  estado: EstadoSuscripcion
  bloqueado: boolean
  mostrar_aviso: boolean
  suscripcion_id?: number
  monto?: string
  ciclo_pago?: string
  ciclo_meses?: number
  fecha_proximo_pago?: string
  fecha_limite?: string
  dias_restantes?: number
  dias_gracia?: number
}

export const useSuscripcionStore = defineStore('suscripcion', () => {
  const datos = ref<DatosSuscripcion | null>(null)
  const loading = ref(false)
  // permite ocultar la ventana de aviso solo durante la sesion actual
  const avisoDescartado = ref(false)

  const bloqueado = computed(() => datos.value?.bloqueado === true)
  const mostrarAviso = computed(() => datos.value?.mostrar_aviso === true && !avisoDescartado.value)
  const estado = computed<EstadoSuscripcion>(() => datos.value?.estado ?? 'libre')
  const diasRestantes = computed(() => datos.value?.dias_restantes ?? 0)

  // consulta el estado del establecimiento activo, se llama al iniciar sesion
  // y cada vez que se cambia de establecimiento
  const cargarEstado = async () => {
    loading.value = true
    try {
      const res = await fetchEstadoSuscripcion()
      datos.value = res.data
      avisoDescartado.value = false
    } catch (e) {
      // si falla la consulta no se restringe nada desde el front, el middleware
      // del backend es el que realmente limita el acceso
      datos.value = null
      console.error('Error al obtener el estado de la suscripcion:', e)
    } finally {
      loading.value = false
    }
  }

  // marca el bloqueo cuando el backend responde 402 en medio de la sesion
  const marcarBloqueado = (info: Partial<DatosSuscripcion> = {}) => {
    datos.value = {
      tiene_suscripcion: true,
      mostrar_aviso: false,
      ...(datos.value ?? {}),
      ...info,
      estado: 'bloqueado',
      bloqueado: true,
    }
  }

  const descartarAviso = () => {
    avisoDescartado.value = true
  }

  const limpiar = () => {
    datos.value = null
    avisoDescartado.value = false
  }

  return {
    datos,
    loading,
    avisoDescartado,
    bloqueado,
    mostrarAviso,
    estado,
    diasRestantes,
    cargarEstado,
    marcarBloqueado,
    descartarAviso,
    limpiar,
  }
})