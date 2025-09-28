<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue';
import ServiceStatus from '@/components/utility/ServiceStatus.vue';

</script>

<template>
    <TopBanner title="Service Status">
        <RouterLink to="#" class="btn">Manage Service</RouterLink>
    </TopBanner>
    <ServiceStatus />
</template>