<script setup lang="ts">
import VideoBigCard from '@/components/dashboards/video/VideoBigCard.vue'
import VideoCard2 from '@/components/dashboards/video/VideoCard2.vue'
import VideoCard3 from '@/components/dashboards/video/VideoCard3.vue'
import VideoCard4 from '@/components/dashboards/video/VideoCard4.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Video">
    <RouterLink to="#" class="btn">Add Video</RouterLink>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <VideoBigCard />
    <VideoCard2 />
    <VideoCard3 />
    <VideoCard4 />
  </div>
</template>
