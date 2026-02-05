<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 min-w-[350px] dark:bg-gray-800">

      <h2 class="font-bold text-lg mb-4 flex items-center gap-2">
        <i class="fa-solid fa-cash-register"></i>
        Total a Pagar : <span class="font-bold text-xl">${{ totalFinal.toFixed(2) }}</span>
      </h2>



      <div >
      
    </div>
    
    <div v-if="descuentoCalculado > 0" class="text-sm text-green-600">
  Descuento aplicado:
  -${{ descuentoCalculado.toFixed(2) }}
  <span class="text-gray-500">
    ({{ tipoDescuento === 'porcentaje'
      ? descuento + '%'
      : '$' + descuento.toFixed(2) }})
  </span>
</div>

          <!-- aca vamos a poner un input para aplicar un descuento -->
<div>
  <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
    Descuento
  </label>

  <div class="flex gap-2">
    <!-- Tipo -->
    <select
      v-model="tipoDescuento"
      class="w-16 py-2 rounded-lg border bg-white dark:bg-gray-800
      text-center focus:ring-green-400"
    >
      <option value="porcentaje">%</option>
      <option value="monto">$</option>
    </select>

    <!-- Valor -->
    <div class="relative flex-1">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <i class="fa-solid fa-tag text-gray-400"></i>
      </span>

      <input
        v-model.number="descuento"
        type="number"
        min="0"
        :max="tipoDescuento === 'porcentaje' ? 100 : props.total"
        class="block w-full pl-10 pr-4 py-2 rounded-lg border
        bg-white dark:bg-gray-800 focus:ring-green-400"
        placeholder="0"
      />
    </div>
  </div>
</div>  




      <div class="mb-3">
        <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Método de pago
        </label>

        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i class="fa-solid fa-wallet text-gray-400 dark:text-gray-500"></i>
          </span>

          <select
            v-model="metodo_pago"
            class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none
            focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
      </div>

      <div class="mb-3">
        <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Cantidad recibida
        </label>

        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i class="fa-solid fa-money-bill-wave text-gray-400 dark:text-gray-500"></i>
          </span>

          <input
            ref="inputPago"
            v-model.number="pago"
            type="number"
            min="0"
            class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400
            dark:placeholder-gray-500 focus:outline-none focus:border-green-500
            focus:ring-1 focus:ring-green-400 transition"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        
 

  </div>

      <div v-if="pago >= total" class="mb-3 text-green-600 font-bold">
        Cambio: ${{ (pago - totalFinal).toFixed(2) }}
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button class="btn-outline flex items-center gap-2" @click="$emit('close')">
          Cancelar
        </button>

        <button class="btn flex items-center gap-2" @click="confirmarVenta">
          Confirmar
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch  } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps(['total'])
const emits = defineEmits(['close', 'confirmar'])
const pago = ref()
const metodo_pago = ref('efectivo')
const inputPago = ref(null)


const descuento = ref(0)
const tipoDescuento = ref('porcentaje') // 👈 por defecto %

const descuentoCalculado = computed(() => {
  if (!descuento.value) return 0

  if (tipoDescuento.value === 'porcentaje') {
    return props.total * (descuento.value / 100)
  }

  return descuento.value
})

const totalFinal = computed(() => {
  return Math.max(props.total - descuentoCalculado.value, 0)
})

watch(descuento, (v) => {
  if (tipoDescuento.value === 'porcentaje' && v > 100) descuento.value = 100
})

watch([descuento, tipoDescuento], () => {
  if (tipoDescuento.value === 'porcentaje') {
    if (descuento.value > 100) descuento.value = 100
    if (descuento.value < 0) descuento.value = 0
  }

  if (tipoDescuento.value === 'monto') {
    if (descuento.value > props.total) descuento.value = props.total
    if (descuento.value < 0) descuento.value = 0
  }
})


//Enfocamos el input automáticamente al abrir el modal
onMounted(() => {
  nextTick(() => inputPago.value?.focus())
})

function confirmarVenta() {
  if (!pago.value || isNaN(pago.value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Monto requerido',
      text: 'Por favor ingresa el monto recibido.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  /* if (pago.value < props.total) {
    Swal.fire({
      icon: 'error',
      title: 'Monto insuficiente',
      text: 'El monto ingresado no alcanza para pagar la venta.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  emits('confirmar', { pago: pago.value, metodo_pago: metodo_pago.value }) */

    if (tipoDescuento.value === 'monto' && descuento.value > props.total) {
    Swal.fire({
      icon: 'warning',
      title: 'Descuento inválido',
      text: 'El descuento no puede ser mayor al total de la venta.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  if (tipoDescuento.value === 'porcentaje' && descuento.value > 100) {
    Swal.fire({
      icon: 'warning',
      title: 'Descuento inválido',
      text: 'El descuento en porcentaje no puede ser mayor al 100%.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  if (pago.value < totalFinal.value){
    Swal.fire({
      icon: 'error',
      title: 'Monto insuficiente',
      text: 'El monto ingresado no alcanza para pagar la venta.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  console.log("pago:", pago.value);
  console.log("metodo_pago:", metodo_pago.value);
  console.log("tipoDescuento:", tipoDescuento.value);
  console.log("descuento:", descuento.value);
  console.log("descuentoCalculado:", descuentoCalculado.value);
  console.log("totalFinal:", totalFinal.value);

  emits('confirmar', {
    pago: pago.value,
    metodo_pago: metodo_pago.value,
    tipo_descuento: tipoDescuento.value,
    descuento: descuento.value??0,
    descuento_aplicado: descuentoCalculado.value,
    total_final: totalFinal.value
  })

}
</script>
