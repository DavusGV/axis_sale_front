<script setup lang="ts">
import type { BarcodePreviewResponse } from '@/api/barcodes'

defineProps<{
  preview: BarcodePreviewResponse | null
  loading: boolean
}>()
</script>

<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-bg4">
    <!-- resumen -->
    <div v-if="preview && !loading" class="flex items-center justify-between mb-3 text-sm">
      <span class="text-gray-600 dark:text-gray-300">
        <strong>{{ preview.total_etiquetas }}</strong> etiquetas en
        <strong>{{ preview.total_paginas }}</strong>
        {{ preview.total_paginas === 1 ? 'página' : 'páginas' }}
      </span>
      <span v-if="preview.total_paginas > 1" class="text-xs text-gray-400">
        Mostrando la primera página
      </span>
    </div>

    <!-- loading -->
    <div v-if="loading" class="py-12 text-center text-sm text-gray-400">
      Generando vista previa...
    </div>

    <!-- sin resultados -->
    <div v-else-if="preview && preview.total_etiquetas === 0"
         class="py-12 text-center text-sm text-gray-400">
      No hay etiquetas para generar con estas opciones.
    </div>

    <!-- hoja simulada tamaño carta -->
    <div
      v-else-if="preview"
      class="mx-auto bg-white shadow-sm border border-gray-300"
      style="width: 100%; max-width: 400px; aspect-ratio: 8.5 / 11; padding: 4%;"
    >
      <div
        class="grid h-full"
        :style="{
          gridTemplateColumns: `repeat(${preview.columnas}, 1fr)`,
          gridTemplateRows: `repeat(${preview.filas}, 1fr)`,
          gap: '3px',
        }"
      >
        <div
          v-for="(et, idx) in preview.primera_pagina"
          :key="idx"
          class="border border-dashed border-gray-400 flex flex-col items-center justify-center px-1 overflow-hidden"
        >
          <span class="text-[6px] font-semibold text-gray-800 truncate w-full text-center leading-tight">
            {{ et.nombre }}
          </span>
          <img :src="et.barcode" alt="barcode" class="w-full object-contain" style="max-height: 45%;" />
          <span class="text-[5px] text-gray-600 tracking-wide">{{ et.codigo }}</span>
          <span v-if="et.precio !== null" class="text-[6px] font-bold text-gray-800">
            ${{ Number(et.precio).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- estado inicial -->
    <div v-else class="py-12 text-center text-sm text-gray-400">
      Configura las opciones para ver la vista previa.
    </div>
  </div>
</template>