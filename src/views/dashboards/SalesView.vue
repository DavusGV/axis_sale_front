<script setup lang="ts">
import ProgressOverivew from '@/components/dashboards/sales/ProgressOverivew.vue';
import RevenueOverview from '@/components/dashboards/sales/RevenueOverview.vue';
import SalesStatistics from '@/components/dashboards/sales/SalesStatistics.vue';
import ShowcaseInfo from '@/components/dashboards/sales/ShowcaseInfo.vue';
import Stats from '@/components/dashboards/sales/Stats.vue';
import TopBanner from '@/components/shared/TopBanner.vue';


</script>

<template>
    <TopBanner title="Sales">
        <div class="flex gap-4 xl:gap-6">
            <RouterLink to="#" class="btn-outline">View Reports</RouterLink>
            <RouterLink to="#" class="btn">Transactions</RouterLink>
        </div>
    </TopBanner>
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <Stats />
        <SalesStatistics />
        <ShowcaseInfo />
        <ProgressOverivew />
        <RevenueOverview />
    </div>
</template>