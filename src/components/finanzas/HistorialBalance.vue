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

// indices de meses con perdida para marcar en la grafica
const puntosPerdida = computed(() =>
  historial.value
    .map((h, i) => (!h.es_ganancia ? i : null))
    .filter(i => i !== null)
)

const chartOptions = computed(() => ({
  chart: {
    type: 'area' as const,
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
    parentHeightOffset: 0, 
    offsetX: 0,
    width: '100%',
  },
  stroke: {
    curve: 'smooth' as const,
    width: [3, 3],
  },
  colors: ['#10B981', '#EF4444'],
  xaxis: {
    categories: labels.value,
    tickPlacement: 'on',
    labels: {
      trim: true,
      style: {
        colors: theme.isDark ? '#9CA3AF' : '#6B7280',
        fontSize: '11px',
      },
    },
  },
  yaxis: {
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
    y: { formatter: (v: number) => '$' + v.toFixed(2) },
  },
  // zona de perdida: fondo rojo suave cuando gastos > ingresos
  annotations: {
    points: puntosPerdida.value.map(i => ({
      x: labels.value[i!],
      y: seriesGastos.value[i!],
      marker: {
        size: 6,
        fillColor: '#EF4444',
        strokeColor: '#fff',
        radius: 3,
      },
      label: {
        text: 'Perdida',
        style: {
          background: '#EF4444',
          color: '#fff',
          fontSize: '10px',
          padding: { left: 4, right: 4, top: 2, bottom: 2 },
        },
      },
    })),
  },
  markers: {
    size: 4,
    hover: { size: 6 },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: theme.isDark ? 'dark' : 'light',
      type: 'vertical',
      shadeIntensity: 0.4,
      gradientToColors: ['#10B981', '#EF4444'],
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
}))

const series = computed(() => [
  { name: 'Ingresos', data: seriesIngresos.value },
  { name: 'Gastos',   data: seriesGastos.value },
])

// Resumen del historial: cuantos meses con ganancia vs perdida
const mesesGanancia = computed(() => historial.value.filter(h => h.es_ganancia).length)
const mesesPerdida  = computed(() => historial.value.filter(h => !h.es_ganancia).length)

const mejorMes = computed(() => {
  if (!historial.value.length) return null
  return historial.value.reduce((a, b) => (a.balance > b.balance ? a : b))
})

const peorMes = computed(() => {
  if (!historial.value.length) return null
  return historial.value.reduce((a, b) => (a.balance < b.balance ? a : b))
})
</script>

<template>
  <div class="box p-4">

    <!-- encabezado -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <i class="fa-solid fa-chart-line text-indigo-500"></i>
        Historial — Ingresos vs Gastos
      </h3>

      <!-- resumen rapido -->
      <div class="flex items-center gap-3 text-xs">
        <span class="flex items-center gap-1 text-emerald-600 font-medium">
          <i class="fa-solid fa-arrow-trend-up"></i>
          {{ mesesGanancia }} con ganancia
        </span>
        <span class="flex items-center gap-1 text-red-500 font-medium">
          <i class="fa-solid fa-arrow-trend-down"></i>
          {{ mesesPerdida }} con perdida
        </span>
      </div>
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
          type="area"
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
              <th class="text-right pb-2 font-medium text-emerald-600">Ingresos</th>
              <th class="text-right pb-2 font-medium text-red-500">Gastos</th>
              <th class="text-right pb-2 font-medium">Balance</th>
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
              <td class="py-2 text-right text-red-500 font-medium">
                ${{ h.gastos.toFixed(2) }}
              </td>
              <td
                class="py-2 text-right font-bold"
                :class="h.es_ganancia ? 'text-emerald-600' : 'text-red-500'"
              >
                {{ h.balance < 0 ? '-' : '' }}${{ Math.abs(h.balance).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- mejor y peor mes -->
      <div class="grid grid-cols-2 gap-3 mt-4" v-if="mejorMes && peorMes">
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Mejor mes</p>
          <p class="text-sm font-bold text-emerald-600 capitalize">{{ mejorMes.label }}</p>
          <p class="text-xs text-emerald-500">${{ mejorMes.balance.toFixed(2) }}</p>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Peor mes</p>
          <p class="text-sm font-bold text-red-500 capitalize">{{ peorMes.label }}</p>
          <p class="text-xs text-red-400">
            {{ peorMes.balance < 0 ? '-' : '' }}${{ Math.abs(peorMes.balance).toFixed(2) }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>