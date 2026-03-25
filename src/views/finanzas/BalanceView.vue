<script setup lang="ts">
import ResumenBalance  from '@/components/finanzas/ResumenBalance.vue'
import HistorialBalance from '@/components/finanzas/HistorialBalance.vue'
import { ref, computed, watch } from 'vue'
import { exportBalanceExcel, exportBalancePdf } from '@/api/finanzas'

// Estado de fechas para los componentes existentes
const today        = new Date()
const currentYear  = today.getFullYear()
const currentMonth = today.getMonth() + 1

const year  = ref<number>(currentYear)
const month = ref<number>(currentMonth)

// selector de rango para el historial
const mesesHistorial = ref<number>(3)
const opcionesMeses  = [3, 6, 12, 24]

const anioInicio = 2023

const years = computed(() => {
  const list = []
  for (let y = anioInicio; y <= currentYear; y++) list.push(y)
  return list
})

const months = computed(() => {
  let end = 12
  if (year.value === currentYear) end = currentMonth
  const list = []
  for (let m = 1; m <= end; m++) {
    list.push({
      value: m,
      label: new Date(0, m - 1).toLocaleString('es-MX', { month: 'long' }),
    })
  }
  return list
})

watch(year, () => {
  if (!months.value.find(m => m.value === month.value)) {
    month.value = months.value[months.value.length - 1]?.value ?? currentMonth
  }
})

const nombreMesActual = computed(() =>
  new Date(0, month.value - 1).toLocaleString('es-MX', { month: 'long' })
)

// ── Exportacion: date pickers y estado ──

// Formato YYYY-MM-DD para los inputs date
function formatDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// Fecha inicio: primer dia del mes seleccionado
const fechaInicio = ref<string>(formatDate(currentYear, currentMonth, 1))

// Fecha fin: dia actual o ultimo dia del mes
const fechaFin = ref<string>(formatDate(currentYear, currentMonth, today.getDate()))

const exportando = ref<'excel' | 'pdf' | null>(null)

// Funcion generica para descargar archivos blob
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
    const res = await exportBalanceExcel({
      fecha_inicio: fechaInicio.value,
      fecha_fin: fechaFin.value
    })
    const nombre = `balance_${fechaInicio.value}_al_${fechaFin.value}.xlsx`
    descargarBlob(res.data, nombre)
  } catch (e: any) {
    console.error('Error al exportar Excel:', e)
    // Cuando el responseType es blob, el error viene como blob tambien
    let mensaje = 'Error al generar el reporte Excel'
    if (e.response?.data instanceof Blob) {
      const texto = await e.response.data.text()
      try {
        const json = JSON.parse(texto)
        mensaje = json.message || mensaje
      } catch { /* no es JSON */ }
    }
    alert(mensaje)
  } finally {
    exportando.value = null
  }
}

async function descargarPdf() {
  if (exportando.value) return
  exportando.value = 'pdf'
  try {
    const res = await exportBalancePdf({
      fecha_inicio: fechaInicio.value,
      fecha_fin: fechaFin.value
    })
    const nombre = `balance_${fechaInicio.value}_al_${fechaFin.value}.pdf`
    descargarBlob(res.data, nombre)
  } catch (e: any) {
    console.error('Error al exportar PDF:', e)
    let mensaje = 'Error al generar el reporte PDF'
    if (e.response?.data instanceof Blob) {
      const texto = await e.response.data.text()
      try {
        const json = JSON.parse(texto)
        mensaje = json.message || mensaje
      } catch { /* no es JSON */ }
    }
    alert(mensaje)
  } finally {
    exportando.value = null
  }
}
</script>

