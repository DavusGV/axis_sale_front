<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Cart from '@/components/ventas/Cart.vue'
import ResumenVenta from '@/components/ventas/ResumenVenta.vue'
import ModalPago from '@/components/ventas/ModalPago.vue'
import { buscarPorCodigoBarras, registrarVenta, fetchProducts } from '@/api/ventas'
import Swal from 'sweetalert2'

// VARIABLES EXISTENTES
const productos = ref([])
const search = ref('')
const carrito = ref([])
const page = ref(1)
const lastPage = ref(1)
const total = computed(() => carrito.value.reduce((acc, item) => acc + item.precio * item.cantidad, 0))
const showModalPago = ref(false)
const defaultImg = '/images/home/vuejs.png'
const loading = ref(false)

//NUEVAS VARIABLES PARA SCANNER
let codigoBuffer = ''
let timeoutScanner: ReturnType<typeof setTimeout> | null = null
const TIEMPO_ESPERA_SCANNER = 100

//filtrado desde el backend
const filteredProductos = computed(() => productos.value)

// recargamos productos cuando cambia la busqueda
watch(search, () => {
  page.value = 1
  loadProducts()
})
onMounted(async () => {
  await loadProducts()
  iniciarEscuchaScanner() // Activar scanner automático
})

onUnmounted(() => {
  detenerEscuchaScanner()
})

//FUNCIONES DEL SCANNER 
function iniciarEscuchaScanner() {
  document.addEventListener('keydown', manejarTeclaScanner)
}

function detenerEscuchaScanner() {
  document.removeEventListener('keydown', manejarTeclaScanner)
  if (timeoutScanner) clearTimeout(timeoutScanner)
}

function manejarTeclaScanner(event: KeyboardEvent) {
  // Ignorar si el usuario está escribiendo en el input de búsqueda
  if (event.target instanceof HTMLInputElement || 
      event.target instanceof HTMLTextAreaElement) {
    return
  }

  // Solo procesar teclas numéricas y Enter
  if ((event.key >= '0' && event.key <= '9') || event.key === 'Enter') {
    
    if (event.key === 'Enter') {
      procesarCodigoEscaneado()
      event.preventDefault()
    } else {
      codigoBuffer += event.key
      
      if (timeoutScanner) clearTimeout(timeoutScanner)
      
      timeoutScanner = setTimeout(() => {
        if (codigoBuffer.length >= 3) { // Mínimo 3 dígitos
          procesarCodigoEscaneado()
        } else {
          codigoBuffer = ''
        }
      }, TIEMPO_ESPERA_SCANNER)
    }
  }
}

async function procesarCodigoEscaneado() {
  if (!codigoBuffer) return
  
  const codigo = codigoBuffer
  codigoBuffer = '' // Limpiar buffer

  try {
    // buscamos el producto por codigo de barra
    const resultado = await buscarPorCodigoBarras(codigo)
    
    if (resultado.success && resultado.producto) {
      agregarAlCarrito(resultado.producto)
      
      Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        text: resultado.producto.nombre,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000
      })
    } else {
      
      Swal.fire({
        icon: 'error',
        title: 'Producto no encontrado',
        text: resultado.message || 'Código no válido',
        showConfirmButton: false,
        timer: 2000

        
      })
    }
  } catch (error: any) {
    const mensaje = error.response?.data?.message || "Error desconocido"
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      toast: true,
      showConfirmButton: false,
      timer: 2000
    })
  }
}

function agregarAlCarrito(producto: any) {
  const idx = carrito.value.findIndex(item => item.producto_id === producto.id)
  const cantidadActual = idx !== -1 ? carrito.value[idx].cantidad : 0

  // validamos el stock si hay productos disponibles 
  if (cantidadActual + 1 > producto.stock) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock insuficiente',
      text: `Solo quedan ${producto.stock} unidades de: ${producto.nombre}`,
      confirmButtonColor: '#f87171'
    })
    return
  }

  if (idx !== -1) {
    carrito.value[idx].cantidad++
  } else {
    carrito.value.push({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio_venta,
      precio_compra: producto.precio_compra,
      cantidad: 1,
      stock: producto.stock, // opcional pero útil en frontend
      imagen: producto.imagen_url || defaultImg
    })
  }
}


const loadProducts = async () => {
  loading.value = true
  const res = await fetchProducts({ page: page.value, search: search.value})
  productos.value = res.data
  lastPage.value = res.last_page
  page.value = res.current_page
  loading.value = false
}

