<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { fetchMovimientos } from '@/api/finanzas'
import TopBanner from '@/components/shared/TopBanner.vue'
import PlaceloadList from '@/components/placeload/PlaceLoadList.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const authStore        = useAuthStore()
const idestablishment  = ref<number>(authStore.establishmentActive || 0)
const movimientos      = ref<any[]>([])
const load             = ref<boolean>(true)
const page             = ref<number>(1)
const ultimaPagina     = ref<number>(1)
const total            = ref<number>(0)

const today        = new Date()
const currentYear  = today.getFullYear()
const currentMonth = today.getMonth() + 1

const year  = ref<number>(Number(route.query.year)  || currentYear)
const month = ref<number>(Number(route.query.month) || currentMonth)

// mismos anos y meses que ingresos
const years = computed(() => {
    const list = []
    for (let y = 2024; y <= currentYear; y++) {
        list.push(y)
    }
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
            label: new Date(0, m - 1).toLocaleString('es-MX', { month: 'long' })
        })
    }
    return list
})

watch(year, () => {
    if (!months.value.find(m => m.value === month.value)) {
        month.value = months.value[months.value.length - 1]?.value ?? currentMonth
    }
})

watch([year, month], () => {
    page.value = 1
    cargarMovimientos()
})

async function cargarMovimientos(p = 1) {
    load.value = true
    try {
        const res = await fetchMovimientos({
            idestablishment: idestablishment.value,
            month:           month.value,
            year:            year.value,
            page:            p,
            per_page:        20,
        })
        movimientos.value = res.movimientos
        ultimaPagina.value = res.ultima_pagina
        total.value        = res.total
        page.value         = res.pagina_actual
    } catch {
        movimientos.value = []
    } finally {
        load.value = false
    }
}

function colorTipo(tipo: string) {
    if (tipo === 'Venta contado')  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (tipo === 'Anticipo')       return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    if (tipo === 'Abono credito')  return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    return 'bg-gray-100 text-gray-600'
}

onMounted(() => cargarMovimientos())
</script>

<template>
  <TopBanner title="Movimientos del mes" />

  <div class="p-4">

    <!-- selectores -->
    <div class="flex flex-wrap items-center gap-3 mb-6
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-2xl px-4 py-3 shadow-sm">

      <div class="relative">
        <i class="fas fa-calendar-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <select
          v-model="year"
          class="pl-10 pr-4 py-2 text-sm rounded-xl min-w-[140px]
                 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100
                 border border-gray-300 dark:border-gray-600
                 focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        >
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <div class="relative">
        <i class="fas fa-calendar-day absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <select
          v-model="month"
          class="pl-10 pr-4 py-2 text-sm rounded-xl min-w-[140px] capitalize
                 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100
                 border border-gray-300 dark:border-gray-600
                 focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
        >
          <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>

      <span class="text-sm text-gray-500 dark:text-gray-400 ml-auto">
        {{ total }} movimientos
      </span>

    </div>

    <!-- loader -->
    <PlaceloadList v-if="load" />

    <!-- tabla -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl border
                       border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-left">
            <th class="px-4 py-3 font-medium">Tipo</th>
            <th class="px-4 py-3 font-medium">Folio</th>
            <th class="px-4 py-3 font-medium">Metodo de pago</th>
            <th class="px-4 py-3 font-medium text-right">Monto</th>
            <th class="px-4 py-3 font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr v-if="movimientos.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
              Sin movimientos para este periodo
            </td>
          </tr>
          <tr
            v-for="(mov, i) in movimientos"
            :key="i"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
          >
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', colorTipo(mov.tipo)]">
                {{ mov.tipo }}
              </span>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
              {{ mov.folio }}
            </td>
            <td class="px-4 py-3 capitalize text-gray-600 dark:text-gray-400">
              {{ mov.metodo_pago ?? '--' }}
            </td>
            <td class="px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-100">
              ${{ Number(mov.monto).toFixed(2) }}
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
              {{ mov.fecha }}
            </td>
          </tr>
        </tbody>
        <!-- total al pie -->
        <tfoot v-if="movimientos.length > 0">
          <tr class="bg-gray-50 dark:bg-gray-700 font-semibold text-gray-700 dark:text-gray-200">
            <td colspan="3" class="px-4 py-3 text-right">Total del periodo:</td>
            <td class="px-4 py-3 text-right">
              ${{ movimientos.reduce((s, m) => s + Number(m.monto), 0).toFixed(2) }}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <!-- paginacion -->
      <div v-if="ultimaPagina > 1"
           class="flex items-center justify-between px-4 py-3
                  border-t border-gray-100 dark:border-gray-700">
        <span class="text-xs text-gray-500">Pagina {{ page }} de {{ ultimaPagina }}</span>
        <div class="flex gap-2">
          <button
            :disabled="page === 1"
            @click="cargarMovimientos(page - 1)"
            class="px-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600
                   disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Anterior
          </button>
          <button
            :disabled="page === ultimaPagina"
            @click="cargarMovimientos(page + 1)"
            class="px-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600
                   disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Siguiente
          </button>
        </div>
      </div>

    </div>
  </div>
</template>