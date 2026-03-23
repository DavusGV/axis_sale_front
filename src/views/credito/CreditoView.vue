<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import DataTable from '@/components/plantillas/DataTable.vue'
import ModalDetalleCredito from '@/components/creditos/ModalDetalleCredito.vue'
import { fetchPlanesPago } from '@/api/planes_pago'
import { useAuthStore } from '@/stores/authStore'

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
  intervalo_dias: number | null
  tipo_plazo: string
  saldo_pendiente: number
  fecha_inicio: string
  fecha_proximo_pago: string
  estado: string
  observaciones: string | null
}

const authStore = useAuthStore()

const planes       = ref<PlanPago[]>([])
const page         = ref(1)
const lastPage     = ref(1)
const totalItems   = ref(0)
const startIndex   = ref(0)
const endIndex     = ref(0)
const loading      = ref(false)

const planSeleccionado = ref<PlanPago | null>(null)

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    desde: start.toISOString().slice(0, 10),
    hasta: end.toISOString().slice(0, 10),
  }
}

const rango = getMonthRange()

const filtros = ref({
  search:      '',
  estado:      '',
  fecha_desde: rango.desde,
  fecha_hasta: rango.hasta,
})

watch(filtros, () => {
  page.value = 1
  loadPlanes()
}, { deep: true })

const columns = [
  { key: 'cliente',          label: 'Cliente' },
  { key: 'venta',            label: 'Venta' },
  { key: 'total_a_pagar',    label: 'Total' },
  { key: 'cuota',            label: 'Cuota' },
  { key: 'saldo_pendiente',  label: 'Saldo' },
  { key: 'fecha_proximo_pago', label: 'Proximo pago' },
  { key: 'plazo',            label: 'Plazo' },
  { key: 'estado',           label: 'Estado' },
]

// dropdown de acciones
const dropdownAbierto = ref<number | string | null>(null)
const dropdownRefs    = ref<Record<string, HTMLElement | null>>({})

function setDropdownRef(el: any, id: number | string) {
  if (el) dropdownRefs.value[id] = el
}

function toggleDropdown(id: number | string) {
  dropdownAbierto.value = dropdownAbierto.value === id ? null : id
}

function cerrarDropdown() {
  dropdownAbierto.value = null
}

function onClickFuera(e: MouseEvent) {
  if (dropdownAbierto.value === null) return
  const ref = dropdownRefs.value[dropdownAbierto.value]
  if (ref && !ref.contains(e.target as Node)) {
    cerrarDropdown()
  }
}

watch(
  () => authStore.establishmentActive,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    page.value = 1
    await loadPlanes()
  }
)

onMounted(async () => {
  document.addEventListener('click', onClickFuera)
  await loadPlanes()
})

onUnmounted(() => {
  document.removeEventListener('click', onClickFuera)
})

const loadPlanes = async (p = 1) => {
  loading.value = true
  try {
    const res = await fetchPlanesPago({
      page:        p,
      estado:      filtros.value.estado || undefined,
      search:      filtros.value.search || undefined,
      fecha_desde: filtros.value.fecha_desde || undefined,
      fecha_hasta: filtros.value.fecha_hasta || undefined,
      per_page:    10
    })
    planes.value     = res.data
    lastPage.value   = res.last_page
    page.value       = res.current_page
    totalItems.value = res.total
    startIndex.value = (res.from ?? 1) - 1
    endIndex.value   = (res.to ?? 1) - 1
  } finally {
    loading.value = false
  }
}

const paginate = (p: number) => loadPlanes(p)
const nextPage = () => { if (page.value < lastPage.value) loadPlanes(page.value + 1) }
const prevPage = () => { if (page.value > 1) loadPlanes(page.value - 1) }

function verDetalle(plan: any) {
  planSeleccionado.value = plan
}

async function onAbonado() {
  await loadPlanes(page.value)
  if (planSeleccionado.value) {
    const planActualizado = planes.value.find(p => p.id === planSeleccionado.value!.id)
    if (planActualizado) planSeleccionado.value = planActualizado
  }
}

// helpers de formato
function nombreCliente(plan: any) {
  return `${plan.cliente?.nombre ?? ''} ${plan.cliente?.apellido_p ?? ''}`.trim()
}

function etiquetaPlazo(plan: any): string {
  const n = plan.num_plazos
  if (plan.tipo_plazo === 'dias') {
    if (plan.intervalo_dias) {
      return `${n} pago${n > 1 ? 's' : ''} (cada ${plan.intervalo_dias} dias)`
    }
    return `Cada ${n} dias`
  } else if (plan.tipo_plazo === 'semanal') {
    return `${n} pago${n > 1 ? 's' : ''} semanal${n > 1 ? 'es' : ''}`
  } else if (plan.tipo_plazo === 'mensual') {
    return `${n} pago${n > 1 ? 's' : ''} mensual${n > 1 ? 'es' : ''}`
  }
  return `${n} ${plan.tipo_plazo}`
}

