<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'

const rows = Array.from({ length: 12 })
</script>

<template>
  <TopBanner title="Placeload Style 03" />
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <div v-for="(_, i) in rows" :key="i"
      class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 border border-n30 dark:border-n500 w-full min-w-max flex flex-col items-center justify-center gap-8 rounded-lg p-2 sm:p-4 xl:p-6 mx-auto bg-n0 dark:bg-bg4">
      <div class="animate-pulse flex gap-4 items-center justify-center w-48">
        <div class="rounded-full bg-n40 dark:bg-n400 h-24 w-24"></div>
      </div>
      <div class="animate-pulse flex flex-col gap-4 items-center w-48">
        <div class="rounded-xl bg-n40 dark:bg-n400 h-3 w-48"></div>
        <div class="rounded-xl bg-n40 dark:bg-n400 h-2 w-32"></div>
      </div>
      <div class="animate-pulse flex flex-col gap-2 grow w-full">
        <div class="rounded-md bg-n40 dark:bg-n400 h-3 w-full"></div>
        <div class="rounded-md bg-n40 dark:bg-n400 h-3 w-full"></div>
        <div class="rounded-md bg-n40 dark:bg-n400 h-3 w-11/12"></div>
        <div class="rounded-md bg-n40 dark:bg-n400 h-3 w-8/12"></div>
      </div>
      <div class="animate-pulse flex gap-1 items-center grow">
        <div class="rounded-full bg-n40 dark:bg-n400 h-10 w-10"></div>
        <div class="rounded-full bg-n40 dark:bg-n400 h-10 w-10"></div>
        <div class="rounded-full bg-n40 dark:bg-n400 h-10 w-10"></div>
        <div class="rounded-full bg-n40 dark:bg-n400 h-10 w-10"></div>
      </div>
      <div class="animate-pulse flex gap-4 items-center">
        <div class="rounded-xl bg-n40 dark:bg-n400 h-10 w-32"></div>
        <div class="rounded-xl bg-n40 dark:bg-n400 h-10 w-32"></div>
      </div>
    </div>
  </div>
</template>
