<script setup lang="ts">
import BTCPriceChart from '@/components/dashboards/banking-3/BTCPriceChart.vue';
import MyTeam from '@/components/dashboards/banking-3/MyTeam.vue';
import PopularCoins from '@/components/dashboards/banking-3/PopularCoins.vue';
import Stats from '@/components/dashboards/banking-3/Stats.vue';
import TransactionHistory from '@/components/dashboards/banking-3/TransactionHistory.vue';
import TopBanner from '@/components/shared/TopBanner.vue';


</script>

<template>
    <TopBanner title="Banking Style 03">
        <RouterLink to="#" class="btn">Fund Transfer</RouterLink>
    </TopBanner>
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <Stats />
        <BTCPriceChart />
        <MyTeam />
        <TransactionHistory />
        <PopularCoins />
    </div>
</template>