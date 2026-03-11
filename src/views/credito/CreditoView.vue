<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import { ref, watch, onMounted } from 'vue'
import { fetchPlanesPago } from '@/api/planes_pago'
import { useAuthStore } from '@/stores/authStore'
import ModalDetalleCredito from '@/components/creditos/ModalDetalleCredito.vue'

interface PlanPago {
  id: number
  cliente: { nombre: string; apellido_p: string; telefono1: string }
  venta: { id: number }
  total_venta: number
  total_a_pagar: number
  total_financiado: number
  anticipo: number
  interes_tipo: string | null
  interes_valor: number
  interes_aplicado: number
  monto_cuota: number
  num_plazos: number
  tipo_plazo: string
  saldo_pendiente: number
  fecha_inicio: string
  fecha_proximo_pago: string
  estado: string
  observaciones: string | null
}

const authStore = useAuthStore()

const planes = ref<PlanPago[]>([])
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)
const filtroEstado = ref('activo')
const planSeleccionado = ref<PlanPago | null>(null)

function etiquetaPlazo(numPlazos: number, tipoPlazo: string): string {
  if (tipoPlazo === 'dias') {
    return `Cada ${numPlazos} dias`
  } else if (tipoPlazo === 'semanal') {
    return `${numPlazos} pago${numPlazos > 1 ? 's' : ''} semanal${numPlazos > 1 ? 'es' : ''}`
  } else if (tipoPlazo === 'mensual') {
    return `${numPlazos} pago${numPlazos > 1 ? 's' : ''} mensual${numPlazos > 1 ? 'es' : ''}`
  }
  return `${numPlazos} ${tipoPlazo}`
}

// buscador de cliente
const searchCliente = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | undefined = undefined

const opcionesEstado = [
  { value: 'activo',    label: 'Activos' },
  { value: 'liquidado', label: 'Liquidados' },
  { value: 'vencido',   label: 'Vencidos' },
  { value: '',          label: 'Todos' },
]

watch(filtroEstado, () => {
  page.value = 1
  loadPlanes()
})

// busqueda con debounce para no hacer peticiones en cada tecla
watch(searchCliente, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadPlanes()
  }, 350)
})

watch(
  () => authStore.establishmentActive,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    page.value = 1
    await loadPlanes()
  }
)

onMounted(async () => {
  await loadPlanes()
})

const loadPlanes = async () => {
  loading.value = true
  try {
    const res = await fetchPlanesPago({
      page: page.value,
      estado: filtroEstado.value || undefined,
      search: searchCliente.value || undefined,
      per_page: 10
    })
    planes.value = res.data
    lastPage.value = res.last_page
    page.value = res.current_page
  } finally {
    loading.value = false
  }
}

function verDetalle(plan: PlanPago) {
  planSeleccionado.value = plan
}

async function onAbonado() {
  // refrescamos la lista y cerramos el modal con datos actualizados
  await loadPlanes()
  // actualizamos el plan en el modal con los datos frescos
  if (planSeleccionado.value) {
    const planActualizado = planes.value.find(p => p.id === planSeleccionado.value!.id)
    if (planActualizado) planSeleccionado.value = planActualizado
  }
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

function nombreCliente(plan: PlanPago) {
  return `${plan.cliente?.nombre ?? ''} ${plan.cliente?.apellido_p ?? ''}`.trim()
}

// formato de fecha con zona horaria de Mexico
function formatFecha(fecha: string) {
  if (!fecha) return '—'
  const date = new Date(fecha)
  if (isNaN(date.getTime())) return fecha
  return date.toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    timeZone: 'America/Mexico_City'
  })
}
</script>

