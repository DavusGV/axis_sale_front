<script setup lang="ts">
import CardGridOne from '@/components/card-grid/CardGridOne.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Card Grid Style 01">
    <RouterLink to="#" class="btn">Manage Users</RouterLink>
  </TopBanner>
  <CardGridOne />
</template>
