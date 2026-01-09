<script setup lang="ts">
import { IconCoin } from '@tabler/icons-vue'
import { IconChartHistogram } from '@tabler/icons-vue'
import { IconReportAnalytics } from '@tabler/icons-vue'
defineProps<{ totales: any }>()


</script>
<template>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <div
      class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 xxxl:px-8 col-span-12 sm:col-span-6 xl:col-span-3 xxl:col-span-4 xxxl:col-span-3 border dark:border-n500"
    >
      <div class="flex gap-4 xxxl:gap-6 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-primary/10 dark:bg-bg3 text-primary">
          <component :size="32" :is="IconCoin"></component>
        </span>
        <div>
          <p class="mb-3">Total de inversion</p>
          <h4 class="h4 font-semibold">{{totales.inversion}}</h4>
        </div>
      </div>
    </div>


     <div
      class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 xxxl:px-8 col-span-12 sm:col-span-6 xl:col-span-3 xxl:col-span-4 xxxl:col-span-3 border dark:border-n500"
    >
      <div class="flex gap-4 xxxl:gap-6 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-primary/10 dark:bg-bg3 text-primary">
          <component :size="32" :is="IconChartHistogram"></component>
        </span>
        <div>
          <p class="mb-3">Total Vendido</p>
          <h4 class="h4 font-semibold">{{totales.vendido}}</h4>
        </div>
      </div>
      <div class="w-full bg-primary/10 rounded-sm h-1 mt-5 lg:mt-7 mb-4">
        <div class="bg-primary h-1 rounded-sm w-[70.7%]"></div>
      </div>
      <p class="flex items-center gap-2">
        <span
          class="flex items-center gap-2"
        >
          <IconTimeline />
          {{ Math.round((totales.vendido / totales.inversion) * 100) || 0 }}%
        </span>
       
      </p>
    </div>



     <div
      class="p-3 bg-n0 rounded-2xl dark:bg-bg4 sm:p-4 xxl:p-6 xxxl:px-8 col-span-12 sm:col-span-6 xl:col-span-3 xxl:col-span-4 xxxl:col-span-3 border dark:border-n500"
    >
      <div class="flex gap-4 xxxl:gap-6 items-center">
        <span class="p-3 inline-flex rounded-2xl bg-primary/10 dark:bg-bg3 text-primary">
          <component :size="32" :is="IconReportAnalytics"></component>
        </span>
        <div>
          <p class="mb-3">Total Ganancia</p>
          <h4 class="h4 font-semibold">{{totales.ganancia}}</h4>
        </div>
      </div>
      <div class="w-full bg-primary/10 rounded-sm h-1 mt-5 lg:mt-7 mb-4">
        <div class="bg-primary h-1 rounded-sm w-[70.7%]"></div>
      </div>
      <p class="flex items-center gap-2">
        <span
          class="flex items-center gap-2"
        >
          <IconTimeline />
          {{ Math.round((totales.ganancia / totales.inversion) * 100) || 0 }}%
        </span>
      </p>
    </div>

  </div>
</template>
