<script lang="ts" setup>
import { IconChartHistogram, IconShoppingCart } from '@tabler/icons-vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <RouterLink
    to="/finanzas/balance"
    title="Balance"
    class="p-2 sm:p-3 rounded-full bg-primary/5 dark:bg-bg3 text-gray-600 dark:text-gray-300 hover:text-primary transition"
    active-class="text-primary"
  >
    <IconChartHistogram :size="20" />
  </RouterLink>

  <RouterLink
    to="/ventas/ventas"
    title="Ventas"
    class="p-2 sm:p-3 rounded-full bg-primary/5 dark:bg-bg3 text-gray-600 dark:text-gray-300 hover:text-primary transition"
    active-class="text-primary"
  >
    <IconShoppingCart :size="20" />
  </RouterLink>
</template>