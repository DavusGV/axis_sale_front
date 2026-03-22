<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import DataTable from '@/components/plantillas/DataTable.vue'
import ModalTicket from '@/components/ventas/ModalTicket.vue'
import ModalEditarVenta from '@/components/ventas/ModalEditarVenta.vue'
import { fetchHistorialVentas, fetchTicket, cancelarVenta } from '@/api/ventas'
import { fetchConfiguracion } from '@/api/configuracion'
import Swal from 'sweetalert2'

const ventas        = ref<any[]>([])
const page          = ref(1)
const lastPage      = ref(1)
const totalItems    = ref(0)
const startIndex    = ref(0)
const endIndex      = ref(0)
const loading       = ref(false)
const configuracion = ref<any>(null)

// ticket
const showModalTicket = ref(false)
const ticketData      = ref<any>(null)

// editar venta
const showModalEditar = ref(false)
const ventaActiva     = ref<any>(null)

// dropdown
const dropdownAbierto = ref<number | string | null>(null)
const dropdownRefs    = ref<Record<string, HTMLElement | null>>({})

function setDropdownRef(el: any, id: number | string) {
  if (el) dropdownRefs.value[id] = el
}

function toggleDropdown(id: number | string) {
  dropdownAbierto.value = dropdownAbierto.value === id ? null : id
}

function cerrarDropdown() {
  dropdownAbierto.value = null
}

function onClickFuera(e: MouseEvent) {
  if (dropdownAbierto.value === null) return
  const ref = dropdownRefs.value[dropdownAbierto.value]
  if (ref && !ref.contains(e.target as Node)) {
    cerrarDropdown()
  }
}

// filtros
const filtros = ref({
  search: '',
  status: '',
  desde:  '',
  hasta:  '',
})

watch(filtros, () => {
  page.value = 1
  cargarHistorial()
}, { deep: true })

const columns = [
  { key: 'folio',         label: 'Folio' },
  { key: 'fecha',         label: 'Fecha' },
  { key: 'metodo_pago',   label: 'Metodo Pago' },
  { key: 'total',         label: 'Total' },
  { key: 'num_productos', label: 'Productos' },
  { key: 'cliente',       label: 'Cliente' },
  { key: 'status',        label: 'Status' },
]

onMounted(async () => {
  document.addEventListener('click', onClickFuera)
  await cargarHistorial()
  try {
    configuracion.value = await fetchConfiguracion()
  } catch {
    // valores por defecto
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickFuera)
})

async function cargarHistorial(p = 1) {
  loading.value = true
  try {
    const res = await fetchHistorialVentas({
      page:   p,
      search: filtros.value.search,
      status: filtros.value.status,
      desde:  filtros.value.desde,
      hasta:  filtros.value.hasta,
    })
    ventas.value     = res.data
    lastPage.value   = res.last_page
    page.value       = res.current_page
    totalItems.value = res.total
    startIndex.value = (res.from ?? 1) - 1
    endIndex.value   = (res.to ?? 1) - 1
  } catch {
    ventas.value = []
  } finally {
    loading.value = false
  }
}

const paginate = (p: number) => cargarHistorial(p)
const nextPage = () => { if (page.value < lastPage.value) cargarHistorial(page.value + 1) }
const prevPage = () => { if (page.value > 1) cargarHistorial(page.value - 1) }

async function verTicket(venta: any) {
  try {
    Swal.fire({
      title: 'Cargando ticket...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
    })
    const res            = await fetchTicket(venta.id)
    ticketData.value     = res.ticket
    showModalTicket.value = true
    Swal.close()
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el ticket.' })
  }
}

function abrirEditar(venta: any) {
  if (venta.status === 'cancelada') {
    Swal.fire({
      icon: 'info',
      title: 'No disponible',
      text: 'No se puede editar una venta cancelada.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500
    })
    return
  }
  ventaActiva.value    = venta
  showModalEditar.value = true
}

