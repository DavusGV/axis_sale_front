<script setup lang="ts">
import Chat from '@/components/dashboards/messaging/Chat.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Messaging">
    <RouterLink to="#" class="btn">Add User</RouterLink>
  </TopBanner>
  <Chat />
</template>
