<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import DataTable from '@/components/plantillas/DataTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import { fetchProducts, type ProductFilters, DestroyProduct, fetchCategories, fetchUnidadesMedidasSelect } from '@/api/products'
import { useAuthStore } from '@/stores/authStore'
import ProductModal from '@/components/products/ProductsModal.vue'
import ProductsImportModal from '@/components/products/ProductsImportModal.vue'
import StockUpdateModal from '@/components/products/StockUpdateModal.vue'

// ---------- STATE ----------
const router = useRouter()
const authStore = useAuthStore()

const showProductModal = ref(false)
const showImportModal  = ref(false)
const showStockModal   = ref(false)
const editingProduct   = ref<any | null>(null)
const productoStock    = ref<any | null>(null)

const productos    = ref<any[]>([])
const total        = ref(0)
const currentPage  = ref<number>(1)
const loading      = ref(false)
const startIndex   = ref(0)
const endIndex     = ref(0)
const totalPages   = ref(1)

// catalogos para filtros
const categorias            = ref<any[]>([])
const categoriaSeleccionada = ref<string | number>('')
const unidades              = ref<any[]>([])
const unidadSeleccionada    = ref<string | number>('')

// dropdown menu de acciones por producto (mismo patron que cotizaciones)
const dropdownAbierto = ref<number | string | null>(null)
const dropdownRefs    = ref<Record<string, HTMLElement | null>>({})
const dropdownStyle   = ref<Record<string, string>>({})

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
  if (spaceAbove > spaceBelow) {
    dropdownStyle.value = {
      bottom: `${window.innerHeight - rect.bottom}px`,
      right:  `${window.innerWidth - rect.left + 4}px`,
    }
  } else {
    dropdownStyle.value = {
      top:   `${rect.top}px`,
      right: `${window.innerWidth - rect.left + 4}px`,
    }
  }
}

function cerrarDropdown() {
  dropdownAbierto.value = null
}

function onClickFuera(e: MouseEvent) {
  if (dropdownAbierto.value === null) return
  const refEl = dropdownRefs.value[dropdownAbierto.value]
  if (refEl && !refEl.contains(e.target as Node)) {
    cerrarDropdown()
  }
}

// columnas que se renderizaran en la tabla
const columns = [
  { key: 'nombre',        label: 'Nombre' },
  { key: 'codigo',        label: 'Codigo' },
  { key: 'servicio',      label: 'Tipo' },
  { key: 'precio_compra', label: 'Precio Compra' },
  { key: 'precio_venta',  label: 'Precio Venta' },
  { key: 'stock',         label: 'Stock' },
  { key: 'categoria',     label: 'Categoria' },
  { key: 'unidad_medida', label: 'Unidad de Medida' },
]

const filtros = ref({
  page:             1,
  search:           '',
  categoria_id:     '',
  unidad_medida_id: '',
})

// catalogos
async function loadCategorias() {
  try {
    const res = await fetchCategories()
    categorias.value = res.categories || res.data?.categories || []
  } catch {
    categorias.value = []
  }
}

async function loadUnidades() {
  try {
    unidades.value = await fetchUnidadesMedidasSelect()
  } catch {
    unidades.value = []
  }
}

async function loadProducts() {
  loading.value = true
  try {
    const res = await fetchProducts(filtros.value)
    productos.value  = res.data
    currentPage.value = res.current_page
    totalPages.value  = res.last_page
    total.value       = res.total
    startIndex.value  = (res.from ?? 1) - 1
    endIndex.value    = (res.to ?? 0) - 1
  } catch {
    productos.value = []
  } finally {
    loading.value = false
  }
}

// recarga al cambiar cualquier filtro
watch(filtros, () => {
  filtros.value.page = 1
  currentPage.value  = 1
  loadProducts()
}, { deep: true })

// busqueda manual desde input
function handleSearch(event: any) {
  filtros.value.search = event.target.value
}

watch(categoriaSeleccionada, (val) => {
  filtros.value.categoria_id = val === null ? '' : String(val)
})

watch(unidadSeleccionada, (val) => {
  filtros.value.unidad_medida_id = val === null ? '' : String(val)
})

