<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  ventasDia: Array<{
    producto_id: number
    nombre: string
    total_vendido: number
  }>
}>()
</script>

<template>
  <div class="col-span-12 lg:col-span-8 box cursor-pointer hover:shadow-md transition"
    @click.stop="router.push('/ventas/historial')"
  >
    <div class="flex flex-wrap justify-between items-center gap-3 pb-4 lg:pb-6 mb-4 lg:mb-6 bb-dashed">
      <p class="font-medium">Ventas del dia - Productos vendidos</p>
    </div>

    <div v-if="ventasDia.length > 0" class="w-full overflow-x-auto">
      <table class="w-full whitespace-nowrap">
        <thead>
          <tr class="bg-primary/5 dark:bg-bg3 text-n500 dark:text-n30">
            <th class="py-3 font-semibold px-4 text-start">Producto</th>
            <th class="py-3 font-semibold px-4 text-start">Cantidad vendida</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="producto in ventasDia"
            :key="producto.producto_id"
            class="hover:bg-primary/5"
          >
            <td class="px-4 py-2">{{ producto.nombre }}</td>
            <td class="px-4 py-2 font-semibold">{{ producto.total_vendido }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p class="text-sm text-n300">No se han realizado ventas hoy</p>
    </div>
  </div>
</template>