<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopBanner from '@/components/shared/TopBanner.vue'
import Categories from '@/components/dashboards/stock/Categories.vue'
import SalesForecast from '@/components/dashboards/stock/SalesForecast.vue'
import RecentOrders from '@/components/dashboards/stock/RecentOrders.vue'
import { fetchStockProductos, fetchStockCronologia, type StockProductoSelect, type StockCronologiaResponse, } from '@/api/stock'
import { useAuthStore } from '@/stores/authStore'

const route       = useRoute()
const router      = useRouter()
const authStore   = useAuthStore()

const productos          = ref<StockProductoSelect[]>([])
const productoSeleccionado = ref<number | null>(null)
const buscadorProducto   = ref('')

// rango por defecto: del inicio del mes pasado al fin del mes actual
function rangoDefecto() {
  const now    = new Date()
  const inicio = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const fin    = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    inicio: inicio.toISOString().slice(0, 10),
    fin:    fin.toISOString().slice(0, 10),
  }
}

const rango = ref(rangoDefecto())

const cronologia = ref<StockCronologiaResponse | null>(null)
const loading    = ref(false)

// nombre del producto seleccionado para mostrarlo en los headers de los hijos
const nombreProducto = computed(() => {
  if (!productoSeleccionado.value) return ''
  const p = productos.value.find(x => x.id === productoSeleccionado.value)
  return p ? `${p.nombre}${p.codigo ? ` (${p.codigo})` : ''}` : ''
})

// carga inicial de productos
async function cargarProductos(search: string = '') {
  try {
    productos.value = await fetchStockProductos(search)
  } catch {
    productos.value = []
  }
}

// carga la cronologia del producto seleccionado
async function cargarCronologia() {
  if (!productoSeleccionado.value) {
    cronologia.value = null
    return
  }
  loading.value = true
  try {
    cronologia.value = await fetchStockCronologia(
      productoSeleccionado.value,
      rango.value.inicio,
      rango.value.fin
    )
  } catch {
    cronologia.value = null
  } finally {
    loading.value = false
  }
}

// si vienen con query producto_id desde productos, lo preseleccionamos
function preseleccionarDesdeQuery() {
  const id = route.query.producto_id
  if (id) {
    productoSeleccionado.value = Number(id)
  }
}

// recarga la cronologia al cambiar producto o rango
watch([productoSeleccionado, rango], () => {
  cargarCronologia()
}, { deep: true })

// busqueda de productos en el select (debounced simple)
let searchTimeout: number | null = null
watch(buscadorProducto, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    cargarProductos(val)
  }, 300)
})

// al cambiar de establecimiento limpiamos todo
watch(
  () => authStore.establishmentActive,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    productoSeleccionado.value = null
    cronologia.value = null
    rango.value = rangoDefecto()
    await cargarProductos()
  }
)

function limpiar() {
  productoSeleccionado.value = null
  cronologia.value = null
  rango.value = rangoDefecto()
  router.replace({ query: {} })
}

onMounted(async () => {
  await cargarProductos()
  preseleccionarDesdeQuery()
})
</script>

<template>
  <TopBanner title="Dashboard de stock" />

  <!-- panel de filtros -->
  <div class="box mb-4 flex flex-wrap items-center gap-3 py-3 px-5">

    <!-- select de producto -->
    <div class="relative flex-1 min-w-[260px] max-w-md">
      <i class="fa-solid fa-box absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
      <select
        v-model="productoSeleccionado"
        class="w-full appearance-none border border-gray-300 dark:border-gray-700
              bg-white dark:bg-bg4 dark:text-gray-100
              rounded-lg pl-9 pr-9 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
      >
        <option :value="null">Selecciona un producto</option>
        <option v-for="p in productos" :key="p.id" :value="p.id">
          {{ p.nombre }}{{ p.codigo ? ` — ${p.codigo}` : '' }}
        </option>
      </select>
      <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
    </div>

    <!-- fecha desde -->
    <div class="relative">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <i class="fa-solid fa-calendar-days text-gray-400 text-xs"></i>
      </span>
      <input
        v-model="rango.inicio"
        type="date"
        @click="($event.target as HTMLInputElement).showPicker()"
        class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 focus:outline-none focus:border-primary
              focus:ring-1 focus:ring-primary/40 transition text-sm"
      />
    </div>

    <!-- fecha hasta -->
    <div class="relative">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <i class="fa-solid fa-calendar-days text-gray-400 text-xs"></i>
      </span>
      <input
        v-model="rango.fin"
        type="date"
        @click="($event.target as HTMLInputElement).showPicker()"
        class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 focus:outline-none focus:border-primary
              focus:ring-1 focus:ring-primary/40 transition text-sm"
      />
    </div>

    <!-- boton limpiar -->
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
            bg-primary text-white border border-primary rounded-lg shadow-sm
            hover:bg-transparent hover:text-primary transition whitespace-nowrap ml-auto"
      @click="limpiar"
    >
      <i class="fa-solid fa-xmark"></i>
      Limpiar
    </button>
  </div>

  <!-- estado vacio sin producto -->
  <div
    v-if="!productoSeleccionado"
    class="box flex flex-col items-center justify-center py-20 text-gray-400"
  >
    <i class="fa-solid fa-magnifying-glass text-5xl mb-3"></i>
    <p class="text-lg">Selecciona un producto para ver su cronologia.</p>
    <p class="text-sm mt-1">Tambien puedes acceder desde la tabla de productos.</p>
  </div>

  <!-- contenido del dashboard -->
  <template v-else-if="cronologia">
    <Categories
      :stock-actual="cronologia.kpis.stock_actual"
      :total-entradas="cronologia.kpis.total_entradas"
      :total-vendido="cronologia.kpis.total_vendido"
      :total-reducido="cronologia.kpis.total_reducido"
      :ultimo-movimiento="cronologia.kpis.ultimo_movimiento"
      :es-servicio="cronologia.kpis.es_servicio"
    />

    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
      <SalesForecast
        :categorias="cronologia.grafica.categorias"
        :series="cronologia.grafica.series"
        :producto-nombre="nombreProducto"
      />
      <RecentOrders
        :items="cronologia.timeline"
        :producto-nombre="nombreProducto"
      />
    </div>
  </template>

  <!-- loading state -->
  <div v-else-if="loading" class="box flex items-center justify-center py-20">
    <i class="fa-solid fa-spinner fa-spin text-3xl text-primary"></i>
  </div>
</template>