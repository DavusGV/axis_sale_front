<script setup lang="ts">
import {
  IconCreditCard,
  IconCash,
  IconPercentage,
  IconChecks,
  IconAlertCircle
} from '@tabler/icons-vue'

defineProps<{ totales: any }>()
</script>

<template>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">

    <!-- Total creditos -->
    <div class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 col-span-12 sm:col-span-6 xl:col-span-4 border dark:border-n500">
      <div class="flex gap-4 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-indigo-500/10 dark:bg-bg3 text-indigo-500">
          <IconCreditCard :size="32" />
        </span>
        <div>
          <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Total creditos</p>
          <h4 class="h4 font-semibold">{{ totales.total_creditos }}</h4>
        </div>
      </div>
      <div class="mt-3 flex gap-4 text-xs">
        <span class="flex items-center gap-1 text-green-600">
          <IconChecks :size="14" />
          {{ totales.liquidados }} liquidados
        </span>
        <span class="flex items-center gap-1 text-orange-500">
          <IconAlertCircle :size="14" />
          {{ totales.activos }} activos
        </span>
      </div>
    </div>

    <!-- Cobrado vs Pendiente -->
    <div class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 col-span-12 sm:col-span-6 xl:col-span-4 border dark:border-n500">
      <div class="flex gap-4 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-emerald-500/10 dark:bg-bg3 text-emerald-500">
          <IconCash :size="32" />
        </span>
        <div>
          <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Cobrado / Pendiente</p>
          <h4 class="h4 font-semibold">
            <span class="text-emerald-500">${{ Number(totales.total_cobrado).toFixed(2) }}</span>
            <span class="text-gray-400 text-sm mx-1">/</span>
            <span class="text-orange-500">${{ Number(totales.total_pendiente).toFixed(2) }}</span>
          </h4>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span>De ${{ Number(totales.total_a_pagar).toFixed(2) }} total</span>
          <span>{{ totales.total_a_pagar > 0 ? Math.round((totales.total_cobrado / totales.total_a_pagar) * 100) : 0 }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
          <div
            class="bg-emerald-500 h-1.5 rounded-full transition-all"
            :style="{ width: (totales.total_a_pagar > 0 ? Math.min((totales.total_cobrado / totales.total_a_pagar) * 100, 100) : 0) + '%' }"
          />
        </div>
      </div>
    </div>

    <!-- Ganancia por comisiones -->
    <div class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 col-span-12 sm:col-span-6 xl:col-span-4 border dark:border-n500">
      <div class="flex gap-4 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-yellow-500/10 dark:bg-bg3 text-yellow-500">
          <IconPercentage :size="32" />
        </span>
        <div>
          <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Ganancia por comisiones</p>
          <h4 class="h4 font-semibold text-yellow-500">${{ Number(totales.comision_cobrada).toFixed(2) }}</h4>
        </div>
      </div>
      <div class="mt-3 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Total comisiones:</span>
        <span class="font-medium">${{ Number(totales.total_intereses).toFixed(2) }}</span>
      </div>
      <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Por cobrar:</span>
        <span class="font-medium text-orange-500">${{ Number(totales.comision_pendiente).toFixed(2) }}</span>
      </div>
    </div>

  </div>
</template>