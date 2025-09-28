<script setup lang="ts">
import EnergyLevelChart from '@/components/dashboards/health/EnergyLevelChart.vue'
import Hero from '@/components/dashboards/health/Hero.vue'
import OverallConditionChart from '@/components/dashboards/health/OverallConditionChart.vue'
import OxygenationChart from '@/components/dashboards/health/OxygenationChart.vue'
import Stats from '@/components/dashboards/health/Stats.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Health">
    <RouterLink to="#" class="btn">Appointment</RouterLink>
  </TopBanner>
  <Hero />
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6 mt-4 xxxl:mt-6">
    <Stats />
    <EnergyLevelChart />
    <OxygenationChart />
    <OverallConditionChart />
  </div>
</template>
