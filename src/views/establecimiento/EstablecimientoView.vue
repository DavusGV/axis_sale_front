<script setup lang="ts">
import { ref, onMounted, watch} from 'vue'
import Swal from 'sweetalert2'
import TopBanner from '@/components/shared/TopBanner.vue'
import FlexTable from '@/components/flex/FlexTable.vue'
import EstablecimientoModal from '@/components/establecimiento/EstablecimientoModal.vue'
import { getEstablecimientos, deleteEstablecimiento } from '@/api/establecimiento'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const establecimientos = ref<any[]>([])
const editingEstablecimiento = ref<any | null>(null)
const total = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const startIndex = ref(0)
const endIndex = ref(0)
const showModal = ref(false)

const params = ref({
  page: 1,
  search: ''
})

const columns = [
  { key: 'nombre', label: 'Establecimiento' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' }
]

async function loadEstablecimientos() {
  loading.value = true

  try {
    const res = await getEstablecimientos(params.value)

    establecimientos.value = res.data

    total.value = res.pagination.total
    currentPage.value = res.pagination.current_page
    totalPages.value = res.pagination.last_page

    if (res.data.length > 0) {
        startIndex.value = (currentPage.value - 1) * res.pagination.per_page + 1
        endIndex.value = startIndex.value + res.data.length - 1
    } else {
        startIndex.value = 0
        endIndex.value = 0
    }


  } catch (error: any) {
    Swal.fire('Error', 'No se pudieron cargar los establecimientos', 'error')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingEstablecimiento.value = null
  showModal.value = true
}

function openEdit(establecimiento: any) {
  editingEstablecimiento.value = establecimiento
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function onSaved() {
  params.value.page = 1
  loadEstablecimientos()
}


async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: '¿Eliminar establecimiento?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    confirmButtonColor: '#dc2626', // rojo  (danger)
    cancelButtonColor: '#3b82f6', // azul(primary)
  })

  if (!result.isConfirmed) return

  try {
    await deleteEstablecimiento(id)
    await loadEstablecimientos()

    Swal.fire('Eliminado', 'Establecimiento eliminado', 'success')
  } catch {
    Swal.fire('Error', 'No se pudo eliminar', 'error')
  }
}

function handleSearch(event: any) {
  params.value.search = event.target.value
  params.value.page = 1
  loadEstablecimientos()
}


const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    params.value.page++
    loadEstablecimientos()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    params.value.page--
    loadEstablecimientos()
  }
}

const paginate = (page: number) => {
  params.value.page = page
  loadEstablecimientos()
}

onMounted(loadEstablecimientos)

// Escucha el cambio de establecimiento seleccionado y vuelve a solicitar
// los productos correspondientes a ese establecimiento
watch(
  () => authStore.establishmentActive,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    await loadEstablecimientos()
  }
)
</script>

<template>
  <TopBanner title="Establecimientos">
    <div class="flex justify-end gap-4">
      <button class="btn" @click="openCreate">
        <i class="far fa-plus"></i>
          Agregar
      </button>

    </div>
  </TopBanner>

  <FlexTable
    :items="establecimientos"
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
    :handleDelete="handleDelete"
    :search="handleSearch"
    :handleEdit="openEdit"
  />


  <EstablecimientoModal
        :show="showModal"
        :establecimiento="editingEstablecimiento"
        @close="closeModal"
        @saved="onSaved"
    />

</template>


