<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import FlexTable from '@/components/flex/FlexTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import { fetchProducts, type ProductFilters, DestroyProduct } from '@/api/products'
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


const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'codigo', label: 'Código' },
  //{ key: 'clave', label: 'Clave' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'precio_compra', label: 'Precio Compra' },
  { key: 'precio_venta', label: 'Precio Venta' },
  { key: 'stock', label: 'Stock' },
  { key: 'categoria_id', label: 'Categoría' },
]

const params = ref({
  page: 1,
  search: "",
  categoria_id: ""
})

const pagination = ref({
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1
})

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
  showProductModal.value = true
}

function closeProductModal() {
  showProductModal.value = false
}

function onProductSaved() {
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

    } catch (error) {
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


onMounted(loadProducts)
</script>

<template>
  <TopBanner title="Productos">
    <div class="flex justify-end gap-4 lg:gap-6">
      <button class="btn" @click="openProductModal">Agregar</button>
    </div>
  </TopBanner>

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
