<script setup lang="ts">
import { ref, onMounted } from 'vue'
const startIndex = ref(0)
const endIndex = ref(0)
const totalPages = ref(1)
import FlexTable from '@/components/flex/FlexTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import { RouterLink } from 'vue-router'
import { fetchProducts } from '@/api/products'
import ProductModal from '@/components/products/ProductsModal.vue'

const showProductModal = ref(false)
const editingProduct = ref(null)
const productos = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'codigo', label: 'Código' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'precio_compra', label: 'Precio Compra' },
  { key: 'precio_venta', label: 'Precio Venta' },
  { key: 'stock', label: 'Stock' },
  { key: 'categoria_id', label: 'Categoría' },
]

const loadProducts = async () => {
  loading.value = true
  const res = await fetchProducts({ page: currentPage.value, pageSize: pageSize.value })
  const pageData = res.data
  productos.value =  res.data;
  //console.log(productos.value);
  total.value = pageData.total
  currentPage.value = pageData.current_page
  pageSize.value = pageData.per_page
  startIndex.value = pageData.from - 1 // Laravel 'from' es 1-based
  endIndex.value = pageData.to - 1
  totalPages.value = pageData.last_page
  loading.value = false
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadProducts()
  }
}
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadProducts()
  }
}
const paginate = (page) => {
  currentPage.value = page
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

function openEditModal(producto) {
  editingProduct.value = { ...producto } // Clonamos el producto para evitar mutaciones reactivas
  showProductModal.value = true
}

function closeProductModal() {
  showProductModal.value = false
}

function onProductSaved() {
  loadProducts()
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
    :page-size="pageSize"
    :columns="columns"
    :loading="loading"
    :start-index="startIndex"
    :end-index="endIndex"
    :total-pages="totalPages"
    :next-page="nextPage"
    :prev-page="prevPage"
    :paginate="paginate"
    :handleEdit="openEditModal"
    :handleDelete="handleDelete"
    @changePage="handlePageChange"
  />
   <ProductModal
    :show="showProductModal"
    :product="editingProduct"
    @close="closeProductModal"
    @saved="onProductSaved"
  />
</template>