<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchDashboard } from '@/api/dashboard'
import Stats from '@/components/dashboards/personal-3/Stats.vue'
import RevenueChart from '@/components/dashboards/personal-3/RevenueChart.vue'
import GreetingCard from '@/components/dashboards/personal-3/GreetingCard.vue'
import ProjectStatusVue from '@/components/dashboards/personal-3/ProjectStatus.vue'
import ProjectsOverivew from '@/components/dashboards/personal-3/ProjectsOverivew.vue'

// Variable reactiva para guardar los datos del dashboard
const dashboardData = ref<any>(null)
const loading = ref(true)

// Llamamos a la API al montar el componente
onMounted(async () => {
  try {
    dashboardData.value = await fetchDashboard()
  } catch (error) {
    console.error('Error al cargar el dashboard:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
    <p class="text-lg">Cargando dashboard...</p>
  </div>

  <div v-else-if="dashboardData" class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <!-- Fila 1: 4 tarjetas de estadisticas -->
    <Stats
      :ingresos="dashboardData.ingresos_dia"
      :gastos="dashboardData.gastos_dia"
      :ganancias="dashboardData.ganancias"
      :descuentos="dashboardData.descuentos"
      :creditos="dashboardData.creditos_pendientes"
      :cotizaciones="dashboardData.cotizaciones_pendientes"
    />

    <!-- Fila 2: Grafica semanal + Stock de productos -->
    <RevenueChart :tendencia="dashboardData.tendencia_semanal" />
    <GreetingCard
      :stockCero="dashboardData.stock_cero"
      :stockBajo="dashboardData.stock_bajo"
    />

    <!-- Fila 3: Top 3 productos + Ventas del dia -->
    <ProjectStatusVue :topProductos="dashboardData.top_productos" />
    <ProjectsOverivew :ventasDia="dashboardData.ventas_dia_productos" />
  </div>
</template>