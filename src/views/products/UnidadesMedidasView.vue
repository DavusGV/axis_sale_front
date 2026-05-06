<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Swal from 'sweetalert2'
import DataTable from '@/components/plantillas/DataTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import AgregarUnidadMedida from '@/components/products/AgregarUnidadMedida.vue'
import {
  fetchUnidadesMedidas,
  createUnidadMedida,
  updateUnidadMedida,
  destroyUnidadMedida
} from '@/api/unidades_medidas'
import { labelAbreviatura } from '@/utils/abreviaturas'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const unidades        = ref<any[]>([])
const unidadEditando  = ref<any>(null)
const loading         = ref(false)

const total      = ref(0)
const currentPage = ref(1)
const totalPages  = ref(1)
const startIndex  = ref(0)
const endIndex    = ref(0)

const filtros = ref({
  search: '',
  page:   1,
  per_page: 15
})

const columns = [
  { key: 'unidad',      label: 'Unidad' },
  { key: 'abreviatura', label: 'Abreviatura' },
  { key: 'descripcion', label: 'Descripcion' },
]

// recarga cuando cambia cualquier filtro (igual que categorias)
watch(filtros, () => {
  filtros.value.page = 1
  cargarUnidades()
}, { deep: true })

// recarga cuando cambia el establecimiento activo
watch(
  () => authStore.establishmentActive,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    await cargarUnidades()
  }
)

onMounted(() => {
  cargarUnidades()
})

async function cargarUnidades(p = 1) {
  loading.value = true
  try {
    const res = await fetchUnidadesMedidas({
      page:     p,
      search:   filtros.value.search,
      per_page: filtros.value.per_page
    })
    unidades.value    = res.data
    total.value       = res.total
    currentPage.value = res.current_page
    totalPages.value  = res.last_page
    startIndex.value  = (res.from ?? 1) - 1
    endIndex.value    = (res.to   ?? 1) - 1
  } catch {
    unidades.value = []
  } finally {
    loading.value = false
  }
}

const paginate  = (p: number) => cargarUnidades(p)
const nextPage  = () => { if (currentPage.value < totalPages.value) cargarUnidades(currentPage.value + 1) }
const prevPage  = () => { if (currentPage.value > 1) cargarUnidades(currentPage.value - 1) }

// guarda una unidad nueva
async function guardarUnidad(data: any) {
  try {
    loading.value = true
    await createUnidadMedida(data)

    Swal.fire({
      icon: 'success',
      title: 'Unidad agregada',
      text: data.unidad,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    await cargarUnidades(currentPage.value)
  } catch (error: any) {
    const mensaje =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Ocurrio un error.'

    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: mensaje,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true
    })
  } finally {
    loading.value = false
  }
}

// activa el modo edicion cargando el item en el formulario
function handleEdit(item: any) {
  unidadEditando.value = item
}

// actualiza una unidad existente
async function handleUpdate(data: any) {
  const result = await Swal.fire({
    title: '¿Actualizar la unidad?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2DC25F',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, actualizar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    loading.value = true
    await updateUnidadMedida(data.id, data)
    unidadEditando.value = null

    Swal.fire({
      icon: 'success',
      title: 'Unidad actualizada correctamente',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })

    await cargarUnidades(currentPage.value)
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al actualizar',
      text: error.response?.data?.error || 'Ocurrio un error.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true
    })
  } finally {
    loading.value = false
  }
}

// elimina una unidad (el backend bloquea si tiene productos)
async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: '¿Eliminar unidad de medida?',
    text: 'No se puede eliminar si hay productos usandola.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    loading.value = true
    await destroyUnidadMedida(id)

    Swal.fire({
      icon: 'success',
      title: 'Eliminada correctamente',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })

    await cargarUnidades(
      unidades.value.length === 1 && currentPage.value > 1
        ? currentPage.value - 1
        : currentPage.value
    )
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: error.response?.data?.error || 'Ocurrio un error.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      confirmButtonColor: '#3b82f6'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <TopBanner title="Unidades de Medida" />

  <div class="p-4">

    <!-- formulario crear/editar embebido arriba -->
    <AgregarUnidadMedida
      :editData="unidadEditando"
      @guardar="guardarUnidad"
      @editar="handleUpdate"
    />

    <!-- filtro de busqueda -->
    <div class="flex flex-wrap gap-3 mb-4">
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-magnifying-glass text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.search"
          type="text"
          placeholder="Buscar unidad..."
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                 bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                 focus:ring-1 focus:ring-green-400 transition text-sm"
          autocomplete="off"
        />
      </div>

      <button
        class="flex items-center gap-1.5 px-3 py-1.5
               text-xs font-medium bg-primary text-white border border-primary
               rounded-lg shadow-sm hover:bg-transparent hover:text-primary
               transition whitespace-nowrap"
        @click="filtros.search = ''; cargarUnidades()"
      >
        <i class="fa-solid fa-xmark mr-1 text-[11px]"></i>
        Limpiar
      </button>
    </div>

    <!-- tabla -->
    <DataTable
      :items="unidades"
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
      <!-- slot de celda personalizada -->
      <template #cell="{ column, value }">
        <template v-if="column.key === 'abreviatura'">
          {{ labelAbreviatura(value) }}
        </template>
        <template v-else>
          {{ value ?? '--' }}
        </template>
      </template>

      <template #actions="{ item }">
        <button
          class="btn-outline text-xs px-2 py-1"
          @click="handleEdit(item)"
        >
          <i class="fa-solid fa-pen"></i>
        </button>
        <button
          class="btn-outline text-xs px-2 py-1 text-red-500"
          @click="handleDelete(Number(item.id))"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      </template>
    </DataTable>

  </div>
</template>