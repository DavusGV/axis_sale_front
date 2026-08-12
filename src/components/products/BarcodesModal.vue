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
const incluirPrecio = ref(false)

// cantidad personalizada: general (un solo input para todos) o individual (por producto)
const usarCantidadGeneral = ref(true)
const cantidadGeneral = ref<number | null>(null)
const cantidadesIndividuales = ref<Record<number, number>>({})

// busqueda de productos especificos (multiples)
const busqueda = ref('')
const resultados = ref<any[]>([])
const buscando = ref(false)
const productosSeleccionados = ref<any[]>([])

// preview
const preview = ref<BarcodePreviewResponse | null>(null)
const cargandoPreview = ref(false)
const generando = ref(false)

// arma los params actuales para el backend
const params = computed<BarcodeParams>(() => {
  const base: BarcodeParams = {
    modo: modo.value,
    producto_ids: modo.value === 'especifico'
      ? productosSeleccionados.value.map(p => p.id)
      : null,
    tipo_cantidad: tipoCantidad.value,
    incluir_precio: incluirPrecio.value,
  }

  if (tipoCantidad.value === 'personalizada') {
    base.usar_cantidad_general = usarCantidadGeneral.value
    if (usarCantidadGeneral.value) {
      base.cantidad = Number(cantidadGeneral.value)
    } else {
      base.cantidades = { ...cantidadesIndividuales.value }
    }
  }

  return base
})

