<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full transition-all duration-300"
      :class="esCredito ? 'max-w-3xl' : 'max-w-sm'"
    >
      <!-- encabezado -->
      <div class="flex items-center justify-between p-6 border-b dark:border-gray-700">
        <h2 class="font-bold text-lg flex items-center gap-2">
          <i class="fa-solid fa-cash-register"></i>
          Total a Pagar:
          <span class="font-bold text-xl">${{ props.total.toFixed(2) }}</span>
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div class="p-6" :class="esCredito ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''">

        <!-- columna izquierda: datos de pago (siempre visible) -->
        <div class="flex flex-col gap-4">

          <!-- metodo de pago -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Metodo de pago
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fa-solid fa-wallet text-gray-400"></i>
              </span>
              <select
                v-model="metodo_pago"
                class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="credito">Credito</option>
              </select>
            </div>
          </div>

          <!-- anticipo (solo credito) -->
          <div v-if="esCredito">
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Anticipo <span class="text-xs text-gray-400">(opcional)</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fa-solid fa-money-bill-wave text-gray-400"></i>
              </span>
              <input
                v-model.number="anticipo"
                type="number"
                min="0"
                :max="props.total"
                class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- cantidad recibida (solo contado) -->
          <div v-if="!esCredito">
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Cantidad recibida
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fa-solid fa-money-bill-wave text-gray-400"></i>
              </span>
              <input
                ref="inputPago"
                v-model.number="pago"
                type="number"
                min="0"
                class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition"
                placeholder="0.00"
              />
            </div>
            <div v-if="pago >= props.total" class="mt-2 text-green-600 font-bold text-sm">
              Cambio: ${{ (pago - props.total).toFixed(2) }}
            </div>
          </div>

          <!-- resumen credito -->
          <div v-if="esCredito" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm flex flex-col gap-1">
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Total venta:</span>
              <span class="font-medium">${{ props.total.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Interes:</span>
              <span class="font-medium text-orange-500">+${{ interesAplicado.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Anticipo:</span>
              <span class="font-medium text-green-600">-${{ (anticipo || 0).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between border-t dark:border-gray-600 pt-1 mt-1">
              <span class="text-gray-500 dark:text-gray-400">A financiar:</span>
              <span class="font-bold text-blue-600">${{ totalFinanciado.toFixed(2) }}</span>
            </div>
            <div v-if="numPlazos > 0" class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Cuota {{ tipoPlazo }}:</span>
              <span class="font-bold text-green-600">${{ montoCuota.toFixed(2) }}</span>
            </div>
            <div v-if="numPlazos > 0" class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Total a pagar:</span>
              <span class="font-bold">${{ (montoCuota * numPlazos).toFixed(2) }}</span>
            </div>
          </div>

        </div>

        <!-- columna derecha: datos del credito (solo visible en modo credito) -->
        <div v-if="esCredito" class="flex flex-col gap-4">

          <!-- buscador de cliente -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Cliente
            </label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i class="fa-solid fa-user text-gray-400"></i>
                </span>
                <input
                  v-model="searchCliente"
                  type="text"
                  class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                         bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                         focus:ring-1 focus:ring-green-400 transition"
                  placeholder="Buscar cliente..."
                  @input="onBuscarCliente"
                />
                <!-- dropdown resultados -->
                <div
                  v-if="resultadosCliente.length && !clienteSeleccionado"
                  class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200
                         dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                  <div
                    v-for="c in resultadosCliente"
                    :key="c.id"
                    class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                    @click="seleccionarCliente(c)"
                  >
                    <span class="font-medium">{{ c.nombre }} {{ c.apellido_p }}</span>
                    <span class="text-gray-400 ml-2">{{ c.telefono1 }}</span>
                  </div>
                </div>
              </div>
              <!-- boton nuevo cliente -->
              <button
                class="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900
                       text-green-600 dark:text-green-300 hover:bg-green-200 transition"
                title="Registrar nuevo cliente"
                @click="showFormCliente = !showFormCliente"
              >
                <i class="fa-solid fa-user-plus text-sm"></i>
              </button>
            </div>

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
              <button @click="limpiarCliente" class="text-gray-400 hover:text-red-500">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <!-- mini formulario nuevo cliente -->
          <div
            v-if="showFormCliente"
            class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex flex-col gap-2 border dark:border-gray-600"
          >
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nuevo cliente</p>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="nuevoCliente.nombre"
                type="text"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-green-500"
                placeholder="Nombre *"
              />
              <input
                v-model="nuevoCliente.apellido_p"
                type="text"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-green-500"
                placeholder="Apellido paterno *"
              />
              <input
                v-model="nuevoCliente.telefono1"
                type="text"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-green-500"
                placeholder="Telefono *"
              />
              <input
                v-model="nuevoCliente.email"
                type="email"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-green-500"
                placeholder="Email"
              />
            </div>
            <button
              class="btn text-sm justify-center"
              @click="registrarNuevoCliente"
              :disabled="loadingCliente"
            >
              <i class="fa-solid fa-user-plus"></i>
              {{ loadingCliente ? 'Guardando...' : 'Registrar cliente' }}
            </button>
          </div>

          <!-- configuracion del plan -->
          <div class="grid grid-cols-2 gap-3">

            <!-- tipo plazo -->
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de plazo
              </label>
              <select
                v-model="tipoPlazo"
                class="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition text-sm"
              >
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
                <option value="dias">Cada X dias</option>
              </select>
            </div>

            <!-- num plazos -->
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ tipoPlazo === 'dias' ? 'Cada cuantos dias' : 'Numero de plazos' }}
              </label>
              <input
                v-model.number="numPlazos"
                type="number"
                min="1"
                class="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition text-sm"
                placeholder="1"
              />
            </div>

            <!-- tipo interes -->
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de interes
              </label>
              <select
                v-model="interesTipo"
                class="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition text-sm"
              >
                <option value="">Sin interes</option>
                <option value="porcentaje">Porcentaje %</option>
                <option value="monto">Monto fijo $</option>
              </select>
            </div>

            <!-- valor interes -->
            <div v-if="interesTipo">
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ interesTipo === 'porcentaje' ? 'Porcentaje' : 'Monto' }}
              </label>
              <input
                v-model.number="interesValor"
                type="number"
                min="0"
                class="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition text-sm"
                placeholder="0"
              />
            </div>

            <!-- fecha inicio -->
            <div class="col-span-2">
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha inicio del plan
              </label>
              <input
                v-model="fechaInicio"
                type="date"
                class="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition text-sm"
              />
            </div>

          </div>

        </div>
      </div>

      <!-- footer -->
      <div class="flex justify-end gap-2 p-6 border-t dark:border-gray-700">
        <button class="btn-outline flex items-center gap-2" @click="$emit('close')">
          Cancelar
        </button>
        <button class="btn flex items-center gap-2" @click="confirmarVenta" :disabled="loading">
          <i class="fa-solid fa-check"></i>
          {{ loading ? 'Procesando...' : 'Confirmar' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import Swal from 'sweetalert2'
import { buscarClientes, crearCliente } from '@/api/clientes'
import { crearPlanPago } from '@/api/planes_pago'

const props = defineProps(['total'])
const emits = defineEmits(['close', 'confirmar'])

const loading = ref(false)
const pago = ref()
const metodo_pago = ref('efectivo')
const inputPago = ref<HTMLInputElement | null>(null)

// datos credito
const anticipo        = ref(0)
const tipoPlazo       = ref('mensual')
const numPlazos       = ref(1)
const interesTipo     = ref('')
const interesValor    = ref(0)
const fechaInicio     = ref(new Date().toISOString().split('T')[0])

// interfaz del cliente
interface Cliente {
  id: number
  nombre: string
  apellido_p: string
  apellido_m?: string
  telefono1: string
  foto?: string
}
// cliente
const searchCliente       = ref('')
const resultadosCliente = ref<Cliente[]>([])
const clienteSeleccionado = ref<Cliente | null>(null)
const showFormCliente     = ref(false)
const loadingCliente      = ref(false)
const nuevoCliente        = ref({
  nombre: '', apellido_p: '', telefono1: '', email: ''
})

let buscarTimeout: ReturnType<typeof setTimeout> | undefined = undefined

const esCredito = computed(() => metodo_pago.value === 'credito')

// calculo del interes
const interesAplicado = computed(() => {
  if (!interesTipo.value || !interesValor.value) return 0
  if (interesTipo.value === 'porcentaje') {
    return props.total * (interesValor.value / 100)
  }
  return interesValor.value
})

// total a financiar = total venta + interes - anticipo
const totalFinanciado = computed(() => {
  const result = props.total + interesAplicado.value - (anticipo.value || 0)
  return Math.max(result, 0)
})

// cuota redondeada hacia arriba para evitar centavos
const montoCuota = computed(() => {
  if (!numPlazos.value || numPlazos.value <= 0) return 0
  return Math.ceil((totalFinanciado.value / numPlazos.value) * 100) / 100
})

// enfocamos el input al abrir
onMounted(() => {
  nextTick(() => inputPago.value?.focus())
})

// limpiamos interes cuando se quita el tipo
watch(interesTipo, (val) => {
  if (!val) interesValor.value = 0
})

// busqueda de clientes con debounce
function onBuscarCliente() {
  if (clienteSeleccionado.value) return
  clearTimeout(buscarTimeout)
  buscarTimeout = setTimeout(async () => {
    if (!searchCliente.value || searchCliente.value.length < 2) {
      resultadosCliente.value = []
      return
    }
    try {
      const res = await buscarClientes(searchCliente.value)
      resultadosCliente.value = res.data?.clientes ?? []
    } catch {
      resultadosCliente.value = []
    }
  }, 300)
}

function seleccionarCliente(cliente: Cliente) {
  clienteSeleccionado.value = cliente
  searchCliente.value = ''
  resultadosCliente.value = []
  showFormCliente.value = false
}

function limpiarCliente() {
  clienteSeleccionado.value = null
  searchCliente.value = ''
}

async function registrarNuevoCliente() {
  if (!nuevoCliente.value.nombre || !nuevoCliente.value.apellido_p || !nuevoCliente.value.telefono1) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos requeridos',
      text: 'Nombre, apellido paterno y telefono son obligatorios.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  loadingCliente.value = true
  try {
    const data = new FormData()
    Object.entries(nuevoCliente.value).forEach(([k, v]) => {
      if (v) data.append(k, v)
    })

    const res = await crearCliente(data)
    // seleccionamos automaticamente el cliente recien creado
    seleccionarCliente(res.cliente)
    showFormCliente.value = false
    nuevoCliente.value = { nombre: '', apellido_p: '', telefono1: '', email: '' }

    Swal.fire({
      icon: 'success',
      title: 'Cliente registrado',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.response?.data?.message || 'No se pudo registrar el cliente.'
    })
  } finally {
    loadingCliente.value = false
  }
}

async function confirmarVenta() {
  // validaciones contado
  if (!esCredito.value) {
    if (!pago.value || isNaN(pago.value)) {
      Swal.fire({ icon: 'warning', title: 'Monto requerido', text: 'Ingresa el monto recibido.', confirmButtonColor: '#ef4444' })
      return
    }
    if (pago.value < props.total) {
      Swal.fire({ icon: 'error', title: 'Monto insuficiente', text: 'El monto no alcanza para pagar la venta.', confirmButtonColor: '#ef4444' })
      return
    }

    emits('confirmar', {
      pago: pago.value,
      metodo_pago: metodo_pago.value,
      total_final: props.total,
      es_credito: false
    })
    return
  }

  // validaciones credito
  if (!clienteSeleccionado.value) {
    Swal.fire({ icon: 'warning', title: 'Cliente requerido', text: 'Selecciona o registra un cliente para el credito.', confirmButtonColor: '#ef4444' })
    return
  }

  if (!numPlazos.value || numPlazos.value <= 0) {
    Swal.fire({ icon: 'warning', title: 'Plazos requeridos', text: 'Ingresa el numero de plazos.', confirmButtonColor: '#ef4444' })
    return
  }

  if (!fechaInicio.value) {
    Swal.fire({ icon: 'warning', title: 'Fecha requerida', text: 'Selecciona la fecha de inicio del plan.', confirmButtonColor: '#ef4444' })
    return
  }

  emits('confirmar', {
    pago: anticipo.value || 0,
    metodo_pago: metodo_pago.value,
    total_final: props.total,
    es_credito: true,
    credito: {
      cliente_id:    clienteSeleccionado.value.id,
      anticipo:      anticipo.value || 0,
      interes_tipo:  interesTipo.value || null,
      interes_valor: interesValor.value || 0,
      num_plazos:    numPlazos.value,
      tipo_plazo:    tipoPlazo.value,
      fecha_inicio:  fechaInicio.value,
    }
  })
}
</script>