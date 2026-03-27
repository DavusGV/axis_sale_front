<script setup lang="ts">
import agregarCategoriaProductos from '@/components/products/AgregarCategoriaProductos.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import DataTable from '@/components/plantillas/DataTable.vue'
import TableActions from '@/components/shared/TableActions.vue'
import { registrarCategoria, fetchCategorias, deleteCategoria, editarCategoria } from '@/api/categorias'
import { ref, watch, onMounted } from "vue"
import Swal from 'sweetalert2'

const categoriaEditando = ref<any>(null)
const loading = ref<boolean>(false)
const categorias = ref<any[]>([])
const lastPage = ref<number>(1)
const page = ref<number>(1)
const totalItems = ref<number>(0)
const startIndex = ref<number>(0)
const endIndex = ref<number>(0)

const filtros = ref({
  search: ''
})

watch(filtros, () => {
  page.value = 1
  cargarCategorias()
}, { deep: true })

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción' }
]

onMounted(() => {
  cargarCategorias()
})

async function cargarCategorias(p = 1) {
  loading.value = true
  try {
    const res = await fetchCategorias({
      page: p,
      search: filtros.value.search
    })

    categorias.value = res.data
    lastPage.value = res.last_page
    page.value = res.current_page
    totalItems.value = res.total
    startIndex.value = (res.from ?? 1) - 1
    endIndex.value = (res.to ?? 1) - 1
  } catch {
    categorias.value = []
  } finally {
    loading.value = false
  }
}

const paginate = (p: number) => cargarCategorias(p)
const nextPage = () => { if (page.value < lastPage.value) cargarCategorias(page.value + 1) }
const prevPage = () => { if (page.value > 1) cargarCategorias(page.value - 1) }

// Guardar categoria
async function guardarCategoria(data: any) {
  try {
    loading.value = true
    const result = await registrarCategoria(data)

    Swal.fire({
      icon: 'success',
      title: 'Categoría agregada',
      text: result.data?.category?.nombre || '',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    await cargarCategorias(page.value)
  } catch (error: any) {
    const message =
      error.response?.data?.data?.message ||
      error.response?.data?.message ||
      'Ocurrió un error.'

    Swal.fire({
      icon: 'error',
      title: 'Error al guardar categoría',
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      confirmButtonColor: '#3b82f6',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
  } finally {
    loading.value = false
  }
}

// Eliminar categoria
async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: '¿Eliminar categoría?',
    text: 'Esta acción no se puede deshacer.',
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
    await deleteCategoria(id)

    Swal.fire({
      icon: 'success',
      title: 'Eliminada correctamente',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })

    await cargarCategorias(
      categorias.value.length === 1 && page.value > 1
        ? page.value - 1
        : page.value
    )
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: error.response?.data?.message || 'Ocurrió un error',
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

// Editar categoria
function handleEdit(item: any) {
  categoriaEditando.value = item
}

// Buscar desde el componente formulario
function handleSearch(item: any) {
  filtros.value.search = item.search
}

// Actualizar categoria
async function handleUpdate(data: any) {
  const result = await Swal.fire({
    title: '¿Actualizar la categoría?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2DC25F',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, Actualizar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    loading.value = true
    await editarCategoria(data)
    categoriaEditando.value = null

    Swal.fire({
      icon: 'success',
      title: 'Categoría actualizada correctamente',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })

    await cargarCategorias(page.value)
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al actualizar',
      text: error.response?.data?.data?.message ||
            error.response?.data?.message  || 'Ocurrió un error',
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
</script>

<template>
  <TopBanner title="Categorías de Productos" />

  <div class="p-4">

    <!-- Formulario crear/editar -->
    <agregarCategoriaProductos
      :editData="categoriaEditando"
      @editar="handleUpdate"
      @guardar="guardarCategoria"
      @search="handleSearch"
    />

    <!-- Filtros estilo historial -->
    <div class="flex flex-wrap gap-3 mb-4">
      <!-- buscar por nombre -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-magnifying-glass text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.search"
          type="text"
          placeholder="Buscar categoría..."
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
          autocomplete="off"
        />
      </div>

      <!-- limpiar filtros -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5
              text-xs font-medium bg-primary text-white border border-primary
              rounded-lg shadow-sm hover:bg-transparent hover:text-primary
              transition whitespace-nowrap"
        @click="filtros.search = ''; cargarCategorias()"
      >
        <i class="fa-solid fa-xmark mr-1 text-[11px]"></i>
        Limpiar
      </button>
    </div>

    <!-- Tabla -->
    <DataTable
      :items="categorias"
      :columns="columns"
      :currentPage="page"
      :totalPages="lastPage"
      :total="totalItems"
      :startIndex="startIndex"
      :endIndex="endIndex"
      :paginate="paginate"
      :nextPage="nextPage"
      :prevPage="prevPage"
    >
      <template #cell="{ item, column, value }">
        <template v-if="column.key === 'descripcion'">
          {{ value ?? '--' }}
        </template>
        <template v-else>
          {{ value ?? '--' }}
        </template>
      </template>

      <template #actions="{ item, index }">
        <TableActions
          :from-bottom="categorias.length > 3 && index >= categorias.length - 2"
          :on-edit="() => handleEdit(item)"
          :on-delete="() => handleDelete(Number(item.id))"
        />
      </template>
    </DataTable>

  </div>
</template>