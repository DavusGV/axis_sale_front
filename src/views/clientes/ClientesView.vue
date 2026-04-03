<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import DataTable from '@/components/plantillas/DataTable.vue'
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
const totalItems = ref(0)
const startIndex = ref(0)
const endIndex   = ref(0)

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
    page.value     = res.current_page
    totalItems.value = res.total
    startIndex.value = (res.current_page - 1) * (res.per_page ?? 15)
    endIndex.value   = startIndex.value + res.data.length - 1
  } finally {
    loading.value = false
  }
}

const columns = [
  { key: 'nombre',    label: 'Cliente'       },
  { key: 'telefono1', label: 'Teléfono'      },
  { key: 'email',     label: 'Email'         },
  { key: 'genero',    label: 'Género'        },
  { key: 'total_ventas',            label: 'Ventas'        },
  { key: 'cotizaciones_pendientes', label: 'Cotizaciones'  },
  { key: 'creditos_activos',        label: 'Créditos'      },
]

const paginate  = (p: number) => { page.value = p; loadClientes() }
const nextPage  = () => { if (page.value < lastPage.value) { page.value++; loadClientes() } }
const prevPage  = () => { if (page.value > 1) { page.value--; loadClientes() } }

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
      text: e?.response?.data?.data || e?.response?.data?.message || 'No se pudo eliminar el cliente.',
      confirmButtonColor: '#3b82f6'
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
      <button
        class="flex items-center gap-1.5 px-3 py-1.5
              text-xs font-medium
              bg-primary text-white
              border border-primary
              rounded-lg shadow-sm
              hover:bg-transparent hover:text-primary
              transition whitespace-nowrap"
        @click="abrirModalNuevo"
      >
        <i class="fa-solid fa-user-plus text-[11px]"></i>
        Nuevo Cliente
      </button>
    </div>

    <!-- tabla -->
    <DataTable
      :items="clientes"
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

        <!-- cliente con foto y nombre completo -->
        <template v-if="column.key === 'nombre'">
          <div class="flex items-center gap-3">
            <img
              v-if="item.foto"
              :src="`/storage/${item.foto}`"
              class="w-9 h-9 rounded-full object-cover"
            />
            <div
              v-else
              class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"
            >
              <i class="fa-solid fa-user text-gray-400 text-sm"></i>
            </div>
            <span class="font-medium">{{ nombreCompleto(item) }}</span>
          </div>
        </template>

        <!-- telefono con segundo numero si existe -->
        <template v-else-if="column.key === 'telefono1'">
          <span>{{ item.telefono1 }}</span>
          <span v-if="item.telefono2" class="text-xs text-gray-400 block">{{ item.telefono2 }}</span>
        </template>

        <!-- email -->
        <template v-else-if="column.key === 'email'">
          {{ item.email ?? '—' }}
        </template>

        <!-- genero -->
        <template v-else-if="column.key === 'genero'">
          <span class="capitalize">{{ item.genero ?? '—' }}</span>
        </template>

        <!-- ventas realizadas -->
        <template v-else-if="column.key === 'total_ventas'">
          <span
            class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
            :class="item.total_ventas > 0
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700'"
          >
            {{ item.total_ventas }}
          </span>
        </template>

        <!-- cotizaciones pendientes -->
        <template v-else-if="column.key === 'cotizaciones_pendientes'">
          <span
            class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
            :class="item.cotizaciones_pendientes > 0
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700'"
          >
            {{ item.cotizaciones_pendientes }}
          </span>
        </template>

        <!-- creditos activos -->
        <template v-else-if="column.key === 'creditos_activos'">
          <span
            class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
            :class="item.creditos_activos > 0
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700'"
          >
            {{ item.creditos_activos }}
          </span>
        </template>

        <template v-else>
          {{ value ?? '—' }}
        </template>

      </template>

      <template #actions="{ item }">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full
                bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300
                hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          title="Editar"
          @click="abrirModalEditar(item)"
        >
          <i class="fa-solid fa-pen text-xs"></i>
        </button>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full
                bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300
                hover:bg-red-200 dark:hover:bg-red-800 transition"
          title="Eliminar"
          @click="confirmarEliminar(item)"
        >
          <i class="fa-solid fa-trash text-xs"></i>
        </button>
      </template>

    </DataTable>

  </div>

  <!-- modal agregar/editar -->
  <ModalAddCliente
    v-if="showModal"
    :cliente="clienteSeleccionado"
    @close="showModal = false"
    @guardado="onGuardado"
  />
</template>