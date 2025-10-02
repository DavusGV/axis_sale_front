<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps<{ productos: any[] }>()

// Prepara los datos para la gráfica
const productNames = computed(() => props.productos.map(p => p.producto))
const vendidos = computed(() => props.productos.map(p => p.vendido))
const ganancias = computed(() => props.productos.map(p => p.ganancia))
const inversiones = computed(() => props.productos.map(p => p.inversion))

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    height: 400,
  },
  title: {
    text: 'Resumen de ventas por producto',
    align: 'left'
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded',
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: productNames.value,
    labels: { style: { colors: '#404A60' } }
  },
  yaxis: {
    labels: { style: { colors: '#404A60' } }
  },
  legend: { show: true },
  colors: ['#38bdf8', '#22c55e', '#fbbf24'],
  tooltip: { enabled: true },
}))

const series = computed(() => [
  {
    name: 'Vendido',
    data: vendidos.value,
  },
  {
    name: 'Ganancia',
    data: ganancias.value,
  },
  {
    name: 'Inversión',
    data: inversiones.value,
  }
])
</script>

<template>
  <div>
    <VueApexCharts
      :options="chartOptions"
      :series="series"
      type="bar"
      height="400"
    />
  </div>
</template>