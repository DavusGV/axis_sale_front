<template>
  <div class="cart bg-white rounded-lg shadow p-4 dark:bg-gray-800">
    

    <h3 class="justify-center font-bold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-100">
      <i class="fa-solid fa-cart-shopping"></i>
      Carrito
    </h3>

    <div v-if="!items.length" class="text-gray-400 text-center py-8">
      <i class="fa-regular fa-face-sad-tear text-lg"></i>
      <p>Vacío</p>
    </div>
    
    <div 
      v-for="item in items" 
      :key="item.producto_id" 
      class="flex items-center border-b py-3 dark:border-gray-700"
    >
      <!-- imagen -->
      <img :src="item.imagen || img" class="w-14 h-12 rounded mr-3 object-cover shadow-sm" />

      <!-- informacion-->
      <div class="flex-1">
        <div class="font-semibold text-gray-700 dark:text-gray-200">{{ item.nombre }}</div>
        <div class="text-xl text-gray-400 dark:text-gray-500">
          ${{ item.precio }} x {{ item.cantidad }}
        </div>
      </div>

      <div class="flex items-center gap-2">

        <!-- restar -->
        <button 
          class="w-9 h-9 flex items-center justify-center rounded-full 
                 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200
                 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          @click="$emit('restar', item.producto_id)"
        >
          <i class="fa-solid fa-minus text-xs"></i>
        </button>

        <span class="font-semibold text-gray-700 dark:text-gray-200 w-6 text-center">
          {{ item.cantidad }}
        </span>


        <button class="w-9 h-9 flex items-center justify-center rounded-full 
                 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200
                 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          @click="$emit('sumar', item.producto_id)"
        >
          <i class="fa-solid fa-plus text-xs"></i>
        </button>

        <button class="w-9 h-9 flex items-center justify-center rounded-full 
                 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300
                 hover:bg-red-200 dark:hover:bg-red-800 transition"
          @click="$emit('eliminar', item.producto_id)"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['items', 'img'])
defineEmits(['sumar', 'restar', 'eliminar'])
</script>
