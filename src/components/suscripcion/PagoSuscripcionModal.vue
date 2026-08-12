<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import Swal from 'sweetalert2'
import { fetchCuentasDeposito, registrarPagoSuscripcion } from '@/api/suscripcion'
import { useSuscripcionStore } from '@/stores/suscripcionStore'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'saved'])

const suscripcionStore = useSuscripcionStore()

const cuentas = ref<any[]>([])
const archivo = ref<File | null>(null)
const nombreArchivo = ref('')
const guardando = ref(false)
const errores = ref<Record<string, string[]>>({})

// fecha local de hoy, sin toISOString porque convierte a UTC y en zonas
// detras de UTC (como Mexico) puede adelantar el dia en la tarde/noche
const ahora = new Date()
const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`

const form = reactive({
  cuenta_deposito_id: '' as string | number,
  fecha_pago: hoy,
  referencia: '',
  observaciones: '',
})

// monto que se debe, viene del estado de la suscripcion, no lo escribe el cliente
const montoFormateado = computed(() =>
  Number(suscripcionStore.datos?.monto ?? 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
)

function limpiarFormulario() {
  form.cuenta_deposito_id = ''
  form.fecha_pago = hoy
  form.referencia = ''
  form.observaciones = ''
  archivo.value = null
  nombreArchivo.value = ''
  errores.value = {}
}

async function loadCuentas() {
  try {
    const res = await fetchCuentasDeposito()
    cuentas.value = res.data?.cuentas || []
  } catch {
    cuentas.value = []
  }
}

function onArchivo(event: any) {
  const file = event.target.files?.[0] || null
  archivo.value = file
  nombreArchivo.value = file ? file.name : ''
  errores.value.voucher = []
}

function cerrar() {
  if (guardando.value) return
  emit('close')
}

async function guardar() {
  errores.value = {}

  if (!archivo.value) {
    errores.value = { voucher: ['Debe adjuntar el comprobante de pago'] }
    return
  }

  guardando.value = true

  try {
    // se envia como FormData porque incluye el archivo del comprobante
    const datos = new FormData()

    if (form.cuenta_deposito_id) {
      datos.append('cuenta_deposito_id', String(form.cuenta_deposito_id))
    }

    datos.append('fecha_pago', form.fecha_pago)
    datos.append('referencia', form.referencia)
    datos.append('observaciones', form.observaciones)
    datos.append('voucher', archivo.value)

    await registrarPagoSuscripcion(datos)

    Swal.fire({
      title: 'Comprobante enviado',
      text: 'Su pago quedó pendiente de verificación. Se le notificará cuando sea aprobado.',
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })

    emit('saved')
    emit('close')
  } catch (e: any) {
    if (e.response?.data?.data?.messages) {
      errores.value = e.response.data.data.messages
    } else {
      const mensaje = e.response?.data?.data?.message || e.response?.data?.message ||
        'No se pudo registrar el pago'
      Swal.fire({
        title: 'Advertencia',
        text: mensaje,
        icon: 'warning',
        color: '#1f2937',
        confirmButtonColor: '#3b82f6',
      })
    }
  } finally {
    guardando.value = false
  }
}

// al abrir se cargan las cuentas y se limpia lo que haya quedado
watch(() => props.show, (val) => {
  if (val) {
    limpiarFormulario()
    loadCuentas()
  }
})
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center px-3 py-6"
    @click.self="cerrar"
  >
    <div class="box w-full max-w-[520px] max-h-[90vh] overflow-y-auto p-4 md:p-6">

      <!-- encabezado -->
      <div class="flex items-center justify-between pb-4 mb-4 bb-dashed">
        <h4 class="h4">Registrar comprobante de pago</h4>
        <button class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition" @click="cerrar">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- monto que se debe, solo lectura -->
      <div class="box bg-primary/5 dark:bg-bg3 p-3 mb-4 text-center">
        <span class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Monto a depositar</span>
        <p class="text-xl font-bold text-primary mt-1">${{ montoFormateado }}</p>
      </div>

      <!-- cuenta de deposito -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Cuenta de depósito</label>
        <select
          v-model="form.cuenta_deposito_id"
          class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
        >
          <option value="">Seleccione una cuenta</option>
          <option v-for="cuenta in cuentas" :key="cuenta.id" :value="cuenta.id">
            {{ cuenta.banco }} - {{ cuenta.numero }}
          </option>
        </select>
        <span v-if="errores.cuenta_deposito_id" class="text-xs text-red-500 mt-1 block">
          {{ errores.cuenta_deposito_id[0] }}
        </span>
      </div>

      <!-- fecha del deposito -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Fecha del depósito</label>
        <input
          v-model="form.fecha_pago"
          type="date"
          :max="hoy"
          class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
        />
        <span v-if="errores.fecha_pago" class="text-xs text-red-500 mt-1 block">{{ errores.fecha_pago[0] }}</span>
      </div>

      <!-- referencia -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Referencia (opcional)</label>
        <input
          v-model="form.referencia"
          type="text"
          maxlength="100"
          placeholder="Folio o referencia"
          class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
        />
      </div>

      <!-- comprobante -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Comprobante (PDF, JPG, PNG o WEBP)</label>
        <label
          class="flex items-center gap-3 border border-dashed border-n30 dark:border-n500 rounded-lg px-3 py-3 cursor-pointer hover:border-primary transition"
        >
          <i class="fa-solid fa-file-arrow-up text-primary"></i>
          <span class="text-sm text-gray-500 dark:text-gray-400 truncate">
            {{ nombreArchivo || 'Seleccionar archivo' }}
          </span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="hidden" @change="onArchivo" />
        </label>
        <span v-if="errores.voucher" class="text-xs text-red-500 mt-1 block">{{ errores.voucher[0] }}</span>
      </div>

      <!-- observaciones -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Observaciones (opcional)</label>
        <textarea
          v-model="form.observaciones"
          rows="2"
          maxlength="500"
          class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
        ></textarea>
      </div>

      <!-- acciones -->
      <div class="flex gap-3 justify-end">
        <button class="btn-outline px-5" :disabled="guardando" @click="cerrar">
          Cancelar
        </button>
        <button class="btn px-5" :disabled="guardando" @click="guardar">
          {{ guardando ? 'Enviando...' : 'Enviar comprobante' }}
        </button>
      </div>

    </div>
  </div>
</template>