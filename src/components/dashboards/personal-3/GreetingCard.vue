<script setup lang="ts">
import { IconAlertTriangle, IconAlertCircle } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Recibimos stock separado en dos grupos
const props = defineProps<{
  stockCero: Array<{ id: number; nombre: string; stock: number }>
  stockBajo: Array<{ id: number; nombre: string; stock: number }>
}>()
</script>

<template>
  <div
    class="col-span-12 lg:col-span-4 box cursor-pointer hover:shadow-md transition"
    @click="router.push('/configuracion/productos')"
  >
    <p class="font-medium pb-4 lg:pb-6 mb-4 lg:mb-6 bb-dashed">
      Stock de productos
    </p>

    <!-- Contenedor con scroll -->
    <div class="max-h-[280px] overflow-y-auto pr-2 space-y-4">

      <!-- Productos con stock menor a 10 -->
      <div v-if="stockBajo.length > 0">
        <p class="text-xs font-semibold text-secondary1 mb-2 flex items-center gap-1">
          <IconAlertTriangle :size="14" />
          Menos de 10 unidades ({{ stockBajo.length }})
        </p>
        <div
          v-for="producto in stockBajo"
          :key="producto.id"
          class="flex justify-between items-center py-1.5 px-2 rounded hover:bg-primary/5"
        >
          <span class="text-sm truncate">{{ producto.nombre }}</span>
          <span class="text-sm font-semibold text-secondary1">{{ producto.stock }}</span>
        </div>
      </div>

      <!-- Productos sin stock -->
      <div v-if="stockCero.length > 0">
        <p class="text-xs font-semibold text-secondary2 mb-2 flex items-center gap-1">
          <IconAlertCircle :size="14" />
          Sin stock ({{ stockCero.length }})
        </p>
        <div
          v-for="producto in stockCero"
          :key="producto.id"
          class="flex justify-between items-center py-1.5 px-2 rounded hover:bg-secondary2/5"
        >
          <span class="text-sm truncate">{{ producto.nombre }}</span>
          <span class="text-sm font-semibold text-secondary2">0</span>
        </div>
      </div>

      <!-- Si no hay productos con stock bajo -->
      <div v-if="stockCero.length === 0 && stockBajo.length === 0">
        <p class="text-sm text-n300">Todos los productos tienen stock suficiente</p>
      </div>
    </div>
  </div>
</template>