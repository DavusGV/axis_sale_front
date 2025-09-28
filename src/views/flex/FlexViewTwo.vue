<script setup lang="ts">
import FlexListTwo from '@/components/flex/FlexListTwo.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <TopBanner title="Flex List Style 02">
    <div class="flex justify-end gap-4 lg:gap-6">
      <RouterLink to="#" class="btn-outline">Manage</RouterLink>
      <RouterLink to="#" class="btn">Add User</RouterLink>
    </div>
  </TopBanner>
  <FlexListTwo />
</template>
