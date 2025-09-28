<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import TileGridThree from '@/components/tile-grid/TileGridThree.vue'
</script>

<template>
  <TopBanner title="Tile Grid Style 01">
    <div class="flex gap-4 lg:gap-6 justify-end">
      <RouterLink to="#" class="btn-outline">Manage</RouterLink>
      <RouterLink to="#" class="btn">Upload</RouterLink>
    </div>
  </TopBanner>
  <TileGridThree />
</template>
