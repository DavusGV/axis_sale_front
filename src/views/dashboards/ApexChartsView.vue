<script setup lang="ts">
import BTCPriceChart from '@/components/charts/BTCPriceChart.vue'
import BalanceChart from '@/components/charts/BalanceChart.vue'
import CompanyOverview from '@/components/charts/CompanyOverview.vue'
import MarketChart from '@/components/charts/MarketChart.vue'
import OverallCondition from '@/components/charts/OverallCondition.vue'
import Oxygenation from '@/components/charts/Oxygenation.vue'
import ProfitOverview from '@/components/charts/ProfitOverview.vue'
import RevenueChart from '@/components/charts/RevenueChart.vue'
import RevenueChart2 from '@/components/charts/RevenueChart2.vue'
import RevenueOverview from '@/components/charts/RevenueOverview.vue'
import SalesForecast from '@/components/charts/SalesForecast.vue'
import SalesOverview from '@/components/charts/SalesOverview.vue'
import SalesStatistics from '@/components/charts/SalesStatistics.vue'
import ShowcaseInfo from '@/components/charts/ShowcaseInfo.vue'
import Transactions from '@/components/charts/Transactions.vue'
import Transactions1 from '@/components/charts/Transactions1.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
</script>

<template>
  <TopBanner title="Apex Charts">
    <RouterLink to="#" class="btn">Add More Charts</RouterLink>
  </TopBanner>
  <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
    <RevenueChart />
    <SalesOverview />
    <ProfitOverview />
    <BTCPriceChart />
    <CompanyOverview />
    <Oxygenation />
    <BalanceChart />
    <RevenueOverview />
    <SalesStatistics />
    <Transactions1 />
    <MarketChart />
    <Transactions />
    <SalesForecast />
    <RevenueChart2 />
    <OverallCondition />
    <ShowcaseInfo />
  </div>
</template>
