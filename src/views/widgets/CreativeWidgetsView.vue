<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import Achivement1 from '@/components/widgets/creative/Achivement1.vue'
import Achivement2 from '@/components/widgets/creative/Achivement2.vue'
import Achivement3 from '@/components/widgets/creative/Achivement3.vue'
import Completed from '@/components/widgets/creative/Completed.vue'
import FoodOrders from '@/components/widgets/creative/FoodOrders.vue'
import Product from '@/components/widgets/creative/Product.vue'
import Profile from '@/components/widgets/creative/Profile.vue'
import SettingsCard from '@/components/widgets/creative/SettingsCard.vue'
import Team from '@/components/widgets/creative/Team.vue'
</script>

<template>
  <TopBanner title="Creative Widgets">
    <RouterLink to="#" class="btn">Recent Tasks</RouterLink>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <Achivement1 />
    <Achivement2 />
    <Achivement3 />
    <Product />
    <Profile />
    <Completed />
    <SettingsCard />
    <Team />
    <FoodOrders />
  </div>
</template>
