<script setup lang="ts">
import { computed } from 'vue'
import { IconArrowUp, IconShoppingCart, IconAlertTriangle } from '@tabler/icons-vue'
import type { StockTimelineItem } from '@/api/stock'

const props = defineProps<{
  items: StockTimelineItem[]
  productoNombre: string
}>()

function colorPorTipo(tipo: string) {
  if (tipo === 'entrada')    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (tipo === 'venta')      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (tipo === 'reduccion')  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-gray-100 text-gray-700'
}

function iconoPorTipo(tipo: string) {
  if (tipo === 'entrada')   return IconArrowUp
  if (tipo === 'venta')     return IconShoppingCart
  if (tipo === 'reduccion') return IconAlertTriangle
  return IconArrowUp
}

function etiquetaTipo(tipo: string) {
  if (tipo === 'entrada')   return 'Entrada'
  if (tipo === 'venta')     return 'Venta'
  if (tipo === 'reduccion') return 'Reduccion'
  return tipo
}

// agrupamos por fecha para que el timeline tenga separadores por dia
const itemsPorFecha = computed(() => {
  const grupos: Record<string, StockTimelineItem[]> = {}
  for (const item of props.items) {
    if (!grupos[item.fecha]) grupos[item.fecha] = []
    grupos[item.fecha].push(item)
  }
  return grupos
})

function formatearFecha(fecha: string) {
  try {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return fecha
  }
}
</script>

<template>
  <div class="col-span-12 box">
    <div class="flex flex-wrap justify-between items-center gap-3 pb-4 lg:pb-6 mb-4 lg:mb-6 bb-dashed">
      <div>
        <p class="font-medium text-lg">Historial de movimientos</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ productoNombre || 'Selecciona un producto' }}
        </p>
      </div>
      <span class="text-xs text-gray-500">
        Total: {{ items.length }} movimiento(s)
      </span>
    </div>

    <div v-if="items.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
      <i class="fa-solid fa-clock-rotate-left text-5xl mb-3"></i>
      <p>No hay movimientos en el rango seleccionado.</p>
    </div>

    <div v-else class="max-h-[600px] overflow-y-auto pr-2">
      <div v-for="(items, fecha) in itemsPorFecha" :key="fecha" class="mb-6">

        <!-- separador de fecha -->
        <div class="sticky top-0 bg-white dark:bg-bg4 z-10 py-2 mb-3 border-b border-gray-200 dark:border-gray-700">
          <p class="text-sm font-semibold text-gray-600 dark:text-gray-300 capitalize">
            {{ formatearFecha(fecha) }}
          </p>
        </div>

        <!-- items del dia -->
        <div class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-bg3 transition border border-gray-100 dark:border-gray-700"
          >
            <!-- icono -->
            <div :class="['rounded-full p-2 h-fit', colorPorTipo(item.tipo)]">
              <component :size="18" :is="iconoPorTipo(item.tipo)" />
            </div>

            <!-- contenido -->
            <div class="flex-1">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span :class="['text-xs font-medium px-2 py-0.5 rounded', colorPorTipo(item.tipo)]">
                    {{ etiquetaTipo(item.tipo) }}
                  </span>
                  <span class="font-semibold text-base">
                    {{ item.cantidad }} unidad(es)
                  </span>
                  <span v-if="item.referencia" class="text-xs text-gray-500">
                    {{ item.referencia }}
                  </span>
                </div>
                <span class="text-xs text-gray-500">{{ item.hora }}</span>
              </div>

              <p v-if="item.motivo" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span class="font-medium">Motivo:</span> {{ item.motivo }}
              </p>

              <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>
                  <i class="fa-solid fa-user mr-1"></i>
                  {{ item.usuario }}
                </span>
                <span v-if="item.stock_anterior !== null && item.stock_nuevo !== null">
                  <i class="fa-solid fa-cubes mr-1"></i>
                  Stock: {{ item.stock_anterior }} → {{ item.stock_nuevo }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>