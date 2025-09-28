<script setup lang="ts">
import MyCards from '@/components/dashboards/banking-2/MyCards.vue';
import TransactionHistory from '@/components/dashboards/banking-2/TransactionHistory.vue';
import Transactions from '@/components/dashboards/banking-2/Transactions.vue';
import TopBanner from '@/components/shared/TopBanner.vue';


</script>

<template>
    <TopBanner title="Banking Style 02">
        <RouterLink to="#" class="btn">Fund Transfer</RouterLink>
    </TopBanner>
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <MyCards />
        <Transactions />
        <TransactionHistory />

    </div>
</template>