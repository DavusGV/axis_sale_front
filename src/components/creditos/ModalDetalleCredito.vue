<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">

      <!-- encabezado -->
      <div class="flex items-center justify-between p-5 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h2 class="font-bold text-lg flex items-center gap-2">
          <i class="fa-solid fa-file-invoice-dollar"></i>
          Detalle del credito
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">

        <!-- columna izquierda -->
        <div class="md:col-span-1 flex flex-col gap-4">

          <!-- cliente -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm uppercase">
              <i class="fa-solid fa-user"></i>
              Cliente
            </h3>
            <p class="font-semibold text-gray-800 dark:text-gray-100">
              {{ nombreCliente }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <i class="fa-solid fa-phone mr-1"></i>
              {{ planLocal.cliente?.telefono1 ?? '—' }}
            </p>
          </div>

          <!-- resumen financiero -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2 text-sm uppercase">
              <i class="fa-solid fa-receipt"></i>
              Resumen
            </h3>
            <div class="flex flex-col gap-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Venta:</span>
                <span class="font-medium">#{{ planLocal.venta?.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Total venta:</span>
                <span class="font-medium">${{ Number(planLocal.total_venta).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Interes:</span>
                <span class="font-medium text-orange-500">
                  +${{ Number(planLocal.interes_aplicado).toFixed(2) }}
                  <span v-if="planLocal.interes_tipo" class="text-xs text-gray-400">
                    ({{ planLocal.interes_tipo === 'porcentaje' ? planLocal.interes_valor + '%' : '$' + planLocal.interes_valor }})
                  </span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Anticipo:</span>
                <span class="font-medium text-green-600">-${{ Number(planLocal.anticipo).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between border-t dark:border-gray-600 pt-2 mt-1">
                <span class="text-gray-500 dark:text-gray-400">Total financiado:</span>
                <span class="font-bold">${{ Number(planLocal.total_financiado).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Cuota:</span>
                <span class="font-bold text-green-600">${{ Number(planLocal.monto_cuota).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Plazos:</span>
                <span class="font-medium capitalize">{{ planLocal.num_plazos }} {{ planLocal.tipo_plazo }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Inicio:</span>
                <span class="font-medium">{{ formatFecha(planLocal.fecha_inicio) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Proximo pago:</span>
                <span class="font-medium text-blue-600">{{ formatFecha(planLocal.fecha_proximo_pago) }}</span>
              </div>
              <div class="flex justify-between border-t dark:border-gray-600 pt-2 mt-1">
                <span class="text-gray-500 dark:text-gray-400">Saldo pendiente:</span>
                <span
                  class="font-bold text-xl"
                  :class="planLocal.saldo_pendiente > 0 ? 'text-orange-500' : 'text-green-600'"
                >
                  ${{ Number(planLocal.saldo_pendiente).toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- barra progreso -->
            <div class="mt-4">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Pagado</span>
                <span>{{ porcentajePagado }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  class="bg-green-500 h-2 rounded-full transition-all duration-500"
                  :style="{ width: porcentajePagado + '%' }"
                />
              </div>
            </div>

            <!-- estado y boton abonar -->
            <div class="mt-4 flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span :class="['px-3 py-1 rounded-full text-xs font-medium capitalize', etiquetaEstado(planLocal.estado)]">
                  {{ planLocal.estado }}
                </span>
              </div>
              <button
                v-if="planLocal.estado === 'activo'"
                class="btn w-full flex items-center justify-center gap-2 text-sm"
                @click="showFormAbono = !showFormAbono"
              >
                <i class="fa-solid fa-hand-holding-dollar"></i>
                {{ showFormAbono ? 'Cancelar' : 'Registrar abono' }}
              </button>
            </div>

            <!-- formulario de abono inline -->
            <div v-if="showFormAbono" class="mt-4 flex flex-col gap-3 border-t dark:border-gray-600 pt-4">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nuevo abono</p>

              <div>
                <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  Monto
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <i class="fa-solid fa-money-bill-wave text-gray-400 text-xs"></i>
                  </span>
                  <input
                    v-model.number="montoAbono"
                    type="number"
                    min="0.01"
                    step="0.01"
                    :max="planLocal.saldo_pendiente"
                    class="block w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                           focus:ring-1 focus:ring-green-400 transition text-sm"
                    placeholder="0.00"
                  />
                </div>
                <!-- info de cuota sugerida y saldo maximo -->
                <div class="flex justify-between mt-1">
                  <p class="text-xs text-gray-400">
                    Cuota sugerida: <strong>${{ Number(planLocal.monto_cuota).toFixed(2) }}</strong>
                  </p>
                  <p class="text-xs text-gray-400">
                    Max: <strong>${{ Number(planLocal.saldo_pendiente).toFixed(2) }}</strong>
                  </p>
                </div>
                <!-- alerta si el monto excede el saldo -->
                <p v-if="montoAbono && montoAbono > Number(planLocal.saldo_pendiente)"
                   class="text-xs text-red-500 mt-1 font-medium">
                  El monto no puede superar el saldo pendiente.
                </p>
              </div>

              <div>
                <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  Metodo de pago
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <i class="fa-solid fa-wallet text-gray-400 text-xs"></i>
                  </span>
                  <select
                    v-model="metodoPago"
                    class="block w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                           focus:ring-1 focus:ring-green-400 transition text-sm"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  Notas <span class="text-gray-400">(opcional)</span>
                </label>
                <textarea
                  v-model="notas"
                  rows="2"
                  class="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                         focus:ring-1 focus:ring-green-400 transition resize-none text-sm"
                  placeholder="Observaciones..."
                />
              </div>

              <button
                class="btn w-full justify-center text-sm"
                @click="confirmarAbono"
                :disabled="loadingAbono || !montoValido"
              >
                <i class="fa-solid fa-check"></i>
                {{ loadingAbono ? 'Guardando...' : 'Confirmar abono' }}
              </button>
            </div>

          </div>
        </div>

        <!-- columna derecha: historial -->
        <div class="md:col-span-2">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2 text-sm uppercase">
              <i class="fa-solid fa-clock-rotate-left"></i>
              Historial de abonos
            </h3>

            <div v-if="loading" class="text-center text-gray-400 py-8 text-sm">
              Cargando...
            </div>

            <div v-else-if="!pagos.length" class="text-center text-gray-400 py-8">
              <i class="fa-regular fa-face-sad-tear text-lg"></i>
              <p class="text-sm mt-1">Sin abonos registrados aun</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="text-gray-500 dark:text-gray-400 uppercase text-xs border-b dark:border-gray-600">
                  <tr>
                    <th class="px-3 py-2 text-left">Cuota</th>
                    <th class="px-3 py-2 text-right">Monto</th>
                    <th class="px-3 py-2 text-right">Saldo ant.</th>
                    <th class="px-3 py-2 text-right">Saldo desp.</th>
                    <th class="px-3 py-2 text-left">Fecha</th>
                    <th class="px-3 py-2 text-left">Metodo</th>
                    <th class="px-3 py-2 text-left">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="pago in pagos"
                    :key="pago.id"
                    class="border-t dark:border-gray-600"
                  >
                    <td class="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                      #{{ pago.numero_cuota }}
                    </td>
                    <td class="px-3 py-2 text-right font-bold text-green-600">
                      ${{ Number(pago.monto_pagado).toFixed(2) }}
                    </td>
                    <td class="px-3 py-2 text-right text-gray-500">
                      ${{ Number(pago.saldo_anterior).toFixed(2) }}
                    </td>
                    <td class="px-3 py-2 text-right text-orange-500 font-medium">
                      ${{ Number(pago.saldo_despues).toFixed(2) }}
                    </td>
                    <td class="px-3 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {{ formatFecha(pago.fecha_pago) }}
                    </td>
                    <td class="px-3 py-2 text-gray-500 dark:text-gray-400 capitalize">
                      {{ pago.metodo_pago }}
                    </td>
                    <td class="px-3 py-2 text-gray-400 text-xs">
                      {{ pago.notas ?? '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { fetchPagosPlan, fetchPlanPago, registrarAbono } from '@/api/planes_pago'

interface PlanPago {
  id: number
  cliente: { nombre: string; apellido_p: string; telefono1: string }
  venta: { id: number }
  total_venta: number
  total_a_pagar: number
  total_financiado: number
  anticipo: number
  interes_tipo: string | null
  interes_valor: number
  interes_aplicado: number
  monto_cuota: number
  num_plazos: number
  tipo_plazo: string
  saldo_pendiente: number
  fecha_inicio: string
  fecha_proximo_pago: string
  estado: string
  observaciones: string | null
}

interface PagoPlan {
  id: number
  numero_cuota: number
  monto_pagado: number
  saldo_anterior: number
  saldo_despues: number
  fecha_pago: string
  metodo_pago: string
  notas: string | null
}

const props = defineProps<{ plan: PlanPago }>()
const emits = defineEmits(['close', 'abonado'])

// copia local del plan para poder actualizarla sin depender del padre
const planLocal = ref<PlanPago>({ ...props.plan })

const pagos = ref<PagoPlan[]>([])
const loading = ref(false)

// formulario abono
const showFormAbono = ref(false)
const loadingAbono = ref(false)
const montoAbono = ref<number | undefined>(undefined)
const metodoPago = ref('efectivo')
const notas = ref('')

const nombreCliente = computed(() =>
  `${planLocal.value.cliente?.nombre ?? ''} ${planLocal.value.cliente?.apellido_p ?? ''}`.trim()
)

const porcentajePagado = computed(() => {
  const totalFinanciado = Number(planLocal.value.total_financiado)
  if (totalFinanciado <= 0) return 100
  const pagado = totalFinanciado - Number(planLocal.value.saldo_pendiente)
  return Math.min(Math.round((pagado / totalFinanciado) * 100), 100)
})

// validacion reactiva del monto
const montoValido = computed(() => {
  if (!montoAbono.value || montoAbono.value <= 0) return false
  if (montoAbono.value > Number(planLocal.value.saldo_pendiente)) return false
  return true
})

onMounted(async () => {
  await cargarPagos()
  montoAbono.value = Number(planLocal.value.monto_cuota)
})

async function cargarPagos() {
  loading.value = true
  try {
    const res = await fetchPagosPlan(planLocal.value.id)
    pagos.value = res.data?.pagos ?? []
  } finally {
    loading.value = false
  }
}

// recarga el plan completo desde el API
async function recargarPlan() {
  try {
    const res = await fetchPlanPago(planLocal.value.id)
    const planActualizado = res.data?.plan ?? res.data ?? null
    if (planActualizado) {
      planLocal.value = planActualizado
    }
  } catch (e) {
    // si falla la recarga, al menos tenemos los datos del response del abono
    console.error('Error al recargar plan:', e)
  }
}

async function confirmarAbono() {
  if (!montoValido.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Monto invalido',
      text: 'Ingresa un monto valido que no supere el saldo pendiente.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  loadingAbono.value = true
  try {
    const res = await registrarAbono(planLocal.value.id, {
      monto_pagado: montoAbono.value,
      metodo_pago:  metodoPago.value,
      notas:        notas.value || null,
      usuario_id:   user.id,
    })

    const estado = res.data?.estado_plan ?? res.data?.plan?.estado

    showFormAbono.value = false
    notas.value = ''

    // recargamos el plan completo y el historial desde el API
    await Promise.all([recargarPlan(), cargarPagos()])

    // actualizamos el monto sugerido con el nuevo saldo
    montoAbono.value = Number(planLocal.value.monto_cuota)

    // notificamos al padre para que refresque la lista
    emits('abonado')

    if (estado === 'liquidado') {
      Swal.fire({
        icon: 'success',
        title: 'Plan liquidado!',
        text: 'El cliente termino de pagar. Plan marcado como liquidado.',
        confirmButtonColor: '#22c55e'
      })
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Abono registrado',
        html: `
          <p>Saldo restante: <strong>$${Number(planLocal.value.saldo_pendiente).toFixed(2)}</strong></p>
          <p class="mt-1 text-sm text-gray-500">Proximo pago: <strong>${formatFecha(planLocal.value.fecha_proximo_pago)}</strong></p>
        `,
        confirmButtonColor: '#22c55e'
      })
    }

  } catch (e: any) {
    const mensaje = e?.response?.data?.message
      || e?.response?.data?.errors?.monto_pagado?.[0]
      || e?.response?.data?.errors?.caja_id?.[0]
      || e?.response?.data?.errors?.usuario_id?.[0]
      || 'No se pudo registrar el abono.'
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje })
  } finally {
    loadingAbono.value = false
  }
}

// formatea fechas ISO o date strings a formato legible en espanol
// maneja tanto "2026-03-05" como "2026-03-05T06:00:00.000000Z"
function formatFecha(fecha: string) {
  if (!fecha) return '—'
  const date = new Date(fecha)
  if (isNaN(date.getTime())) return fecha
  return date.toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/Mexico_City'
  })
}

function etiquetaEstado(estado: string) {
  const map: Record<string, string> = {
    activo:    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    liquidado: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    vencido:   'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    cancelado: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-600'
}
</script>