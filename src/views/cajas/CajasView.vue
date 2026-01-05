<script setup lang="ts">
import { watch } from 'vue';
import FlexListTwo from '@/components/cajas/CajasTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import { useAuthStore } from '@/stores/authStore';
/* import { RouterLink } from 'vue-router' */

</script>

<template>
  <TopBanner title="Cajas" >
    <!-- <div class="flex justify-end gap-4 lg:gap-6">
      <RouterLink to="#" class="btn-outline">Manage</RouterLink>
      <RouterLink to="#" class="btn">Add User</RouterLink>
    </div> -->
  </TopBanner>
  <FlexListTwo />
</template>
