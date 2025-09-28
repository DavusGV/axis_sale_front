<script setup lang="ts">
import TopBannerVue from '@/components/dashboards/personal-1/TopBanner.vue'
import StatBoxesVue from '@/components/dashboards/personal-1/StatBoxes.vue'
import MonthlyRevenueChartVue from '@/components/dashboards/personal-1/MonthlyRevenueChart.vue';
import ProjectsOverview from '@/components/dashboards/personal-1/ProjectsOverview.vue';
import ProgressOverivew from '@/components/dashboards/personal-1/ProgressOverivew.vue';
import BrowserSessions from '@/components/dashboards/personal-1/BrowserSessions.vue';
</script>

<template>
    <main class="duration-300">
        <TopBannerVue />
        <StatBoxesVue />
        <div class="grid grid-cols-12 gap-4 xxxl:gap-6 mt-4 lg:mt-6">
            <div class="col-span-12 lg:col-span-6">
                <MonthlyRevenueChartVue />
            </div>
            <div class="col-span-12 lg:col-span-6">
                <ProjectsOverview />
            </div>
            <div class="col-span-12 lg:col-span-6">
                <ProgressOverivew />
            </div>
            <div class="col-span-12 lg:col-span-6">
                <BrowserSessions />
            </div>

        </div>
    </main>
</template>

