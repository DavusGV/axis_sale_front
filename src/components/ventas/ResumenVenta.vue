<template>
  <div class="mt-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">

    <div class="flex justify-between items-center mb-4">
      <span class="text-lm font-semibold text-gray-700 dark:text-gray-300">Total</span>
      <span class="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">
        ${{ total.toFixed(2) }}
      </span>
    </div>

    <button
      class="btn w-full justify-center mb-2"
      @click="$emit('pagar')"
    >
      <i class="fa-solid fa-dollar text-lg"></i>
      Pagar
    </button>

    <!-- boton cotizar -->
    <button
      class="btn w-full justify-center bg-yellow-600 border-yellow-600"
      @click="$emit('cotizar')"
    >
      <i class="fa-solid fa-file-invoice-dollar text-lg mr-1"></i>
      Cotizar
    </button>

  </div>
</template>

<script setup>
defineProps(['total'])
defineEmits(['pagar', 'cotizar'])
</script>
