<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/plantillas/DataTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import SuscripcionModal from '@/components/suscripcion/SuscripcionModal.vue'
import { fetchSuscripciones } from '@/api/suscripcion'

const router = useRouter()

const suscripciones = ref<any[]>([])
const total        = ref(0)
const currentPage  = ref(1)
const totalPages   = ref(1)
const startIndex   = ref(0)
const endIndex     = ref(0)
const loading      = ref(false)

const showModal        = ref(false)
const editingItem      = ref<any | null>(null)

// columnas que se renderizaran en la tabla
const columns = [
  { key: 'establecimiento', label: 'Establecimiento' },
  { key: 'monto',           label: 'Monto' },
  { key: 'ciclo',           label: 'Ciclo' },
  { key: 'dia_pago',        label: 'Dia de pago' },
  { key: 'fecha_proximo_pago', label: 'Proximo pago' },
  { key: 'dias_restantes',  label: 'Dias restantes' },
  { key: 'estado',          label: 'Estado' },
  { key: 'activo',          label: 'Activo' },
]

// etiquetas y colores por estado calculado
const etiquetasEstado: Record<string, string> = {
  libre:      'Sin restriccion',
  al_dia:     'Al dia',
  por_vencer: 'Por vencer',
  vencido:    'Vencido',
  bloqueado:  'Bloqueado',
}

const clasesEstado: Record<string, string> = {
  libre:      'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300',
  al_dia:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  por_vencer: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  vencido:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  bloqueado:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function etiquetaDiaPago(item: any) {
  if (item.ciclo_pago === 'anual' && item.mes_pago) {
    return `${item.dia_pago} de ${nombresMeses[item.mes_pago - 1]}`
  }
  return `Día ${item.dia_pago}`
}

function etiquetaCiclo(item: any) {
  return item.ciclo_pago === 'mensual' ? 'Mensual' : 'Anual'
}

function formatearFecha(fecha?: string) {
  if (!fecha) return '--'
  const soloFecha = fecha.split('T')[0]
  const [anio, mes, dia] = soloFecha.split('-')
  return `${dia}/${mes}/${anio}`
}

async function loadSuscripciones(p = 1) {
  loading.value = true
  try {
    const res = await fetchSuscripciones({ page: p })
    const data = res.data.suscripciones
    suscripciones.value = data.data
    currentPage.value   = data.current_page
    totalPages.value    = data.last_page
    total.value         = data.total
    startIndex.value    = (data.from ?? 1) - 1
    endIndex.value      = (data.to ?? 0) - 1
  } catch {
    suscripciones.value = []
  } finally {
    loading.value = false
  }
}

function paginate(page: number) {
  currentPage.value = page
  loadSuscripciones(page)
}

function nextPage() {
  if (currentPage.value < totalPages.value) paginate(currentPage.value + 1)
}

function prevPage() {
  if (currentPage.value > 1) paginate(currentPage.value - 1)
}

function abrirModal() {
  editingItem.value = null
  showModal.value = true
}

function abrirEdicion(item: any) {
  editingItem.value = { ...item }
  showModal.value = true
}

function onGuardado() {
  loadSuscripciones(currentPage.value)
}

onMounted(() => {
  loadSuscripciones()
})
</script>

<template>
  <TopBanner title="Suscripciones">
    <div class="flex justify-end gap-4 lg:gap-6">
      <button class="btn-outline" @click="router.push({ name: 'cuentas-deposito' })">
        <i class="fa-solid fa-building-columns"></i>
        Cuentas de deposito
      </button>
      <button class="btn-outline" @click="router.push({ name: 'suscripcion-pagos' })">
        <i class="fa-solid fa-receipt"></i>
        Pagos
      </button>
      <button class="btn" @click="abrirModal">
        <i class="far fa-plus"></i>
        Agregar
      </button>
    </div>
  </TopBanner>

  <DataTable
    :items="suscripciones"
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
      <!-- nombre del establecimiento relacionado -->
      <template v-if="column.key === 'establecimiento'">
        {{ item.establecimiento?.nombre ?? '--' }}
      </template>

      <template v-else-if="column.key === 'monto'">
        ${{ Number(value).toFixed(2) }}
      </template>

      <template v-else-if="column.key === 'ciclo'">
        {{ etiquetaCiclo(item) }}
      </template>

      <template v-else-if="column.key === 'dia_pago'">
        {{ etiquetaDiaPago(item) }}
      </template>

      <template v-else-if="column.key === 'fecha_proximo_pago'">
        {{ formatearFecha(value) }}
      </template>

      <!-- dias restantes, en rojo cuando ya vencio -->
      <template v-else-if="column.key === 'dias_restantes'">
        <span :class="value < 0 ? 'text-red-600 dark:text-red-400 font-medium' : ''">
          {{ value }}
        </span>
      </template>

      <template v-else-if="column.key === 'estado'">
        <span
          class="inline-block px-2 py-0.5 rounded text-xs font-medium"
          :class="clasesEstado[value] || clasesEstado.libre"
        >
          {{ etiquetasEstado[value] || value }}
        </span>
      </template>

      <template v-else-if="column.key === 'activo'">
        <span
          class="inline-block px-2 py-0.5 rounded text-xs font-medium"
          :class="value
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300'"
        >
          {{ value ? 'Si' : 'No' }}
        </span>
      </template>

      <template v-else>
        {{ value ?? '--' }}
      </template>
    </template>

    <template #actions="{ item }">
      <div class="flex justify-center">
        <button
          class="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-blue-600 dark:text-blue-400"
          title="Editar"
          @click="abrirEdicion(item)"
        >
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
      </div>
    </template>
  </DataTable>

  <SuscripcionModal
    :show="showModal"
    :suscripcion="editingItem"
    @close="showModal = false"
    @saved="onGuardado"
  />
</template>