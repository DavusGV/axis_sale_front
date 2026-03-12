<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { IconFilter } from '@tabler/icons-vue'
import { getCreditReport } from '@/api/reports'
import CreditosStatBoxes from '@/components/reportes/credito/CreditosStatBoxes.vue'
import CreditoTablaDetalle from '@/components/reportes/credito/CreditoTablaDetalle.vue'
import CreditoBarChart from '@/components/reportes/credito/CreditoBarChart.vue'

const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth() + 1

const anio = ref(currentYear)
const mes = ref(currentMonth)
const filtroEstado = ref('')

const anioInicio = 2023

const years = computed(() => {
  const list = []
  for (let y = anioInicio; y <= currentYear; y++) list.push(y)
  return list
})

const months = computed(() => {
  let end = 12
  if (anio.value === currentYear) end = currentMonth
  const list = []
  for (let m = 1; m <= end; m++) {
    list.push({
      value: m,
      label: new Date(0, m - 1).toLocaleString('es-MX', { month: 'long' }),
    })
  }
  return list
})

// si cambia el anio y el mes actual no existe en ese anio, ajustar
watch(anio, () => {
  if (!months.value.find(m => m.value === mes.value)) {
    mes.value = months.value[months.value.length - 1]?.value ?? currentMonth
  }
})

// recargar automaticamente al cambiar anio o mes
watch([anio, mes], () => {
  cargarReporte()
})

const loading = ref(false)
const error = ref('')

const data = ref<{
  detalle: any[]
  totales: any
  por_mes: any[]
}>({
  detalle: [],
  totales: {
    total_creditos: 0,
    activos: 0,
    liquidados: 0,
    total_venta: 0,
    total_anticipos: 0,
    total_intereses: 0,
    total_a_pagar: 0,
    total_cobrado: 0,
    total_pendiente: 0,
    comision_cobrada: 0,
    comision_pendiente: 0,
  },
  por_mes: [],
})

const opcionesEstado = [
  { value: '',          label: 'Todos' },
  { value: 'activo',    label: 'Activos' },
  { value: 'liquidado', label: 'Liquidados' },
  { value: 'vencido',   label: 'Vencidos' },
]

async function cargarReporte() {
  // calcular desde/hasta a partir de anio y mes
  const daysInMonth = new Date(anio.value, mes.value, 0).getDate()
  const desde = `${anio.value}-${String(mes.value).padStart(2, '0')}-01`
  const hasta = `${anio.value}-${String(mes.value).padStart(2, '0')}-${daysInMonth}`

  loading.value = true
  error.value = ''
  try {
    const res = await getCreditReport({ desde, hasta, estado: filtroEstado.value })
    data.value = res.data
  } catch (e: any) {
    error.value = 'No se pudo cargar el reporte de creditos'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(cargarReporte)
</script>

<template>
  <main class="duration-300">

    <!-- filtros -->
    <div class="flex flex-wrap items-end gap-4 mb-6 bg-white/70 dark:bg-bg4 p-4 rounded-xl border border-n200 dark:border-n500 shadow-sm">

    <!-- selector de anio -->
    <div class="flex flex-col">
        <label class="block text-xs font-semibold mb-1 flex items-center gap-2 text-gray-700 dark:text-gray-100">
        <i class="fas fa-calendar-alt text-gray-400"></i>
        Anio
        </label>
        <select
        v-model="anio"
        class="bg-gray-50 text-gray-900 border-gray-300
                dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
                rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary-500 transition min-w-[120px]"
        >
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
    </div>

    <!-- selector de mes -->
    <div class="flex flex-col">
        <label class="block text-xs font-semibold mb-1 flex items-center gap-2 text-gray-700 dark:text-gray-100">
        <i class="fas fa-calendar-day text-gray-400"></i>
        Mes
        </label>
        <select
        v-model="mes"
        class="bg-gray-50 text-gray-900 border-gray-300
                dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
                rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary-500 transition capitalize min-w-[150px]"
        >
        <option v-for="m in months" :key="m.value" :value="m.value">
            {{ m.label }}
        </option>
        </select>
    </div>

    <!-- filtro estado -->
    <div class="flex flex-col">
        <label class="block text-xs font-semibold mb-1 flex items-center gap-2 text-gray-700 dark:text-gray-100">
        <IconFilter class="inline-block" :size="18" />
        Estado
        </label>
        <select
        v-model="filtroEstado"
        class="bg-gray-50 text-gray-900 border-gray-300
                dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
                rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary-500 transition capitalize min-w-[130px]"
        >
        <option v-for="op in opcionesEstado" :key="op.value" :value="op.value">
            {{ op.label }}
        </option>
        </select>
    </div>

    <!-- boton buscar -->
    <button
        @click="cargarReporte"
        class="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition"
    >
        Buscar
    </button>
    </div>

    <!-- loading / error -->
    <div v-if="loading" class="text-center text-gray-400 py-8">Cargando reporte...</div>
    <div v-if="error" class="text-center text-red-500 py-4">{{ error }}</div>

    <!-- contenido -->
    <template v-if="!loading">

      <!-- tarjetas resumen -->
      <CreditosStatBoxes :totales="data.totales" />

      <!-- grafica y tabla -->
      <div class="grid grid-cols-12 gap-4 xxxl:gap-6 mt-4 lg:mt-6">

        <!-- grafica de barras -->
        <div class="col-span-12">
          <CreditoBarChart :por-mes="data.por_mes" />
        </div>

        <!-- tabla detalle -->
        <div class="col-span-12">
          <CreditoTablaDetalle :detalle="data.detalle" />
        </div>

      </div>
    </template>

  </main>
</template>