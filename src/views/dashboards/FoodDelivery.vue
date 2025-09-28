<script setup lang="ts">
import Category from '@/components/dashboards/food-delivery/Category.vue'
import Hero from '@/components/dashboards/food-delivery/Hero.vue'
import PopularDishes from '@/components/dashboards/food-delivery/PopularDishes.vue'
import RecentOrders from '@/components/dashboards/food-delivery/RecentOrders.vue'
import Sidebar from '@/components/dashboards/food-delivery/Sidebar.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Food Delivery">
    <RouterLink to="#" class="btn">Quick Order</RouterLink>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6 foodapp">
    <Hero />
    <div class="col-span-12 lg:col-span-7 xl:col-span-8">
      <Category />
      <PopularDishes />
      <RecentOrders />
    </div>
    <div class="col-span-12 lg:col-span-5 xl:col-span-4">
      <Sidebar />
    </div>
  </div>
</template>
