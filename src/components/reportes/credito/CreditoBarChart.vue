<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLayoutStore } from '@/stores/layoutStore'

const props = defineProps<{ porMes: any[] }>()
const { theme } = useLayoutStore()

const labels = computed(() => props.porMes.map(m => m.label))
const cobrados = computed(() => props.porMes.map(m => m.cobrado))
const pendientes = computed(() => props.porMes.map(m => m.pendiente))
const comisiones = computed(() => props.porMes.map(m => m.comisiones))

const series = computed(() => [
  { name: 'Cobrado', data: cobrados.value },
  { name: 'Pendiente', data: pendientes.value },
  { name: 'Comisiones', data: comisiones.value },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '60%',
      borderRadius: 4,
    },
  },
  dataLabels: { enabled: false },
  colors: ['#10B981', '#F97316', '#EAB308'],
  xaxis: {
    categories: labels.value,
    labels: {
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
}))
</script>

<template>
  <div class="bg-n0 dark:bg-bg4 rounded-2xl border dark:border-n500 p-4 xxl:p-6">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
      <i class="fa-solid fa-chart-column text-indigo-500"></i>
      Creditos por mes — Cobrado vs Pendiente vs Comisiones
    </h3>

    <div v-if="!porMes.length" class="text-center text-gray-400 py-8">
      <p class="text-sm">Sin datos para graficar</p>
    </div>

    <VueApexCharts
      v-else
      :options="chartOptions"
      :series="series"
      type="bar"
      height="350"
    />
  </div>
</template>