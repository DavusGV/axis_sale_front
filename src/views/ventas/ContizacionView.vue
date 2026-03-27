<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import DataTable from '@/components/plantillas/DataTable.vue'
import ModalTicket from '@/components/ventas/ModalTicket.vue'
import ModalComprobarCotizacion from '@/components/ventas/ModalComprobarCotizacion.vue'
import { fetchCotizaciones, fetchTicketCotizacion, cancelarCotizacion } from '@/api/cotizaciones'
import { fetchConfiguracion } from '@/api/configuracion'
import { fetchTicket } from '@/api/ventas'
import Swal from 'sweetalert2'

// listado de cotizaciones
const cotizaciones   = ref<any[]>([])
const search         = ref('')
const page         = ref(1)
const lastPage     = ref(1)
const totalItems   = ref(0)
const startIndex   = ref(0)
const endIndex     = ref(0)
const loading        = ref(false)
const configuracion  = ref<any>(null)

// descargar ticket de venta realizada
const descargarTicket = ref(false)

// modal ticket cotizacion
const showModalTicket = ref(false)
const ticketData      = ref<any>(null)

// modal comprobar y convertir
const showModalComprobar  = ref(false)
const cotizacionActiva    = ref<any>(null)

// modal ticket venta (cuando la cotizacion ya fue vendida)
const showModalTicketVenta = ref(false)
const ticketVentaData      = ref<any>(null)

// dropdown menu de acciones por cotizacion
const dropdownAbierto = ref<number | string | null>(null)
const dropdownRefs    = ref<Record<string, HTMLElement | null>>({})
const dropdownStyle = ref<Record<string, string>>({})

function setDropdownRef(el: any, id: number | string) {
  if (el) dropdownRefs.value[id] = el
}

function toggleDropdown(id: number | string) {
  if (dropdownAbierto.value === id) {
    dropdownAbierto.value = null
    return
  }

  dropdownAbierto.value = id

  const refEl = dropdownRefs.value[id]
  if (!refEl) return

  const rect = refEl.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.top
  const spaceAbove = rect.top

  dropdownStyle.value = {}

  // alineamos el menu al mismo nivel del boton
  if (spaceAbove > spaceBelow) {
    // abre hacia arriba, anclado desde abajo al nivel del boton
    dropdownStyle.value = {
      bottom: `${window.innerHeight - rect.bottom}px`,
      right: `${window.innerWidth - rect.left + 4}px`,
    }
  } else {
    // abre hacia abajo, anclado desde arriba al nivel del boton
    dropdownStyle.value = {
      top: `${rect.top}px`,
      right: `${window.innerWidth - rect.left + 4}px`,
    }
  }
}

function cerrarDropdown() {
  dropdownAbierto.value = null
}

// cerrar dropdown al hacer click fuera
function onClickFuera(e: MouseEvent) {
  if (dropdownAbierto.value === null) return
  const ref = dropdownRefs.value[dropdownAbierto.value]
  if (ref && !ref.contains(e.target as Node)) {
    cerrarDropdown()
  }
}

onMounted(async () => {
  await cargarCotizaciones()
  document.addEventListener('click', onClickFuera)
  try {
    configuracion.value = await fetchConfiguracion()
  } catch {
      // si falla se usaran valores por defecto de forma que no interrumpa el flujo
      Swal.fire({
        icon: 'warning',
        title: 'Configuración no disponible',
        text: 'Se usarán valores por defecto',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      })
    }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickFuera)
})

