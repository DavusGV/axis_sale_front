<script setup lang="ts">
import ResumenBalance  from '@/components/finanzas/ResumenBalance.vue'
import HistorialBalance from '@/components/finanzas/HistorialBalance.vue'
import PlaceloadList   from '@/components/placeload/PlaceLoadList.vue'
import { ref, computed, watch } from 'vue'

// Estado de fechas
const today        = new Date()
const currentYear  = today.getFullYear()
const currentMonth = today.getMonth() + 1

const year  = ref<number>(currentYear)
const month = ref<number>(currentMonth)

// selector de rango para el historial
const mesesHistorial = ref<number>(3)
const opcionesMeses  = [3, 6, 12, 24]

const anioInicio = 2023 // ajustar segun necesidad

const years = computed(() => {
  const list = []
  for (let y = anioInicio; y <= currentYear; y++) list.push(y)
  return list
})

const months = computed(() => {
  let start = 1
  let end   = 12
  if (year.value === currentYear) end = currentMonth
  const list = []
  for (let m = start; m <= end; m++) {
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
</script>

<template>

  <!-- barra de filtros — mismo estilo que GastosView -->
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

    <!-- selectores de fecha -->
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