// paginacion
function paginate(page: number) {
  currentPage.value  = page
  filtros.value.page = page
  loadProducts()
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    paginate(currentPage.value + 1)
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    paginate(currentPage.value - 1)
  }
}

// acciones
function openProductModal() {
  editingProduct.value = null
  showProductModal.value = true
}

function openEditModal(producto: any) {
  editingProduct.value = { ...producto }
  showProductModal.value = true
}

function closeProductModal() {
  showProductModal.value = false
}

function onProductSaved() {
  loadProducts()
}

function openImportModal() {
  showImportModal.value = true
}

function onImported() {
  loadProducts()
}

// abrir modal de actualizar stock
function abrirActualizarStock(producto: any) {
  if (producto.es_servicio) {
    Swal.fire({
      title: 'No aplica',
      text:  'Los servicios no manejan stock.',
      icon:  'info',
      toast: true,
      position: 'top-end',
      timer: 2500,
      showConfirmButton: false,
    })
    return
  }
  productoStock.value = producto
  showStockModal.value = true
}

function cerrarStockModal() {
  showStockModal.value = false
  productoStock.value  = null
}

function onStockActualizado() {
  loadProducts()
}

// navegar al dashboard con el producto preseleccionado
function verCronologia(producto: any) {
  router.push({
    name:  'stock',
    query: { producto_id: producto.id },
  })
}

function limpiarFiltros() {
  categoriaSeleccionada.value = ''
  unidadSeleccionada.value    = ''
  filtros.value = {
    page: 1,
    search: '',
    categoria_id: '',
    unidad_medida_id: '',
  }
  currentPage.value = 1
}

