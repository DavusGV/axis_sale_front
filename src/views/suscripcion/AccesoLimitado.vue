<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { fetchCuentasDeposito } from '@/api/suscripcion'
import { useSuscripcionStore } from '@/stores/suscripcionStore'
import { useAuthStore } from '@/stores/authStore'
import PagoSuscripcionModal from '@/components/suscripcion/PagoSuscripcionModal.vue'
import { descargarCuentasDepositoPdf } from '@/api/suscripcion'
import { descargarBlob } from '@/utils/descargarArchivo'

const router = useRouter()
const suscripcionStore = useSuscripcionStore()
const authStore = useAuthStore()

const cuentas = ref<any[]>([])
const verificando = ref(false)
const mostrarModalPago = ref(false)

const descargandoPdf = ref(false)

const datos = computed(() => suscripcionStore.datos)

const montoFormateado = computed(() =>
  Number(datos.value?.monto ?? 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
)

// las fechas llegan como YYYY-MM-DD, se arma el formato local sin usar Date
// para evitar el corrimiento de un dia por zona horaria
function formatearFecha(fecha?: string) {
  if (!fecha) return '--'
  const soloFecha = fecha.split('T')[0]
  const [anio, mes, dia] = soloFecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function etiquetaTipo(tipo: string) {
  if (tipo === 'tarjeta') return 'Tarjeta'
  if (tipo === 'clabe') return 'CLABE'
  return 'Cuenta'
}

async function loadCuentas() {
  try {
    const res = await fetchCuentasDeposito()
    cuentas.value = res.data?.cuentas || []
  } catch {
    cuentas.value = []
  }
}

// vuelve a consultar el estado por si el pago ya fue verificado
async function revisarEstado() {
  verificando.value = true
  await suscripcionStore.cargarEstado()
  verificando.value = false

  if (!suscripcionStore.bloqueado) {
    Swal.fire({
      icon: 'success',
      title: 'Acceso restablecido',
      text: 'Su suscripción está al día.',
      timer: 2000,
      showConfirmButton: false,
    })
    router.push('/ventas/ventas')
    return
  }

  Swal.fire({
    icon: 'info',
    title: 'Pago pendiente',
    text: 'Su pago aún no ha sido verificado. Intente más tarde.',
    color: '#1f2937',
    confirmButtonColor: '#3b82f6',
  })
}

// cambia al establecimiento indicado y revisa si ese si tiene acceso
async function cambiarEstablecimiento(id: number) {
  authStore.establishmentActive = id
  await suscripcionStore.cargarEstado()

  if (!suscripcionStore.bloqueado) {
    router.push('/ventas/ventas')
    return
  }

  Swal.fire({
    icon: 'warning',
    title: 'Acceso limitado',
    text: 'Este establecimiento también tiene un pago pendiente.',
    color: '#1f2937',
    confirmButtonColor: '#3b82f6',
  })
}

async function descargarPdf() {
  descargandoPdf.value = true
  try {
    const blob = await descargarCuentasDepositoPdf()
    descargarBlob(blob, 'cuentas-deposito.pdf')
  } catch {
    Swal.fire({
      title: 'No se pudo descargar',
      text: 'Intente nuevamente en unos momentos.',
      icon: 'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
  } finally {
    descargandoPdf.value = false
  }
}

onMounted(() => {
  loadCuentas()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-3 md:px-5 py-10">
    <div class="box w-full max-w-[720px] p-4 md:p-6 xl:p-8">

      <!-- encabezado -->
      <div class="text-center pb-4 mb-4 bb-dashed">
        <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <i class="fa-solid fa-lock text-2xl text-red-600 dark:text-red-400"></i>
        </span>
        <h3 class="h3 mb-2">Acceso limitado</h3>
        <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">
          El acceso al sistema está restringido porque la suscripción de este
          establecimiento tiene un pago pendiente. Registre su comprobante para
          reactivar el servicio.
        </p>
      </div>

      <!-- datos del adeudo -->
      <div v-if="datos" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="box bg-primary/5 dark:bg-bg3 p-4 text-center">
          <span class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Monto a depositar</span>
          <p class="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">${{ montoFormateado }}</p>
        </div>
        <div class="box bg-primary/5 dark:bg-bg3 p-4 text-center">
          <span class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Fecha de vencimiento</span>
          <p class="text-2xl font-bold mt-1">{{ formatearFecha(datos.fecha_proximo_pago) }}</p>
        </div>
      </div>

      <!-- cuentas de deposito -->
      <div v-if="cuentas.length" class="mb-6">
        <h4 class="text-sm font-semibold uppercase tracking-wide mb-3">Cuentas para depósito</h4>

        <button class="btn-outline text-xs px-3 py-1.5 mb-3" :disabled="descargandoPdf" @click="descargarPdf">
          <i class="fa-solid" :class="descargandoPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i>
          {{ descargandoPdf ? 'Descargando...' : 'Descargar en PDF' }}
        </button>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="cuenta in cuentas"
            :key="cuenta.id"
            class="border border-n30 dark:border-n500 rounded-lg p-3 text-sm"
          >
            <p class="font-semibold text-primary">{{ cuenta.banco }}</p>
            <p class="text-gray-600 dark:text-gray-300 mt-1">Titular: {{ cuenta.titular }}</p>
            <p class="text-gray-600 dark:text-gray-300">
              {{ etiquetaTipo(cuenta.tipo_cuenta) }}: {{ cuenta.numero }}
            </p>
            <p v-if="cuenta.concepto" class="text-gray-600 dark:text-gray-300">
              Concepto: {{ cuenta.concepto }}
            </p>
          </div>
        </div>
      </div>

      <!-- acciones -->
      <div class="flex flex-wrap gap-3 justify-center">
        <button class="btn px-5" @click="mostrarModalPago = true">
          <i class="fa-solid fa-file-arrow-up"></i>
          Subir comprobante
        </button>
        <button class="btn-outline px-5" :disabled="verificando" @click="revisarEstado">
          <i class="fa-solid fa-rotate-right"></i>
          {{ verificando ? 'Verificando...' : 'Ya pagué, revisar de nuevo' }}
        </button>
        <button class="btn-outline px-5" @click="authStore.logout()">
          <i class="fa-solid fa-right-from-bracket"></i>
          Cerrar sesión
        </button>
      </div>

      <!-- cambio de establecimiento, por si tiene otro al dia -->
      <div v-if="authStore.establishments.length > 1" class="mt-6 pt-4 border-t border-dashed border-n30 dark:border-n500 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Puede continuar en otro de sus establecimientos:
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="est in authStore.establishments"
            :key="est.id"
            v-show="est.id !== authStore.establishmentActive"
            class="btn-outline px-4 py-1.5 text-xs"
            @click="cambiarEstablecimiento(est.id)"
          >
            {{ est.nombre }}
          </button>
        </div>
      </div>

    </div>

    <PagoSuscripcionModal
      :show="mostrarModalPago"
      @close="mostrarModalPago = false"
      @saved="revisarEstado"
    />
  </div>
</template>