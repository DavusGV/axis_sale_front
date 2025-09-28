<template>
  <div class="mt-4 p-4 bg-white rounded-lg shadow dark:bg-gray-800">
    <div class="flex justify-between text-lg font-bold mb-2">
      <span>Total:</span>
      <span>${{ total.toFixed(2) }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
    </div>
    <button class="btn w-full bg-green-500 hover:bg-green-600 text-white" @click="$emit('pagar')">Pagar</button>
  </div>
</template>
<script setup>
defineProps(['total'])
defineEmits(['pagar'])
</script>