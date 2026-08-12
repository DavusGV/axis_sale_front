<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import DataTable from '@/components/plantillas/DataTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import { fetchPagosPendientes, verificarPago, rechazarPago } from '@/api/suscripcion'

const router = useRouter()

const pagos        = ref<any[]>([])
const total        = ref(0)
const currentPage  = ref(1)
const totalPages   = ref(1)
const startIndex   = ref(0)
const endIndex     = ref(0)
const loading      = ref(false)
const procesando   = ref(false)

// pestana activa, define el estado que se consulta
const estadoActivo = ref('pendiente')

const pestanas = [
  { valor: 'pendiente',  titulo: 'Por verificar' },
  { valor: 'verificado', titulo: 'Verificados' },
  { valor: 'rechazado',  titulo: 'Rechazados' },
]

// columnas que se renderizaran en la tabla
const columns = [
  { key: 'establecimiento', label: 'Establecimiento' },
  { key: 'fecha_pago',      label: 'Fecha deposito' },
  { key: 'monto',           label: 'Monto' },
  { key: 'cuenta',          label: 'Cuenta' },
  { key: 'referencia',      label: 'Referencia' },
  { key: 'voucher',         label: 'Comprobante' },
  { key: 'periodo',         label: 'Periodo cubierto' },
]

function formatearFecha(fecha?: string) {
  if (!fecha) return '--'
  const soloFecha = fecha.split('T')[0]
  const [anio, mes, dia] = soloFecha.split('-')
  return `${dia}/${mes}/${anio}`
}

async function loadPagos(p = 1) {
  loading.value = true
  try {
    const res = await fetchPagosPendientes({ page: p, estado: estadoActivo.value })
    const data = res.data.pagos
    pagos.value       = data.data
    currentPage.value = data.current_page
    totalPages.value  = data.last_page
    total.value       = data.total
    startIndex.value  = (data.from ?? 1) - 1
    endIndex.value    = (data.to ?? 0) - 1
  } catch {
    pagos.value = []
  } finally {
    loading.value = false
  }
}

function cambiarPestana(valor: string) {
  if (estadoActivo.value === valor) return
  estadoActivo.value = valor
  currentPage.value = 1
  loadPagos(1)
}

function paginate(page: number) {
  currentPage.value = page
  loadPagos(page)
}

function nextPage() {
  if (currentPage.value < totalPages.value) paginate(currentPage.value + 1)
}

function prevPage() {
  if (currentPage.value > 1) paginate(currentPage.value - 1)
}

