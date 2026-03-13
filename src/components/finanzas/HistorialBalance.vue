<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLayoutStore } from '@/stores/layoutStore'

const props = defineProps<{
  meses: number          // cantidad de meses a mostrar (3, 6, 12, 24)
  mesActivo?: number     // mes seleccionado para resaltar
  anioActivo?: number
}>()

const { theme } = useLayoutStore()

// ------------------------------------------------------------
// Estado
// ------------------------------------------------------------
const loading  = ref(false)
const historial = ref<{
  mes: number
  anio: number
  label: string
  ingresos: number
  gastos: number
  balance: number
  es_ganancia: boolean
}[]>([])

import { fetchHistorialBalance } from '@/api/finanzas'

async function cargarHistorial() {
  loading.value = true
  try {
    const d = await fetchHistorialBalance({ meses: props.meses })
    historial.value = d.historial ?? []
  } catch (e) {
    console.error('Error al cargar historial de balance:', e)
  } finally {
    loading.value = false
  }
}

watch(() => props.meses, cargarHistorial)
onMounted(cargarHistorial)

// ------------------------------------------------------------
// Grafica de lineas dobles
// ------------------------------------------------------------
const labels = computed(() => historial.value.map(h => h.label))

const seriesIngresos = computed(() => historial.value.map(h => h.ingresos))
const seriesGastos   = computed(() => historial.value.map(h => h.gastos))
const seriesBalance  = computed(() => historial.value.map(h => h.balance))

// indices de meses con mayor inversion para marcar en la grafica
const puntosInversion = computed(() =>
  historial.value
    .map((h, i) => (!h.es_ganancia ? i : null))
    .filter(i => i !== null)
)

const chartOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
    parentHeightOffset: 0,
  },
  stroke: {
    width: [0, 0, 3],
    curve: 'smooth' as const,
  },
  colors: ['#10B981', '#3B82F6', '#F59E0B'],
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '50%',
    },
  },
  xaxis: {
    categories: labels.value,
    labels: {
      trim: true,
      style: {
        colors: theme.isDark ? '#9CA3AF' : '#6B7280',
        fontSize: '11px',
      },
    },
  },
  yaxis: {
    // permite que el eje baje de 0 cuando hay balance negativo
    forceNiceScale: true,
    labels: {
      style: { colors: theme.isDark ? '#9CA3AF' : '#6B7280' },
      formatter: (v: number) => '$' + v.toFixed(0),
    },
  },
  grid: {
    borderColor: theme.isDark ? '#374151' : '#E5E7EB',
    strokeDashArray: 4,
  },
  legend: {
    show: true,
    position: 'top' as const,
    labels: { colors: theme.isDark ? '#EBECEF' : '#404A60' },
  },
  tooltip: {
    theme: theme.isDark ? 'dark' : 'light',
    shared: true,
    intersect: false,
    y: { formatter: (v: number) => '$' + v.toFixed(2) },
  },
  markers: {
    size: [0, 0, 5],
    hover: { size: 7 },
  },
  fill: {
    opacity: [0.9, 0.9, 1],
  },
  dataLabels: {
    enabled: false,
  },
  // linea horizontal en 0 para referencia visual
  annotations: {
    yaxis: [
      {
        // eje izquierdo — para las barras (ingresos y gastos)
        forceNiceScale: true,
        title: { text: 'Monto ($)', style: { color: theme.isDark ? '#9CA3AF' : '#6B7280' } },
        labels: {
          style: { colors: theme.isDark ? '#9CA3AF' : '#6B7280' },
          formatter: (v: number) => '$' + v.toFixed(0),
        },
      },
      {
        // segunda barra usa el mismo eje izquierdo
        show: false,
        seriesName: 'Ingresos Generados',
      },
      {
        // eje derecho — para la linea de resultado
        opposite: true,
        forceNiceScale: true,
        title: { text: 'Resultado ($)', style: { color: '#F59E0B' } },
        labels: {
          style: { colors: '#F59E0B' },
          formatter: (v: number) => '$' + v.toFixed(0),
        },
      },
    ],
  },
}))

const series = computed(() => [
  { name: 'Ingresos Generados', type: 'bar',  data: seriesIngresos.value },
  { name: 'Gastos operativos', type: 'bar',  data: seriesGastos.value },
  { name: 'Resultado del mes',  type: 'line', data: seriesBalance.value },
])

