<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatBoxesVue from '@/components/reportes/ventas/StatBoxes.vue'
import MonthlyRevenueChartVue from '@/components/dashboards/personal-1/MonthlyRevenueChart.vue'
import ProjectsOverview from '@/components/dashboards/personal-1/ProjectsOverview.vue'
import ProgressOverivew from '@/components/dashboards/personal-1/ProgressOverivew.vue'
import BrowserSessions from '@/components/dashboards/personal-1/BrowserSessions.vue'
import { IconCalendarPlus } from '@tabler/icons-vue'
import { getSales } from '@/api/reports'
import ProductosBarChart from '@/components/reportes/ventas/ProductosBarChart.vue'



// Helpers para fechas
function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    desde: start.toISOString().slice(0, 10),
    hasta: end.toISOString().slice(0, 10),
  }
}

const filtro = ref(getMonthRange())
const loading = ref(false)
const error = ref('')
const data = ref<{ productos: any[]; totales: any }>({ productos: [], totales: { inversion: 0, vendido: 0, ganancia: 0 } })

async function cargarReporte() {
  loading.value = true
  error.value = ''
  try {
    const res = await getSales(filtro.value)
    data.value = res.data
    console.log(data.value)
    loading.value = false

  } catch (e: any) {
    error.value = 'No se pudo cargar el reporte'
  } finally {
    loading.value = false
  }
}

// Cargar al iniciar
onMounted(cargarReporte)

</script>

<template>
  <main class="duration-300">
    <!-- Filtro de fechas -->
    <div class="flex items-end gap-4 mb-6 bg-white/70 dark:bg-bg4 p-4 rounded-xl border border-n200 shadow-sm">
    <div class="flex flex-col">
      <label class="block text-xs font-semibold mb-1 flex items-center gap-2 text-gray-700 dark:text-gray-100">
        <IconCalendarPlus class="inline-block" :size="18" />
        Fecha inicio
      </label>
      <input
        type="date"
        v-model="filtro.desde"
        @change="cargarReporte"
        class="input w-full 
    bg-gray-50 text-gray-900 border-gray-300
    dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
    rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
      />
    </div>
    <div class="flex flex-col">
      <label class="block text-xs font-semibold mb-1 flex items-center gap-2 text-gray-700 dark:text-gray-100">
        <IconCalendarPlus class="inline-block" :size="18" />
        Fecha fin
      </label>
      <input
        type="date"
        v-model="filtro.hasta"
        @change="cargarReporte"
        class="input w-full 
    bg-gray-50 text-gray-900 border-gray-300
    dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
    rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
      />
    </div>
    <button
      @click="cargarReporte"
      class="ml-4 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition"
    >
      Buscar
    </button>
  </div>

    <!-- Loading/Error -->
    <div v-if="loading" class="my-4">Cargando...</div>
    <div v-if="error" class="my-4 text-red-500">{{ error }}</div>

    <!-- Stat Boxes, pásales los totales -->
    <StatBoxesVue :totales="data.totales" />

     <div class="grid grid-cols-12 gap-4 xxxl:gap-6 mt-4 lg:mt-6">
      <!--<div class="col-span-12 lg:col-span-6">
        <MonthlyRevenueChartVue :productos="data.productos" />
      </div>
      <div class="col-span-12 lg:col-span-6">
        <ProjectsOverview />
      </div>
      <div class="col-span-12 lg:col-span-6">
        <ProgressOverivew />
      </div>-->
      <div class="col-span-12 lg:col-span-12">
        <ProductosBarChart :productos="data.productos" />
      </div>
    </div>
  </main>
</template>