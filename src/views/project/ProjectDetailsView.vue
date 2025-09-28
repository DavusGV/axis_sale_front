<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import ProjectDetails from '@/components/projects/ProjectDetails.vue'
</script>

<template>
  <TopBanner title="Project Style 01">
    <RouterLink to="#" class="btn">Manage Projects</RouterLink>
  </TopBanner>
  <ProjectDetails />
</template>