function sumarCantidad(id: number) {
  const item = carrito.value.find(i => i.producto_id === id)
  if (!item) return

  if (item.cantidad + 1 > item.stock) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock insuficiente',
      text: `Solo quedan ${item.stock} unidades de: ${item.nombre}`,
      confirmButtonColor: '#ef4444'
    })
    return
  }

  item.cantidad++
}

function restarCantidad(id: number) {
  const item = carrito.value.find(i => i.producto_id === id)
  if (item && item.cantidad > 1) item.cantidad--
}

function eliminarDelCarrito(id: number) {
  carrito.value = carrito.value.filter(i => i.producto_id !== id)
}

function abrirModalPago() {
  if (!carrito.value.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Carrito vacío',
      text: 'Agrega productos al carrito primero',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
    return
  }
  showModalPago.value = true
}

async function registrarVentaLocal({ pago, metodo_pago }: any) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const usuario_id = user.id
  const cambio = pago - total.value
  
  const detalles = carrito.value.map(item => ({
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio: item.precio,
    precio_compra: item.precio_compra
  }))

  const ventaData = {
    usuario_id,
    total: total.value,
    pago,
    cambio,
    metodo_pago,
    detalles
  }

  try {
    Swal.fire({
      title: 'Guardando venta...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    //registramos la venta realizada de los productos
    const resultado = await registrarVenta(ventaData)
    
    carrito.value = []
    showModalPago.value = false
    await loadProducts()
    Swal.close()

    Swal.fire({
      icon: 'success',
      title: '¡Venta realizada!',
      text: resultado.message || 'La venta se registró correctamente.',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#22c55e'
    })
    
  } catch (e: any) {
    Swal.close()
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.message || 'No se pudo registrar la venta.'
    })
  }
}
</script>

<template>
  <TopBanner title="Ventas">
    <!-- Indicador de scanner activo -->
    <template #right>
      <div class="flex items-center gap-2 text-sm text-green-600">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Scanner activo</span>
      </div>
    </template>
  </TopBanner>
  
  <div class="ventas-container flex flex-col md:flex-row gap-6">
    <div class="w-full md:w-2/3">
      <div class="relative mb-4">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2"></line>
          </svg>
        </span>
        <input
          v-model="search"
          class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
          placeholder="Buscar producto..."
          type="text"
          autocomplete="off"
        />
      </div>
      
      <!-- Grid de productos-->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center items-center">
        <div
          v-for="producto in filteredProductos"
          :key="producto.id"
          class="producto-card bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col p-3 h-56"
        >
          <img :src="producto.imagen_url || defaultImg" class="w-16 h-16 rounded mb-2 object-cover mx-auto block" />
          <span
            class="font-semibold truncate"
            :title="producto.descripcion"
            style="display:block; max-width: 100%;"
          >
            {{ producto.nombre }}
          </span>
          <span class="text-xs text-gray-400">{{ producto.codigo ?? 'Sin código' }}</span>
          <span class="font-bold mt-1">${{ Number(producto.precio_venta).toFixed(2) }}</span>
          <button
            class="btn justify-center"
            @click="agregarAlCarrito(producto)"
          >
            Agregar
          </button>
        </div>
      </div>
      <!-- paginacion -->
      <div class="flex justify-center items-center gap-3 mt-6 select-none">
        <!-- Botón Anterior -->
        <button
          @click="page--; loadProducts()"
          :disabled="page <= 1"
          class="btn"
        >
          <IconChevronLeft />
        </button>

        <!-- numero de paginas -->
        <div class="flex gap-2">
          <button
            v-for="num in lastPage"
            :key="num"
            @click="page = num; loadProducts()"
            :class="['btn', page === num
                ? 'border-green-600 text-white shadow-lg scale-110'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md'
            ]"
          >
            {{ num }}
          </button>
        </div>

        <!-- Boton Siguiente -->
        <button
          @click="page++; loadProducts()"
          :disabled="page >= lastPage"
          class="btn"
        >
          <IconChevronRight />
        </button>
      </div>
    </div>
    
    <!-- Carrito y Resumen -->
    <div class="w-full md:w-1/3">
      <Cart
        :items="carrito"
        :img="defaultImg"
        @sumar="sumarCantidad"
        @restar="restarCantidad"
        @eliminar="eliminarDelCarrito"
      />
      <ResumenVenta
        :total="total"
        @pagar="abrirModalPago"
      />
    </div>
    
    <!-- Modal de Pago -->
    <ModalPago
      v-if="showModalPago"
      :total="total"
      @close="showModalPago = false"
      @confirmar="registrarVentaLocal"
    />
  </div>
</template>