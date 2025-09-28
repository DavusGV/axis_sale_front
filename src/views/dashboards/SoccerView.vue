<script setup lang="ts">
import AvailableLeague from '@/components/dashboards/soccer/AvailableLeague.vue';
import Hero from '@/components/dashboards/soccer/Hero.vue';
import LiveMatch from '@/components/dashboards/soccer/LiveMatch.vue';
import Matches from '@/components/dashboards/soccer/Matches.vue';
import TopBanner from '@/components/shared/TopBanner.vue';

</script>

<template>
    <TopBanner title="Soccer">
        <RouterLink to="#" class="btn">Schedule</RouterLink>
    </TopBanner>
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <Hero />
        <LiveMatch />
        <Matches />
        <AvailableLeague />
    </div>
</template>