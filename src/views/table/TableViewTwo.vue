<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import TableListTwo from '@/components/table/TableListTwo.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <TopBanner title="Table List Style 02">
    <RouterLink to="#" class="btn">Manage Products</RouterLink>
  </TopBanner>
  <TableListTwo />
</template>
