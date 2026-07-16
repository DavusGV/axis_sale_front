<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Swal from 'sweetalert2'
import {
  previewBarcodes,
  downloadBarcodesPdf,
  type BarcodeParams,
  type BarcodePreviewResponse,
} from '@/api/barcodes'
import { fetchProducts } from '@/api/products'
import BarcodePreview from './BarcodePreview.vue'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

// estado del formulario
const modo = ref<'todos' | 'especifico'>('todos')
const tipoCantidad = ref<'unica' | 'personalizada' | 'stock'>('unica')
const cantidad = ref<number>(1)
const incluirPrecio = ref(false)

// busqueda de producto especifico
const busqueda = ref('')
const resultados = ref<any[]>([])
const buscando = ref(false)
const productoSeleccionado = ref<any | null>(null)

// preview
const preview = ref<BarcodePreviewResponse | null>(null)
const cargandoPreview = ref(false)
const generando = ref(false)

// arma los params actuales para el backend
const params = computed<BarcodeParams>(() => ({
  modo: modo.value,
  producto_id: modo.value === 'especifico' ? productoSeleccionado.value?.id ?? null : null,
  tipo_cantidad: tipoCantidad.value,
  cantidad: tipoCantidad.value === 'personalizada' ? Number(cantidad.value) : undefined,
  incluir_precio: incluirPrecio.value,
}))

// valida si ya se puede pedir preview o generar
const listoParaGenerar = computed(() => {
  if (modo.value === 'especifico' && !productoSeleccionado.value) return false
  if (tipoCantidad.value === 'personalizada' && (!cantidad.value || cantidad.value < 1)) return false
  return true
})

// debounce para no spamear el endpoint de preview
let debounceTimer: any = null
function programarPreview() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(cargarPreview, 400)
}

async function cargarPreview() {
  if (!listoParaGenerar.value) {
    preview.value = null
    return
  }
  cargandoPreview.value = true
  try {
    preview.value = await previewBarcodes(params.value)
  } catch {
    preview.value = null
  } finally {
    cargandoPreview.value = false
  }
}

// recalcula el preview cuando cambian las opciones
watch([modo, tipoCantidad, cantidad, incluirPrecio, productoSeleccionado], programarPreview)

// buscador de producto especifico reutilizando fetchProducts con search
let busquedaTimer: any = null
watch(busqueda, () => {
  // si ya hay uno seleccionado y el texto coincide, no re-buscamos
  if (productoSeleccionado.value && busqueda.value === productoSeleccionado.value.nombre) return
  clearTimeout(busquedaTimer)
  busquedaTimer = setTimeout(buscarProductos, 350)
})

async function buscarProductos() {
  const termino = busqueda.value.trim()
  if (termino.length < 2) {
    resultados.value = []
    return
  }
  buscando.value = true
  try {
    const res = await fetchProducts({ search: termino, per_page: 8 })
    resultados.value = res.data ?? []
  } catch {
    resultados.value = []
  } finally {
    buscando.value = false
  }
}

function seleccionarProducto(p: any) {
  productoSeleccionado.value = p
  busqueda.value = p.nombre
  resultados.value = []
}

function limpiarSeleccion() {
  productoSeleccionado.value = null
  busqueda.value = ''
  resultados.value = []
}

async function generar() {
  if (!listoParaGenerar.value) return
  generando.value = true
  try {
    await downloadBarcodesPdf(params.value)
    emit('close')
  } catch {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo generar el PDF de códigos de barras.',
      icon: 'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
  } finally {
    generando.value = false
  }
}

function cerrar() {
  emit('close')
}

// reset al abrir el modal
watch(() => props.show, (val) => {
  if (!val) return
  modo.value = 'todos'
  tipoCantidad.value = 'unica'
  cantidad.value = 1
  incluirPrecio.value = false
  limpiarSeleccion()
  cargarPreview()
})
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
    <div class="bg-white dark:bg-bg3 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

      <!-- header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Generar códigos de barras
        </h3>
        <button class="text-gray-400 hover:text-gray-600" @click="cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- body -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">

        <!-- columna opciones -->
        <div class="space-y-4">

          <!-- modo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Modo</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                class="border rounded-lg py-2 text-sm transition"
                :class="modo === 'todos'
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'"
                @click="modo = 'todos'"
              >
                Todos los productos
              </button>
              <button
                class="border rounded-lg py-2 text-sm transition"
                :class="modo === 'especifico'
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'"
                @click="modo = 'especifico'"
              >
                Producto específico
              </button>
            </div>
          </div>

          <!-- buscador especifico -->
          <div v-if="modo === 'especifico'" class="relative">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Buscar producto</label>
            <div class="relative">
              <input
                v-model="busqueda"
                type="text"
                placeholder="Nombre, código o SKU..."
                class="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg4 dark:text-gray-100
                       rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                autocomplete="off"
              />
              <button
                v-if="productoSeleccionado"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="limpiarSeleccion"
              >
                <i class="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            <!-- resultados -->
            <ul
              v-if="resultados.length && !productoSeleccionado"
              class="absolute z-10 mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg"
            >
              <li
                v-for="p in resultados"
                :key="p.id"
                class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 flex justify-between gap-2"
                @click="seleccionarProducto(p)"
              >
                <span class="truncate text-gray-700 dark:text-gray-200">{{ p.nombre }}</span>
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ p.codigo }}</span>
              </li>
            </ul>

            <p v-if="buscando" class="text-xs text-gray-400 mt-1">Buscando...</p>

            <div
              v-if="productoSeleccionado"
              class="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-bg4 rounded-lg px-3 py-2"
            >
              Stock disponible:
              <strong>{{ productoSeleccionado.es_servicio ? 'N/A' : productoSeleccionado.stock }}</strong>
            </div>
          </div>

          <!-- tipo de cantidad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Cantidad de etiquetas</label>
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="radio" value="unica" v-model="tipoCantidad" class="text-primary" />
                Una etiqueta por producto
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="radio" value="personalizada" v-model="tipoCantidad" class="text-primary" />
                Cantidad personalizada
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="radio" value="stock" v-model="tipoCantidad" class="text-primary" />
                Según stock disponible
              </label>
            </div>

            <input
              v-if="tipoCantidad === 'personalizada'"
              v-model.number="cantidad"
              type="number"
              min="1"
              class="mt-2 w-32 border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg4 dark:text-gray-100
                     rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <!-- incluir precio -->
          <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" v-model="incluirPrecio" class="text-primary rounded" />
            Incluir precio en la etiqueta
          </label>
        </div>

        <!-- columna preview -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Vista previa</label>
          <BarcodePreview :preview="preview" :loading="cargandoPreview" />
        </div>
      </div>

      <!-- footer -->
      <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
        <button class="btn-outline" @click="cerrar">Cancelar</button>
        <button
          class="btn disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!listoParaGenerar || generando || (preview?.total_etiquetas ?? 0) === 0"
          @click="generar"
        >
          <i v-if="!generando" class="far fa-file-pdf"></i>
          <i v-else class="fa-solid fa-spinner fa-spin"></i>
          {{ generando ? 'Generando...' : 'Generar PDF' }}
        </button>
      </div>
    </div>
  </div>
</template>