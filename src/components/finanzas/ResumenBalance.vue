<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLayoutStore } from '@/stores/layoutStore'

const props = defineProps<{
  month: number
  year: number
}>()

const { theme } = useLayoutStore()

// ------------------------------------------------------------
// Estado
// ------------------------------------------------------------
const loading   = ref(false)
const ingresos  = ref(0)
const gastos    = ref(0)
const balance   = ref(0)
const esGanancia = ref(true)

import { fetchBalanceMensual } from '@/api/finanzas'

async function cargarBalance() {
  if (!props.month || !props.year) return
  loading.value = true
  try {
    const d = await fetchBalanceMensual({ month: props.month, year: props.year })
    ingresos.value   = Number(d.ingresos  ?? 0)
    gastos.value     = Number(d.gastos    ?? 0)
    balance.value    = Number(d.balance   ?? 0)
    esGanancia.value = d.es_ganancia ?? balance.value >= 0
  } catch (e) {
    console.error('Error al cargar balance mensual:', e)
  } finally {
    loading.value = false
  }
}

watch([() => props.month, () => props.year], cargarBalance)
onMounted(cargarBalance)

// Grafica media dona
const chartSeries = computed(() => [ingresos.value, gastos.value])

const chartOptions = computed(() => ({
  chart: {
    type: 'donut' as const,
    sparkline: { enabled: false },
  },
  labels: ['Ingresos', 'Gastos'],
  colors: ['#10B981', '#EF4444'],
  plotOptions: {
    pie: {
      startAngle: -90,
      endAngle: 90,
      offsetY: 10,
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: esGanancia.value ? 'Ganancia' : 'Perdida',
            color: esGanancia.value ? '#10B981' : '#EF4444',
            fontSize: '13px',
            formatter: () =>
              (balance.value < 0 ? '-' : '') +
              '$' + Math.abs(balance.value).toFixed(2),
          },
        },
      },
    },
  },
  legend: {
    show: true,
    position: 'bottom' as const,
    labels: { colors: theme.isDark ? '#EBECEF' : '#404A60' },
  },
  dataLabels: { enabled: false },
  tooltip: {
    y: { formatter: (v: number) => '$' + v.toFixed(2) },
  },
  responsive: [
    { breakpoint: 480, options: { chart: { height: 200 } } },
  ],
}))

// Helpers
const nombreMes = computed(() =>
  props.month
    ? new Date(0, props.month - 1).toLocaleString('es-MX', { month: 'long' })
    : ''
)

const porcentajeGastos = computed(() => {
  const total = ingresos.value + gastos.value
  return total > 0 ? Math.round((gastos.value / total) * 100) : 0
})
</script>

<template>
  <div class="box mb-4 xxxl:mb-6 p-4">

    <!-- titulo -->
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
      <i class="fa-solid fa-scale-balanced text-indigo-500"></i>
      Balance del mes
      <span class="text-xs text-gray-400 capitalize">{{ nombreMes }} {{ year }}</span>
    </h3>

    <!-- loading -->
    <div v-if="loading" class="text-center text-gray-400 py-8 text-sm">
      Cargando balance...
    </div>

    <!-- sin datos -->
    <div v-else-if="!ingresos && !gastos" class="text-center text-gray-400 py-8">
      <i class="fa-regular fa-face-meh text-2xl mb-2"></i>
      <p class="text-sm">Sin movimientos registrados este mes</p>
    </div>

    <!-- contenido -->
    <div v-else>

      <!-- tarjetas ingresos / gastos -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Ingresos</p>
          <p class="text-base font-bold text-emerald-600">${{ ingresos.toFixed(2) }}</p>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Gastos</p>
          <p class="text-base font-bold text-red-500">${{ gastos.toFixed(2) }}</p>
        </div>
      </div>

      <!-- media dona -->
      <VueApexCharts
        height="220"
        width="100%"
        type="donut"
        :series="chartSeries"
        :options="chartOptions"
      />

      <!-- resultado balance -->
      <div
        class="mt-4 rounded-xl px-4 py-3 text-center"
        :class="esGanancia
          ? 'bg-emerald-50 dark:bg-emerald-900/20'
          : 'bg-red-50 dark:bg-red-900/20'"
      >
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {{ esGanancia ? 'Ganancia neta' : 'Perdida neta' }}
        </p>
        <p
          class="text-2xl font-extrabold"
          :class="esGanancia ? 'text-emerald-600' : 'text-red-500'"
        >
          {{ balance < 0 ? '-' : '' }}${{ Math.abs(balance).toFixed(2) }}
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Los gastos representan el {{ porcentajeGastos }}% del total
        </p>
      </div>

    </div>
  </div>
</template>