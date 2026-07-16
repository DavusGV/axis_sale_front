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

          <!-- cliente de la venta -->
          <div class="mb-4 relative">
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Cliente
              <span v-if="props.venta.es_credito" class="text-xs text-red-400 font-normal">*requerido</span>
              <span v-else class="text-xs text-gray-400 font-normal">(opcional)</span>
            </label>

            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fa-solid fa-user text-gray-400"></i>
              </span>
              <input
                v-model="busquedaCliente"
                @input="onBuscarCliente"
                type="text"
                placeholder="Buscar cliente por nombre..."
                class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                      bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                      focus:ring-1 focus:ring-green-400 transition text-sm"
                autocomplete="off"
              />

              <!-- dropdown de resultados -->
              <ul
                v-if="resultadosClientes.length"
                class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200
                      dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                <li
                  v-for="cli in resultadosClientes"
                  :key="cli.id"
                  @click="seleccionarCliente(cli)"
                  class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm flex justify-between items-center"
                >
                  <span class="font-medium text-gray-800 dark:text-white">{{ cli.nombre }} {{ cli.apellido_p }}</span>
                  <span class="text-xs text-gray-400">{{ cli.telefono1 }}</span>
                </li>
              </ul>
            </div>

            <p v-if="buscandoCliente" class="text-xs text-gray-400 mt-1">
              <i class="fa-solid fa-spinner fa-spin mr-1"></i> Buscando...
            </p>

            <!-- cliente seleccionado -->
            <div
              v-if="clienteSeleccionado"
              class="mt-2 flex items-center justify-between bg-green-50 dark:bg-green-900/30
                    border border-green-200 dark:border-green-700 rounded-lg px-3 py-2 text-sm"
            >
              <span class="font-medium text-green-700 dark:text-green-300">
                <i class="fa-solid fa-circle-check mr-1"></i>
                {{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido_p }}
              </span>
              <button @click="quitarCliente" type="button" class="text-gray-400 hover:text-red-500" title="Quitar cliente">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <!-- panel de ajuste de anticipo solo en ventas a credito -->
          <div v-if="props.venta.es_credito" class="mb-4 p-4 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10">

            <div class="flex items-start gap-3">
              <input
                id="ajustar-anticipo-check"
                v-model="ajustarAnticipo"
                type="checkbox"
                class="mt-1 cursor-pointer"
              />
              <label for="ajustar-anticipo-check" class="cursor-pointer text-sm">
                <span class="font-semibold text-gray-800 dark:text-white block">
                  Ajustar anticipo del crédito
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                  Marcar solo si se devolvió o recibió dinero adicional del cliente.
                  Esto modifica el anticipo registrado y el dinero en caja de esta venta.
                </span>
              </label>
            </div>

            <div v-if="ajustarAnticipo" class="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">

              <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span>Anticipo actual:</span>
                <span class="font-semibold">${{ Number(anticipoActual).toFixed(2) }}</span>
              </div>

              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Nuevo anticipo
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i class="fa-solid fa-money-bill-wave text-gray-400"></i>
                </span>
                <input
                  v-model.number="nuevoAnticipo"
                  type="number"
                  min="0"
                  step="0.01"
                  class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500
                        focus:ring-1 focus:ring-blue-400 transition text-sm"
                  placeholder="0.00"
                />
              </div>

              <div v-if="diferenciaAnticipo !== 0" class="mt-2 text-xs"
                  :class="diferenciaAnticipo < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                <i class="fa-solid" :class="diferenciaAnticipo < 0 ? 'fa-arrow-down' : 'fa-arrow-up'"></i>
                {{ diferenciaAnticipo < 0
                  ? `Se devolverán $${Math.abs(diferenciaAnticipo).toFixed(2)} al cliente`
                  : `Se recibirán $${diferenciaAnticipo.toFixed(2)} adicionales del cliente` }}
              </div>
            </div>
          </div>

          <!-- alerta de inconsistencias detectadas con opcion a resincronizar -->
          <div
            v-if="inconsistencias"
            class="mb-4 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10"
          >
            <div class="flex items-start gap-3">
              <i class="fa-solid fa-triangle-exclamation text-yellow-500 mt-1"></i>
              <div class="flex-1">
                <p class="font-semibold text-yellow-700 dark:text-yellow-400 text-sm mb-2">
                  Inconsistencias detectadas en este crédito
                </p>
                <ul class="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 list-disc pl-4">
                  <li v-for="(issue, idx) in inconsistencias" :key="idx">{{ issue }}</li>
                </ul>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-3">
                  Puedes corregir esto sin editar productos: marca "Ajustar anticipo" arriba,
                  coloca el valor correcto y presiona "Resincronizar crédito".
                </p>
                <button
                  class="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-500 hover:bg-yellow-600
                        text-white transition flex items-center gap-2"
                  @click="resincronizar"
                  :disabled="resincronizando"
                >
                  <i class="fa-solid" :class="resincronizando ? 'fa-spinner fa-spin' : 'fa-rotate'"></i>
                  {{ resincronizando ? 'Resincronizando...' : 'Resincronizar crédito' }}
                </button>
              </div>
            </div>
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

            <!-- resultados de busqueda -->
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
import { actualizarMetodoPago, actualizarDetallesVenta, getMetodosPago, fetchProducts, resincronizarCredito, actualizarClienteVenta } from '@/api/ventas'
import { buscarClientes } from '@/api/clientes'
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
const busquedaProducto = ref('')
const resultadosBusqueda = ref<any[]>([])
const buscando = ref(false)

