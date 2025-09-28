<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue';
import Categories from '@/components/dashboards/stock/Categories.vue'
import SalesForecast from '@/components/dashboards/stock/SalesForecast.vue';
import RecentOrders from '@/components/dashboards/stock/RecentOrders.vue';
import StorageFunnel from '@/components/dashboards/stock/StorageFunnel.vue';
import TrendingStocks from '@/components/dashboards/stock/TrendingStocks.vue';

</script>

<template>
  <TopBanner title="Stock Dashboard">
    <RouterLink to="#" class="btn">Recent Orders</RouterLink>
  </TopBanner>
  <Categories />
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <SalesForecast />
    <StorageFunnel />
    <RecentOrders />
    <TrendingStocks />
  </div>
</template>