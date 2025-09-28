<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import TileGridOne from '@/components/tile-grid/TileGridOne.vue'
</script>

<template>
  <TopBanner title="Tile Grid Style 01">
    <div class="flex gap-4 lg:gap-6 justify-end">
      <RouterLink to="#" class="btn-outline">Manage</RouterLink>
      <RouterLink to="#" class="btn">Add User</RouterLink>
    </div>
  </TopBanner>
  <TileGridOne />
</template>