// ajuste de anticipo (solo en ventas a credito)
const ajustarAnticipo = ref(false)
const nuevoAnticipo   = ref(0)
const anticipoActual  = ref(0)

// cliente de la venta
const clienteId           = ref<number | null>(null)
const clienteOriginalId   = ref<number | null>(null)
const clienteSeleccionado = ref<any | null>(null)
const busquedaCliente     = ref('')
const resultadosClientes  = ref<any[]>([])
const buscandoCliente     = ref(false)
let timeoutCliente: ReturnType<typeof setTimeout> | null = null

const diferenciaAnticipo = computed(() => {
  if (!ajustarAnticipo.value) return 0
  return Number(nuevoAnticipo.value || 0) - Number(anticipoActual.value || 0)
})
const resincronizando = ref(false)

let timeoutBusqueda: ReturnType<typeof setTimeout> | null = null

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
      // filtramos los que ya estan en el carrito
      const idsEnCarrito = items.value.map(i => i.producto_id)
      resultadosBusqueda.value = res.data.filter(
        (p: any) => !idsEnCarrito.includes(p.id)
      )
    } catch {
      resultadosBusqueda.value = []
    } finally {
      buscando.value = false
    }
  }, 300)
}

const hayCambios = computed(() => {
  if (metodoPagoId.value !== metodoPagoOriginalId.value) return true
  if (items.value.length !== itemsOriginalCount.value) return true
  if (items.value.some(item => item.detalle_id === 0)) return true
  if (items.value.some(item => item.cantidad !== item.cantidad_original)) return true
  // tambien marca cambio si el anticipo fue ajustado
  if (ajustarAnticipo.value && diferenciaAnticipo.value !== 0) return true
  if (clienteId.value !== clienteOriginalId.value) return true
  return false
})

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

  items.value.push({
    detalle_id:         0,
    producto_id:        producto.id,
    nombre:             producto.nombre,
    cantidad:           1,
    cantidad_original:  0,
    precio:             producto.precio_venta,
    precio_compra:      producto.precio_compra,
    es_servicio:        producto.es_servicio ?? false,
    stock_disponible:   producto.stock ?? null,
    tipo_descuento:     null,
    descuento:          0,
    descuento_aplicado: 0,
  })

  // limpiamos la busqueda
  busquedaProducto.value = ''
  resultadosBusqueda.value = []
}

function onBuscarCliente() {
  if (timeoutCliente) clearTimeout(timeoutCliente)

  const q = busquedaCliente.value.trim()
  if (q.length < 2) {
    resultadosClientes.value = []
    return
  }

  timeoutCliente = setTimeout(async () => {
    buscandoCliente.value = true
    try {
      const body = await buscarClientes(q)
      // mismo shape que usa el modal de venta: body.data.clientes
      resultadosClientes.value = body?.data?.clientes ?? body?.clientes ?? []
    } catch {
      resultadosClientes.value = []
    } finally {
      buscandoCliente.value = false
    }
  }, 300)
}

function seleccionarCliente(cli: any) {
  clienteId.value           = cli.id
  clienteSeleccionado.value = cli
  busquedaCliente.value     = ''
  resultadosClientes.value  = []
}

function quitarCliente() {
  // una venta a credito debe conservar cliente
  if (props.venta.es_credito) {
    Swal.fire({
      icon: 'info',
      title: 'No permitido',
      text: 'Una venta a crédito debe tener un cliente asignado.',
      confirmButtonColor: '#3b82f6',
    })
    return
  }
  clienteId.value           = null
  clienteSeleccionado.value = null
  busquedaCliente.value     = ''
  resultadosClientes.value  = []
}

onMounted(async () => {
  await cargarDatos()
})