// meses que tuvieron al menos un ingreso
const mesesConIngresos = computed(() =>
  historial.value.filter(h => h.ingresos > 0).length
)

// meses que tuvieron al menos una inversion (gasto)
const mesesConInversiones = computed(() =>
  historial.value.filter(h => h.gastos > 0).length
)

// mes con mayor ingreso registrado
const mesMayorIngreso = computed(() => {
  if (!historial.value.length) return null
  return historial.value.reduce((a, b) => (a.ingresos > b.ingresos ? a : b))
})

// mes con menor ingreso registrado
const mesMenorIngreso = computed(() => {
  if (!historial.value.length) return null
  return historial.value.reduce((a, b) => (a.ingresos < b.ingresos ? a : b))
})

// mes con mayor inversion (mayor gasto)
const mesMayorInversion = computed(() => {
  if (!historial.value.length) return null
  return historial.value.reduce((a, b) => (a.gastos > b.gastos ? a : b))
})
</script>

<template>
  <div class="box p-4">

    <!-- encabezado -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <i class="fa-solid fa-chart-line text-indigo-500"></i>
        Historial — Ingresos Generados vs Gastos Operativos
      </h3>
    </div>

    <!-- loading -->
    <div v-if="loading" class="text-center text-gray-400 py-12 text-sm">
      Cargando historial...
    </div>

    <!-- sin datos -->
    <div v-else-if="!historial.length" class="text-center text-gray-400 py-12">
      <i class="fa-regular fa-face-meh text-2xl mb-2"></i>
      <p class="text-sm">Sin datos de historial disponibles</p>
    </div>

    <div v-else>

      <!-- grafica de lineas dobles -->
      <div class="w-full overflow-hidden">
        <VueApexCharts
          height="280"
          type="bar"
          :series="series"
          :options="chartOptions"
        />
      </div>

      <!-- tabla resumen de meses -->
      <div class="mt-4 overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
              <th class="text-left pb-2 font-medium">Mes</th>
              <th class="text-right pb-2 font-medium text-emerald-600">Ingresos Obtenidos</th>
              <th class="text-right pb-2 font-medium text-blue-500">Gastos Realizados</th>
              <th class="text-right pb-2 font-medium">Saldo Restante (Balance)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="h in historial"
              :key="`${h.anio}-${h.mes}`"
              class="border-b border-gray-100 dark:border-gray-800 last:border-0 transition"
              :class="{
                'bg-indigo-50 dark:bg-indigo-900/20':
                  h.mes === mesActivo && h.anio === anioActivo
              }"
            >
              <td class="py-2 capitalize text-gray-700 dark:text-gray-300 font-medium">
                {{ h.label }}
                <span
                  v-if="h.mes === mesActivo && h.anio === anioActivo"
                  class="ml-1 text-[10px] bg-indigo-500 text-white rounded px-1 py-0.5"
                >
                  actual
                </span>
              </td>
              <td class="py-2 text-right text-emerald-600 font-medium">
                ${{ h.ingresos.toFixed(2) }}
              </td>
              <td class="py-2 text-right text-blue-500 font-medium">
                ${{ h.gastos.toFixed(2) }}
              </td>
              <td
                class="py-2 text-right font-bold"
                :class="h.balance >= 0 ? 'text-emerald-600' : 'text-yellow-500'"
              >
                {{ h.balance < 0 ? '-' : '' }}${{ Math.abs(h.balance).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- mayor ingreso y menor ingreso mes -->
      <div class="grid grid-cols-3 gap-3 mt-4" v-if="mesMayorIngreso && mesMenorIngreso && mesMayorInversion">
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Mayor ingreso</p>
          <p class="text-sm font-bold text-emerald-600 capitalize">{{ mesMayorIngreso.label }}</p>
          <p class="text-xs text-emerald-500">${{ mesMayorIngreso.ingresos.toFixed(2) }}</p>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Menor ingreso</p>
          <p class="text-sm font-bold text-yellow-500 capitalize">{{ mesMenorIngreso.label }}</p>
          <p class="text-xs text-yellow-400">${{ mesMenorIngreso.ingresos.toFixed(2) }}</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Mayor inversion</p>
          <p class="text-sm font-bold text-blue-500 capitalize">{{ mesMayorInversion.label }}</p>
          <p class="text-xs text-blue-400">${{ mesMayorInversion.gastos.toFixed(2) }}</p>
        </div>
      </div>

    </div>
  </div>
</template>