async function cargarCotizaciones(p = 1) {
  loading.value = true
  try {
    const res = await fetchCotizaciones({
      page:        p,
      search:      filtros.value.search,
      status:      filtros.value.status,
      cliente:     filtros.value.cliente,
      fecha_desde: filtros.value.fecha_desde,
      fecha_hasta: filtros.value.fecha_hasta,
    })
    cotizaciones.value = res.data
    lastPage.value     = res.last_page
    page.value         = res.current_page
    totalItems.value   = res.total
    startIndex.value   = res.from - 1
    endIndex.value     = res.to - 1
  } catch {
    cotizaciones.value = []
  } finally {
    loading.value = false
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

// filtros de busqueda
const filtros = ref({
  search:      '',
  status:      '',
  cliente:     '',
  fecha_desde: rango.desde,
  fecha_hasta: rango.hasta,
})

// recarga al cambiar cualquier filtro
watch(filtros, () => {
  page.value = 1
  cargarCotizaciones()
}, { deep: true })

const columns = [
  { key: 'folio',          label: 'Folio Cotizacion' },
  { key: 'venta_folio',    label: 'Folio Venta' },
  { key: 'cliente.nombre', label: 'Cliente' },
  { key: 'total',          label: 'Total' },
  { key: 'expires_at',     label: 'Expira' },
  { key: 'status',         label: 'Status' },
  { key: 'notas',          label: 'Notas' },
  { key: 'created_at',     label: 'Fecha' },
]

const paginate  = (p: number) => cargarCotizaciones(p)
const nextPage  = () => { if (page.value < lastPage.value) cargarCotizaciones(page.value + 1) }
const prevPage  = () => { if (page.value > 1) cargarCotizaciones(page.value - 1) }

async function verTicket(cotizacion: any) {
  descargarTicket.value = false
  try {
    Swal.fire({
      title: 'Cargando ticket...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
    })
    const res             = await fetchTicketCotizacion(cotizacion.id)
    ticketData.value      = res.data.ticket  // corregido
    showModalTicket.value = true
    Swal.close()
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el ticket.' })
  }
}

async function verTicketVenta(cotizacion: any) {
  if (cotizacion.status !== 'vendido' || !cotizacion.venta_folio) {
    Swal.fire({
      icon: 'info',
      title: 'No disponible',
      text: 'Esta cotización no tiene una venta asociada.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500
    })
    return
  }

  try {
    Swal.fire({
      title: 'Cargando ticket de venta...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
    })

    // necesitamos el id de la venta, lo buscamos desde el backend
    const res = await fetchTicketCotizacion(cotizacion.id)
    const ventaFolio = res.data.ticket.venta_folio

    // buscamos la venta por el venta_id que guarda la cotizacion
    // necesitamos agregar venta_id al response del index
    const ventaId = cotizacion.venta_id
    const ticketRes = await fetchTicket(ventaId)

    ticketVentaData.value      = ticketRes.ticket
    showModalTicketVenta.value = true
    Swal.close()
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el ticket de venta.' })
  }
}

function abrirComprobar(cotizacion: any) {
  if (cotizacion.status !== 'pendiente') {
    Swal.fire({
      icon: 'info',
      title: 'No disponible',
      text: `Esta cotizacion esta en estado: ${cotizacion.status}.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500
    })
    return
  }
  cotizacionActiva.value   = cotizacion
  showModalComprobar.value = true
}

function onVentaRealizada(ticket?: any) {
  cargarCotizaciones()

  // si viene el ticket de venta lo mostramos
  if (ticket) {
    descargarTicket.value = true
    ticketVentaData.value = ticket
    showModalTicketVenta.value = true
  }
}

async function confirmarCancelar(id: number) {
  // buscamos la cotizacion para validar el status
  const cotizacion = cotizaciones.value.find(c => c.id === id)
  if (cotizacion?.status !== 'pendiente') {
    Swal.fire({
      icon: 'info',
      title: 'No disponible',
      text: `Solo se pueden cancelar cotizaciones pendientes.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500
    })
    return
  }

  const confirm = await Swal.fire({
    icon: 'warning',
    title: 'Cancelar cotizacion',
    text: 'Esta accion no se puede deshacer.',
    showCancelButton: true,
    confirmButtonText: 'Si, cancelar',
    cancelButtonText: 'No',
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#00A2FF',
  })

  if (!confirm.isConfirmed) return

  try {
    await cancelarCotizacion(id)
    Swal.fire({
      icon: 'success',
      title: 'Cotizacion cancelada',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
    await cargarCotizaciones()
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar la cotizacion.' })
  }
}

// badge de color segun el status
function colorStatus(status: string) {
  if (status === 'pendiente') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (status === 'vendido')   return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (status === 'cancelado') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  return ''
}
</script>

<template>
  <TopBanner title="Cotizaciones" />

  <div class="p-4">

    <!-- panel de filtros -->
    <div class="flex flex-wrap gap-3 mb-4">

      <!-- buscar por folio -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-magnifying-glass text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.search"
          type="text"
          placeholder="Folio COT o venta..."
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
          autocomplete="off"
        />
      </div>

      <!-- buscar por cliente -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-user text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.cliente"
          type="text"
          placeholder="Buscar cliente..."
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
          <option value="">Todos los status</option>
          <option value="pendiente">Pendiente</option>
          <option value="vendido">Vendido</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <!-- fecha desde -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i class="fa-solid fa-calendar-days text-gray-400 text-xs"></i>
        </span>
        <input
          v-model="filtros.fecha_desde"
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
          v-model="filtros.fecha_hasta"
          type="date"
          @click="($event.target as HTMLInputElement).showPicker()"
          class="block pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-400 transition text-sm"
        />
      </div>

      <!-- boton limpiar filtros -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium
            bg-primary text-white
            border border-primary
            rounded-lg shadow-sm
            hover:bg-transparent hover:text-primary
            transition whitespace-nowrap"
        @click="filtros = { search: '', status: '', cliente: '', fecha_desde: getMonthRange().desde, fecha_hasta: getMonthRange().hasta }; cargarCotizaciones()"
      >
        <i class="fa-solid fa-xmark mr-1 text-[11px]"></i>
          Limpiar Filtros
      </button>
    </div>

    <DataTable
      :items="cotizaciones"
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

        <!-- folio venta -->
        <template v-else-if="column.key === 'venta_folio'">
          <span v-if="value" class="text-green-600 font-medium">{{ value }}</span>
          <span v-else class="text-gray-400">—</span>
        </template>

        <!-- notas truncadas -->
        <template v-else-if="column.key === 'notas'">
          <span v-if="value" class="truncate block max-w-[150px]" :title="value">{{ value }}</span>
          <span v-else class="text-gray-400">—</span>
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
            class="fixed border text-sm z-50 dark:border-gray-600
                  min-w-[170px] p-1.5 rounded-md bg-white dark:bg-gray-800 shadow-lg"
            :style="dropdownStyle"
          >
            <!-- ver ticket cotizacion (siempre) -->
            <li>
              <button
                @click="verTicket(item); cerrarDropdown()"
                class="py-2 w-full text-left hover:bg-blue-50 dark:hover:bg-gray-700
                      rounded-md duration-300 px-3 flex items-center gap-2 text-blue-600 dark:text-blue-400"
              >
                <i class="fa-solid fa-receipt text-xs"></i>
                Ticket COT
              </button>
            </li>

            <!-- ver ticket venta (solo si vendido) -->
            <li v-if="item.status === 'vendido' && item.venta_id">
              <button
                @click="verTicketVenta(item); cerrarDropdown()"
                class="py-2 w-full text-left hover:bg-green-50 dark:hover:bg-gray-700
                      rounded-md duration-300 px-3 flex items-center gap-2 text-green-600 dark:text-green-400"
              >
                <i class="fa-solid fa-file-invoice-dollar text-xs"></i>
                Ticket VTA
              </button>
            </li>

            <!-- comprobar (solo pendiente) -->
            <li v-if="item.status === 'pendiente'">
              <button
                @click="abrirComprobar(item); cerrarDropdown()"
                class="py-2 w-full text-left hover:bg-orange-50 dark:hover:bg-gray-700
                      rounded-md duration-300 px-3 flex items-center gap-2 text-orange-600 dark:text-orange-400"
              >
                <i class="fa-solid fa-boxes-stacked text-xs"></i>
                Comprobar
              </button>
            </li>

            <!-- cancelar (solo pendiente) -->
            <li v-if="item.status === 'pendiente'">
              <button
                @click="confirmarCancelar(Number(item.id)); cerrarDropdown()"
                class="py-2 w-full text-left hover:bg-red-50 dark:hover:bg-gray-700
                      rounded-md duration-300 px-3 flex items-center gap-2 text-red-600 dark:text-red-400"
              >
                <i class="fa-solid fa-ban text-xs"></i>
                Cancelar
              </button>
            </li>
          </ul>
        </div>
      </template>
    </DataTable>

  </div>

  <!-- modal ticket reutilizado de ventas -->
  <ModalTicket
    v-if="showModalTicket && ticketData"
    :ticket="ticketData"
    tipo="cotizacion"
    :impresora_ancho="configuracion?.impresora_ancho ?? 80"
    :impresora_alto="configuracion?.impresora_alto ?? 200"
    @close="showModalTicket = false"
  />

  <!-- modal ticket de venta -->
  <ModalTicket
    v-if="showModalTicketVenta && ticketVentaData"
    :ticket="ticketVentaData"
    tipo="venta"
    :impresora_ancho="configuracion?.impresora_ancho ?? 80"
    :impresora_alto="configuracion?.impresora_alto ?? 200"
    @close="showModalTicketVenta = false"
    :auto-descargar="descargarTicket"
  />

  <!-- modal comprobar stock y convertir -->
  <ModalComprobarCotizacion
    v-if="showModalComprobar && cotizacionActiva"
    :cotizacion="cotizacionActiva"
    @close="showModalComprobar = false; cotizacionActiva = null"
    @vendido="onVentaRealizada"
  />

</template>