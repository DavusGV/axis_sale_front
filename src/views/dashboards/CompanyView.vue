<script setup lang="ts">
import CompanyHistory from '@/components/dashboards/company/CompanyHistory.vue';
import CompanyOverview from '@/components/dashboards/company/CompanyOverview.vue';
import CompanyProfile from '@/components/dashboards/company/CompanyProfile.vue';
import ProfitOverview from '@/components/dashboards/company/ProfitOverview.vue';
import ProjectsSummery from '@/components/dashboards/company/ProjectsSummery.vue';
import Stats from '@/components/dashboards/company/Stats.vue';
import TopBanner from '@/components/shared/TopBanner.vue';


</script>

<template>
    <TopBanner title="Company Board">
        <RouterLink to="#" class="btn">Invite Users</RouterLink>
    </TopBanner>
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <Stats />
        <div class="col-span-12 xl:col-span-8">
            <CompanyOverview />
            <ProfitOverview />
            <CompanyHistory />
        </div>
        <div class="col-span-12 xl:col-span-4 grid grid-cols-2 gap-4 xxxl:gap-6">
            <CompanyProfile />
            <ProjectsSummery />
        </div>
    </div>
</template>