<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'

const rows = Array.from({ length: 24 })
</script>

<template>
  <TopBanner title="Placeload Style 04" />
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <div
      v-for="(_, i) in rows"
      :key="i"
      class="col-span-12 md:col-span-6 lg:col-span-4 4xl:col-span-3 border border-n30 dark:border-n500 w-full min-w-max gap-8 rounded-lg p-4 xl:p-6 mx-auto bg-n0 dark:bg-bg4"
    >
      <div class="animate-pulse flex gap-4 items-center justify-start">
        <div class="rounded-full bg-n40 dark:bg-n400 h-16 w-16"></div>
        <div class="animate-pulse flex flex-col gap-4">
          <div class="rounded-xl bg-n40 dark:bg-n400 h-3 w-40 md:w-48"></div>
          <div class="rounded-xl bg-n40 dark:bg-n400 h-2 w-24 md:w-32"></div>
        </div>
      </div>
    </div>
  </div>
</template>
