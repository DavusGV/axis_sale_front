<script setup lang="ts">
import Inbox from '@/components/dashboards/inbox/Inbox.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Inbox">
    <RouterLink to="#" class="btn">Recycle Mail</RouterLink>
  </TopBanner>
  <Inbox />
</template>
