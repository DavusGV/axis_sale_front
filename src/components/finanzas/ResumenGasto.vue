<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { fetchResumenGastos } from '@/api/finanzas'
import { useLayoutStore } from '@/stores/layoutStore'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps<{
  month: number
  year: number
}>()

const { theme } = useLayoutStore()

const loading = ref(false)
const totalMes = ref(0)
const cantidadGastos = ref(0)
const porTipo = ref<{ tipo: string; total: number }[]>([])

// colores para la grafica
const colores = ['#5D69F4', '#00998B', '#FFC861', '#FF6161', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444']

// cargar resumen desde el API
async function cargarResumen() {
  if (!props.month || !props.year) return
  loading.value = true
  try {
    const data = await fetchResumenGastos({ month: props.month, year: props.year })
    totalMes.value = data.total_mes ?? 0
    cantidadGastos.value = data.cantidad_gastos ?? 0
    porTipo.value = data.por_tipo ?? []
  } catch (e) {
    console.error('Error al cargar resumen de gastos:', e)
  } finally {
    loading.value = false
  }
}

// recargar cuando cambian mes o anio
watch([() => props.month, () => props.year], () => {
  cargarResumen()
})

onMounted(() => {
  cargarResumen()
})

// configuracion de la grafica
const chartOptions = computed(() => {
  const labels = porTipo.value.map(item => item.tipo)
  const series = porTipo.value.map(item => Number(item.total))

  return {
    series,
    options: {
      chart: {
        type: 'donut' as const,
      },
      labels,
      colors: colores.slice(0, labels.length),
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                fontSize: '14px',
                color: theme.isDark ? '#EBECEF' : '#404A60',
              },
              value: {
                fontSize: '16px',
                color: theme.isDark ? '#EBECEF' : '#404A60',
                formatter: (val: string) => '$' + Number(val).toFixed(2),
              },
              total: {
                show: true,
                label: 'Total',
                color: '#5D69F4',
                fontSize: '14px',
                formatter: () => '$' + totalMes.value.toFixed(2),
              },
            },
          },
        },
      },
      legend: {
        show: true,
        position: 'bottom' as const,
        labels: {
          colors: theme.isDark ? '#EBECEF' : '#404A60',
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        y: {
          formatter: (val: number) => '$' + val.toFixed(2),
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { height: 280 },
            legend: { position: 'bottom' },
          },
        },
      ],
    },
  }
})

// nombre del mes para mostrar
const nombreMes = computed(() => {
  if (!props.month) return ''
  return new Date(0, props.month - 1).toLocaleString('es-MX', { month: 'long' })
})
</script>

<template>
  <div class="box mb-4 xxxl:mb-6 p-4">

    <!-- titulo -->
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
      <i class="fa-solid fa-chart-pie text-purple-500"></i>
      Resumen de gastos
      <span class="text-xs text-gray-400 capitalize">{{ nombreMes }} {{ year }}</span>
    </h3>

    <!-- loading -->
    <div v-if="loading" class="text-center text-gray-400 py-8 text-sm">
      Cargando resumen...
    </div>

    <!-- sin datos -->
    <div v-else-if="!porTipo.length" class="text-center text-gray-400 py-8">
      <i class="fa-regular fa-face-meh text-2xl mb-2"></i>
      <p class="text-sm">Sin gastos registrados este mes</p>
    </div>

    <!-- grafica y datos -->
    <div v-else>

      <!-- tarjetas resumen -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">Total del mes</p>
          <p class="text-lg font-bold text-red-500">${{ totalMes.toFixed(2) }}</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">Gastos registrados</p>
          <p class="text-lg font-bold text-gray-700 dark:text-gray-200">{{ cantidadGastos }}</p>
        </div>
      </div>

      <!-- grafica donut -->
      <VueApexCharts
        :height="300"
        width="100%"
        type="donut"
        :series="chartOptions.series"
        :options="chartOptions.options"
      />

      <!-- listado por tipo -->
      <div class="mt-4 flex flex-col gap-2">
        <div
          v-for="(item, index) in porTipo"
          :key="item.tipo"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: colores[index % colores.length] }"
            ></span>
            <span class="text-gray-600 dark:text-gray-300">{{ item.tipo }}</span>
          </div>
          <span class="font-medium text-gray-800 dark:text-gray-100">${{ Number(item.total).toFixed(2) }}</span>
        </div>
      </div>

    </div>

  </div>
</template>