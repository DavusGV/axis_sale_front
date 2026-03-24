<script setup lang="ts">
import { useLayoutStore } from '@/stores/layoutStore'
import type { ApexOptions } from 'apexcharts'
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const { theme } = useLayoutStore()

// Recibimos la tendencia semanal como prop
const props = defineProps<{
  tendencia: Array<{ dia: string; fecha: string; total: number }>
}>()

// Extraemos las categorias (Dom, Lun, Mar...) y los valores
const categorias = computed(() => props.tendencia.map(item => item.dia))
const valores = computed(() => props.tendencia.map(item => item.total))

const series = computed(() => [
  {
    name: 'Ventas',
    data: valores.value
  }
])

const chartData = computed<ApexOptions>(() => {
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      }
    },
    colors: ['#5D69F4'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: categorias.value,
      labels: {
        style: {
          colors: !theme.isDark ? '#404A60' : '#EBECEF'
        }
      },
      axisBorder: { show: false },
      axisTicks: {
        color: theme.isDark ? '#404A60' : '#EBECEF'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: !theme.isDark ? '#404A60' : '#EBECEF'
        },
        formatter: function (v: number) {
          return '$' + v.toLocaleString('es-MX')
        },
        offsetX: theme.dir == 'rtl' ? -30 : 0
      }
    },
    grid: {
      borderColor: theme.isDark ? '#404A60' : '#EBECEF'
    },
    tooltip: {
      y: {
        formatter: function (v: number) {
          return '$' + v.toLocaleString('es-MX', { minimumFractionDigits: 2 })
        }
      }
    }
  }
})
</script>

<template>
  <div class="col-span-12 lg:col-span-8 box overflow-x-hidden">
    <div class="flex flex-wrap justify-between items-center gap-3 pb-4 lg:pb-6 mb-4 lg:mb-6 bb-dashed">
      <p class="font-medium">Tendencia de ventas - Semana actual</p>
    </div>
    <VueApexCharts
      :height="280"
      width="100%"
      :series="series"
      :options="chartData"
      type="bar"
    />
  </div>
</template>