async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: 'Eliminar producto?',
    text: 'Esta accion no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor:  '#d33',
    confirmButtonText:  'Si, eliminar',
    cancelButtonText:   'Cancelar',
  })

  if (!result.isConfirmed) return

  try {
    await DestroyProduct(id)
    Swal.fire({
      title: 'Eliminado',
      text: 'El producto ha sido eliminado.',
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
    await loadProducts()
  } catch {
    Swal.fire({
      title: 'Advertencia',
      text: 'No se pudo eliminar el producto',
      icon: 'warning',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
  }
}

// cuando cambia el establecimiento recargamos catalogos y productos
watch(
  () => authStore.establishmentActive,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    limpiarFiltros()
    await loadCategorias()
    await loadUnidades()
    await loadProducts()
  }
)

onMounted(async () => {
  document.addEventListener('click', onClickFuera)
  await loadCategorias()
  await loadUnidades()
  await loadProducts()
})
</script>

<template>
  <TopBanner title="Productos">
    <div class="flex justify-end gap-4 lg:gap-6">
      <button class="btn-outline" @click="openImportModal">
        <i class="fa-solid fa-file-arrow-up"></i>
        Importar
      </button>
      <button class="btn" @click="openProductModal">
        <i class="far fa-plus"></i>
        Agregar
      </button>
    </div>
  </TopBanner>

  <!-- panel de filtros -->
  <div class="box mb-4 flex flex-wrap items-center gap-3 py-3 px-5">

    <!-- buscador -->
    <div class="relative flex-1 min-w-[220px] max-w-xs">
      <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
      <input
        v-model="filtros.search"
        type="text"
        placeholder="Buscar producto..."
        class="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg4 dark:text-gray-100
               rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
        autocomplete="off"
      />
    </div>

    <!-- filtro categoria -->
    <div class="relative flex-1 min-w-[220px] max-w-xs">
      <i class="fa-solid fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
      <select
        v-model="categoriaSeleccionada"
        class="w-full appearance-none border border-gray-300 dark:border-gray-700
              bg-white dark:bg-bg4 dark:text-gray-100
              rounded-lg pl-9 pr-9 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
      >
        <option value="">Todas las categorias</option>
        <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
          {{ cat.nombre }}
        </option>
      </select>
      <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
    </div>

    <!-- filtro unidad -->
    <div class="relative flex-1 min-w-[220px] max-w-xs">
      <i class="fa-solid fa-ruler absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
      <select
        v-model="unidadSeleccionada"
        class="w-full appearance-none border border-gray-300 dark:border-gray-700
              bg-white dark:bg-bg4 dark:text-gray-100
              rounded-lg pl-9 pr-9 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
      >
        <option value="">Todas las unidades</option>
        <option v-for="u in unidades" :key="u.id" :value="u.id">
          {{ u.unidad }} ({{ u.abreviatura }})
        </option>
      </select>
      <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
    </div>

    <!-- boton limpiar -->
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
            bg-primary text-white border border-primary rounded-lg shadow-sm
            hover:bg-transparent hover:text-primary transition whitespace-nowrap ml-auto"
      @click="limpiarFiltros"
    >
      <i class="fa-solid fa-xmark"></i>
      Limpiar filtros
    </button>
  </div>

  <!-- tabla con DataTable -->
  <DataTable
    :items="productos"
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
    <!-- celdas personalizadas -->
    <template #cell="{ item, column, value }">
      <!-- precios formateados -->
      <template v-if="column.key === 'precio_compra' || column.key === 'precio_venta'">
        <span v-if="value !== null && value !== undefined">${{ Number(value).toFixed(2) }}</span>
        <span v-else class="text-gray-400">—</span>
      </template>

      <!-- stock con badge si esta bajo -->
      <template v-else-if="column.key === 'stock'">
        <span
          v-if="item.es_servicio"
          class="text-xs text-gray-400 italic"
        >N/A</span>
        <span
          v-else
          :class="[
            'inline-block px-2 py-0.5 rounded text-xs font-medium',
            value === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : value < 5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
          ]"
        >
          {{ value }}
        </span>
      </template>

      <!-- tipo: producto / servicio -->
      <template v-else-if="column.key === 'servicio'">
        <span :class="item.es_servicio ? 'text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-200'">
          {{ value }}
        </span>
      </template>

      <!-- fallback -->
      <template v-else>
        {{ value ?? '--' }}
      </template>
    </template>

    <!-- acciones con dropdown -->
    <template #actions="{ item }">
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
                min-w-[180px] p-1.5 rounded-md bg-white dark:bg-gray-800 shadow-lg"
          :style="dropdownStyle"
        >
          <li>
            <button
              @click="openEditModal(item); cerrarDropdown()"
              class="py-2 w-full text-left hover:bg-blue-50 dark:hover:bg-gray-700
                    rounded-md duration-300 px-3 flex items-center gap-2 text-blue-600 dark:text-blue-400"
            >
              <i class="fa-solid fa-pen-to-square text-xs"></i>
              Editar
            </button>
          </li>
          <li v-if="!item.es_servicio">
            <button
              @click="abrirActualizarStock(item); cerrarDropdown()"
              class="py-2 w-full text-left hover:bg-green-50 dark:hover:bg-gray-700
                    rounded-md duration-300 px-3 flex items-center gap-2 text-green-600 dark:text-green-400"
            >
              <i class="fa-solid fa-arrow-up-arrow-down text-xs"></i>
              Actualizar stock
            </button>
          </li>
          <li>
            <button
              @click="verCronologia(item); cerrarDropdown()"
              class="py-2 w-full text-left hover:bg-purple-50 dark:hover:bg-gray-700
                    rounded-md duration-300 px-3 flex items-center gap-2 text-purple-600 dark:text-purple-400"
            >
              <i class="fa-solid fa-chart-line text-xs"></i>
              Ver cronologia
            </button>
          </li>
          <li>
            <button
              @click="handleDelete(Number(item.id)); cerrarDropdown()"
              class="py-2 w-full text-left hover:bg-red-50 dark:hover:bg-gray-700
                    rounded-md duration-300 px-3 flex items-center gap-2 text-red-600 dark:text-red-400"
            >
              <i class="fa-solid fa-trash text-xs"></i>
              Eliminar
            </button>
          </li>
        </ul>
      </div>
    </template>
  </DataTable>

  <!-- modales -->
  <ProductModal
    :show="showProductModal"
    :product="editingProduct"
    @close="closeProductModal"
    @saved="onProductSaved"
  />

  <ProductsImportModal
    :show="showImportModal"
    @close="showImportModal = false"
    @imported="onImported"
  />

  <StockUpdateModal
    :show="showStockModal"
    :producto="productoStock"
    @close="cerrarStockModal"
    @saved="onStockActualizado"
  />
</template>