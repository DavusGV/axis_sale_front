<script setup lang="ts">
import Stats from '@/components/dashboards/analytics/Stats.vue';
import ProjectsOverview from '@/components/dashboards/analytics/ProjectsOverview.vue';
import TopBanner from '@/components/shared/TopBanner.vue';
import MarketChart from '@/components/dashboards/analytics/MarketChart.vue';
import RevenueHistory from '@/components/dashboards/analytics/RevenueHistory.vue';
import SummeryChart from '@/components/dashboards/analytics/SummeryChart.vue';
import RecentTickets from '@/components/dashboards/analytics/RecentTickets.vue';
import SalesForecast from '@/components/dashboards/analytics/SalesForecast.vue';
import { IconDownload } from '@tabler/icons-vue';


</script>

<template>
    <div>
        <TopBanner title="Analytics Dashboard">
            <RouterLink to="#" class="btn">
                <IconDownload :size="20" /> Project Reports
            </RouterLink>
        </TopBanner>
        <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
            <div class="col-span-12 lg:col-span-8">
                <Stats />
                <ProjectsOverview />
                <MarketChart />
                <RevenueHistory />
            </div>
            <div class="col-span-12 lg:col-span-4">
                <SummeryChart />
                <RecentTickets />
                <SalesForecast />
            </div>
        </div>
    </div>
</template>