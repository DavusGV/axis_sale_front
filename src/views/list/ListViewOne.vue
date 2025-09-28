<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import ListOne from '@/components/list/ListOne.vue'
</script>

<template>
  <TopBanner title="List View Style 01">
    <div class="flex justify-end gap-4 lg:gap-6">
      <RouterLink to="#" class="btn-outline">Manage</RouterLink>
      <RouterLink to="#" class="btn">Add User</RouterLink>
    </div>
  </TopBanner>
  <ListOne />
</template>
