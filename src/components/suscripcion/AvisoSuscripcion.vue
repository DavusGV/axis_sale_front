<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useSuscripcionStore } from '@/stores/suscripcionStore'
import PagoSuscripcionModal from '@/components/suscripcion/PagoSuscripcionModal.vue'

const suscripcionStore = useSuscripcionStore()

// minutos que tarda el aviso en volver a aparecer despues de cerrarlo
const MINUTOS_REAPARICION = 10

let temporizador: number | undefined

const mostrarModalPago = ref(false)

const visible = computed(() => suscripcionStore.mostrarAviso)

// ya vencido el aviso no se puede cerrar, solo cuando esta por vencer
const puedeCerrar = computed(() => suscripcionStore.estado === 'por_vencer')

const esVencido = computed(() => suscripcionStore.estado === 'vencido')

const titulo = computed(() =>
  esVencido.value ? 'Suscripción vencida' : 'Suscripción por vencer'
)

const mensaje = computed(() => {
  const dias = suscripcionStore.diasRestantes

  if (esVencido.value) {
    return 'Su suscripción venció. Registre su pago para no perder el acceso al sistema.'
  }
  if (dias <= 0) {
    return 'Su suscripción vence hoy. Registre su pago para conservar el acceso.'
  }
  return `Su suscripción vence en ${dias} ${dias === 1 ? 'día' : 'días'}. Registre su pago a tiempo.`
})

const montoFormateado = computed(() =>
  Number(suscripcionStore.datos?.monto ?? 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
)

function cerrar() {
  suscripcionStore.descartarAviso()

  // el aviso vuelve a salir pasado el intervalo para que no se ignore
  temporizador = window.setTimeout(() => {
    suscripcionStore.avisoDescartado = false
  }, MINUTOS_REAPARICION * 60 * 1000)
}

function irAPagar() {
  mostrarModalPago.value = true
}

async function onPagoRegistrado() {
  await suscripcionStore.cargarEstado()
}

onUnmounted(() => {
  if (temporizador) window.clearTimeout(temporizador)
})
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-x-8"
    leave-active-class="transition duration-200 ease-in"
    leave-to-class="opacity-0 translate-x-8"
  >
    <div
      v-if="visible"
      class="fixed bottom-5 ltr:right-5 rtl:left-5 z-[9999] w-[320px] max-w-[calc(100vw-2.5rem)]
             box p-4 shadow-xl border-l-4"
      :class="esVencido ? 'border-l-red-600' : 'border-l-yellow-500'"
    >
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <i
            class="fa-solid fa-triangle-exclamation"
            :class="esVencido ? 'text-red-600 dark:text-red-400' : 'text-yellow-500'"
          ></i>
          <span class="font-semibold text-sm">{{ titulo }}</span>
        </div>
        <button
          v-if="puedeCerrar"
          class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          @click="cerrar"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <p class="text-xs text-gray-600 dark:text-gray-300 mb-3">{{ mensaje }}</p>

      <p class="text-xs text-gray-600 dark:text-gray-300 mb-3">
        Monto a depositar:
        <span class="font-semibold text-gray-800 dark:text-gray-100">${{ montoFormateado }}</span>
      </p>

      <button class="btn w-full py-2 text-xs justify-center" @click="irAPagar">
        <i class="fa-solid fa-file-arrow-up"></i>
        Subir comprobante
      </button>
    </div>
  </transition>

  <PagoSuscripcionModal
    :show="mostrarModalPago"
    @close="mostrarModalPago = false"
    @saved="onPagoRegistrado"
  />
</template>