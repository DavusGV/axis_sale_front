<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
    <div class="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-6 w-[95vw] max-w-3xl">

      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Importar productos</h2>
        <button class="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300" @click="cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- PASO 1: Descarga del template -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 class="font-semibold mb-1">1. Descarga la plantilla</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              La plantilla incluye las categorias y unidades de medida de tu establecimiento como listas desplegables.
            </p>
          </div>
          <button
            type="button"
            class="btn-outline whitespace-nowrap"
            @click="descargarPlantilla"
            :disabled="descargando"
          >
            <i class="fa-solid fa-download mr-2"></i>
            {{ descargando ? 'Generando...' : 'Descargar plantilla' }}
          </button>
        </div>
      </div>

      <!-- PASO 2: Subida del archivo -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <h3 class="font-semibold mb-2">2. Sube el archivo lleno</h3>

        <div
          class="border-2 border-dashed border-primary rounded flex flex-col items-center justify-center p-6 transition cursor-pointer bg-gray-50 dark:bg-gray-800"
          :class="{ 'bg-blue-50 dark:bg-gray-700': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
          @click="abrirSelector"
        >
          <template v-if="!archivoSeleccionado">
            <i class="fa-solid fa-file-excel text-primary text-3xl mb-2"></i>
            <h6 class="mb-1 dark:text-gray-200">Arrastra el archivo .xlsx aqui</h6>
            <p class="text-sm text-gray-500 dark:text-gray-400">o haz clic para seleccionar</p>
          </template>

          <template v-else>
            <i class="fa-solid fa-file-circle-check text-green-500 text-3xl mb-2"></i>
            <p class="text-sm font-medium">{{ archivoSeleccionado.name }}</p>
            <p class="text-xs text-gray-500">{{ formatearTamano(archivoSeleccionado.size) }}</p>
          </template>

          <input
            ref="inputArchivo"
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="onFileChange"
          />
        </div>

        <div class="flex justify-end mt-3 gap-2">
          <button
            v-if="archivoSeleccionado"
            type="button"
            class="btn-outline"
            @click="resetArchivo"
          >
            Cambiar archivo
          </button>
          <button
            type="button"
            class="btn"
            :disabled="!archivoSeleccionado || procesando"
            @click="procesarPreview"
          >
            <i class="fa-solid fa-magnifying-glass mr-2"></i>
            {{ procesando ? 'Validando...' : 'Validar archivo' }}
          </button>
        </div>
      </div>

      <!-- PASO 3: Preview con resumen -->
      <div v-if="preview" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <h3 class="font-semibold mb-3">3. Resumen de validacion</h3>

        <!-- Cards de resumen -->
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="bg-gray-100 dark:bg-gray-800 rounded p-3 text-center">
            <p class="text-xs text-gray-500">Total filas</p>
            <p class="text-2xl font-bold">{{ preview.total_filas }}</p>
          </div>
          <div class="bg-green-50 dark:bg-green-900/30 rounded p-3 text-center">
            <p class="text-xs text-green-700 dark:text-green-300">Validas</p>
            <p class="text-2xl font-bold text-green-700 dark:text-green-400">{{ preview.validas }}</p>
          </div>
          <div class="bg-red-50 dark:bg-red-900/30 rounded p-3 text-center">
            <p class="text-xs text-red-700 dark:text-red-300">Con errores</p>
            <p class="text-2xl font-bold text-red-700 dark:text-red-400">{{ preview.con_errores }}</p>
          </div>
        </div>

        <!-- Aviso cuando hay filas fallidas pero hay validas -->
        <div
          v-if="preview.con_errores > 0 && preview.validas > 0"
          class="bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded p-3 mb-3 text-sm text-amber-800 dark:text-amber-200"
        >
          <i class="fa-solid fa-triangle-exclamation mr-2"></i>
          Si continuas con la importacion, las {{ preview.validas }} filas validas se guardaran y las {{ preview.con_errores }} filas con errores se descargaran en un archivo aparte para que las corrijas y vuelvas a subirlas.
        </div>

        <!-- Aviso cuando todas las filas tienen error -->
        <div
          v-if="preview.con_errores > 0 && preview.validas === 0"
          class="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded p-3 mb-3 text-sm text-red-800 dark:text-red-200"
        >
          <i class="fa-solid fa-circle-xmark mr-2"></i>
          Ninguna fila del archivo es valida. Revisa los errores y corrige el archivo antes de volver a subirlo.
        </div>

        <!-- Aviso cuando archivo esta vacio -->
        <div
          v-if="preview.total_filas === 0"
          class="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-3 mb-3 text-sm"
        >
          <i class="fa-solid fa-circle-info mr-2"></i>
          {{ preview.mensaje || 'El archivo no contiene filas para procesar.' }}
        </div>

        <!-- Tabla de errores por fila -->
        <div v-if="preview.errores && preview.errores.length > 0" class="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 dark:bg-gray-800 sticky top-0">
              <tr>
                <th class="text-left px-3 py-2 w-20">Fila</th>
                <th class="text-left px-3 py-2">Errores</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="err in preview.errores"
                :key="err.fila"
                class="border-t border-gray-200 dark:border-gray-700"
              >
                <td class="px-3 py-2 align-top font-medium">{{ err.fila }}</td>
                <td class="px-3 py-2">
                  <ul class="list-disc list-inside space-y-1">
                    <li v-for="(msg, idx) in err.errores" :key="idx" class="text-red-600 dark:text-red-400">
                      {{ msg }}
                    </li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mt-4 gap-2">
          <button type="button" class="btn-outline" @click="resetTodo">
            Cargar otro archivo
          </button>
          <button
            type="button"
            class="btn"
            :disabled="!puedeConfirmar || ejecutando"
            @click="confirmarImportacion"
          >
            <i class="fa-solid fa-cloud-arrow-up mr-2"></i>
            {{ ejecutando ? 'Importando...' : `Importar ${preview.validas} producto(s)` }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import {
  downloadProductsTemplate,
  previewProductsImport,
  executeProductsImport,
  type ImportPreviewResponse
} from '@/api/products'

const props = defineProps<{ show: boolean }>()
const emits = defineEmits(['close', 'imported'])

// estado
const inputArchivo = ref<HTMLInputElement | null>(null)
const archivoSeleccionado = ref<File | null>(null)
const isDragging = ref(false)
const descargando = ref(false)
const procesando = ref(false)
const ejecutando = ref(false)
const preview = ref<ImportPreviewResponse | null>(null)

const puedeConfirmar = computed(() => {
  return preview.value !== null
    && preview.value.token !== null
    && preview.value.validas > 0
})

function cerrar() {
  resetTodo()
  emits('close')
}

function resetTodo() {
  archivoSeleccionado.value = null
  preview.value = null
  if (inputArchivo.value) {
    inputArchivo.value.value = ''
  }
}

function resetArchivo() {
  archivoSeleccionado.value = null
  preview.value = null
  if (inputArchivo.value) {
    inputArchivo.value.value = ''
  }
}

function abrirSelector() {
  inputArchivo.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    archivoSeleccionado.value = file
    preview.value = null
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) {
    archivoSeleccionado.value = file
    preview.value = null
  }
}

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function descargarPlantilla() {
  descargando.value = true
  try {
    await downloadProductsTemplate()
  } catch (e) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo descargar la plantilla.',
      icon: 'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6'
    })
  } finally {
    descargando.value = false
  }
}

