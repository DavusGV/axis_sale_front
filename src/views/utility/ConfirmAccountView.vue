<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue';
import ConfirmAccount from '@/components/utility/ConfirmAccount.vue';


</script>

<template>
    <TopBanner title="Confirm Account">
        <RouterLink to="#" class="btn">Add Account</RouterLink>
    </TopBanner>
    <ConfirmAccount />
</template>