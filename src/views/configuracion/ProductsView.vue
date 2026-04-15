<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import FlexTable from '@/components/flex/FlexTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import { fetchProducts, type ProductFilters, DestroyProduct, fetchCategories, fetchUnidadesMedidasSelect } from '@/api/products'
import { useAuthStore } from '@/stores/authStore'
import ProductModal from '@/components/products/ProductsModal.vue'

// ---------- STATE ----------
const showProductModal = ref(false)
const editingProduct = ref<any | null>(null)
const productos = ref<any[]>([])
const total = ref(0)
const currentPage = ref<number>(1)     //siempre 1
const pageSize = ref<number>(0) // backend mandara la paginacion
const loading = ref(false)
const startIndex = ref(0)
const endIndex = ref(0)
const totalPages = ref(1)
// catalogo y filtro de
const categorias = ref<any[]>([])
const categoriaSeleccionada = ref<string | number>('')
const unidades = ref<any[]>([])
const unidadSeleccionada = ref<string | number>('')

const authStore = useAuthStore()


const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'codigo', label: 'Código' },
  //{ key: 'clave', label: 'Clave' },
  { key: 'servicio', label: 'Tipo' },
  //{ key: 'descripcion', label: 'Descripción' },
  { key: 'precio_compra', label: 'Precio Compra' },
  { key: 'precio_venta', label: 'Precio Venta' },
  //{ key: 'iva', label: 'IVA (%)' },
  { key: 'stock', label: 'Stock' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'unidad_medida', label: 'Unidad de Medida' },
]

const params = ref({
  page: 1,
  search: "",
  categoria_id: "",
  unidad_medida_id: "" 
})

const pagination = ref({
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1
})

// cargamos el catalogo de categorias para el filtro
async function loadCategorias() {
  try {
    const res = await fetchCategories()
    categorias.value = res.categories || res.data?.categories || []
  } catch (e) {
    categorias.value = []
  }
}

async function loadUnidades() {
  try {
    unidades.value = await fetchUnidadesMedidasSelect()
  } catch (e) {
    unidades.value = []
  }
}

// aqui mostramos los datos con filtros y paginacion
async function loadProducts() {
  const res = await fetchProducts(params.value)

  // Guardamos productos
  productos.value = res.data

  // Guardamos la paginación normalizada
  pagination.value = {
    total: res.total,
    per_page: res.per_page,
    current_page: res.current_page,
    last_page: res.last_page
  }

  // Sincronizamos valores del tabla
  currentPage.value = res.current_page
  totalPages.value = res.last_page
  total.value = res.total

  // Índices visibles
  startIndex.value = res.from ?? 0
  endIndex.value = res.to ?? 0
}

//evento de busqueda
function handleSearch(event: any) {
  params.value.search = event.target.value
  currentPage.value = 1
  loadProducts()
}

// cuando cambia la categoria seleccionada recargamos desde la pagina 1
watch(categoriaSeleccionada, (nuevoValor) => {
  params.value.categoria_id = nuevoValor === null ? '' : String(nuevoValor)
  params.value.page = 1
  currentPage.value = 1
  loadProducts()
})

watch(unidadSeleccionada, (nuevoValor) => {
  params.value.unidad_medida_id = nuevoValor === null ? '' : String(nuevoValor)
  params.value.page = 1
  currentPage.value = 1
  loadProducts()
})

// la paginacion 
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    params.value.page = currentPage.value
    loadProducts()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    params.value.page = currentPage.value
    loadProducts()
  }
}

const paginate = (page: number) => {
  currentPage.value = page
  params.value.page = page
  loadProducts()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadProducts()
}


function openProductModal() {
  editingProduct.value = null
  showProductModal.value = true
}

function openEditModal(producto: any) {
  editingProduct.value = { ...producto }
  //console.log(editingProduct.value);
  showProductModal.value = true
}

function closeProductModal() {
  showProductModal.value = false
}

function onProductSaved() {
  loadProducts()
}

function limpiarFiltros() {
  categoriaSeleccionada.value = ''
  unidadSeleccionada.value = ''
  params.value.search = ''
  params.value.categoria_id = ''
  params.value.unidad_medida_id = ''
  params.value.page = 1
  currentPage.value = 1
  loadProducts()
}

async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: '¿Eliminar producto?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await DestroyProduct(id)

      
      Swal.fire({
        title: 'Eliminado',
        text: 'El producto ha sido eliminado.',
        icon: 'success',
        color: '#1f2937',              // White text
        confirmButtonColor: '#3b82f6' // Azul Tailwind
        })

      // recargar lista
      await loadProducts()

    } catch (error: any) {
      Swal.fire({
        title: 'Advertencia',
        text: 'No se pudo eliminar el producto',
        icon: 'warning',
        color: '#1f2937',              // White text
        confirmButtonColor: '#3b82f6' // Azul Tailwind
      })
    }
  }
}

// Escucha el cambio de establecimiento seleccionado y vuelve a solicitar
// los productos correspondientes a ese establecimiento
watch(
  () => authStore.establishmentActive,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    await loadProducts()
  }
)

onMounted(async () => {
  await loadCategorias()
  await loadUnidades() 
  await loadProducts()
})
</script>

<template>
  <TopBanner title="Productos">
    <div class="flex justify-end gap-4 lg:gap-6">
      <button class="btn" @click="openProductModal">
        <i class="far fa-plus"></i>
        Agregar
      </button>
    </div>
  </TopBanner>
  <div class="box mb-4 flex flex-wrap items-center gap-3 py-3 px-5">
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

    <!-- filtro por unidad de medida -->
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

    <!-- boton limpiar todos los filtros -->
    <button
      class="flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium
            bg-primary text-white
            border border-primary
            rounded-lg shadow-sm
            hover:bg-transparent hover:text-primary
            transition whitespace-nowrap ml-auto"
      @click="limpiarFiltros"
    >
      <i class="fa-solid fa-xmark"></i>
      Limpiar filtros
    </button>
  </div>

  <FlexTable
  :items="productos"
  :total="total"
  :current-page="currentPage"
  :columns="columns"
  :loading="loading"
  :start-index="startIndex"
  :end-index="endIndex"
  :total-pages="totalPages"
  :paginate="paginate"
  :next-page="nextPage"
  :prev-page="prevPage"
  :handleEdit="openEditModal"
  :handleDelete="handleDelete"
  :search="handleSearch"
/>



  <ProductModal
    :show="showProductModal"
    :product="editingProduct"
    @close="closeProductModal"
    @saved="onProductSaved"
  />
</template>
