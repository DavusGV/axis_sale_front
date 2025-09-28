<script setup lang="ts">
import FlexListThree from '@/components/flex/FlexListThree.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <TopBanner title="Flex List Style 03">
    <div class="flex justify-end gap-4 lg:gap-6">
      <RouterLink to="#" class="btn-outline">Manage</RouterLink>
      <RouterLink to="#" class="btn">Add User</RouterLink>
    </div>
  </TopBanner>
  <FlexListThree />
</template>
