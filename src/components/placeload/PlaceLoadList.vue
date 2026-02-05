<script setup lang="ts">
const rows = Array.from({ length: 12 })
</script>

<template>
  <TopBanner title="Placeload Style 01" />
  <div class="flex flex-col gap-4 overflow-x-auto w-full">
    <div
      v-for="(_, i) in rows"
      :key="i"
      class="border border-n30 dark:border-n500 w-full min-w-max flex gap-8 rounded-lg p-4 mx-auto bg-n0 dark:bg-bg4"
    >
      <div class="animate-pulse flex gap-4 items-center grow">
        <div class="rounded-full bg-n40 dark:bg-n400 h-16 w-16"></div>
        <div class="flex-1 space-y-3 py-1">
          <div class="h-3 bg-n40 dark:bg-n400 rounded w-40"></div>
          <div class="h-3 bg-n40 dark:bg-n400 rounded w-32"></div>
        </div>
      </div>
      <div class="animate-pulse flex gap-4 items-center">
        <div class="flex-1 flex gap-3 items-center">
          <div class="h-4 bg-n40 dark:bg-n400 rounded-xl w-28"></div>
          <div class="h-4 bg-n40 dark:bg-n400 rounded-xl w-28"></div>
          <div class="h-4 bg-n40 dark:bg-n400 rounded-xl w-28"></div>
        </div>
        <div class="rounded-xl bg-n40 dark:bg-n400 h-6 w-40"></div>
      </div>
      <div class="animate-pulse flex gap-4 items-center">
        <div class="h-10 bg-n40 dark:bg-n400 rounded-full w-10"></div>
        <div class="rounded-xl bg-n40 dark:bg-n400 h-4 w-32"></div>
      </div>
      <div class="animate-pulse flex gap-4 items-center">
        <div class="rounded-xl bg-n40 dark:bg-n400 h-10 w-32"></div>
      </div>
    </div>
  </div>
</template>
