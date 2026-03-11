<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl">

      <!-- encabezado -->
      <div class="flex items-center justify-between p-5 border-b dark:border-gray-700">
        <h2 class="font-bold text-lg flex items-center gap-2">
          <i class="fa-solid fa-hand-holding-dollar"></i>
          {{ pasoActual === 1 ? 'Buscar Cliente' : pasoActual === 2 ? 'Seleccionar Adeudo' : 'Registrar Abono' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- indicador de pasos -->
      <div class="flex items-center justify-center gap-2 px-5 pt-4">
        <div
          v-for="paso in 3"
          :key="paso"
          :class="[
            'h-2 rounded-full transition-all duration-300',
            pasoActual >= paso ? 'bg-green-500 w-10' : 'bg-gray-200 dark:bg-gray-600 w-6'
          ]"
        />
      </div>

      <div class="p-5">

        <!-- PASO 1: buscar cliente -->
        <div v-if="pasoActual === 1">
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre o telefono del cliente
          </label>
          <div class="relative">
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
              autofocus
            />
          </div>

          <!-- resultados -->
          <div v-if="loadingClientes" class="mt-4 text-center text-gray-400 text-sm">
            Buscando...
          </div>

          <div v-else-if="resultadosClientes.length" class="mt-3 flex flex-col gap-2">
            <p class="text-xs text-gray-400 uppercase font-medium">Clientes encontrados</p>
            <div
              v-for="c in resultadosClientes"
              :key="c.id"
              class="flex items-center justify-between p-3 rounded-lg border border-gray-200
                     dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
              @click="seleccionarCliente(c)"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <i class="fa-solid fa-user text-gray-400 text-sm"></i>
                </div>
                <div>
                  <p class="font-medium text-gray-800 dark:text-gray-100">
                    {{ c.nombre }} {{ c.apellido_p }}
                  </p>
                  <p class="text-xs text-gray-400">{{ c.telefono1 }}</p>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
            </div>
          </div>

          <div v-else-if="searchCliente.length >= 2 && !loadingClientes" class="mt-4 text-center text-gray-400 text-sm">
            No se encontraron clientes
          </div>
        </div>

        <!-- PASO 2: planes del cliente -->
        <div v-else-if="pasoActual === 2">

          <!-- info del cliente seleccionado -->
          <div class="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <i class="fa-solid fa-user text-green-600 dark:text-green-300 text-sm"></i>
            </div>
            <div>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ clienteSeleccionado?.nombre }} {{ clienteSeleccionado?.apellido_p }}
              </p>
              <p class="text-xs text-gray-400">{{ clienteSeleccionado?.telefono1 }}</p>
            </div>
            <button @click="volverPaso1" class="ml-auto text-xs text-gray-400 hover:text-gray-600">
              Cambiar
            </button>
          </div>

          <div v-if="loadingPlanes" class="text-center text-gray-400 py-6 text-sm">
            Cargando adeudos...
          </div>

          <div v-else-if="!planesCliente.length" class="text-center text-gray-400 py-6">
            <i class="fa-solid fa-circle-check text-green-500 text-2xl mb-2"></i>
            <p>Este cliente no tiene adeudos activos</p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <p class="text-xs text-gray-400 uppercase font-medium">Adeudos activos</p>
            <div
              v-for="plan in planesCliente"
              :key="plan.id"
              class="p-3 rounded-lg border border-gray-200 dark:border-gray-600
                     hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
              @click="seleccionarPlan(plan)"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium text-gray-800 dark:text-gray-100">
                    Venta #{{ plan.venta?.id }}
                    <span :class="['ml-2 px-2 py-0.5 rounded-full text-xs capitalize', etiquetaEstado(plan.estado)]">
                      {{ plan.estado }}
                    </span>
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ etiquetaPlazo(plan.num_plazos, plan.tipo_plazo) }} · Cuota ${{ Math.floor(Number(plan.total_financiado) / Number(plan.num_plazos)).toFixed(2) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-orange-500 text-lg">
                    ${{ Number(plan.saldo_pendiente).toFixed(2) }}
                  </p>
                  <p class="text-xs text-gray-400">saldo pendiente</p>
                </div>
              </div>
              <!-- barra progreso mini -->
              <div class="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <div
                  class="bg-green-500 h-1.5 rounded-full"
                  :style="{ width: porcentajePagadoPlan(plan) + '%' }"
                />
              </div>
              <p class="text-xs text-gray-400 mt-1">
                Proximo pago: {{ formatFecha(plan.fecha_proximo_pago) }}
              </p>
            </div>
          </div>

        </div>

        <!-- PASO 3: registrar abono -->
        <div v-else-if="pasoActual === 3 && planSeleccionado">

          <!-- resumen del plan -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm flex flex-col gap-1.5">
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Venta:</span>
              <span class="font-medium">#{{ planSeleccionado.venta?.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Saldo pendiente:</span>
              <span class="font-bold text-orange-500">${{ Number(planSeleccionado.saldo_pendiente).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Cuota sugerida:</span>
              <span class="font-medium text-green-600">${{ Math.floor(Number(planSeleccionado.total_financiado) / Number(planSeleccionado.num_plazos)).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Proximo pago:</span>
              <span class="font-medium text-blue-600">{{ formatFecha(planSeleccionado.fecha_proximo_pago) }}</span>
            </div>
          </div>

          <!-- monto -->
          <div class="mb-3">
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto del abono
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fa-solid fa-money-bill-wave text-gray-400"></i>
              </span>
              <input
                v-model.number="montoAbono"
                type="number"
                min="0.01"
                step="0.01"
                :max="planSeleccionado.saldo_pendiente"
                class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                       focus:ring-1 focus:ring-green-400 transition"
                placeholder="0.00"
              />
            </div>
            <!-- alerta si excede saldo -->
            <p v-if="montoAbono && montoAbono > Number(planSeleccionado.saldo_pendiente)"
               class="text-xs text-red-500 mt-1 font-medium">
              El monto no puede superar el saldo pendiente (${{ Number(planSeleccionado.saldo_pendiente).toFixed(2) }}).
            </p>
          </div>

          <!-- metodo pago -->
          <div class="mb-3">
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Metodo de pago
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fa-solid fa-wallet text-gray-400"></i>
              </span>
              <select
                :value="metodoPagoId"
                @change="onMetodoPagoChange(Number(($event.target as HTMLSelectElement).value))"
                class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                      bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                      focus:ring-1 focus:ring-green-400 transition"
              >
                <option v-for="m in metodosPago" :key="m.id" :value="m.id">
                  {{ m.nombre }}
                </option>
              </select>
            </div>
          </div>

          <!-- notas -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Notas <span class="text-xs text-gray-400">(opcional)</span>
            </label>
            <textarea
              v-model="notas"
              rows="2"
              class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                     bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                     focus:ring-1 focus:ring-green-400 transition resize-none text-sm"
              placeholder="Observaciones del abono..."
            />
          </div>

        </div>

      </div>

      <!-- footer -->
      <div class="flex items-center justify-between gap-2 p-5 border-t dark:border-gray-700">
        <button
          v-if="pasoActual > 1"
          class="btn-outline flex items-center gap-2"
          @click="retroceder"
        >
          <i class="fa-solid fa-arrow-left"></i>
          Atras
        </button>
        <div v-else />

        <button
          v-if="pasoActual === 3"
          class="btn flex items-center gap-2"
          @click="confirmarAbono"
          :disabled="loadingAbono || !montoValido"
        >
          <i class="fa-solid fa-check"></i>
          {{ loadingAbono ? 'Guardando...' : 'Confirmar abono' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import { buscarClientes } from '@/api/clientes'
import { fetchPlanesPorCliente, registrarAbono } from '@/api/planes_pago'
import { getMetodosPago } from '@/api/ventas'

interface Cliente {
  id: number
  nombre: string
  apellido_p: string
  telefono1: string
}

interface PlanPago {
  id: number
  venta: { id: number }
  total_venta: number
  total_financiado: number
  saldo_pendiente: number
  monto_cuota: number
  num_plazos: number
  tipo_plazo: string
  fecha_proximo_pago: string
  estado: string
}

const emits = defineEmits(['close', 'abonado'])

// control de pasos
const pasoActual = ref(1)

// paso 1
const searchCliente = ref('')
const resultadosClientes = ref<Cliente[]>([])
const loadingClientes = ref(false)
const clienteSeleccionado = ref<Cliente | null>(null)
let buscarTimeout: ReturnType<typeof setTimeout> | undefined = undefined

// paso 2
const planesCliente = ref<PlanPago[]>([])
const loadingPlanes = ref(false)
const planSeleccionado = ref<PlanPago | null>(null)

// paso 3
const montoAbono = ref<number | undefined>(undefined)
const metodoPago = ref<string>('')
const metodosPago   = ref<{ id: number; nombre: string }[]>([])
const metodoPagoId  = ref<number | null>(null)
const notas = ref('')
const loadingAbono = ref(false)

// validacion reactiva del monto
const montoValido = computed(() => {
  if (!montoAbono.value || montoAbono.value <= 0) return false
  if (!planSeleccionado.value) return false
  if (montoAbono.value > Number(planSeleccionado.value.saldo_pendiente)) return false
  return true
})

function etiquetaPlazo(numPlazos: number, tipoPlazo: string): string {
  if (tipoPlazo === 'dias') {
    return `Cada ${numPlazos} dias`
  } else if (tipoPlazo === 'semanal') {
    return `${numPlazos} pagos semanales`
  } else if (tipoPlazo === 'mensual') {
    return `${numPlazos} pagos mensuales`
  }
  return `${numPlazos} ${tipoPlazo}`
}

function onMetodoPagoChange(id: number) {
  const metodo = metodosPago.value.find(m => m.id === id)
  if (metodo) {
    metodoPago.value   = metodo.nombre
    metodoPagoId.value = metodo.id
  }
}

function onBuscarCliente() {
  clearTimeout(buscarTimeout)
  buscarTimeout = setTimeout(async () => {
    if (!searchCliente.value || searchCliente.value.length < 2) {
      resultadosClientes.value = []
      return
    }
    loadingClientes.value = true
    try {
      const res = await buscarClientes(searchCliente.value)
      resultadosClientes.value = res.data?.clientes ?? res.clientes ?? []
    } finally {
      loadingClientes.value = false
    }
  }, 300)
}

async function seleccionarCliente(cliente: Cliente) {
  clienteSeleccionado.value = cliente
  pasoActual.value = 2
  loadingPlanes.value = true
  try {
    const res = await fetchPlanesPorCliente(cliente.id)
    // el endpoint devuelve paginacion, los planes estan en res.data
    planesCliente.value = res.data ?? res ?? []
  } finally {
    loadingPlanes.value = false
  }
}

async function seleccionarPlan(plan: PlanPago) {
  planSeleccionado.value = plan
  const cuota = Math.floor(Number(plan.total_financiado) / Number(plan.num_plazos))
  montoAbono.value = cuota
  pasoActual.value = 3

  // cargar metodos de pago si no se han cargado aun
  if (!metodosPago.value.length) {
    try {
      const res = await getMetodosPago()
      metodosPago.value = res.data ?? []
      if (metodosPago.value.length) {
        metodoPago.value   = metodosPago.value[0].nombre
        metodoPagoId.value = metodosPago.value[0].id
      }
    } catch {
      metodosPago.value = []
    }
  }
}

function volverPaso1() {
  pasoActual.value = 1
  searchCliente.value = ''
  resultadosClientes.value = []
  clienteSeleccionado.value = null
  planesCliente.value = []
  planSeleccionado.value = null
}

function retroceder() {
  if (pasoActual.value === 3) {
    pasoActual.value = 2
    planSeleccionado.value = null
  } else if (pasoActual.value === 2) {
    volverPaso1()
  }
}

async function confirmarAbono() {
  if (!montoValido.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Monto invalido',
      text: 'Ingresa un monto valido que no supere el saldo pendiente.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  if (!planSeleccionado.value) return

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  loadingAbono.value = true
  try {
    const res = await registrarAbono(planSeleccionado.value.id, {
      monto_pagado:   montoAbono.value,
      metodo_pago:    'Abono a credito',
      metodo_pago_id: null,
      notas:          notas.value || null,
      usuario_id:     user.id,
    })

    // extraemos estado del response (compatible con ambas estructuras)
    const estado = res.data?.estado_plan ?? res.estado_plan

    emits('abonado')

    if (estado === 'liquidado') {
      Swal.fire({
        icon: 'success',
        title: 'Plan liquidado!',
        text: 'El cliente termino de pagar. Plan marcado como liquidado.',
        confirmButtonColor: '#22c55e'
      })
    } else {
      const saldo = res.data?.saldo_pendiente ?? res.saldo_pendiente
      const proximoPago = res.data?.fecha_proximo_pago ?? res.fecha_proximo_pago
      Swal.fire({
        icon: 'success',
        title: 'Abono registrado',
        html: `
          <p>Saldo restante: <strong>$${Number(saldo).toFixed(2)}</strong></p>
          <p class="mt-1 text-sm text-gray-500">Proximo pago: <strong>${formatFecha(proximoPago)}</strong></p>
        `,
        confirmButtonColor: '#22c55e'
      })
    }

    emits('close')

  } catch (e: any) {
    const mensaje = e?.response?.data?.message
      || e?.response?.data?.errors?.monto_pagado?.[0]
      || e?.response?.data?.errors?.caja_id?.[0]
      || e?.response?.data?.errors?.usuario_id?.[0]
      || 'No se pudo registrar el abono.'
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje })
  } finally {
    loadingAbono.value = false
  }
}

function porcentajePagadoPlan(plan: PlanPago) {
  const totalFinanciado = Number(plan.total_financiado)
  if (totalFinanciado <= 0) return 100
  const pagado = totalFinanciado - Number(plan.saldo_pendiente)
  return Math.min(Math.round((pagado / totalFinanciado) * 100), 100)
}

function formatFecha(fecha: string) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function etiquetaEstado(estado: string) {
  const map: Record<string, string> = {
    activo:    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    liquidado: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    vencido:   'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    cancelado: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-600'
}
</script>