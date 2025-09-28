<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import UserGridThree from '@/components/user-grid/UserGridThree.vue'
</script>

<template>
  <TopBanner title="User Grid Style 03">
    <div class="flex gap-4 lg:gap-6 justify-end">
      <RouterLink to="#" class="btn-outline">Manage</RouterLink>
      <RouterLink to="#" class="btn">Add User</RouterLink>
    </div>
  </TopBanner>
  <UserGridThree />
</template>
