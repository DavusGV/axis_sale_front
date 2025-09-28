<script setup lang="ts">
import Jobs from '@/components/dashboards/jobs/Jobs.vue';
import SearchBar from '@/components/dashboards/jobs/SearchBar.vue';
import TopBanner from '@/components/shared/TopBanner.vue';


</script>

<template>
    <TopBanner title="Jobs Dashboard">
        <RouterLink to="#" class="btn">Create Alert</RouterLink>
    </TopBanner>
    <SearchBar />
    <Jobs />
</template>