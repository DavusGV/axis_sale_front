<script setup lang="ts">
import SalesOverview from '@/components/dashboards/personal-2/SalesOverview.vue';
import Statistics from '@/components/dashboards/personal-2/Statistics.vue';
import Calender from '@/components/dashboards/personal-2/Calendar.vue';
import TopBanner from '@/components/shared/TopBanner.vue';
import MyTasks from '@/components/dashboards/personal-2/MyTasks.vue';
import LiveUsers from '@/components/dashboards/personal-2/LiveUsers.vue';
</script>

<template>
    <TopBanner>
        <RouterLink to="#" class="btn">Project Analytics</RouterLink>
    </TopBanner>
    <Statistics />
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <SalesOverview />
        <Calender />
        <MyTasks />
        <LiveUsers />
    </div>
</template>