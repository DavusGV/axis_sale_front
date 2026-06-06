<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import DataTable from '@/components/plantillas/DataTable.vue'
import { getAllPermissions } from '@/api/RolePermission'

// columnas
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'category', label: 'Categoría' },
  { key: 'name', label: 'Nombre' },
  { key: 'created_at', label: 'Fecha' }
]

// estados
const permissions = ref([])
const loading = ref(false)

// paginación
const page = ref(1)
const lastPage = ref(1)
const totalItems = ref(0)
const perPage = ref(10)

// helpers para DataTable
const startIndex = ref(0)
const endIndex = ref(0)

// fetch
const cargarPermisos = async () => {
  try {
    loading.value = true

    const res = await getAllPermissions({
      page: page.value,
      per_page: perPage.value
    } )
    const data = res.data
    permissions.value = data.data
    page.value = data.current_page
    lastPage.value = data.last_page
    totalItems.value = data.total

  } catch (error) {
    console.error('Error al cargar permisos', error)
  } finally {
    loading.value = false
  }
}

// paginación
const paginate = (newPage: number) => {
  page.value = newPage
  cargarPermisos()
}

const nextPage = () => {
  if (page.value < lastPage.value) {
    page.value++
    cargarPermisos()
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    cargarPermisos()
  }
}

onMounted(() => {
  cargarPermisos()
})
</script>

<template>
  <TopBanner title="Permisos" />

  <div class="p-4">

    <DataTable
      :items="permissions"
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

      <!-- celdas personalizadas -->
      <template #cell="{ item, column, value }">

        <!-- fecha -->
        <template v-if="column.key === 'created_at'">
          <span>{{ new Date(value).toLocaleDateString() }}</span>
        </template>

        <!-- default -->
        <template v-else>
          {{ value ?? '--' }}
        </template>

      </template>

    </DataTable>

  </div>
</template>