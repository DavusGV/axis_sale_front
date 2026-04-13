import { watch, type Ref } from 'vue'

// key unica donde se guarda el carrito pendiente en localStorage
const STORAGE_KEY = 'axis_carrito_pendiente'

// estructura del contexto que valida a quien pertenece el carrito
interface ContextoCarrito {
  establecimiento_id: number | null
  usuario_id: number | null
}

// estructura completa del objeto guardado en localStorage
interface CarritoGuardado extends ContextoCarrito {
  items: any[]
  updated_at: string
}

/**
 * Mantiene los productos del carrito entre recargas, navegacion entre modulos
 * y cierre de sesion, siempre que el contexto (establecimiento + usuario) coincida
 */
export function useCarritoPersistente(
  carrito: Ref<any[]>,
  obtenerContexto: () => ContextoCarrito
) {

  // compara dos contextos y dice si pertenecen al mismo establecimiento y usuario
  function mismoContexto(guardado: ContextoCarrito, actual: ContextoCarrito): boolean {
    return guardado.establecimiento_id === actual.establecimiento_id
        && guardado.usuario_id === actual.usuario_id
  }

  // intenta restaurar el carrito desde localStorage
  // si el contexto no coincide o el dato esta corrupto, lo descarta
  function restaurarCarrito(): void {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const guardado: CarritoGuardado = JSON.parse(raw)
      const actual = obtenerContexto()

      // si no es del mismo usuario o establecimiento, descartamos
      if (!mismoContexto(guardado, actual)) {
        localStorage.removeItem(STORAGE_KEY)
        return
      }

      // validamos que items sea un array antes de asignar
      if (Array.isArray(guardado.items) && guardado.items.length > 0) {
        carrito.value = guardado.items
      }
    } catch (e) {
      // dato corrupto: limpiamos para no romper la vista
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // serializa el carrito actual y lo guarda en localStorage
  // si el carrito esta vacio, borra la key para no ensuciar el storage
  function guardarCarrito(): void {
    if (!carrito.value.length) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    const ctx = obtenerContexto()

    // si no hay contexto valido, no guardamos
    if (!ctx.establecimiento_id || !ctx.usuario_id) return

    const data: CarritoGuardado = {
      establecimiento_id: ctx.establecimiento_id,
      usuario_id: ctx.usuario_id,
      items: carrito.value,
      updated_at: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // vacia el carrito en memoria y borra la persistencia
  // se usa al completar venta, completar cotizacion o al limpiar manualmente
  function limpiarCarrito(): void {
    carrito.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  // arranca el watch que guarda automaticamente cualquier cambio
  // debe llamarse DESPUES de restaurarCarrito para evitar escrituras innecesarias
  function iniciarPersistencia(): void {
    watch(
      carrito,
      () => {
        guardarCarrito()
      },
      { deep: true }
    )
  }

  return {
    restaurarCarrito,
    guardarCarrito,
    limpiarCarrito,
    iniciarPersistencia,
  }
}