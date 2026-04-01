<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import DataTable from '@/components/plantillas/DataTable.vue'
import ModalTicket from '@/components/ventas/ModalTicket.vue'
import ModalEditarVenta from '@/components/ventas/ModalEditarVenta.vue'
import { fetchHistorialVentas, cancelarVenta, exportHistorialExcel, exportHistorialPdf } from '@/api/ventas'
import Swal from 'sweetalert2'

const ventas        = ref<any[]>([])
const page          = ref(1)
const lastPage      = ref(1)
const totalItems    = ref(0)
const startIndex    = ref(0)
const endIndex      = ref(0)
const loading       = ref(false)

// ticket
const showModalTicket = ref(false)
const ticketVentaId = ref<number | null>(null)

// editar venta
const showModalEditar = ref(false)
const ventaActiva     = ref<any>(null)

// exportacion
const exportando = ref<'excel' | 'pdf' | null>(null)

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

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    desde: start.toISOString().slice(0, 10),
    hasta: end.toISOString().slice(0, 10),
  }
}

const rango = getMonthRange()

// filtros
const filtros = ref({
  search: '',
  status: '',
  desde:  rango.desde,
  hasta:  rango.hasta,
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

function verTicket(venta: any) {
  // solo asignamos el id, el modal se encarga de pedir el PDF al backend
  ticketVentaId.value   = venta.id
  showModalTicket.value = true
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

function colorStatus(status: string) {
  if (status === 'vendido')   return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (status === 'pendiente') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (status === 'no_pagado') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  if (status === 'cancelada') return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  return 'bg-gray-100 text-gray-600'
}

// ── Funciones de exportacion ──

function descargarBlob(data: Blob, nombreArchivo: string) {
  const url = window.URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', nombreArchivo)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

async function descargarExcel() {
  if (exportando.value) return
  exportando.value = 'excel'
  try {
    const res = await exportHistorialExcel({
      desde:  filtros.value.desde,
      hasta:  filtros.value.hasta,
      search: filtros.value.search,
      status: filtros.value.status,
    })
    const nombre = `historial_ventas_${filtros.value.desde}_al_${filtros.value.hasta}.xlsx`
    descargarBlob(res.data, nombre)
  } catch (e: any) {
    let mensaje = 'Error al generar el reporte Excel'
    if (e.response?.data instanceof Blob) {
      const texto = await e.response.data.text()
      try {
        const json = JSON.parse(texto)
        mensaje = json.message || mensaje
      } catch { /* no es JSON */ }
    }
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje })
  } finally {
    exportando.value = null
  }
}

async function descargarPdf() {
  if (exportando.value) return
  exportando.value = 'pdf'
  try {
    const res = await exportHistorialPdf({
      desde:  filtros.value.desde,
      hasta:  filtros.value.hasta,
      search: filtros.value.search,
      status: filtros.value.status,
    })
    const nombre = `historial_ventas_${filtros.value.desde}_al_${filtros.value.hasta}.pdf`
    descargarBlob(res.data, nombre)
  } catch (e: any) {
    let mensaje = 'Error al generar el reporte PDF'
    if (e.response?.data instanceof Blob) {
      const texto = await e.response.data.text()
      try {
        const json = JSON.parse(texto)
        mensaje = json.message || mensaje
      } catch { /* no es JSON */ }
    }
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje })
  } finally {
    exportando.value = null
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
            <option value="pendiente">Pendiente</option>
            <option value="no_pagado">No pagado</option>
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
        @click="filtros = { search: '', status: '', desde: getMonthRange().desde, hasta: getMonthRange().hasta }; cargarHistorial()"
      >
        <i class="fa-solid fa-xmark mr-1 text-[11px]"></i>
        Limpiar Filtros
      </button>

      <!-- boton exportar Excel -->
      <button
        @click="descargarExcel"
        :disabled="exportando !== null"
        class="flex items-center gap-1.5 px-3 py-1.5
              text-xs font-medium rounded-lg shadow-sm transition whitespace-nowrap
              bg-emerald-600 hover:bg-emerald-700 text-white
              disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i
          class="fa-solid text-[11px]"
          :class="exportando === 'excel' ? 'fa-spinner fa-spin' : 'fa-file-excel'"
        ></i>
        {{ exportando === 'excel' ? 'Generando...' : 'Excel' }}
      </button>

      <!-- boton exportar PDF -->
      <button
        @click="descargarPdf"
        :disabled="exportando !== null"
        class="flex items-center gap-1.5 px-3 py-1.5
              text-xs font-medium rounded-lg shadow-sm transition whitespace-nowrap
              bg-red-600 hover:bg-red-700 text-white
              disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i
          class="fa-solid text-[11px]"
          :class="exportando === 'pdf' ? 'fa-spinner fa-spin' : 'fa-file-pdf'"
        ></i>
        {{ exportando === 'pdf' ? 'Generando...' : 'PDF' }}
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
      <!-- celdas personalizadas -->
      <template #cell="{ item, column, value }">

        <!-- total formateado -->
        <template v-if="column.key === 'total'">
          <span class="font-medium">${{ Number(value).toFixed(2) }}</span>
        </template>

        <!-- status con badge -->
        <template v-else-if="column.key === 'status'">
          <span :class="['px-2 py-1 rounded-full text-xs font-medium capitalize', colorStatus(item.status)]">
            {{ item.status }}
          </span>
        </template>

        <!-- metodo de pago capitalizado -->
        <template v-else-if="column.key === 'metodo_pago'">
          <span class="capitalize">{{ value ?? '--' }}</span>
        </template>

        <!-- cliente -->
        <template v-else-if="column.key === 'cliente'">
          {{ value ?? '--' }}
        </template>

        <!-- cualquier otra columna -->
        <template v-else>
          {{ value ?? '--' }}
        </template>
      </template>
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
    v-if="showModalTicket && ticketVentaId"
    :id="ticketVentaId"
    tipo="venta"
    :folio="ventas.find(v => v.id === ticketVentaId)?.folio"
    @close="showModalTicket = false; ticketVentaId = null"
  />

  <!-- modal editar venta -->
  <ModalEditarVenta
    v-if="showModalEditar && ventaActiva"
    :venta="ventaActiva"
    @close="showModalEditar = false; ventaActiva = null"
    @actualizado="cargarHistorial"
  />

</template>