<template>
  <TopBanner title="Creditos" />

  <div class="p-4">

    <!-- filtros y buscador -->
    <div class="flex flex-col sm:flex-row gap-3 mb-5">
      <!-- filtros de estado -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="op in opcionesEstado"
          :key="op.value"
          @click="filtroEstado = op.value"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium border transition',
            filtroEstado === op.value
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          {{ op.label }}
        </button>
      </div>

      <!-- buscador de cliente -->
      <div class="relative sm:ml-auto w-full sm:w-72">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-search text-gray-400 text-sm"></i>
        </span>
        <input
          v-model="searchCliente"
          type="text"
          class="block w-full pl-9 pr-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                 placeholder-gray-400 dark:placeholder-gray-500
                 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400
                 transition text-sm"
          placeholder="Buscar cliente..."
        />
        <!-- boton para limpiar busqueda -->
        <button
          v-if="searchCliente"
          @click="searchCliente = ''"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    </div>

    <!-- tabla -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
          <tr>
            <th class="px-4 py-3 text-left">Cliente</th>
            <th class="px-4 py-3 text-left">Venta</th>
            <th class="px-4 py-3 text-right">Total</th>
            <th class="px-4 py-3 text-right">Cuota</th>
            <th class="px-4 py-3 text-right">Saldo</th>
            <th class="px-4 py-3 text-left">Proximo pago</th>
            <th class="px-4 py-3 text-left">Plazo</th>
            <th class="px-4 py-3 text-center">Estado</th>
            <th class="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="px-4 py-8 text-center text-gray-400">Cargando...</td>
          </tr>
          <tr v-else-if="!planes.length">
            <td colspan="9" class="px-4 py-8 text-center text-gray-400">
              <i class="fa-regular fa-face-sad-tear text-lg"></i>
              <p v-if="searchCliente">No se encontraron creditos para "{{ searchCliente }}"</p>
              <p v-else>No hay creditos registrados</p>
            </td>
          </tr>
          <tr
            v-for="plan in planes"
            :key="plan.id"
            class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <td class="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
              {{ nombreCliente(plan) }}
              <span class="block text-xs text-gray-400">{{ plan.cliente?.telefono1 }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
              #{{ plan.venta?.id }}
            </td>
            <td class="px-4 py-3 text-right font-medium">
              ${{ Number(plan.total_a_pagar).toFixed(2) }}
            </td>
            <td class="px-4 py-3 text-right text-green-600 font-medium">
              ${{ Math.floor(Number(plan.total_financiado) / Number(plan.num_plazos)).toFixed(2) }}
            </td>
            <td class="px-4 py-3 text-right font-bold"
              :class="Number(plan.saldo_pendiente) > 0 ? 'text-orange-500' : 'text-green-600'"
            >
              ${{ Number(plan.saldo_pendiente).toFixed(2) }}
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {{ formatFecha(plan.fecha_proximo_pago) }}
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">
              {{ etiquetaPlazo(plan.num_plazos, plan.tipo_plazo) }}
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium capitalize', etiquetaEstado(plan.estado)]">
                {{ plan.estado }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full mx-auto
                       bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300
                       hover:bg-blue-200 transition"
                @click="verDetalle(plan)"
                title="Ver detalle"
              >
                <i class="fa-solid fa-eye text-xs"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- paginacion -->
    <div class="flex justify-center items-center gap-3 mt-6 select-none">
      <button @click="page--; loadPlanes()" :disabled="page <= 1" class="btn">
        <IconChevronLeft />
      </button>
      <div class="flex gap-2">
        <button
          v-for="num in lastPage"
          :key="num"
          @click="page = num; loadPlanes()"
          :class="['btn', page === num
            ? 'border-green-600 text-white shadow-lg scale-110'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          {{ num }}
        </button>
      </div>
      <button @click="page++; loadPlanes()" :disabled="page >= lastPage" class="btn">
        <IconChevronRight />
      </button>
    </div>

  </div>

  <!-- modal detalle -->
  <ModalDetalleCredito
    v-if="planSeleccionado"
    :plan="planSeleccionado"
    @close="planSeleccionado = null"
    @abonado="onAbonado"
  />
</template>