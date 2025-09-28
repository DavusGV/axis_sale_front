<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
    <div class="bg-white rounded-lg shadow-lg p-6 min-w-[300px] dark:bg-gray-800">
      <h2 class="font-bold text-lg mb-4">Pago</h2>
      <div class="mb-3">
        <label class="block mb-1">Total a pagar</label>
        <div class="font-bold text-xl">${{ total.toFixed(2) }}</div>
      </div>
      <div class="mb-3">
  <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Método de pago</label>
  <div class="relative">
    <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <!-- Ícono de pago (puedes cambiar por otro si prefieres) -->
      <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <line x1="2" y1="11" x2="22" y2="11" stroke="currentColor" stroke-width="2" />
      </svg>
    </span>
    <select
      v-model="metodo_pago"
      class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
    >
      <option value="efectivo">Efectivo</option>
      <!-- <option value="tarjeta">Tarjeta</option> -->
    </select>
  </div>
</div>

<div class="mb-3">
  <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad recibida</label>
  <div class="relative">
    <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <!-- Ícono de dinero (puedes cambiar por otro si prefieres) -->
      <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
      </svg>
    </span>
    <input
      v-model.number="pago"
      type="number"
      min="0"
      class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
      placeholder="0.00"
    />
  </div>
</div>
      <div v-if="pago >= total" class="mb-3 text-green-600 font-bold">
        Cambio: ${{ (pago-total).toFixed(2) }}
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button class="btn-outline" @click="$emit('close')">Cancelar</button>
        <button class="btn" @click="confirmarVenta">Confirmar</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps(['total'])
const emits = defineEmits(['close', 'confirmar'])
import Swal from 'sweetalert2'


const pago = ref(0)
const metodo_pago = ref('efectivo')

function confirmarVenta() {
   if (!pago.value || isNaN(pago.value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Monto requerido',
      text: 'Por favor ingresa el monto recibido.',
      confirmButtonColor: '#ef4444' // Rojo
    });
    return;
  }

  // Validar que el monto sea suficiente
  if (pago.value < props.total) {
    Swal.fire({
      icon: 'error',
      title: 'Monto insuficiente',
      text: 'El monto ingresado no alcanza para pagar la venta.',
      confirmButtonColor: '#ef4444' // Rojo
    });
    return;
  }
  emits('confirmar', { pago: pago.value, metodo_pago: metodo_pago.value })
}
</script>