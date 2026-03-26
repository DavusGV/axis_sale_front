<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchDashboard, exportDashboardExcel, exportDashboardPdf } from '@/api/dashboard'
import Stats from '@/components/dashboards/personal-3/Stats.vue'
import RevenueChart from '@/components/dashboards/personal-3/RevenueChart.vue'
import GreetingCard from '@/components/dashboards/personal-3/GreetingCard.vue'
import ProjectStatusVue from '@/components/dashboards/personal-3/ProjectStatus.vue'
import ProjectsOverivew from '@/components/dashboards/personal-3/ProjectsOverivew.vue'
import Swal from 'sweetalert2'

// Variable reactiva para guardar los datos del dashboard
const dashboardData = ref<any>(null)
const loading = ref(true)
const exportando = ref<'excel' | 'pdf' | null>(null)

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

// Funciones de exportacion

function descargarBlob(data: Blob, nombreArchivo: string) {
  const url = window.URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', nombreArchivo)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

async function descargarExcel() {
  if (exportando.value) return
  exportando.value = 'excel'
  try {
    const res = await exportDashboardExcel()
    const hoy = new Date().toISOString().slice(0, 10)
    descargarBlob(res.data, `dashboard_${hoy}.xlsx`)
  } catch (e: any) {
    let mensaje = 'Error al generar el reporte Excel'
    if (e.response?.data instanceof Blob) {
      const texto = await e.response.data.text()
      try {
        const json = JSON.parse(texto)
        mensaje = json.message || mensaje
      } catch { /* no es JSON */ }
    }
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje })
  } finally {
    exportando.value = null
  }
}

async function descargarPdf() {
  if (exportando.value) return
  exportando.value = 'pdf'
  try {
    const res = await exportDashboardPdf()
    const hoy = new Date().toISOString().slice(0, 10)
    descargarBlob(res.data, `dashboard_${hoy}.pdf`)
  } catch (e: any) {
    let mensaje = 'Error al generar el reporte PDF'
    if (e.response?.data instanceof Blob) {
      const texto = await e.response.data.text()
      try {
        const json = JSON.parse(texto)
        mensaje = json.message || mensaje
      } catch { /* no es JSON */ }
    }
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje })
  } finally {
    exportando.value = null
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
    <p class="text-lg">Cargando dashboard...</p>
  </div>

  <div v-else-if="dashboardData">

    <!-- Barra con botones de exportacion -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <i class="fa-solid fa-chart-pie text-indigo-500"></i>
        Dashboard
      </h2>

      <div class="flex items-center gap-2">
        <!-- boton Excel -->
        <button
          @click="descargarExcel"
          :disabled="exportando !== null"
          class="flex items-center gap-1.5 px-3 py-1.5
                text-xs font-medium rounded-lg shadow-sm transition whitespace-nowrap
                bg-emerald-600 hover:bg-emerald-700 text-white
                disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i
            class="fa-solid text-[11px]"
            :class="exportando === 'excel' ? 'fa-spinner fa-spin' : 'fa-file-excel'"
          ></i>
          {{ exportando === 'excel' ? 'Generando...' : 'Excel' }}
        </button>

        <!-- boton PDF -->
        <button
          @click="descargarPdf"
          :disabled="exportando !== null"
          class="flex items-center gap-1.5 px-3 py-1.5
                text-xs font-medium rounded-lg shadow-sm transition whitespace-nowrap
                bg-red-600 hover:bg-red-700 text-white
                disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i
            class="fa-solid text-[11px]"
            :class="exportando === 'pdf' ? 'fa-spinner fa-spin' : 'fa-file-pdf'"
          ></i>
          {{ exportando === 'pdf' ? 'Generando...' : 'PDF' }}
        </button>
      </div>
    </div>

    <!-- Grid principal del dashboard -->
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
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
  </div>
</template>