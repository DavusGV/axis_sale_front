<script setup lang="ts">
import { IconTrophy } from '@tabler/icons-vue'

const props = defineProps<{
  topProductos: Array<{
    producto_id: number
    nombre: string
    total_vendido: number
  }>
}>()

// Colores para el podio: oro, plata, bronce
const colores = ['text-yellow-500', 'text-gray-400', 'text-amber-700']
const bgColores = ['bg-yellow-500/10', 'bg-gray-400/10', 'bg-amber-700/10']
</script>

<template>
  <div class="col-span-12 lg:col-span-4 box">
    <div class="flex items-center gap-2 pb-4 lg:pb-6 mb-4 lg:mb-6 bb-dashed">
      <p class="font-medium">Productos mas vendidos</p>
    </div>

    <div v-if="topProductos.length > 0" class="space-y-4">
      <div
        v-for="(producto, index) in topProductos"
        :key="producto.producto_id"
        class="flex items-center gap-3 p-3 rounded-lg"
        :class="bgColores[index]"
      >
        <div class="flex items-center justify-center w-8 h-8 rounded-full" :class="bgColores[index]">
          <span class="font-bold" :class="colores[index]">{{ index + 1 }}</span>
        </div>
        <div class="flex-1">
          <p class="font-medium text-sm">{{ producto.nombre }}</p>
        </div>
        <div class="text-right">
          <p class="font-bold" :class="colores[index]">{{ producto.total_vendido }}</p>
          <p class="text-xs text-n300">vendidos</p>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="text-sm text-n300">No hay ventas registradas</p>
    </div>
  </div>
</template>