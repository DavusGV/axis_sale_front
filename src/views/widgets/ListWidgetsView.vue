<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import PopularActivities from '@/components/widgets/list/PopularActivities.vue'
import PopularCoins from '@/components/widgets/list/PopularCoins.vue'
import ProjectSummery from '@/components/widgets/list/ProjectSummery.vue'
import RecentActivities from '@/components/widgets/list/RecentActivities.vue'
import TrendingNow from '@/components/widgets/list/TrendingNow.vue'
import TrendingStocks from '@/components/widgets/list/TrendingStocks.vue'
</script>

<template>
  <TopBanner title="List Widgets">
    <RouterLink to="#" class="btn">Add Widget</RouterLink>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <PopularActivities />
    <TrendingNow />
    <RecentActivities />
    <TrendingStocks />
    <ProjectSummery />
    <PopularCoins />
  </div>
</template>
