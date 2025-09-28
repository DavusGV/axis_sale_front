<script setup lang="ts">
import BalanceChart from '@/components/dashboards/personal-3/BalanceChart.vue';
import GreetingCard from '@/components/dashboards/personal-3/GreetingCard.vue';
import ProjectStatusVue from '@/components/dashboards/personal-3/ProjectStatus.vue';
import ProjectsOverivew from '@/components/dashboards/personal-3/ProjectsOverivew.vue';
import RevenueChart from '@/components/dashboards/personal-3/RevenueChart.vue';
import Stats from '@/components/dashboards/personal-3/Stats.vue';
import TopBanner from '@/components/shared/TopBanner.vue';




</script>

<template>
    <TopBanner>
        <RouterLink to="#" class="btn">Stock Projects</RouterLink>
    </TopBanner>
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <BalanceChart />
        <GreetingCard />
        <Stats />
        <RevenueChart />
        <ProjectStatusVue />
        <ProjectsOverivew />
    </div>
</template>

