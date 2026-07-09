<script setup lang="ts">
import { useLayoutStore } from '@/stores/layoutStore'
import useWindowSize from '@/utils/useWindowSize'
import type { ApexOptions } from 'apexcharts'
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const { windowSize } = useWindowSize()
const { theme } = useLayoutStore()

const props = defineProps<{
  categorias: string[]
  series: { name: string; data: number[] }[]
  productoNombre: string
}>()

const chartData = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 600,
    },
  },
  plotOptions: {
    bar: {
      columnWidth: windowSize.value < 768 ? '60%' : '40%',
      borderRadius: 4,
    },
  },
  dataLabels: { enabled: false },
  // colores: entradas (verde), ventas (azul), reducciones (rojo)
  colors: ['#10B981', '#3B82F6', '#EF4444'],
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    labels: {
      colors: theme.isDark ? '#EBECEF' : '#404A60',
    },
  },
  xaxis: {
    categories: props.categorias,
    labels: {
      style: {
        colors: theme.isDark ? '#EBECEF' : '#404A60',
        fontSize: '11px',
      },
      rotate: -45,
      hideOverlappingLabels: true,
    },
    axisBorder: { show: false },
    axisTicks: { color: theme.isDark ? '#404A60' : '#EBECEF' },
  },
  yaxis: {
    labels: {
      style: { colors: theme.isDark ? '#EBECEF' : '#404A60' },
      formatter: (val: number) => Math.round(val).toString(),
    },
  },
  fill: { opacity: 1 },
  grid: {
    borderColor: theme.isDark ? '#404A60' : '#EBECEF',
    strokeDashArray: 3,
  },
  tooltip: {
    theme: theme.isDark ? 'dark' : 'light',
    y: {
      formatter: (val: number) => `${val} unidad(es)`,
    },
  },
  responsive: [
    { breakpoint: 1500, options: { chart: { height: 380 } } },
    { breakpoint: 992,  options: { chart: { height: 320 } } },
    { breakpoint: 570,  options: { chart: { height: 280 } } },
  ],
}))

// detectamos si hay datos para mostrar
const hayDatos = computed(() => {
  return props.series.some(s => s.data.some(v => v > 0))
})
</script>

<template>
  <div class="col-span-12 box overflow-x-hidden">
    <div class="flex flex-wrap justify-between items-center gap-3 pb-4 lg:pb-6 mb-4 lg:mb-6 bb-dashed">
      <div>
        <p class="font-medium text-lg">Movimientos por dia</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ productoNombre || 'Selecciona un producto' }}
        </p>
      </div>
      <div class="flex items-center gap-3 text-xs">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm bg-green-500"></span> Entradas
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm bg-blue-500"></span> Ventas
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm bg-red-500"></span> Reducciones
        </span>
      </div>
    </div>

    <div v-if="hayDatos">
      <VueApexCharts :height="400" width="100%" :options="chartData" :series="series" type="bar" />
    </div>
    <div v-else class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class="fa-solid fa-chart-column text-5xl mb-3"></i>
      <p>No hay movimientos en el rango seleccionado.</p>
    </div>
  </div>
</template>