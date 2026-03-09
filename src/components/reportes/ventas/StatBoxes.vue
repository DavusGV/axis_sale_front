<script setup lang="ts">
import { IconCoin, IconChartHistogram, IconReportAnalytics, IconCreditCard } from '@tabler/icons-vue'
defineProps<{ totales: any }>()
</script>

<template>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">

    <!-- Inversion -->
    <div class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 xxxl:px-8 col-span-12 sm:col-span-6 xl:col-span-3 border dark:border-n500">
      <div class="flex gap-4 xxxl:gap-6 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-primary/10 dark:bg-bg3 text-primary">
          <IconCoin :size="32" />
        </span>
        <div>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">Total de inversion</p>
          <h4 class="h4 font-semibold">${{ Number(totales.inversion).toFixed(2) }}</h4>
        </div>
      </div>
    </div>

    <!-- Cobrado real -->
    <div class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 xxxl:px-8 col-span-12 sm:col-span-6 xl:col-span-3 border dark:border-n500">
      <div class="flex gap-4 xxxl:gap-6 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-emerald-500/10 dark:bg-bg3 text-emerald-500">
          <IconChartHistogram :size="32" />
        </span>
        <div>
          <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Cobrado real</p>
          <h4 class="h4 font-semibold">${{ Number(totales.cobrado_real).toFixed(2) }}</h4>
        </div>
      </div>
      <div class="mt-3 flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
        <div class="flex justify-between">
          <span>Contado:</span>
          <span class="font-medium text-gray-700 dark:text-gray-200">${{ Number(totales.cobrado_contado).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Credito cobrado:</span>
          <span class="font-medium text-green-600">${{ Number(totales.cobrado_credito).toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Pendiente credito -->
    <div class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 xxxl:px-8 col-span-12 sm:col-span-6 xl:col-span-3 border dark:border-n500">
      <div class="flex gap-4 xxxl:gap-6 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-orange-500/10 dark:bg-bg3 text-orange-500">
          <IconCreditCard :size="32" />
        </span>
        <div>
          <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Adeudo en credito</p>
          <h4 class="h4 font-semibold text-orange-500">${{ Number(totales.pendiente_credito).toFixed(2) }}</h4>
        </div>
      </div>
      <p class="mt-3 text-xs text-gray-400">Mercancia entregada pendiente de cobro</p>
    </div>

    <!-- Ganancia real -->
    <div class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 xxxl:px-8 col-span-12 sm:col-span-6 xl:col-span-3 border dark:border-n500">
      <div class="flex gap-4 xxxl:gap-6 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-primary/10 dark:bg-bg3 text-primary">
          <IconReportAnalytics :size="32" />
        </span>
        <div>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">Ganancia real</p>
          <h4 class="h4 font-semibold" :class="totales.ganancia_real >= 0 ? 'text-emerald-500' : 'text-red-500'">
            ${{ Number(totales.ganancia_real).toFixed(2) }}
          </h4>
        </div>
      </div>
      <div class="w-full bg-primary/10 rounded-sm h-1 mt-5 mb-4">
        <div class="bg-primary h-1 rounded-sm" :style="{ width: Math.min(Math.round((totales.ganancia_real / totales.inversion) * 100), 100) + '%' }"></div>
      </div>
      <p class="text-xs text-gray-400">
        {{ totales.inversion > 0 ? Math.round((totales.ganancia_real / totales.inversion) * 100) : 0 }}% sobre inversion
      </p>
    </div>

  </div>
</template>