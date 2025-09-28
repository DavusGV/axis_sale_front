<script setup lang="ts">
import MyBalance from '@/components/dashboards/banking-1/MyBalance.vue';
import TransactionHistory from '@/components/dashboards/banking-1/TransactionHistory.vue';
import Transactions from '@/components/dashboards/banking-1/Transactions.vue';
import TransferInvoice from '@/components/dashboards/banking-1/TransferInvoice.vue';
import WeeklyTransactions from '@/components/dashboards/banking-1/WeeklyTransactions.vue';
import TopBanner from '@/components/shared/TopBanner.vue';

</script>

<template>
    <TopBanner title="Banking Style 01">
        <RouterLink to="#" class="btn">Recent Transactions</RouterLink>
    </TopBanner>
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <MyBalance />
        <TransferInvoice />
        <Transactions />
        <WeeklyTransactions />
        <TransactionHistory />
    </div>
</template>