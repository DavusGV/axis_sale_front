<template>
    <div class="flex justify-between flex-wrap items-center mb-4">
        <h2>{{ props.title || "Dashboard" }}</h2>
        <slot />
    </div>
</template>
  
<script lang="ts" setup>

const props = defineProps<{
    title?: string;
}>();

</script>


