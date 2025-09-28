<script setup lang="ts">
import Articles from '@/components/dashboards/writer/Articles.vue'
import Hero from '@/components/dashboards/writer/Hero.vue'
import LatestComments from '@/components/dashboards/writer/LatestComments.vue'
import PopularAuthors from '@/components/dashboards/writer/PopularAuthors.vue'
import Stats from '@/components/dashboards/writer/Stats.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Writer">
    <RouterLink to="#" class="btn">Add Article</RouterLink>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <div class="col-span-12 xl:col-span-8">
      <Hero />
      <Stats />
      <PopularAuthors />
      <LatestComments />
    </div>
    <div class="col-span-12 xl:col-span-4">
      <Articles />
    </div>
  </div>
</template>
