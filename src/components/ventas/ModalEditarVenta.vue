<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

      <!-- encabezado -->
      <div class="flex items-center justify-between p-5 border-b dark:border-gray-700 flex-shrink-0">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-pen text-orange-500"></i>
          Editar venta — {{ props.venta.folio }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- body -->
      <div class="p-5 overflow-y-auto flex-1">

        <div v-if="cargando" class="text-center py-8 text-gray-400">
          <i class="fa-solid fa-spinner fa-spin mr-2"></i> Cargando datos...
        </div>

        <template v-else>

          <!-- metodo de pago -->
          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Metodo de pago
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fa-solid fa-wallet text-gray-400"></i>
              </span>
              <select
                v-model="metodoPagoId"
                @change="onCambioMetodo"
                class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition text-sm"
              >
                <option v-for="m in metodosPago" :key="m.id" :value="m.id">
                  {{ m.nombre }}
                </option>
              </select>
            </div>
          </div>

          <!-- productos -->
          <div class="flex flex-col gap-3">
            <div
              v-for="item in items"
              :key="item.detalle_id"
              class="rounded-lg border border-gray-200 dark:border-gray-600
                     bg-gray-50 dark:bg-gray-700/30 p-4"
            >
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 dark:text-white truncate">{{ item.nombre }}</p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>Precio: ${{ Number(item.precio).toFixed(2) }}</span>
                    <span v-if="!item.es_servicio">Stock: {{ item.stock_disponible }}</span>
                    <span v-else><i class="fa-solid fa-wrench mr-1"></i>Servicio</span>
                  </div>
                  <p v-if="item.descuento_aplicado > 0" class="text-xs text-green-600 dark:text-green-400 mt-1">
                    Desc:
                    <span v-if="item.tipo_descuento === 'porcentaje'">{{ item.descuento }}%</span>
                    <span v-else>${{ Number(item.descuento).toFixed(2) }}/u</span>
                    (-${{ Number(item.descuento_aplicado).toFixed(2) }})
                  </p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="font-bold text-gray-800 dark:text-white">
                    ${{ subtotalItem(item).toFixed(2) }}
                  </p>
                </div>
              </div>

              <!-- controles -->
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div class="flex items-center gap-1">
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full
                           bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 transition"
                    @click="restarCantidad(item)"
                  >
                    <i class="fa-solid fa-minus text-xs"></i>
                  </button>
                  <input
                    v-model.number="item.cantidad"
                    type="number"
                    min="1"
                    class="w-14 text-center px-1 py-1 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-sm"
                    @change="validarCantidad(item)"
                  />
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full
                           bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 transition"
                    @click="sumarCantidad(item)"
                  >
                    <i class="fa-solid fa-plus text-xs"></i>
                  </button>
                </div>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full
                         bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300
                         hover:bg-red-200 transition"
                  @click="eliminarProducto(item)"
                >
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- totales -->
          <div v-if="items.length" class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div class="flex justify-between font-bold text-lg text-gray-800 dark:text-white">
              <span>Total:</span>
              <span>${{ calcularTotal().toFixed(2) }}</span>
            </div>
          </div>

          <!-- indicador de cambios -->
          <div
            v-if="hayCambios"
            class="mt-3 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200
                   dark:border-orange-700 text-sm text-orange-600 dark:text-orange-400 text-center"
          >
            <i class="fa-solid fa-pen mr-1"></i>
            Hay cambios sin guardar.
          </div>

        </template>
      </div>

      <!-- footer -->
      <div class="flex gap-3 p-5 border-t dark:border-gray-700 flex-shrink-0">
        <button
          class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200
                 hover:bg-gray-200 transition text-sm font-medium flex items-center justify-center gap-2"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          v-if="hayCambios"
          class="flex-1 px-4 py-2 rounded-lg border border-orange-500
                 bg-orange-500 text-white hover:bg-orange-600 transition text-sm font-medium
                 disabled:opacity-50 flex items-center justify-center gap-2"
          :disabled="guardando"
          @click="guardarCambios"
        >
          <i class="fa-solid fa-floppy-disk"></i>
          {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchTicket, actualizarMetodoPago, actualizarDetallesVenta, getMetodosPago } from '@/api/ventas'
import Swal from 'sweetalert2'

interface ItemEditar {
  detalle_id:         number
  producto_id:        number
  nombre:             string
  cantidad:           number
  cantidad_original:  number
  precio:             number
  precio_compra:      number
  es_servicio:        boolean
  stock_disponible:   number | null
  tipo_descuento:     string | null
  descuento:          number
  descuento_aplicado: number
}

const props = defineProps<{ venta: any }>()
const emit  = defineEmits(['close', 'actualizado'])

const items       = ref<ItemEditar[]>([])
const cargando    = ref(true)
const guardando   = ref(false)
const metodosPago = ref<any[]>([])
const metodoPagoId      = ref<number | null>(null)
const metodoPagoNombre  = ref('')
const metodoPagoOriginalId = ref<number | null>(null)
const itemsOriginalCount   = ref(0)

const hayCambios = computed(() => {
  if (metodoPagoId.value !== metodoPagoOriginalId.value) return true
  if (items.value.length !== itemsOriginalCount.value) return true
  return items.value.some(item => item.cantidad !== item.cantidad_original)
})

onMounted(async () => {
  await cargarDatos()
})

async function cargarDatos() {
  cargando.value = true
  try {
    // cargamos metodos de pago
    const metRes = await getMetodosPago()
    metodosPago.value = metRes.data ?? []

    // cargamos el ticket completo para obtener los detalles
    const ticketRes = await fetchTicket(props.venta.id)
    const ticket    = ticketRes.ticket

    // buscamos el metodo de pago actual
    const metodoActual = metodosPago.value.find(
      (m: any) => m.nombre.toLowerCase() === (ticket.metodo_pago ?? '').toLowerCase()
    )
    metodoPagoId.value         = metodoActual?.id ?? metodosPago.value[0]?.id ?? null
    metodoPagoNombre.value     = metodoActual?.nombre ?? ticket.metodo_pago ?? ''
    metodoPagoOriginalId.value = metodoPagoId.value

    // armamos los items editables desde los productos del ticket
    // necesitamos los detalle_id, que no vienen en el ticket
    // hacemos una peticion extra o los obtenemos del historial
    // por simplicidad usamos los datos del ticket y el indice
    // NOTA: necesitamos los ids de venta_detalles
    // los obtenemos directamente del response del ticket que tiene los productos
    // pero no trae detalle_id, asi que lo agregamos al backend

    // Por ahora usamos los datos disponibles
    items.value = ticket.productos.map((p: any, idx: number) => ({
      detalle_id:         p.detalle_id ?? idx, // se necesita agregar al backend
      producto_id:        p.producto_id ?? 0,
      nombre:             p.nombre,
      cantidad:           p.cantidad,
      cantidad_original:  p.cantidad,
      precio:             p.precio_unitario,
      precio_compra:      p.precio_compra ?? 0,
      es_servicio:        p.es_servicio ?? false,
      stock_disponible:   p.stock_disponible ?? null,
      tipo_descuento:     p.tipo_descuento,
      descuento:          p.descuento,
      descuento_aplicado: p.descuento_aplicado,
    }))

    itemsOriginalCount.value = items.value.length

  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los datos.' })
    emit('close')
  } finally {
    cargando.value = false
  }
}

function onCambioMetodo() {
  const metodo = metodosPago.value.find((m: any) => m.id === metodoPagoId.value)
  if (metodo) metodoPagoNombre.value = metodo.nombre
}

function subtotalItem(item: ItemEditar): number {
  const bruto = item.precio * item.cantidad
  let desc    = 0
  if (item.tipo_descuento === 'porcentaje') {
    desc = bruto * (item.descuento / 100)
  } else if (item.tipo_descuento === 'monto') {
    desc = item.descuento * item.cantidad
  }
  return bruto - desc
}

function calcularTotal(): number {
  return items.value.reduce((acc, item) => acc + subtotalItem(item), 0)
}

function sumarCantidad(item: ItemEditar) {
  if (!item.es_servicio && item.stock_disponible !== null) {
    const maxPermitido = item.stock_disponible + item.cantidad_original
    if (item.cantidad >= maxPermitido) {
      Swal.fire({
        icon: 'warning', title: 'Stock insuficiente',
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000
      })
      return
    }
  }
  item.cantidad++
  recalcularDescuento(item)
}

function restarCantidad(item: ItemEditar) {
  if (item.cantidad > 1) {
    item.cantidad--
    recalcularDescuento(item)
  }
}

function validarCantidad(item: ItemEditar) {
  if (item.cantidad < 1) item.cantidad = 1
  recalcularDescuento(item)
}

function recalcularDescuento(item: ItemEditar) {
  if (item.tipo_descuento === 'porcentaje') {
    item.descuento_aplicado = (item.precio * item.cantidad) * (item.descuento / 100)
  } else if (item.tipo_descuento === 'monto') {
    item.descuento_aplicado = item.descuento * item.cantidad
  }
}

function eliminarProducto(item: ItemEditar) {
  Swal.fire({
    icon: 'warning',
    title: 'Quitar producto',
    text: `¿Quitar "${item.nombre}" de la venta?`,
    showCancelButton: true,
    confirmButtonText: 'Sí, quitar',
    cancelButtonText: 'No',
    confirmButtonColor: '#ef4444',
  }).then(result => {
    if (result.isConfirmed) {
      items.value = items.value.filter(i => i.detalle_id !== item.detalle_id)
    }
  })
}

async function guardarCambios() {
  if (!items.value.length) {
    Swal.fire({ icon: 'warning', title: 'Sin productos', text: 'La venta debe tener al menos un producto.' })
    return
  }

  guardando.value = true
  try {
    // si cambio el metodo de pago lo actualizamos primero
    if (metodoPagoId.value !== metodoPagoOriginalId.value) {
      await actualizarMetodoPago(props.venta.id, {
        metodo_pago:    metodoPagoNombre.value,
        metodo_pago_id: metodoPagoId.value,
      })
    }

    // si cambiaron los detalles los actualizamos
    const detallesCambiaron = items.value.some(i => i.cantidad !== i.cantidad_original)
      || items.value.length !== itemsOriginalCount.value

    if (detallesCambiaron) {
      const detalles = items.value.map(item => ({
        detalle_id:         item.detalle_id,
        cantidad:           item.cantidad,
        precio:             item.precio,
        tipo_descuento:     item.tipo_descuento,
        descuento:          item.descuento,
        descuento_aplicado: item.descuento_aplicado,
      }))

      await actualizarDetallesVenta(props.venta.id, { detalles })
    }

    Swal.fire({
      icon: 'success',
      title: 'Venta actualizada',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })

    emit('actualizado')
    emit('close')

  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.response?.data?.message || 'No se pudieron guardar los cambios.'
    })
  } finally {
    guardando.value = false
  }
}
</script>