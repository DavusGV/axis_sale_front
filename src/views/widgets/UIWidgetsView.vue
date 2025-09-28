<script setup lang="ts">
import SalesForecast from '@/components/dashboards/analytics/SalesForecast.vue'
import ProjectsOverview from '@/components/dashboards/personal-1/ProjectsOverview.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import EmailSettings from '@/components/widgets/ui/EmailSettings.vue'
import PopularTag from '@/components/widgets/ui/PopularTag.vue'
import WhoFollowing from '@/components/widgets/ui/WhoFollowing.vue'
import Calendar from '@/components/dashboards/personal-2/Calendar.vue'
import ProjectStatus from '@/components/dashboards/personal-3/ProjectStatus.vue'
import LiveUsers from '@/components/widgets/ui/LiveUsers.vue'
import SearchBar from '@/components/widgets/ui/SearchBar.vue'
import Followers from '@/components/widgets/ui/Followers.vue'
import Gallery from '@/components/widgets/ui/Gallery.vue'
</script>

<template>
  <TopBanner title="UI Widgets">
    <RouterLink to="#" class="btn">Upgrade Now</RouterLink>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <div class="col-span-12 min-[640px]:col-span-6 xl:col-span-4 overflow-hidden">
      <div
        class="flex items-center pr-1 box mb-4 xxxl:mb-6 p-4 xxxl:p-6 relative after:bg-[url(/images/welcome.png)] after:bg-no-repeat after:bg-right-bottom after:bg-contain after:absolute after:w-full after:h-full rtl:after:scale-x-[-1]">
        <div>
          <h2 class="h2 mb-4 leading-tight">
            Welcome <br />
            back, <br />
            Hawkins
          </h2>
          <p><span class="text-primary">DashBoi</span> Dashboard</p>
        </div>
      </div>
      <div class="mb-4 xxxl:mb-6">
        <ProjectsOverview />
      </div>
      <SalesForecast />
    </div>
    <div class="col-span-12 min-[640px]:col-span-6 xl:col-span-4">
      <WhoFollowing />
      <EmailSettings />
      <PopularTag />
    </div>
    <div class="col-span-12 min-[640px]:col-span-6 xl:col-span-4">
      <SearchBar />
      <Calendar />
      <Followers />
      <Gallery />
    </div>
    <div class="col-span-12 min-[640px]:col-span-6 xl:col-span-12 grid grid-cols-12 gap-4 xxxl:gap-6">
      <LiveUsers />
      <div class="col-span-12 xl:col-span-6 min-h-full">
        <ProjectStatus />
      </div>
    </div>
  </div>
</template>
