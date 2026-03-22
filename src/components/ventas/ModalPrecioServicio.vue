<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-w-[350px]">

      <h2 class="font-bold text-lg mb-4 flex items-center gap-2">
        <i class="fa-solid fa-wrench"></i>
        Precio del servicio
      </h2>

      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {{ props.producto.nombre }}
      </p>

      <div>
        <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Precio de venta
        </label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i class="fa-solid fa-dollar-sign text-gray-400"></i>
          </span>
          <input
            ref="inputPrecio"
            v-model.number="precio"
            type="number"
            min="0"
            step="0.01"
            class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                   focus:ring-1 focus:ring-green-400 transition"
            placeholder="0.00"
            @keyup.enter="confirmar"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button class="btn-outline" @click="$emit('close')">Cancelar</button>
        <button class="btn" @click="confirmar">Agregar</button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps(['producto'])
const emits = defineEmits(['close', 'confirmar'])

const precio = ref<number>(0)
const inputPrecio = ref<HTMLInputElement | null>(null)

// al abrir el modal enfocamos el input
onMounted(() => {
  nextTick(() => inputPrecio.value?.focus())
})

function confirmar() {
  if (!precio.value || precio.value <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Precio invalido',
      text: 'Ingresa un precio mayor a 0.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  emits('confirmar', {
    ...props.producto,
    precio_venta: precio.value
  })
}
</script>