<template>
    <div class="flex justify-between flex-wrap items-center gap-4 mb-6 lg:mb-8">
        <h4>{{ props.title || "Dashboard" }}</h4>
        <slot />
    </div>
</template>
  
<script lang="ts" setup>

const props = defineProps<{
    title?: string;
}>();

</script>


