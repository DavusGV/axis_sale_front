<template>
  <div class="cart bg-white rounded-lg shadow p-4 dark:bg-gray-800">
    <h3 class="font-bold mb-2">Carrito</h3>
    <div v-if="!items.length" class="text-gray-400">Vacío</div>
    <div v-for="item in items" :key="item.producto_id" class="flex items-center border-b py-2">
      <img :src="item.imagen || img" class="w-10 h-10 rounded mr-2" />
      <div class="flex-1">
        <div class="font-semibold">{{ item.nombre }}</div>
        <div class="text-xs text-gray-400">${{ item.precio }} x {{ item.cantidad }}</div>
      </div>
      <div class="flex items-center gap-1">
        <button class="btn-outline" @click="$emit('restar', item.producto_id)">-</button>
        <span>{{ item.cantidad }}</span>
        <button class="btn-outline" @click="$emit('sumar', item.producto_id)">+</button>
        <button class="btn-outline text-red-500" @click="$emit('eliminar', item.producto_id)">✕</button>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps(['items', 'img'])
defineEmits(['sumar', 'restar', 'eliminar'])
</script>