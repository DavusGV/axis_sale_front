<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import TableListThree from '@/components/table/TableListThree.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <TopBanner title="Table List Style 03">
    <RouterLink to="#" class="btn">Manage Documents</RouterLink>
  </TopBanner>
  <TableListThree />
</template>