async function cargarDatos() {
  cargando.value = true
  try {
    // cargamos metodos de pago
    const metRes = await getMetodosPago()
    metodosPago.value = metRes.data ?? []

    // usamos los detalles que ya vienen en el prop venta
    const metodoActual = metodosPago.value.find(
      (m: any) => Number(m.id) === Number(props.venta.metodo_pago_id)
    ) ?? metodosPago.value.find(
      (m: any) => m.nombre.toLowerCase() === (props.venta.metodo_pago ?? '').toLowerCase()
    )
    metodoPagoId.value         = metodoActual?.id ?? metodosPago.value[0]?.id ?? null
    metodoPagoNombre.value     = metodoActual?.nombre ?? props.venta.metodo_pago ?? ''
    metodoPagoOriginalId.value = metodoPagoId.value

    // armamos los items desde los detalles del prop
    items.value = (props.venta.detalles ?? []).map((d: any) => ({
      detalle_id:         d.detalle_id,
      producto_id:        d.producto_id,
      nombre:             d.nombre,
      cantidad:           d.cantidad,
      cantidad_original:  d.cantidad,
      precio:             d.precio,
      precio_compra:      d.precio_compra,
      es_servicio:        d.es_servicio,
      stock_disponible:   d.stock_disponible,
      tipo_descuento:     d.tipo_descuento,
      descuento:          d.descuento,
      descuento_aplicado: d.descuento_aplicado,
    }))

    // prefijamos el cliente actual de la venta
    clienteId.value         = props.venta.cliente_id ?? null
    clienteOriginalId.value = props.venta.cliente_id ?? null
    // si la venta ya trae cliente lo mostramos como seleccionado (el nombre viene del historial)
    clienteSeleccionado.value = props.venta.cliente_id
      ? { id: props.venta.cliente_id, nombre: props.venta.cliente ?? '', apellido_p: '' }
      : null
    busquedaCliente.value   = ''

    itemsOriginalCount.value = items.value.length

    // si es credito leemos el anticipo actual del plan
    if (props.venta.es_credito) {
      // anticipo viene desde el endpoint de venta: ajusta el campo segun como lo expongas
      // tomamos primero del prop si esta, si no quedara en 0 hasta que el operador lo edite
      anticipoActual.value = Number(props.venta.anticipo ?? props.venta.pago ?? 0)
      nuevoAnticipo.value  = anticipoActual.value
    }

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

// inconsistencias detectadas al abrir el modal
const inconsistencias = computed(() => {
  if (!props.venta.es_credito) return null

  const total       = Number(props.venta.total ?? 0)
  const pago        = Number(props.venta.pago ?? 0)
  const anticipo    = Number(props.venta.anticipo ?? 0)
  const totalAPagar = Number(props.venta.total_a_pagar ?? total)

  // Suma real de los detalles del prop
  const totalDetalles = (props.venta.detalles ?? []).reduce((acc: number, d: any) => {
    const bruto = Number(d.precio) * Number(d.cantidad)
    const desc  = Number(d.descuento_aplicado ?? 0)
    return acc + bruto - desc
  }, 0)

  const issues: string[] = []

  // Total de la venta no coincide con lo que suman los productos
  if (Math.abs(total - totalDetalles) > 0.01) {
    issues.push(
      `El total guardado ($${total.toFixed(2)}) no coincide con la suma de los productos ($${totalDetalles.toFixed(2)}). La resincronización corregirá el total.`
    )
  }

  // Pago en caja diferente al anticipo del plan
  if (Math.abs(pago - anticipo) > 0.01) {
    issues.push(
      `El dinero en caja ($${pago.toFixed(2)}) no coincide con el anticipo del crédito ($${anticipo.toFixed(2)}).`
    )
  }

  // Total del plan diferente al total de la venta (solo si el total ya es correcto)
  if (Math.abs(total - totalDetalles) <= 0.01 && Math.abs(totalAPagar - total) > 0.01) {
    issues.push(
      `El total a pagar del crédito ($${totalAPagar.toFixed(2)}) no coincide con el total de la venta ($${total.toFixed(2)}).`
    )
  }

  return issues.length ? issues : null
})

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

async function resincronizar() {
  const confirm = await Swal.fire({
    icon: 'warning',
    title: 'Resincronizar crédito',
    html: `
      <div class="text-left text-sm">
        <p>Esta acción recalculará el plan de pago basándose en:</p>
        <ul class="mt-2 mb-2" style="list-style: disc; padding-left: 20px;">
          <li>El total actual de la venta</li>
          <li>${ajustarAnticipo.value ? `El nuevo anticipo: <b>$${nuevoAnticipo.value.toFixed(2)}</b>` : `El anticipo actual: <b>$${anticipoActual.value.toFixed(2)}</b>`}</li>
          <li>Los abonos ya registrados (no se modifican)</li>
        </ul>
        <b>¿Continuar?</b>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Sí, resincronizar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#eab308',
    cancelButtonColor: '#6b7280',
  })

  if (!confirm.isConfirmed) return

  resincronizando.value = true
  try {
    const payload: any = {}
    if (ajustarAnticipo.value) {
      payload.anticipo_ajustado = nuevoAnticipo.value
    }

    const respuesta   = await resincronizarCredito(props.venta.id, payload)
    const planResumen = respuesta?.data?.plan_pago
    const totalCorregido = respuesta?.data?.total_corregido
    const totalReal      = respuesta?.data?.total_real

    let mensajeExtra = ''

    if (totalCorregido) {
      mensajeExtra += `<p class="mb-2 text-orange-600 dark:text-orange-400"><b>Total corregido:</b> $${Number(totalReal).toFixed(2)}</p>`
    }

    mensajeExtra += `Nuevo saldo: <b>$${Number(planResumen.saldo_pendiente).toFixed(2)}</b>`

    if (planResumen.anticipo_cambio) {
      mensajeExtra += `<br>Anticipo: $${Number(planResumen.anticipo).toFixed(2)}`
    }
    if (planResumen.saldo_a_favor > 0) {
      mensajeExtra += `<br><br><b class="text-orange-500">Saldo a favor: $${Number(planResumen.saldo_a_favor).toFixed(2)}</b><br>Gestionar con soporte.`
    }
    if (planResumen.estado === 'liquidado') {
      mensajeExtra += '<br><br><b class="text-green-500">El plan quedó liquidado.</b>'
    }

    await Swal.fire({
      icon: 'success',
      title: 'Crédito resincronizado',
      html: mensajeExtra,
      confirmButtonColor: '#10b981',
    })

    emit('actualizado')
    emit('close')

  } catch (e: any) {
    if (e?.response?.data?.requiere_soporte) {
      const data = e.response.data
      Swal.fire({
        icon: 'error',
        title: 'Requiere soporte',
        html: `<p>${data.message}</p>`,
        confirmButtonColor: '#ef4444',
      })
      return
    }
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.response?.data?.data || e?.response?.data?.message || e?.message || 'No se pudo resincronizar el crédito.'
    })
  } finally {
    resincronizando.value = false
  }
}

async function guardarCambios() {
  if (!items.value.length) {
    Swal.fire({ icon: 'warning', title: 'Sin productos', text: 'La venta debe tener al menos un producto.' })
    return
  }

  // validamos stock de productos nuevos antes de guardar
  const sinStock = items.value.find(i => !i.es_servicio && i.detalle_id === 0 && i.stock_disponible !== null && i.cantidad > i.stock_disponible)
  if (sinStock) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock insuficiente',
      text: `"${sinStock.nombre}" tiene solo ${sinStock.stock_disponible} unidades disponibles.`,
      confirmButtonColor: '#ef4444'
    })
    return
  }

  // si esta ajustando anticipo validamos que sea coherente
  if (props.venta.es_credito && ajustarAnticipo.value) {
    if (nuevoAnticipo.value < 0) {
      Swal.fire({ icon: 'warning', title: 'Anticipo invalido', text: 'El anticipo no puede ser negativo.' })
      return
    }
    if (nuevoAnticipo.value > calcularTotal()) {
      Swal.fire({
        icon: 'warning',
        title: 'Anticipo excede el total',
        text: `El anticipo ($${nuevoAnticipo.value.toFixed(2)}) no puede ser mayor al total de la venta ($${calcularTotal().toFixed(2)}). Si cubre todo, deja de ser credito.`,
        confirmButtonColor: '#ef4444'
      })
      return
    }
  }

  // detectamos que cambios reales hay para decidir si se recalcula el credito
  const detallesCambiaron = items.value.some(i => i.cantidad !== i.cantidad_original)
    || items.value.length !== itemsOriginalCount.value
  const anticipoCambio = ajustarAnticipo.value && diferenciaAnticipo.value !== 0

  // solo confirmamos el recalculo si cambian productos o anticipo
  // cambiar solo el cliente o el metodo de pago no altera el saldo del credito
  if (props.venta.es_credito && (detallesCambiaron || anticipoCambio)) {
    const totalActual = props.venta.total
    const totalNuevo  = calcularTotal()
    const diferencia  = totalActual - totalNuevo
    const cambioTexto = diferencia > 0
      ? `Total venta: bajará en <b>$${diferencia.toFixed(2)}</b>`
      : (diferencia < 0
          ? `Total venta: subirá en <b>$${Math.abs(diferencia).toFixed(2)}</b>`
          : 'Total venta: sin cambios')

    let textoAnticipo = ''
    if (ajustarAnticipo.value && diferenciaAnticipo.value !== 0) {
      textoAnticipo = diferenciaAnticipo.value < 0
        ? `<br>Anticipo: bajará a <b>$${nuevoAnticipo.value.toFixed(2)}</b> (devolución de $${Math.abs(diferenciaAnticipo.value).toFixed(2)})`
        : `<br>Anticipo: subirá a <b>$${nuevoAnticipo.value.toFixed(2)}</b> (entrega adicional de $${diferenciaAnticipo.value.toFixed(2)})`
    } else {
      textoAnticipo = `<br>Anticipo: se mantiene en <b>$${anticipoActual.value.toFixed(2)}</b>`
    }

    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'Editar venta a crédito',
      html: `
        <div class="text-left text-sm">
          <p>${cambioTexto}${textoAnticipo}</p>
          <ul class="mt-3 mb-2" style="list-style: disc; padding-left: 20px;">
            <li>Se recalculará el saldo del crédito.</li>
            <li>Los abonos ya registrados <b>no se editan</b>.</li>
            <li>Si los abonos cubren el nuevo total, el plan se liquida.</li>
            <li>Si los abonos exceden el nuevo total, la edición se bloqueará y requerirá soporte.</li>
          </ul>
        </div>
        <b>¿Continuar?</b>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
    })

    if (!confirm.isConfirmed) return
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

    // si cambio el cliente lo actualizamos (agregar, cambiar o quitar)
    if (clienteId.value !== clienteOriginalId.value) {
      await actualizarClienteVenta(props.venta.id, { cliente_id: clienteId.value })
    }

    if (detallesCambiaron || anticipoCambio) {
      const detalles = items.value.map(item => ({
        detalle_id:         item.detalle_id,
        producto_id:        item.producto_id,
        cantidad:           item.cantidad,
        precio:             item.precio,
        tipo_descuento:     item.tipo_descuento,
        descuento:          item.descuento,
        descuento_aplicado: item.descuento_aplicado,
      }))

      const payload: any = { detalles }
      if (props.venta.es_credito) {
        payload.confirmar_edicion_credito = true
        // solo enviamos anticipo si el operador lo marco para ajuste
        if (ajustarAnticipo.value) {
          payload.anticipo_ajustado = nuevoAnticipo.value
        }
      }

      const respuesta = await actualizarDetallesVenta(props.venta.id, payload)

      const planResumen = respuesta?.data?.plan_pago
      if (planResumen) {
        let mensajeExtra = `Nuevo saldo: <b>$${Number(planResumen.saldo_pendiente).toFixed(2)}</b>`

        if (planResumen.anticipo_cambio) {
          mensajeExtra += `<br>Anticipo actualizado: $${Number(planResumen.anticipo).toFixed(2)}`
        }

        if (planResumen.saldo_a_favor > 0) {
          mensajeExtra += `<br><br><b class="text-orange-500">Saldo a favor del cliente: $${Number(planResumen.saldo_a_favor).toFixed(2)}</b><br>Gestionar devolución con soporte.`
        }
        if (planResumen.estado === 'liquidado') {
          mensajeExtra += '<br><br><b class="text-green-500">El plan quedó liquidado.</b>'
        }

        await Swal.fire({
          icon: 'success',
          title: 'Venta y crédito actualizados',
          html: mensajeExtra,
          confirmButtonColor: '#10b981',
        })

        emit('actualizado')
        emit('close')
        return
      }
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
    // caso especial: el backend bloqueo por exceso de abonos
    if (e?.response?.data?.requiere_soporte) {
      const data = e.response.data
      Swal.fire({
        icon: 'error',
        title: 'Requiere intervención de soporte',
        html: `
          <p class="mb-3">${data.message}</p>
          <div class="text-left text-sm bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2">
            <div><b>Total abonado:</b> $${Number(data.total_abonado).toFixed(2)}</div>
            <div><b>Nuevo total a pagar:</b> $${Number(data.nuevo_total).toFixed(2)}</div>
            <div class="text-red-500 mt-1"><b>Excedente:</b> $${Number(data.excedente).toFixed(2)}</div>
          </div>
          <p class="mt-3 text-sm">Contacta a soporte para gestionar la devolución del excedente al cliente.</p>
        `,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Entendido',
      })
      return
    }

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