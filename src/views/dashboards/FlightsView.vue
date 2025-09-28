<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue';
import Hero from '@/components/dashboards/flights/Hero.vue';
import FlightList from '@/components/dashboards/flights/FlightList.vue';
import RightCol from '@/components/dashboards/flights/RightCol.vue';

</script>

<template>
  <TopBanner title="Flights Booking">
    <RouterLink to="#" class="btn">Recent Bookings</RouterLink>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <Hero />
    <FlightList />
    <RightCol />
  </div>
</template>