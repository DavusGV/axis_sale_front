<script setup lang="ts">
import ListTwo from '@/components/list/ListTwo.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="List View Style 02">
    <RouterLink to="#" class="btn">Add Project</RouterLink>
  </TopBanner>
  <ListTwo />
</template>
