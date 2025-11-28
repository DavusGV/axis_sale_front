<script setup lang="ts">
import TopBanner from '@/components/shared/TopBanner.vue'
import { ref, computed, onMounted } from 'vue'
import Cart from '@/components/ventas/Cart.vue'
import ResumenVenta from '@/components/ventas/ResumenVenta.vue'
import ModalPago from '@/components/ventas/ModalPago.vue'
import axiosInstance from '@/utils/axios'
import { fetchProducts } from '@/api/products'
import Swal from 'sweetalert2'



const productos = ref([])
const search = ref('')
const carrito = ref([]) // { producto_id, nombre, precio, cantidad, imagen }
const total = computed(() => carrito.value.reduce((acc, item) => acc + item.precio * item.cantidad, 0))
const showModalPago = ref(false)
const defaultImg = '/images/home/vuejs.png'
const loading = ref(false)

const filteredProductos = computed(() =>

  productos.value.filter(p =>
  (p.nombre || '').toLowerCase().includes(search.value.toLowerCase()) ||
  (p.codigo || '').toLowerCase().includes(search.value.toLowerCase())
  )
)

onMounted(async () => {
  // Reemplaza con tu endpoint real
  await loadProducts()
 
})

const loadProducts = async () => {
  loading.value = true
  const res = await fetchProducts()
  productos.value =  res.data;
  //console.log(productos.value)
}

function agregarAlCarrito(producto) {
  const idx = carrito.value.findIndex(item => item.producto_id === producto.id)
  if (idx !== -1) {
    carrito.value[idx].cantidad++
  } else {
    carrito.value.push({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio_venta,
      precio_compra: producto.precio_compra,
      cantidad: 1,
      imagen: producto.imagen_url
    })
  }
}
function sumarCantidad(id) {
  const item = carrito.value.find(i => i.producto_id === id)
  if (item) item.cantidad++
}
function restarCantidad(id) {
  const item = carrito.value.find(i => i.producto_id === id)
  if (item && item.cantidad > 1) item.cantidad--
}
function eliminarDelCarrito(id) {
  carrito.value = carrito.value.filter(i => i.producto_id !== id)
}
function abrirModalPago() {
  if (!carrito.value.length) return
  showModalPago.value = true
}



async function registrarVenta({ pago, metodo_pago }) {

  // Obtén usuario en sesión
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const usuario_id = user.id
  // Calcula el cambio
  const cambio = pago - total.value
  // Prepara detalles
  const detalles = carrito.value.map(item => ({
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio: item.precio,
    precio_compra: item.precio_compra
  }))

  try {

      Swal.fire({
      title: 'Guardando venta...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    await axiosInstance.post('/ventas/store', {
      usuario_id,
      total: total.value,
      pago,
      cambio,
      metodo_pago,
      detalles
    })
    carrito.value = []
    showModalPago.value = false
    Swal.close();

    // Muestra SweetAlert2 de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Venta realizada!',
      text: 'La venta se registró correctamente.',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#22c55e'
    })
  } catch (e) {
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.response?.data?.message || 'No se pudo registrar la venta.'
    })
  }
}

</script>

<template>
  
  <TopBanner title="Ventas">
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
            class="btn mt-2 w-full py-1 text-sm font-semibold rounded bg-green-500 hover:bg-green-600 text-white transition dark:bg-green-600 dark:hover:bg-green-700"
            @click="agregarAlCarrito(producto)"
            >
                Agregar
            </button>
        </div>
      </div>
    </div>
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
    <ModalPago
      v-if="showModalPago"
      :total="total"
      @close="showModalPago = false"
      @confirmar="registrarVenta"
    />
  </div>
</template>
