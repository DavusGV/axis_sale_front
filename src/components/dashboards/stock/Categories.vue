<script setup lang="ts">
import { computed } from 'vue'
import {
  IconBox,
  IconArrowUp,
  IconShoppingCart,
  IconAlertTriangle,
  IconClock
} from '@tabler/icons-vue'

const props = defineProps<{
  stockActual: number
  totalEntradas: number
  totalVendido: number
  totalReducido: number
  ultimoMovimiento: string | null
  esServicio: boolean
}>()

// formateamos la fecha del ultimo movimiento de forma corta y legible
const ultimoFormateado = computed(() => {
  if (!props.ultimoMovimiento) return 'Sin registros'
  try {
    const fecha = new Date(props.ultimoMovimiento)
    return fecha.toLocaleString('es-MX', {
      day:   '2-digit',
      month: '2-digit',
      year:  '2-digit',
      hour:  '2-digit',
      minute:'2-digit',
    })
  } catch {
    return props.ultimoMovimiento
  }
})

// cada card define su icono, titulo, valor y color
const kpis = computed(() => [
  {
    icon: IconBox,
    title: 'Stock actual',
    value: props.esServicio ? 'N/A (servicio)' : String(props.stockActual),
    color: 'text-primary',
    bg:    'bg-primary/10',
  },
  {
    icon: IconArrowUp,
    title: 'Total entradas',
    value: String(props.totalEntradas),
    color: 'text-green-600 dark:text-green-400',
    bg:    'bg-green-100 dark:bg-green-900/30',
  },
  {
    icon: IconShoppingCart,
    title: 'Total vendido',
    value: String(props.totalVendido),
    color: 'text-blue-600 dark:text-blue-400',
    bg:    'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: IconAlertTriangle,
    title: 'Total reducido',
    value: String(props.totalReducido),
    color: 'text-red-600 dark:text-red-400',
    bg:    'bg-red-100 dark:bg-red-900/30',
  },
  {
    icon: IconClock,
    title: 'Ultimo movimiento',
    value: ultimoFormateado.value,
    color: 'text-purple-600 dark:text-purple-400',
    bg:    'bg-purple-100 dark:bg-purple-900/30',
  },
])
</script>

<template>
  <div class="flex justify-start gap-4 xxxl:gap-6 mb-4 xxxl:mb-6 overflow-x-auto pb-2">
    <div
      v-for="kpi in kpis"
      :key="kpi.title"
      class="min-w-[200px] flex-1 p-5 xxl:p-6 border-[3px] flex flex-col items-center rounded-2xl border-n0 dark:border-n500 bg-primary/5"
    >
      <div :class="['rounded-2xl p-3 mb-4', kpi.bg, kpi.color]">
        <component :size="36" :is="kpi.icon"></component>
      </div>
      <p class="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wide mb-1">
        {{ kpi.title }}
      </p>
      <p class="text-lg md:text-xl font-bold text-center">
        {{ kpi.value }}
      </p>
    </div>
  </div>
</template>