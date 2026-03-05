<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import { ref, watch, onMounted } from 'vue'
import ModalAddCliente from '@/components/clientes/ModalAddCliente.vue'
import { fetchClientes, eliminarCliente } from '@/api/clientes'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const clientes = ref<any[]>([])
const search = ref('')
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)

const showModal = ref(false)
const clienteSeleccionado = ref<any>(null)

watch(search, () => {
  page.value = 1
  loadClientes()
})

watch(
  () => authStore.establishmentActive,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    page.value = 1
    await loadClientes()
  }
)

onMounted(async () => {
  await loadClientes()
})

const loadClientes = async () => {
  loading.value = true
  try {
    const res = await fetchClientes({ page: page.value, search: search.value })
    clientes.value = res.data
    lastPage.value = res.last_page
    page.value = res.current_page
  } finally {
    loading.value = false
  }
}

function abrirModalNuevo() {
  clienteSeleccionado.value = null
  showModal.value = true
}

function abrirModalEditar(cliente: any) {
  clienteSeleccionado.value = cliente
  showModal.value = true
}

async function onGuardado() {
  showModal.value = false
  clienteSeleccionado.value = null
  await loadClientes()
  Swal.fire({
    icon: 'success',
    title: clienteSeleccionado.value ? 'Cliente actualizado' : 'Cliente registrado',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000
  })
}

async function confirmarEliminar(cliente: any) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Eliminar cliente',
    text: `¿Seguro que deseas eliminar a ${cliente.nombre} ${cliente.apellido_p}?`,
    showCancelButton: true,
    confirmButtonText: 'Si, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280'
  })

  if (!result.isConfirmed) return

  try {
    await eliminarCliente(cliente.id)
    await loadClientes()
    Swal.fire({
      icon: 'success',
      title: 'Cliente eliminado',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.response?.data?.message || 'No se pudo eliminar el cliente.'
    })
  }
}

function nombreCompleto(cliente: any) {
  return [cliente.nombre, cliente.apellido_p, cliente.apellido_m].filter(Boolean).join(' ')
}
</script>

<template>
  <TopBanner title="Clientes" />

  <div class="p-4">

    <!-- barra superior: busqueda y boton nuevo -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          v-model="search"
          class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400
                 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1
                 focus:ring-green-400 transition"
          placeholder="Buscar por nombre, telefono o correo..."
          type="text"
          autocomplete="off"
        />
      </div>
      <button class="btn flex items-center gap-2 whitespace-nowrap" @click="abrirModalNuevo">
        <i class="fa-solid fa-user-plus"></i>
        Nuevo Cliente
      </button>
    </div>

    <!-- tabla -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
          <tr>
            <th class="px-4 py-3 text-left">Cliente</th>
            <th class="px-4 py-3 text-left">Telefono</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Genero</th>
            <th class="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400">
              Cargando...
            </td>
          </tr>
          <tr v-else-if="!clientes.length">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400">
              <i class="fa-regular fa-face-sad-tear text-lg"></i>
              <p>No hay clientes registrados</p>
            </td>
          </tr>
          <tr
            v-for="cliente in clientes"
            :key="cliente.id"
            class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <!-- foto y nombre -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="cliente.foto"
                  :src="`/storage/${cliente.foto}`"
                  class="w-9 h-9 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"
                >
                  <i class="fa-solid fa-user text-gray-400 text-sm"></i>
                </div>
                <span class="font-medium text-gray-800 dark:text-gray-100">
                  {{ nombreCompleto(cliente) }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300">
              {{ cliente.telefono1 }}
              <span v-if="cliente.telefono2" class="text-xs text-gray-400 block">
                {{ cliente.telefono2 }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300">
              {{ cliente.email ?? '—' }}
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">
              {{ cliente.genero ?? '—' }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-2">
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full
                         bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300
                         hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                  @click="abrirModalEditar(cliente)"
                  title="Editar"
                >
                  <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full
                         bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300
                         hover:bg-red-200 dark:hover:bg-red-800 transition"
                  @click="confirmarEliminar(cliente)"
                  title="Eliminar"
                >
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- paginacion -->
    <div class="flex justify-center items-center gap-3 mt-6 select-none">
      <button
        @click="page--; loadClientes()"
        :disabled="page <= 1"
        class="btn"
      >
        <IconChevronLeft />
      </button>

      <div class="flex gap-2">
        <button
          v-for="num in lastPage"
          :key="num"
          @click="page = num; loadClientes()"
          :class="['btn', page === num
            ? 'border-green-600 text-white shadow-lg scale-110'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          {{ num }}
        </button>
      </div>

      <button
        @click="page++; loadClientes()"
        :disabled="page >= lastPage"
        class="btn"
      >
        <IconChevronRight />
      </button>
    </div>

  </div>

  <!-- modal agregar/editar -->
  <ModalAddCliente
    v-if="showModal"
    :cliente="clienteSeleccionado"
    @close="showModal = false"
    @guardado="onGuardado"
  />
</template>