function verComprobante(item: any) {
  if (!item.voucher_url) {
    Swal.fire({
      title: 'Sin comprobante',
      text: 'Este pago no tiene comprobante adjunto.',
      icon: 'info',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
    return
  }
  window.open(item.voucher_url, '_blank')
}

async function handleVerificar(item: any) {
  const result = await Swal.fire({
    title: 'Verificar pago?',
    html: `Se recorrera la fecha de vencimiento <strong>${item.meses_cubiertos}</strong> mes(es) del establecimiento <strong>${item.establecimiento?.nombre ?? ''}</strong>.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor:  '#d33',
    confirmButtonText:  'Si, verificar',
    cancelButtonText:   'Cancelar',
  })

  if (!result.isConfirmed) return

  procesando.value = true

  try {
    const res = await verificarPago(item.id)

    Swal.fire({
      title: 'Pago verificado',
      text: res.data?.message || 'El pago fue verificado correctamente.',
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })

    await loadPagos(currentPage.value)
  } catch (e: any) {
    const mensaje = e.response?.data?.data?.message || e.response?.data?.message ||
      'No se pudo verificar el pago'
    Swal.fire({
      title: 'Advertencia',
      text: mensaje,
      icon: 'warning',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
  } finally {
    procesando.value = false
  }
}

async function handleRechazar(item: any) {
  const { value: motivo } = await Swal.fire({
    title: 'Rechazar pago',
    input: 'textarea',
    inputLabel: 'Motivo del rechazo',
    inputPlaceholder: 'Indique por que se rechaza el comprobante',
    inputAttributes: { maxlength: '255' },
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor:  '#3085d6',
    confirmButtonText:  'Rechazar',
    cancelButtonText:   'Cancelar',
    inputValidator: (value) => {
      if (!value) return 'Debe indicar el motivo del rechazo'
      return null
    },
  })

  if (!motivo) return

  procesando.value = true

  try {
    await rechazarPago(item.id, motivo)

    Swal.fire({
      title: 'Pago rechazado',
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })

    await loadPagos(currentPage.value)
  } catch (e: any) {
    const mensaje = e.response?.data?.data?.message || e.response?.data?.message ||
      'No se pudo rechazar el pago'
    Swal.fire({
      title: 'Advertencia',
      text: mensaje,
      icon: 'warning',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
  } finally {
    procesando.value = false
  }
}

onMounted(() => {
  loadPagos()
})
</script>

<template>
  <TopBanner title="Pagos de suscripcion">
    <div class="flex justify-end gap-4 lg:gap-6">
      <button class="btn-outline" @click="router.push({ name: 'suscripciones' })">
        <i class="fa-solid fa-arrow-left"></i>
        Suscripciones
      </button>
    </div>
  </TopBanner>

  <!-- pestanas por estado -->
  <div class="box mb-4 flex flex-wrap gap-2 py-3 px-5">
    <button
      v-for="pestana in pestanas"
      :key="pestana.valor"
      class="px-4 py-1.5 text-xs font-medium rounded-lg border transition"
      :class="estadoActivo === pestana.valor
        ? 'bg-primary text-white border-primary'
        : 'bg-transparent text-primary border-primary hover:bg-primary/10'"
      @click="cambiarPestana(pestana.valor)"
    >
      {{ pestana.titulo }}
    </button>
  </div>

  <DataTable
    :items="pagos"
    :columns="columns"
    :currentPage="currentPage"
    :totalPages="totalPages"
    :total="total"
    :startIndex="startIndex"
    :endIndex="endIndex"
    :paginate="paginate"
    :nextPage="nextPage"
    :prevPage="prevPage"
  >
    <template #cell="{ item, column, value }">
      <template v-if="column.key === 'establecimiento'">
        {{ item.establecimiento?.nombre ?? '--' }}
      </template>

      <template v-else-if="column.key === 'fecha_pago'">
        {{ formatearFecha(value) }}
      </template>

      <template v-else-if="column.key === 'monto'">
        ${{ Number(value).toFixed(2) }}
      </template>

      <template v-else-if="column.key === 'cuenta'">
        <span v-if="item.cuenta_deposito">
          {{ item.cuenta_deposito.banco }} - {{ item.cuenta_deposito.numero }}
        </span>
        <span v-else class="text-gray-400">--</span>
      </template>

      <!-- comprobante en nueva pestana -->
      <template v-else-if="column.key === 'voucher'">
        <button
          v-if="item.voucher_url"
          class="cursor-pointer text-primary hover:underline text-xs flex items-center gap-1"
          @click="verComprobante(item)"
        >
          <i class="fa-solid fa-file-arrow-down"></i>
          Ver
        </button>
        <span v-else class="text-gray-400">--</span>
      </template>

      <!-- periodo cubierto, solo existe si ya fue verificado -->
      <template v-else-if="column.key === 'periodo'">
        <span v-if="item.periodo_inicio">
          {{ formatearFecha(item.periodo_inicio) }} - {{ formatearFecha(item.periodo_fin) }}
        </span>
        <span v-else class="text-gray-400">--</span>
      </template>

      <template v-else>
        {{ value ?? '--' }}
      </template>
    </template>

    <template #actions="{ item }">
      <div class="flex justify-center gap-1">
        <!-- solo los pendientes se pueden verificar o rechazar -->
        <template v-if="item.estado === 'pendiente'">
          <button
            class="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-green-600 dark:text-green-400 disabled:opacity-50"
            title="Verificar"
            :disabled="procesando"
            @click="handleVerificar(item)"
          >
            <i class="fa-solid fa-circle-check"></i>
          </button>
          <button
            class="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-red-600 dark:text-red-400 disabled:opacity-50"
            title="Rechazar"
            :disabled="procesando"
            @click="handleRechazar(item)"
          >
            <i class="fa-solid fa-circle-xmark"></i>
          </button>
        </template>

        <!-- en verificados se muestra quien lo aprobo -->
        <span v-else-if="item.estado === 'verificado'" class="text-xs text-gray-500 dark:text-gray-400">
          {{ item.verificado_por?.name ?? 'Verificado' }}
        </span>

        <!-- en rechazados el motivo -->
        <button
          v-else
          class="cursor-pointer text-xs text-red-600 dark:text-red-400 hover:underline"
          title="Ver motivo"
          @click="Swal.fire({ title: 'Motivo del rechazo', text: item.motivo_rechazo, icon: 'info', color: '#1f2937', confirmButtonColor: '#3b82f6' })"
        >
          Ver motivo
        </button>
      </div>
    </template>
  </DataTable>
</template>