// valida si ya se puede pedir preview o generar
const listoParaGenerar = computed(() => {
  if (modo.value === 'especifico' && productosSeleccionados.value.length === 0) return false

  if (tipoCantidad.value === 'personalizada') {
    if (usarCantidadGeneral.value) {
      if (!cantidadGeneral.value || cantidadGeneral.value < 1) return false
    } else {
      const faltaAlguna = productosSeleccionados.value.some(
        p => !cantidadesIndividuales.value[p.id] || cantidadesIndividuales.value[p.id] < 1
      )
      if (faltaAlguna) return false
    }
  }

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
watch(
  [modo, tipoCantidad, incluirPrecio, usarCantidadGeneral, cantidadGeneral],
  programarPreview
)
// la lista y el mapa de cantidades individuales se observan aparte con deep
watch(productosSeleccionados, programarPreview, { deep: true })
watch(cantidadesIndividuales, programarPreview, { deep: true })

// al activar la cantidad general se deja el input en blanco para que el
// usuario la escriba a proposito, evitando que se mande 0 por accidente
// si activo el toggle sin querer. las cantidades individuales no se pierden,
// quedan guardadas por si vuelve a desactivarlo.
watch(usarCantidadGeneral, (activo) => {
  if (activo) {
    cantidadGeneral.value = null
  }
})

// buscador de productos reutilizando fetchProducts con search
let busquedaTimer: any = null
watch(busqueda, () => {
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
    const idsSeleccionados = productosSeleccionados.value.map(p => p.id)
    // no debe poder seleccionarse un producto que ya esta en la lista
    resultados.value = (res.data ?? []).filter((p: any) => !idsSeleccionados.includes(p.id))
  } catch {
    resultados.value = []
  } finally {
    buscando.value = false
  }
}

function agregarProducto(p: any) {
  const yaExiste = productosSeleccionados.value.some(sel => sel.id === p.id)
  if (yaExiste) return
  productosSeleccionados.value.push(p)
  // cantidad individual arranca en 1 por defecto
  cantidadesIndividuales.value[p.id] = 1
  busqueda.value = ''
  resultados.value = []
}

function quitarProducto(id: number) {
  productosSeleccionados.value = productosSeleccionados.value.filter(p => p.id !== id)
  delete cantidadesIndividuales.value[id]
}

// cantidad a mostrar en la tabla cuando no es editable (unica, stock o general)
function cantidadEstimada(p: any): number | string {
  if (tipoCantidad.value === 'unica') return 1
  if (tipoCantidad.value === 'personalizada') return cantidadGeneral.value ?? ''
  // stock
  return p.es_servicio ? 'N/A' : (p.stock ?? 0)
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
  incluirPrecio.value = false
  usarCantidadGeneral.value = true
  cantidadGeneral.value = null
  cantidadesIndividuales.value = {}
  busqueda.value = ''
  resultados.value = []
  productosSeleccionados.value = []
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

          <!-- tipo de cantidad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Cantidad de etiquetas</label>
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="radio" value="unica" v-model="tipoCantidad" class="text-primary" />
                Una etiqueta por producto
              </label>

              <div>
                <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input type="radio" value="personalizada" v-model="tipoCantidad" class="text-primary" />
                  Cantidad personalizada
                </label>

                <!-- opciones propias de "cantidad personalizada", indentadas para que se lea como parte de esa opcion -->
                <div
                  v-if="tipoCantidad === 'personalizada'"
                  class="ml-6 mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700 space-y-2"
                >
                  <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    <span class="relative inline-flex items-center shrink-0">
                      <input type="checkbox" v-model="usarCantidadGeneral" class="sr-only peer" />
                      <span class="w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary transition-colors"></span>
                      <span class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                    </span>
                    Usar la misma cantidad para todos los productos
                  </label>

                  <input
                    v-if="usarCantidadGeneral"
                    v-model.number="cantidadGeneral"
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    class="w-32 border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg4 dark:text-gray-100
                           rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="radio" value="stock" v-model="tipoCantidad" class="text-primary" />
                Según stock disponible
              </label>
            </div>
          </div>

          <!-- incluir precio -->
          <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" v-model="incluirPrecio" class="text-primary rounded" />
            Incluir precio en la etiqueta
          </label>

          <!-- buscador especifico -->
          <div v-if="modo === 'especifico'" class="relative">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Buscar productos</label>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Nombre, código o SKU..."
              class="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg4 dark:text-gray-100
                     rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              autocomplete="off"
            />

            <!-- resultados -->
            <ul
              v-if="resultados.length"
              class="absolute z-10 mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg"
            >
              <li
                v-for="p in resultados"
                :key="p.id"
                class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 flex justify-between gap-2"
                @click="agregarProducto(p)"
              >
                <span class="truncate text-gray-700 dark:text-gray-200">{{ p.nombre }}</span>
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ p.codigo }}</span>
              </li>
            </ul>

            <p v-if="buscando" class="text-xs text-gray-400 mt-1">Buscando...</p>

            <!-- tabla de productos seleccionados, con scroll para listas largas -->
            <div v-if="productosSeleccionados.length" class="mt-3 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div class="max-h-56 overflow-y-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-bg4 text-gray-500 dark:text-gray-300 sticky top-0">
                    <tr>
                      <th class="text-left px-3 py-1.5 font-medium">Producto</th>
                      <th class="text-left px-3 py-1.5 font-medium">Código</th>
                      <th class="text-left px-3 py-1.5 font-medium">Cantidad</th>
                      <th class="px-3 py-1.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="p in productosSeleccionados"
                      :key="p.id"
                      class="border-t border-gray-100 dark:border-gray-700"
                    >
                      <td
                        class="px-3 py-1.5 text-gray-700 dark:text-gray-200 truncate max-w-[140px]"
                        :title="p.nombre"
                      >{{ p.nombre }}</td>
                      <td class="px-3 py-1.5 text-gray-500 dark:text-gray-400">{{ p.codigo }}</td>
                      <td class="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                        <input
                          v-if="tipoCantidad === 'personalizada' && !usarCantidadGeneral"
                          v-model.number="cantidadesIndividuales[p.id]"
                          type="number"
                          min="1"
                          class="w-16 border border-gray-300 dark:border-gray-700 bg-white dark:bg-bg4 dark:text-gray-100
                                 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <span v-else>{{ cantidadEstimada(p) }}</span>
                      </td>
                      <td class="px-3 py-1.5 text-right">
                        <button class="text-gray-400 hover:text-red-500" @click="quitarProducto(p.id)">
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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