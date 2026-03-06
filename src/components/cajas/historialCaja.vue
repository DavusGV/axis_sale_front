<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Swal from 'sweetalert2'
import FlexTable from '@/components/flex/FlexTable.vue'
import PlaceloadList from '@/components/placeload/PlaceLoadList.vue'
import { fetchHistoryBox } from '@/api/cajas'

interface HistoryBox {
  id: number
  estado: string
  saldo_inicial: string
  saldo_final: string
  fecha_apertura: string
  fecha_cierre: string
  created_at: string
  updated_at: string
  caja?: {
    id?: number
    nombre?: string
  }
}

interface PaginationResponse {
  data: HistoryBox[]
  total: number
  current_page: number
  last_page: number
  per_page: number
}

const props = defineProps<{
  show: boolean
  historyId: number | null
}>()

const emit = defineEmits(['close'])


const rawHistory = ref<HistoryBox[]>([])
const loading    = ref(false)

const currentPage = ref(1)
const totalPages  = ref(1)
const total       = ref(0)
const page        = ref(1)
const startIndex  = ref(0)
const endIndex    = ref(0)


const history = computed(() => {
  if (!Array.isArray(rawHistory.value)) return []

  return rawHistory.value.map((item) => ({
    id: item.id,
    caja_nombre: item.caja?.nombre ?? '—',
    estado: item.estado,
    saldo_inicial: formatMoney(Number(item.saldo_inicial)),
    saldo_final: formatMoney(Number(item.saldo_final)),
    fecha_apertura: formatDate(item.fecha_apertura),
    fecha_cierre: formatDate(item.fecha_cierre)
  }))
})


function formatDate(date?: string) {
  if (!date) return '—'
  return new Date(date.replace(' ', 'T')).toLocaleString('es-MX')
}

function formatMoney(value?: number) {
  if (value == null || isNaN(value)) return '—'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value)
}

const columns = [
  { key: 'id',            label: 'ID' },
  { key: 'caja_nombre',   label: 'Caja' },
  { key: 'estado',        label: 'Estado' },
  { key: 'saldo_inicial', label: 'Saldo Inicial' },
  { key: 'saldo_final',   label: 'Saldo Final' },
  { key: 'fecha_apertura',label: 'Fecha Apertura' },
  { key: 'fecha_cierre',  label: 'Fecha Cierre' }
]


async function loadHistory() {
  if (!props.historyId) return

  loading.value = true

  try {
    const res = await fetchHistoryBox(props.historyId, {
      page: page.value
    })

    const pagination: PaginationResponse = res.data

    rawHistory.value = Array.isArray(pagination.data)
      ? pagination.data
      : []

    total.value = pagination.total
    currentPage.value = pagination.current_page
    totalPages.value = pagination.last_page

    calculateIndexes(pagination.per_page)
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo cargar el historial', 'error')
  } finally {
    loading.value = false
  }
}

function calculateIndexes(perPage: number) {
  if (!rawHistory.value.length) {
    startIndex.value  = 0
    endIndex.value    = 0
    return
  }

  startIndex.value = (currentPage.value - 1) * perPage + 1
  endIndex.value = startIndex.value + rawHistory.value.length - 1
}

function nextPage() {
  if (currentPage.value >= totalPages.value) return
  page.value++
  loadHistory()
}

function prevPage() {
  if (currentPage.value <= 1) return
  page.value--
  loadHistory()
}

function paginate(p: number) {
  page.value = p
  loadHistory()
}

watch(
  () => props.show,
  (show) => {
    if (!show || !props.historyId) return
    page.value = 1
    loadHistory()
  }
)

watch(
  () => props.historyId,
  (id) => {
    if (!props.show || !id) return
    page.value = 1
    loadHistory()
  }
)
</script>
<template>
  <div v-if="show" class="box">
    <PlaceloadList v-if="loading" />
    <FlexTable
      v-else
      :items="history"
      :total="total"
      :current-page="currentPage"
      :columns="columns"
      :loading="loading"
      :start-index="startIndex"
      :end-index="endIndex"
      :total-pages="totalPages"
      :paginate="paginate"
      :next-page="nextPage"
      :prev-page="prevPage"
    />
  </div>
</template>