<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

      <!-- encabezado -->
      <div class="flex items-center justify-between p-5 border-b dark:border-gray-700 flex-shrink-0">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-boxes-stacked text-blue-500"></i>
          Comprobar cotizacion — {{ props.cotizacion.folio }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- cuerpo con scroll -->
      <div class="p-5 overflow-y-auto flex-1">

        <!-- cargando -->
        <div v-if="cargando" class="text-center py-8 text-gray-400">
          <i class="fa-solid fa-spinner fa-spin mr-2"></i>
          Comprobando stock...
        </div>

        <template v-else>

          <!-- alerta si hay problemas de stock -->
          <div
            v-if="hayProblemas"
            class="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200
                   dark:border-yellow-700 text-sm text-yellow-700 dark:text-yellow-400"
          >
            <i class="fa-solid fa-triangle-exclamation mr-1"></i>
            Algunos productos tienen stock insuficiente. Ajusta las cantidades o eliminalos.
          </div>

          <!-- sin productos -->
          <div v-if="!items.length" class="text-center py-8 text-gray-400">
            <i class="fa-regular fa-face-sad-tear text-2xl mb-2"></i>
            <p>No hay productos en esta cotizacion.</p>
          </div>

          <!-- buscador de productos -->
          <div class="mb-4 relative">
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Agregar producto
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fa-solid fa-magnifying-glass text-gray-400"></i>
              </span>
              <input
                v-model="busquedaProducto"
                @input="onBuscarProducto"
                type="text"
                placeholder="Buscar producto por nombre o codigo..."
                class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                      bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                      focus:ring-1 focus:ring-green-400 transition text-sm"
                autocomplete="off"
              />
            </div>

            <ul
              v-if="resultadosBusqueda.length"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200
                    dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              <li
                v-for="prod in resultadosBusqueda"
                :key="prod.id"
                @click="agregarProductoNuevo(prod)"
                class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                      flex justify-between items-center text-sm"
              >
                <span class="text-gray-800 dark:text-white">{{ prod.nombre }}</span>
                <span class="text-xs text-gray-400">
                  ${{ Number(prod.precio_venta).toFixed(2) }}
                  <span v-if="!prod.es_servicio"> · Stock: {{ prod.stock }}</span>
                </span>
              </li>
            </ul>

            <p v-if="buscando" class="text-xs text-gray-400 mt-1">
              <i class="fa-solid fa-spinner fa-spin mr-1"></i> Buscando...
            </p>
          </div>
          <!-- lista de productos -->
          <div class="flex flex-col gap-3">
            <div
              v-for="item in items"
              :key="item.cotizacion_detalle_id"
              :class="[
                'rounded-lg border p-4 transition',
                item.problema
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
              ]"
            >
              <!-- fila principal: nombre + precio + acciones -->
              <div class="flex items-start gap-3">

                <!-- info del producto -->
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 dark:text-white truncate">{{ item.nombre }}</p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span v-if="item.es_servicio">
                      <i class="fa-solid fa-wrench mr-1"></i>Servicio
                    </span>
                    <span v-else>
                      <i class="fa-solid fa-box mr-1"></i>Stock: {{ item.stock_disponible ?? 0 }}
                    </span>
                    <span>
                      Precio: ${{ Number(item.precio).toFixed(2) }}
                    </span>
                  </div>

                  <!-- mensaje de error -->
                  <p v-if="item.mensaje" class="text-xs text-red-500 mt-1">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ item.mensaje }}
                  </p>

                  <!-- descuento aplicado -->
                  <p v-if="item.descuento_aplicado > 0" class="text-xs text-green-600 dark:text-green-400 mt-1">
                    <i class="fa-solid fa-tag mr-1"></i>
                    Desc:
                    <span v-if="item.tipo_descuento === 'porcentaje'">{{ item.descuento }}%</span>
                    <span v-else>${{ Number(item.descuento).toFixed(2) }}/u</span>
                    (-${{ Number(item.descuento_aplicado).toFixed(2) }})
                  </p>
                </div>

                <!-- subtotal -->
                <div class="text-right flex-shrink-0">
                  <p v-if="item.descuento_aplicado > 0" class="text-xs line-through text-gray-400">
                    ${{ (item.precio * item.cantidad).toFixed(2) }}
                  </p>
                  <p class="font-bold text-gray-800 dark:text-white">
                    ${{ subtotalItem(item).toFixed(2) }}
                  </p>
                </div>
              </div>

              <!-- fila de controles -->
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">

                <!-- controles de cantidad -->
                <div class="flex items-center gap-1">
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full
                           bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200
                           hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                    @click="restarCantidad(item)"
                  >
                    <i class="fa-solid fa-minus text-xs"></i>
                  </button>

                  <input
                    v-model.number="item.cantidad"
                    type="number"
                    min="0"
                    :max="item.es_servicio ? 9999 : (item.stock_disponible ?? 0)"
                    class="w-14 text-center px-1 py-1 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                    @change="validarCantidad(item)"
                  />

                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full
                           bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200
                           hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                    @click="sumarCantidad(item)"
                  >
                    <i class="fa-solid fa-plus text-xs"></i>
                  </button>
                </div>

                <!-- botones de accion -->
                <div class="flex items-center gap-1">

                  <!-- editar precio (solo servicios) -->
                  <button
                    v-if="item.es_servicio"
                    class="w-8 h-8 flex items-center justify-center rounded-full
                           bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300
                           hover:bg-purple-200 dark:hover:bg-purple-800 transition"
                    title="Cambiar precio"
                    @click="abrirEditarPrecio(item)"
                  >
                    <i class="fa-solid fa-dollar-sign text-xs"></i>
                  </button>

                  <!-- editar descuento -->
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full
                           bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300
                           hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                    title="Editar descuento"
                    @click="abrirDescuento(item)"
                  >
                    <i class="fa-solid fa-tag text-xs"></i>
                  </button>

                  <!-- eliminar -->
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full
                           bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300
                           hover:bg-red-200 dark:hover:bg-red-800 transition"
                    title="Eliminar producto"
                    @click="eliminarProducto(item)"
                  >
                    <i class="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- resumen -->
          <div v-if="items.length" class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span>Subtotal:</span>
              <span>${{ calcularSubtotal().toFixed(2) }}</span>
            </div>
            <div v-if="calcularDescuentoTotal() > 0" class="flex justify-between text-sm text-green-600 mb-1">
              <span>Descuentos:</span>
              <span>-${{ calcularDescuentoTotal().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg text-gray-800 dark:text-white pt-2 border-t border-gray-300 dark:border-gray-600">
              <span>Total:</span>
              <span>${{ calcularTotal().toFixed(2) }}</span>
            </div>
          </div>

          <!-- indicador de cambios pendientes -->
          <div
            v-if="hayCambios"
            class="mt-3 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200
                   dark:border-orange-700 text-sm text-orange-600 dark:text-orange-400 text-center"
          >
            <i class="fa-solid fa-pen mr-1"></i>
            Hay cambios sin guardar en la cotizacion.
          </div>

        </template>
      </div>

      <!-- footer -->
      <div class="flex gap-3 p-5 border-t dark:border-gray-700 flex-shrink-0">
        <button
          class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200
                 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium
                 flex items-center justify-center gap-2"
          @click="$emit('close')"
        >
          Cancelar
        </button>

        <!-- guardar cambios -->
        <button
          v-if="!cargando && hayCambios"
          class="flex-1 px-4 py-2 rounded-lg border border-orange-500
                 bg-orange-500 text-white hover:bg-orange-600 transition text-sm font-medium
                 disabled:opacity-50 flex items-center justify-center gap-2"
          :disabled="guardando"
          @click="guardarCambios"
        >
          <i class="fa-solid fa-floppy-disk"></i>
          {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
        </button>

        <!-- proceder a pagar -->
        <button
          v-if="!cargando && items.length"
          class="flex-1 px-4 py-2 rounded-lg border border-blue-600
                 bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium
                 disabled:opacity-50 flex items-center justify-center gap-2"
          :disabled="hayCambios"
          @click="abrirPago"
        >
          <i class="fa-solid fa-cart-shopping"></i>
          Proceder a pagar
        </button>
      </div>

    </div>
  </div>

  <!-- modal de pago -->
  <ModalPago
    v-if="showModalPago"
    :total="calcularTotal()"
    @close="showModalPago = false"
    @confirmar="confirmarVenta"
  />

  <!-- modal descuento producto -->
  <ModalDescuentoProducto
    v-if="showModalDescuento && itemDescuento"
    :key="itemDescuento.producto_id"
    :item="itemDescuento"
    @close="showModalDescuento = false"
    @confirmar="aplicarDescuento"
  />

  <!-- modal precio servicio -->
  <ModalPrecioServicio
    v-if="showModalPrecio && itemPrecio"
    :producto="itemPrecio"
    @close="showModalPrecio = false"
    @confirmar="aplicarPrecio"
  />

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ModalPago from '@/components/ventas/ModalPago.vue'
import ModalDescuentoProducto from '@/components/ventas/ModalDescuentoProducto.vue'
import ModalPrecioServicio from '@/components/ventas/ModalPrecioServicio.vue'
import { comprobarStockCotizacion, convertirCotizacion, actualizarDetallesCotizacion } from '@/api/cotizaciones'
import { fetchTicket, fetchProducts } from '@/api/ventas'
import Swal from 'sweetalert2'

interface ItemComprobar {
  cotizacion_detalle_id: number
  producto_id:           number
  nombre:                string
  cantidad:              number
  cantidad_original:     number
  precio:                number
  precio_original:       number
  precio_compra:         number
  stock_disponible:      number | null
  es_servicio:           boolean
  problema:              boolean
  mensaje:               string | null
  tipo_descuento:        string | null
  descuento:             number
  descuento_aplicado:    number
}

const props = defineProps<{
  cotizacion: any
}>()

const emit = defineEmits(['close', 'vendido'])

const items          = ref<ItemComprobar[]>([])
const hayProblemas   = ref(false)
const cargando       = ref(true)
const guardando      = ref(false)
const showModalPago  = ref(false)

// modales de edicion
const showModalDescuento = ref(false)
const itemDescuento      = ref<any>(null)
const showModalPrecio    = ref(false)
const itemPrecio         = ref<any>(null)
const busquedaProducto = ref('')
const resultadosBusqueda = ref<any[]>([])
const buscando = ref(false)
let timeoutBusqueda: ReturnType<typeof setTimeout> | null = null

// detecta si hay cambios respecto al estado original
const hayCambios = computed(() => {
  return items.value.some(item => {
    return item.cantidad !== item.cantidad_original
      || item.precio !== item.precio_original
      || item.descuento !== (item as any)._descuento_original
      || item.tipo_descuento !== (item as any)._tipo_descuento_original
  }) || (items.value.length !== (itemsOriginalCount.value ?? 0))
})

const itemsOriginalCount = ref(0)

onMounted(async () => {
  await comprobar()
})

async function comprobar() {
  cargando.value = true
  try {
    const res = await comprobarStockCotizacion(props.cotizacion.id)
    hayProblemas.value = res.data.hay_problemas

    // armamos los items con los datos completos desde los detalles de la cotizacion
    items.value = res.data.productos.map((p: any) => {
      // buscamos el detalle original para tomar precio, descuento, etc
      const detalle = props.cotizacion.detalles?.find(
        (d: any) => d.id === p.cotizacion_detalle_id
      )

      const cantidad = p.problema && p.stock_disponible !== null && p.stock_disponible > 0
        ? p.stock_disponible
        : (p.problema && (p.stock_disponible === 0 || !p.producto_id) ? 0 : p.cantidad_cotizada)

      const item: any = {
        cotizacion_detalle_id: p.cotizacion_detalle_id,
        producto_id:           p.producto_id,
        nombre:                p.nombre,
        cantidad:              cantidad,
        cantidad_original:     cantidad,
        precio:                detalle?.precio ?? 0,
        precio_original:       detalle?.precio ?? 0,
        precio_compra:         detalle?.precio_compra ?? 0,
        stock_disponible:      p.stock_disponible,
        es_servicio:           p.es_servicio,
        problema:              p.problema,
        mensaje:               p.mensaje,
        tipo_descuento:        detalle?.tipo_descuento ?? null,
        descuento:             detalle?.descuento ?? 0,
        descuento_aplicado:    detalle?.descuento_aplicado ?? 0,
      }

      // guardamos los originales para detectar cambios
      item._descuento_original      = item.descuento
      item._tipo_descuento_original = item.tipo_descuento

      return item
    })

    itemsOriginalCount.value = items.value.length

  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo comprobar el stock.' })
    emit('close')
  } finally {
    cargando.value = false
  }
}

function onBuscarProducto() {
  if (timeoutBusqueda) clearTimeout(timeoutBusqueda)

  if (busquedaProducto.value.length < 2) {
    resultadosBusqueda.value = []
    return
  }

  timeoutBusqueda = setTimeout(async () => {
    buscando.value = true
    try {
      const res = await fetchProducts({ page: 1, search: busquedaProducto.value })
      const idsEnLista = items.value.map(i => i.producto_id)
      resultadosBusqueda.value = res.data.filter(
        (p: any) => !idsEnLista.includes(p.id)
      )
    } catch {
      resultadosBusqueda.value = []
    } finally {
      buscando.value = false
    }
  }, 300)
}

function agregarProductoNuevo(producto: any) {
  // validamos stock si no es servicio
  if (!producto.es_servicio && (producto.stock ?? 0) < 1) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin stock',
      text: `El producto "${producto.nombre}" no tiene stock disponible.`,
      confirmButtonColor: '#ef4444'
    })
    busquedaProducto.value = ''
    resultadosBusqueda.value = []
    return
  }

  const item: any = {
    cotizacion_detalle_id: 0,
    producto_id:           producto.id,
    nombre:                producto.nombre,
    cantidad:              1,
    cantidad_original:     0,
    precio:                producto.precio_venta,
    precio_original:       producto.precio_venta,
    precio_compra:         producto.precio_compra,
    stock_disponible:      producto.stock ?? null,
    es_servicio:           producto.es_servicio ?? false,
    problema:              false,
    mensaje:               null,
    tipo_descuento:        null,
    descuento:             0,
    descuento_aplicado:    0,
  }

  item._descuento_original = 0
  item._tipo_descuento_original = null

  items.value.push(item)
  busquedaProducto.value = ''
  resultadosBusqueda.value = []
}

