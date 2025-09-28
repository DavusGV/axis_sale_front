<script setup lang="ts">
import Calender from '@/components/dashboards/flights/Calender.vue';
import Hobby from '@/components/dashboards/hobbies/Hobby.vue';
import HobbyList from '@/components/dashboards/hobbies/HobbyList.vue';
import PopularActivites from '@/components/dashboards/hobbies/PopularActivites.vue';
import Search from '@/components/dashboards/hobbies/Search.vue';
import TrendingNow from '@/components/dashboards/hobbies/TrendingNow.vue';
import TopBanner from '@/components/shared/TopBanner.vue';


</script>

<template>
    <TopBanner title="Hobbies">
        <RouterLink to="#" class="btn">View All</RouterLink>
    </TopBanner>
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <div class="col-span-12 xl:col-span-8">
            <Hobby />
            <div class="grid grid-cols-2 gap-4 xxxl:gap-6">
                <TrendingNow />
                <PopularActivites />
            </div>
        </div>
        <div class="col-span-12 xl:col-span-4">
            <Search />
            <Calender />
        </div>
        <HobbyList />
    </div>
</template>