<template>

  <!-- barra de filtros -->
  <div
    class="min-w-[140px] flex flex-wrap items-center justify-between gap-3 mb-6
           bg-white dark:bg-gray-800
           border border-gray-200 dark:border-gray-700
           rounded-2xl px-4 py-3 shadow-sm"
  >
    <!-- titulo de la seccion -->
    <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
      <i class="fa-solid fa-scale-balanced text-indigo-500"></i>
      Balance mensual
      <span class="capitalize text-gray-400 font-normal">
        — {{ nombreMesActual }} {{ year }}
      </span>
    </h2>

    <!-- selectores de fecha y exportacion -->
    <div class="flex flex-wrap items-center gap-3">

      <!-- selector de anio -->
      <div class="relative">
        <i class="fas fa-calendar-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <select
          v-model="year"
          class="pl-10 pr-4 py-2 text-sm rounded-xl min-w-[130px]
                 bg-gray-50 dark:bg-gray-700
                 text-gray-800 dark:text-gray-100
                 border border-gray-300 dark:border-gray-600
                 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500
                 transition"
        >
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <!-- selector de mes -->
      <div class="relative">
        <i class="fas fa-calendar-day absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <select
          v-model="month"
          class="pl-10 pr-4 py-2 text-sm rounded-xl min-w-[140px]
                 bg-gray-50 dark:bg-gray-700
                 text-gray-800 dark:text-gray-100
                 border border-gray-300 dark:border-gray-600
                 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500
                 transition capitalize"
        >
          <option v-for="m in months" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>
      </div>

      <!-- selector de rango de historial -->
      <div class="relative">
        <i class="fas fa-history absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <select
          v-model="mesesHistorial"
          class="pl-10 pr-4 py-2 text-sm rounded-xl min-w-[160px]
                 bg-gray-50 dark:bg-gray-700
                 text-gray-800 dark:text-gray-100
                 border border-gray-300 dark:border-gray-600
                 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500
                 transition"
        >
          <option v-for="n in opcionesMeses" :key="n" :value="n">
            Ultimos {{ n }} meses
          </option>
        </select>
      </div>

      <!-- separador visual -->
      <div class="hidden sm:block w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

      <!-- date picker: desde -->
      <div class="relative">
        <label class="absolute -top-2 left-3 text-[10px] text-gray-400 bg-white dark:bg-gray-800 px-1">Desde</label>
        <input
          v-model="fechaInicio"
          type="date"
          @click="($event.target as HTMLInputElement).showPicker()"
          class="px-3 py-2 text-sm rounded-xl min-w-[140px]
                 bg-gray-50 dark:bg-gray-700
                 text-gray-800 dark:text-gray-100
                 border border-gray-300 dark:border-gray-600
                 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500
                 transition"
        />
      </div>

      <!-- date picker: hasta -->
      <div class="relative">
        <label class="absolute -top-2 left-3 text-[10px] text-gray-400 bg-white dark:bg-gray-800 px-1">Hasta</label>
        <input
          v-model="fechaFin"
          type="date"
          @click="($event.target as HTMLInputElement).showPicker()"
          class="px-3 py-2 text-sm rounded-xl min-w-[140px]
                 bg-gray-50 dark:bg-gray-700
                 text-gray-800 dark:text-gray-100
                 border border-gray-300 dark:border-gray-600
                 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500
                 transition"
        />
      </div>

      <!-- boton exportar Excel -->
      <button
        @click="descargarExcel"
        :disabled="exportando !== null"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl
               bg-emerald-600 hover:bg-emerald-700 text-white
               disabled:opacity-50 disabled:cursor-not-allowed
               transition shadow-sm"
      >
        <i
          class="fa-solid"
          :class="exportando === 'excel' ? 'fa-spinner fa-spin' : 'fa-file-excel'"
        ></i>
        <span class="hidden sm:inline">{{ exportando === 'excel' ? 'Generando...' : 'Excel' }}</span>
      </button>

      <!-- boton exportar PDF -->
      <button
        @click="descargarPdf"
        :disabled="exportando !== null"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl
               bg-red-600 hover:bg-red-700 text-white
               disabled:opacity-50 disabled:cursor-not-allowed
               transition shadow-sm"
      >
        <i
          class="fa-solid"
          :class="exportando === 'pdf' ? 'fa-spinner fa-spin' : 'fa-file-pdf'"
        ></i>
        <span class="hidden sm:inline">{{ exportando === 'pdf' ? 'Generando...' : 'PDF' }}</span>
      </button>

    </div>
  </div>

  <!-- grid principal -->
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">

    <!-- columna izquierda: dona + balance del mes seleccionado -->
    <div class="col-span-12 lg:col-span-4">
      <ResumenBalance
        :month="month"
        :year="year"
      />
    </div>

    <!-- columna derecha: grafica de lineas + tabla de historial -->
    <div class="col-span-12 lg:col-span-8">
      <HistorialBalance
        :meses="mesesHistorial"
        :mes-activo="month"
        :anio-activo="year"
      />
    </div>

  </div>

</template>