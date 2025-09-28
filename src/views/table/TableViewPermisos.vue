<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import TableListOne from '@/components/table/TableListOne.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <TopBanner title="Permisos">
    <RouterLink to="#" class="btn">Add New</RouterLink>
  </TopBanner>
  <TableListOne />
</template>
