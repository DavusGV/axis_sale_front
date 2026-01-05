<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import TopBanner from '@/components/shared/TopBanner.vue'
import FlexTable from '@/components/flex/FlexTable.vue'
import UserModal from '@/components/usuarios/CreateEditModal.vue'

import {
  getUsers,
  deleteUser
} from '@/api/user'

// ---------------- STATE ----------------
const users = ref<any[]>([])
const loading = ref(false)
const router = useRouter()

const total = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const startIndex = ref(0)
const endIndex = ref(0)

const showUserModal = ref(false)

const params = ref({
  page: 1,
  search: ''
})

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' }
]

// ---------------- LOAD ----------------
async function loadUsers() {
  loading.value = true
  try {
    const res = await getUsers(params.value)

    users.value = res.data
    total.value = res.pagination.total
    currentPage.value = res.pagination.current_page
    totalPages.value = res.pagination.last_page

    startIndex.value = (currentPage.value - 1) * res.pagination.per_page + 1
    endIndex.value = startIndex.value + users.value.length - 1
  } catch {
    Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error')
  } finally {
    loading.value = false
  }
}

// ---------------- ACTIONS ----------------
function openCreate() {
  showUserModal.value = true
}

function openFullEdit(user: any) {
  router.push({
    name: 'usuarios-editar',
    params: { id: user.id }
  })
}

async function handleUserSaved() {
  showUserModal.value = false
  await loadUsers()
}

async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: '¿Eliminar usuario?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280'
  })

  if (!result.isConfirmed) return

  await deleteUser(id)
  await loadUsers()

  Swal.fire('Eliminado', 'Usuario eliminado', 'success')
}

// ---------------- SEARCH & PAGINATION ----------------
function handleSearch(e: any) {
  params.value.search = e.target.value
  params.value.page = 1
  loadUsers()
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    params.value.page++
    loadUsers()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    params.value.page--
    loadUsers()
  }
}

const paginate = (page: number) => {
  params.value.page = page
  loadUsers()
}

onMounted(loadUsers)
</script>

<template>
  <TopBanner title="Usuarios">
    <div class="flex gap-3">
      <button class="btn" @click="openCreate">
        <i class="far fa-plus"></i> Agregar
      </button>
    </div>
  </TopBanner>

  <FlexTable
    :items="users"
    :columns="columns"
    :total="total"
    :current-page="currentPage"
    :total-pages="totalPages"
    :start-index="startIndex"
    :end-index="endIndex"
    :loading="loading"
    :search="handleSearch"
    :paginate="paginate"
    :next-page="nextPage"
    :prev-page="prevPage"
    :handleEdit="openFullEdit"
    :handleDelete="handleDelete"
  />

  <!-- MODAL SOLO PARA CREAR -->
  <UserModal
    :show="showUserModal"
    @close="showUserModal = false"
    @success="handleUserSaved"
  />
</template>

