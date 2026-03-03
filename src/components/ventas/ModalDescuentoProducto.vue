<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 min-w-[350px] dark:bg-gray-800">

      <h2 class="font-bold text-lg mb-4 flex items-center gap-2">
        <i class="fa-solid fa-tag"></i>
        Descuento: {{ props.item.nombre }}
      </h2>

      <div class="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Subtotal del producto:
        <span class="font-bold text-gray-700 dark:text-gray-200">
          ${{ subtotalProducto.toFixed(2) }}
        </span>
      </div>

      <div v-if="descuentoCalculado > 0" class="text-sm text-green-600 mb-3">
        Descuento aplicado: -${{ descuentoCalculado.toFixed(2) }}
        <span class="text-gray-500">
          ({{ tipoDescuento === 'porcentaje' ? descuento + '%' : '$' + descuento.toFixed(2) }})
        </span>
      </div>

      <div class="mb-4">
        <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Descuento
        </label>

        <div class="flex gap-2">
          <select
            v-model="tipoDescuento"
            class="w-16 py-2 rounded-lg border bg-white dark:bg-gray-800 text-center focus:ring-green-400"
          >
            <option value="porcentaje">%</option>
            <option value="monto">$</option>
          </select>

          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i class="fa-solid fa-tag text-gray-400"></i>
            </span>
            <input
              v-model.number="descuento"
              type="number"
              min="0"
              :max="tipoDescuento === 'porcentaje' ? 100 : subtotalProducto"
              class="block w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-800 focus:ring-green-400"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div class="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
        Total con descuento:
        <span class="font-bold text-lg text-green-600">
          ${{ totalConDescuento.toFixed(2) }}
        </span>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button class="btn-outline flex items-center gap-2" @click="$emit('close')">
          Cancelar
        </button>
        <button class="btn flex items-center gap-2" @click="confirmar">
          Aplicar
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps(['item'])
const emits = defineEmits(['close', 'confirmar'])

const descuento = ref(props.item.descuento ?? 0)
const tipoDescuento = ref(props.item.tipo_descuento ?? 'porcentaje')

// subtotal del producto (precio * cantidad)
const subtotalProducto = computed(() => props.item.precio * props.item.cantidad)

const descuentoCalculado = computed(() => {
  if (!descuento.value) return 0
  if (tipoDescuento.value === 'porcentaje') {
    return subtotalProducto.value * (descuento.value / 100)
  }
  return descuento.value
})

const totalConDescuento = computed(() => {
  return Math.max(subtotalProducto.value - descuentoCalculado.value, 0)
})

watch([descuento, tipoDescuento], () => {
  if (tipoDescuento.value === 'porcentaje') {
    descuento.value = Math.round(descuento.value)
    if (descuento.value > 100) descuento.value = 100
    if (descuento.value < 0) descuento.value = 0
  }

  if (tipoDescuento.value === 'monto') {
    if (descuento.value > subtotalProducto.value) descuento.value = subtotalProducto.value
    if (descuento.value < 0) descuento.value = 0
  }
})

function confirmar() {
  if (tipoDescuento.value === 'monto' && descuento.value > subtotalProducto.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Descuento invalido',
      text: 'El descuento no puede ser mayor al subtotal del producto.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  emits('confirmar', {
    producto_id: props.item.producto_id,
    tipo_descuento: tipoDescuento.value,
    descuento: descuento.value ?? 0,
    descuento_aplicado: descuentoCalculado.value
  })
}
</script>