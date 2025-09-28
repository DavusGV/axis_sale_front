<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import KanbanBoard from '@/components/projects/KanbanBoard.vue'
</script>

<template>
  <TopBanner title="Kanban Board">
    <RouterLink to="#" class="btn">Create New Board</RouterLink>
  </TopBanner>
  <KanbanBoard />
</template>
