<script setup lang="ts">
import FaceBookStats from '@/components/dashboards/influencer/FaceBookStats.vue';
import InstagramStatsVue from '@/components/dashboards/influencer/InstagramStats.vue';
import Profile from '@/components/dashboards/influencer/Profile.vue';
import TiktokStats from '@/components/dashboards/influencer/TiktokStats.vue';
import TwitterStats from '@/components/dashboards/influencer/TwitterStats.vue';
import TopBanner from '@/components/shared/TopBanner.vue';


</script>

<template>
    <TopBanner title="Influencer">
        <RouterLink to="#" class="btn">Add Account</RouterLink>
    </TopBanner>
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <div class="col-span-12 xl:col-span-8">
            <Profile />
            <InstagramStatsVue />
            <FaceBookStats />
            <TwitterStats />
        </div>
        <div class="col-span-12 xl:col-span-4">
            <TiktokStats />
        </div>
    </div>
</template>