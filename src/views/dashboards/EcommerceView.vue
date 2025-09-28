<script setup lang="ts">
import SalesForecast from '@/components/dashboards/analytics/SalesForecast.vue'
import RecentOrders from '@/components/dashboards/ecommerce/RecentOrders.vue'
import Stats from '@/components/dashboards/ecommerce/Stats.vue'
import MonthlyRevenueChart from '@/components/dashboards/personal-1/MonthlyRevenueChart.vue'
import SalesOverview from '@/components/dashboards/personal-2/SalesOverview.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Ecommerce">
    <div class="flex justify-between items-center gap-4 lg:gap-6">
      <RouterLink to="#" class="btn">View Reports</RouterLink>
      <RouterLink to="#" class="btn-outline">Manage Store</RouterLink>
    </div>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <Stats />
    <div class="col-span-12 xl:col-span-6">
      <MonthlyRevenueChart />
    </div>
    <div class="col-span-12 xl:col-span-6">
      <SalesOverview />
    </div>
    <div class="col-span-12 md:col-span-7 lg:col-span-8">
      <RecentOrders />
    </div>
    <div class="col-span-12 md:col-span-5 lg:col-span-4">
      <SalesForecast />
    </div>
  </div>
</template>
