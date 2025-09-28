<script setup lang="ts">
import LatestReviews from '@/components/dashboards/maps/LatestReviews.vue'
import Map2 from '@/components/dashboards/maps/Map2.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Map Style 02">
    <RouterLink to="#" class="btn">Add Location</RouterLink>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <LatestReviews />

    <Map2 />
  </div>
</template>