function formatFecha(fecha: string) {
  if (!fecha) return '—'
  const date = new Date(fecha)
  if (isNaN(date.getTime())) return fecha
  return date.toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    timeZone: 'America/Mexico_City'
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

function calcularCuota(plan: any): string {
  const total = Number(plan.total_financiado)
  const plazos = Number(plan.num_plazos)
  if (plazos <= 0 || total <= 0) return '$0.00'
  return '$' + Math.floor(total / plazos).toFixed(2)
}
</script>

<template>
  <TopBanner title="Creditos" />

  <div class="p-4">

    <!-- filtros -->
    <div class="flex flex-wrap gap-3 mb-4">

      <!-- buscar por cliente -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-user text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.search"
          type="text"
          placeholder="Buscar cliente..."
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
          autocomplete="off"
        />
      </div>

      <!-- filtro por estado -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-filter text-gray-400 text-xs"></i>
        </span>
        <select
          v-model="filtros.estado"
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="liquidado">Liquidado</option>
          <option value="vencido">Vencido</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <!-- fecha desde -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-calendar-days text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.fecha_desde"
          type="date"
          @click="($event.target as HTMLInputElement).showPicker()"
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
        />
      </div>

      <!-- fecha hasta -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-calendar-days text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.fecha_hasta"
          type="date"
          @click="($event.target as HTMLInputElement).showPicker()"
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
        />
      </div>

      <!-- limpiar filtros -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5
              text-xs font-medium bg-primary text-white border border-primary
              rounded-lg shadow-sm hover:bg-transparent hover:text-primary
              transition whitespace-nowrap"
        @click="filtros = { search: '', estado: '', fecha_desde: getMonthRange().desde, fecha_hasta: getMonthRange().hasta }; loadPlanes()"
      >
        <i class="fa-solid fa-xmark mr-1 text-[11px]"></i>
        Limpiar Filtros
      </button>
    </div>

    <!-- tabla -->
    <DataTable
      :items="planes"
      :columns="columns"
      :currentPage="page"
      :totalPages="lastPage"
      :total="totalItems"
      :startIndex="startIndex"
      :endIndex="endIndex"
      :paginate="paginate"
      :nextPage="nextPage"
      :prevPage="prevPage"
    >
      <!-- celdas personalizadas -->
      <template #cell="{ item, column, value }">

        <!-- cliente: nombre + telefono -->
        <template v-if="column.key === 'cliente'">
          <span class="font-medium text-gray-800 dark:text-gray-100">
            {{ nombreCliente(item) }}
          </span>
          <span class="block text-xs text-gray-400">{{ item.cliente?.telefono1 }}</span>
        </template>

        <!-- venta -->
        <template v-else-if="column.key === 'venta'">
          #{{ item.venta?.id }}
        </template>

        <!-- total a pagar -->
        <template v-else-if="column.key === 'total_a_pagar'">
          <span class="font-medium">${{ Number(value).toFixed(2) }}</span>
        </template>

        <!-- cuota calculada -->
        <template v-else-if="column.key === 'cuota'">
          <span class="text-green-600 font-medium">{{ calcularCuota(item) }}</span>
        </template>

        <!-- saldo pendiente -->
        <template v-else-if="column.key === 'saldo_pendiente'">
          <span
            class="font-bold"
            :class="Number(value) > 0 ? 'text-orange-500' : 'text-green-600'"
          >
            ${{ Number(value).toFixed(2) }}
          </span>
        </template>

        <!-- fecha proximo pago -->
        <template v-else-if="column.key === 'fecha_proximo_pago'">
          {{ formatFecha(value) }}
        </template>

        <!-- plazo -->
        <template v-else-if="column.key === 'plazo'">
          <span class="capitalize">{{ etiquetaPlazo(item) }}</span>
        </template>

        <!-- estado -->
        <template v-else-if="column.key === 'estado'">
          <span :class="['px-2 py-1 rounded-full text-xs font-medium capitalize', etiquetaEstado(item.estado)]">
            {{ item.estado }}
          </span>
        </template>

        <!-- cualquier otra columna -->
        <template v-else>
          {{ value ?? '--' }}
        </template>
      </template>

      <!-- acciones -->
      <template #actions="{ item }">
        <div class="relative flex justify-center" :ref="el => setDropdownRef(el, item.id)">
          <button
            class="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            @click="toggleDropdown(item.id)"
          >
            <i class="fa-solid fa-ellipsis-vertical text-gray-500"></i>
          </button>

          <ul
            v-show="dropdownAbierto === item.id"
            class="absolute right-full mr-1 border text-sm z-30 dark:border-gray-600
                   min-w-[170px] p-1.5 rounded-md bg-white dark:bg-gray-800 shadow-lg"
          >
            <li>
              <button
                @click="verDetalle(item); cerrarDropdown()"
                class="py-2 w-full text-left hover:bg-blue-50 dark:hover:bg-gray-700
                       rounded-md duration-300 px-3 flex items-center gap-2 text-blue-600 dark:text-blue-400"
              >
                <i class="fa-solid fa-eye text-xs"></i>
                Ver detalle
              </button>
            </li>
          </ul>
        </div>
      </template>
    </DataTable>

  </div>

  <!-- modal detalle -->
  <ModalDetalleCredito
    v-if="planSeleccionado"
    :plan="planSeleccionado"
    @close="planSeleccionado = null"
    @abonado="onAbonado"
  />
</template>