// calcula el subtotal de un item con descuento
function subtotalItem(item: ItemComprobar): number {
  const bruto = item.precio * item.cantidad
  return bruto - calcularDescuentoItem(item)
}

// calcula el descuento de un item segun su tipo
function calcularDescuentoItem(item: ItemComprobar): number {
  if (!item.descuento) return 0
  if (item.tipo_descuento === 'porcentaje') {
    return (item.precio * item.cantidad) * (item.descuento / 100)
  }
  return item.descuento * item.cantidad
}

function calcularSubtotal(): number {
  return items.value.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
}

function calcularDescuentoTotal(): number {
  return items.value.reduce((acc, item) => acc + calcularDescuentoItem(item), 0)
}

function calcularTotal(): number {
  return items.value.reduce((acc, item) => acc + subtotalItem(item), 0)
}

// controles de cantidad
function sumarCantidad(item: ItemComprobar) {
  if (!item.es_servicio && item.stock_disponible !== null && item.cantidad >= item.stock_disponible) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock insuficiente',
      text: `Solo hay ${item.stock_disponible} unidades disponibles.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
    return
  }
  item.cantidad++
  recalcularDescuento(item)
}

function restarCantidad(item: ItemComprobar) {
  if (item.cantidad > 1) {
    item.cantidad--
    recalcularDescuento(item)
  }
}

function validarCantidad(item: ItemComprobar) {
  if (item.cantidad < 0) item.cantidad = 0
  if (!item.es_servicio && item.stock_disponible !== null && item.cantidad > item.stock_disponible) {
    item.cantidad = item.stock_disponible
  }
  recalcularDescuento(item)
}

// recalcula el descuento_aplicado cuando cambia la cantidad
function recalcularDescuento(item: ItemComprobar) {
  item.descuento_aplicado = calcularDescuentoItem(item)
}

function eliminarProducto(item: ItemComprobar) {
  Swal.fire({
    icon: 'warning',
    title: 'Eliminar producto',
    text: `¿Quitar "${item.nombre}" de la cotización?`,
    showCancelButton: true,
    confirmButtonText: 'Si, quitar',
    cancelButtonText: 'No',
    confirmButtonColor: '#ef4444',
  }).then(result => {
    if (result.isConfirmed) {
      items.value = items.value.filter(i => i.cotizacion_detalle_id !== item.cotizacion_detalle_id)
    }
  })
}

// abrir modal descuento
function abrirDescuento(item: ItemComprobar) {
  itemDescuento.value = {
    producto_id:    item.producto_id,
    nombre:         item.nombre,
    precio:         item.precio,
    cantidad:       item.cantidad,
    tipo_descuento: item.tipo_descuento ?? 'porcentaje',
    descuento:      item.descuento,
  }
  showModalDescuento.value = true
}

function aplicarDescuento({ tipo_descuento, descuento, descuento_aplicado }: any) {
  const item = items.value.find(i => i.producto_id === itemDescuento.value?.producto_id)
  if (!item) return

  item.tipo_descuento     = tipo_descuento
  item.descuento          = descuento
  item.descuento_aplicado = descuento_aplicado

  showModalDescuento.value = false
  itemDescuento.value      = null
}

// abrir modal precio servicio
function abrirEditarPrecio(item: ItemComprobar) {
  itemPrecio.value = {
    id:     item.producto_id,
    nombre: item.nombre,
  }
  showModalPrecio.value = true
}

function aplicarPrecio(productoConPrecio: any) {
  const item = items.value.find(i => i.producto_id === productoConPrecio.id)
  if (!item) return

  item.precio = productoConPrecio.precio_venta
  recalcularDescuento(item)

  showModalPrecio.value = false
  itemPrecio.value      = null
}

// guardar cambios en la cotizacion sin proceder a pagar
async function guardarCambios() {
  const itemsValidos = items.value.filter(i => i.cantidad > 0)

  if (!itemsValidos.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin productos',
      text: 'La cotización debe tener al menos un producto.'
    })
    return
  }
  
  // validamos stock de los items antes de guardar
  const sinStock = itemsValidos.find(i => !i.es_servicio && i.stock_disponible !== null && i.cantidad > i.stock_disponible)
  if (sinStock) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock insuficiente',
      text: `"${sinStock.nombre}" tiene solo ${sinStock.stock_disponible} unidades disponibles.`,
      confirmButtonColor: '#ef4444'
    })
    return
  }

  guardando.value = true
  try {
    const detalles = itemsValidos.map(item => ({
      cotizacion_detalle_id: item.cotizacion_detalle_id,
      producto_id:           item.producto_id,
      cantidad:              item.cantidad,
      precio:                item.precio,
      tipo_descuento:        item.tipo_descuento,
      descuento:             item.descuento,
      descuento_aplicado:    calcularDescuentoItem(item),
    }))

    await actualizarDetallesCotizacion(props.cotizacion.id, { detalles })

    // actualizamos los originales para que hayCambios vuelva a false
    items.value.forEach(item => {
      item.cantidad_original       = item.cantidad
      item.precio_original         = item.precio;
      (item as any)._descuento_original      = item.descuento;
      (item as any)._tipo_descuento_original = item.tipo_descuento
    })
    itemsOriginalCount.value = items.value.length

    // eliminamos los que quedaron en 0
    items.value = items.value.filter(i => i.cantidad > 0)

    Swal.fire({
      icon: 'success',
      title: 'Cotización actualizada',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })

    // notificamos al padre para que recargue la tabla
    emit('vendido')

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

function abrirPago() {
  if (hayCambios.value) {
    Swal.fire({
      icon: 'info',
      title: 'Cambios sin guardar',
      text: 'Guarda los cambios antes de proceder al pago.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500
    })
    return
  }

  const paraVender = items.value.filter(i => i.cantidad > 0)
  if (!paraVender.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin productos',
      text: 'No hay productos disponibles para convertir en venta.'
    })
    return
  }

  showModalPago.value = true
}

async function confirmarVenta({ pago, metodo_pago, metodo_pago_id, total_final, es_credito, credito }: any) {
  const user       = JSON.parse(localStorage.getItem('user') || '{}')
  const usuario_id = user.id

  const detalles = items.value
    .filter(i => i.cantidad > 0)
    .map(item => ({
      producto_id:        item.producto_id,
      cantidad:           item.cantidad,
      precio:             item.precio,
      precio_compra:      item.precio_compra,
      subtotal:           item.precio * item.cantidad,
      tipo_descuento:     item.tipo_descuento ?? null,
      descuento:          item.descuento ?? 0,
      descuento_aplicado: calcularDescuentoItem(item),
    }))

  const ventaData = {
    usuario_id,
    total: detalles.reduce((acc, d) => acc + d.subtotal, 0),
    total_final,
    pago,
    cambio: es_credito ? 0 : pago - total_final,
    metodo_pago,
    metodo_pago_id,
    detalles,
  }

  try {
    Swal.fire({
      title: 'Convirtiendo cotización...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
    })

    const resultado = await convertirCotizacion(props.cotizacion.id, ventaData)

    // cargamos el ticket de la venta recien generada
    const ticketRes = await fetchTicket(resultado.data.venta.id)

    Swal.close()
    showModalPago.value = false

    // emitimos el ticket para que el padre lo muestre
    emit('vendido', ticketRes.ticket)
    emit('close')

  } catch (e: any) {
    Swal.close()
    const mensaje = e?.response?.data?.message || 'No se pudo convertir la cotización.'
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje })
  }
}
</script>