async function procesarPreview() {
  if (!archivoSeleccionado.value) return
  procesando.value = true
  try {
    preview.value = await previewProductsImport(archivoSeleccionado.value)
  } catch (e: any) {
    const msg = e?.response?.data?.message
      || e?.response?.data?.error
      || 'No se pudo procesar el archivo.'
    Swal.fire({
      title: 'Error',
      text: msg,
      icon: 'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6'
    })
  } finally {
    procesando.value = false
  }
}

async function confirmarImportacion() {
  if (!preview.value || !preview.value.token) return

  // si hay errores avisamos antes de continuar
  if (preview.value.con_errores > 0) {
    const result = await Swal.fire({
      title: 'Confirmar importacion',
      html: `Se importaran <b>${preview.value.validas}</b> productos validos.<br><b>${preview.value.con_errores}</b> filas se descargaran en un archivo aparte para que las corrijas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Si, importar',
      cancelButtonText: 'Cancelar',
      color: '#1f2937'
    })
    if (!result.isConfirmed) return
  }

  ejecutando.value = true
  try {
    const resultado = await executeProductsImport(preview.value.token)

    let mensaje = `Se importaron ${resultado.insertados} productos correctamente.`
    if (resultado.archivoDescargado) {
      mensaje += ` Se descargo un archivo con ${resultado.total_fallidas} filas que fallaron para que las corrijas.`
    }

    Swal.fire({
      title: 'Importacion completada',
      text: mensaje,
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6'
    })

    emits('imported')
    cerrar()
  } catch (e: any) {
    const msg = e?.response?.data?.message
      || e?.response?.data?.error
      || 'No se pudo completar la importacion.'
    Swal.fire({
      title: 'Error',
      text: msg,
      icon: 'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6'
    })
  } finally {
    ejecutando.value = false
  }
}
</script>