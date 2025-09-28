<script setup lang="ts">
import FeedSettings from '@/components/dashboards/hr/FeedSettings.vue';
import Hero from '@/components/dashboards/hr/Hero.vue';
import NewUsers from '@/components/dashboards/hr/NewUsers.vue';
import TopBanner from '@/components/shared/TopBanner.vue';


</script>

<template>
    <TopBanner title="Human Resources">
        <RouterLink to="#" class="btn">Active Jobs</RouterLink>
    </TopBanner>
    <Hero />
    <NewUsers />
    <FeedSettings />
</template>