async function confirmarCancelar(venta: any) {
  if (venta.status === 'cancelada') {
    Swal.fire({
      icon: 'info',
      title: 'Ya cancelada',
      text: 'Esta venta ya fue cancelada.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500
    })
    return
  }

  const confirm = await Swal.fire({
    icon: 'warning',
    title: 'Cancelar venta',
    html: `¿Cancelar la venta <strong>${venta.folio}</strong>?<br>El stock de los productos sera devuelto.`,
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No',
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#00A2FF',
  })

  if (!confirm.isConfirmed) return

  try {
    await cancelarVenta(venta.id)
    Swal.fire({
      icon: 'success',
      title: 'Venta cancelada',
      text: 'El stock fue devuelto correctamente.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
    await cargarHistorial()
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar la venta.' })
  }
}
</script>

<template>
  <TopBanner title="Historial de Ventas" />

  <div class="p-4">

    <!-- filtros -->
    <div class="flex flex-wrap gap-3 mb-4">

      <!-- buscar por folio -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-magnifying-glass text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.search"
          type="text"
          placeholder="Folio o metodo de pago..."
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
          autocomplete="off"
        />
      </div>

      <!-- filtro por status -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-filter text-gray-400 text-xs"></i>
        </span>
        <select
          v-model="filtros.status"
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
        >
          <option value="">Todos</option>
          <option value="vendido">Vendido</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <!-- fecha desde -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-calendar-days text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.desde"
          type="date"
          @click="($event.target as HTMLInputElement).showPicker()"
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
        />
      </div>

      <!-- fecha hasta -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-calendar-days text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.hasta"
          type="date"
          @click="($event.target as HTMLInputElement).showPicker()"
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
        />
      </div>

      <!-- limpiar filtros -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5
              text-xs font-medium bg-primary text-white border border-primary
              rounded-lg shadow-sm hover:bg-transparent hover:text-primary
              transition whitespace-nowrap"
        @click="filtros = { search: '', status: '', desde: '', hasta: '' }; cargarHistorial()"
      >
        <i class="fa-solid fa-xmark mr-1 text-[11px]"></i>
        Limpiar Filtros
      </button>
    </div>

    <!-- tabla -->
    <DataTable
      :items="ventas"
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
      <template #actions="{ item, index }">
        <div class="relative flex justify-center" :ref="el => setDropdownRef(el, item.id)">
          <button
            class="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            @click="toggleDropdown(item.id)"
          >
            <i class="fa-solid fa-ellipsis-vertical text-gray-500"></i>
          </button>

          <ul
            v-show="dropdownAbierto === item.id"
            class="absolute right-full mr-1 border text-sm z-30 dark:border-gray-600
                   min-w-[170px] p-1.5 rounded-md bg-white dark:bg-gray-800 shadow-lg"
            :class="{ 'bottom-0': index >= ventas.length - 2 }"
          >
            <!-- ver ticket -->
            <li>
              <button
                @click="verTicket(item); cerrarDropdown()"
                class="py-2 w-full text-left hover:bg-blue-50 dark:hover:bg-gray-700
                       rounded-md duration-300 px-3 flex items-center gap-2 text-blue-600 dark:text-blue-400"
              >
                <i class="fa-solid fa-receipt text-xs"></i>
                Ver ticket
              </button>
            </li>

            <!-- editar (solo vendido) -->
            <li v-if="item.status !== 'cancelada'">
              <button
                @click="abrirEditar(item); cerrarDropdown()"
                class="py-2 w-full text-left hover:bg-orange-50 dark:hover:bg-gray-700
                       rounded-md duration-300 px-3 flex items-center gap-2 text-orange-600 dark:text-orange-400"
              >
                <i class="fa-solid fa-pen text-xs"></i>
                Editar venta
              </button>
            </li>

            <!-- cancelar (solo vendido) -->
            <li v-if="item.status !== 'cancelada'">
              <button
                @click="confirmarCancelar(item); cerrarDropdown()"
                class="py-2 w-full text-left hover:bg-red-50 dark:hover:bg-gray-700
                       rounded-md duration-300 px-3 flex items-center gap-2 text-red-600 dark:text-red-400"
              >
                <i class="fa-solid fa-ban text-xs"></i>
                Cancelar venta
              </button>
            </li>
          </ul>
        </div>
      </template>
    </DataTable>

  </div>

  <!-- modal ticket -->
  <ModalTicket
    v-if="showModalTicket && ticketData"
    :ticket="ticketData"
    tipo="venta"
    :impresora_ancho="configuracion?.impresora_ancho ?? 80"
    :impresora_alto="configuracion?.impresora_alto ?? 200"
    @close="showModalTicket = false"
  />

  <!-- modal editar venta -->
  <ModalEditarVenta
    v-if="showModalEditar && ventaActiva"
    :venta="ventaActiva"
    @close="showModalEditar = false; ventaActiva = null"
    @actualizado="cargarHistorial"
  />

</template>