<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
    <div class="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-6 w-[95vw] max-w-3xl">

      <h2 class="text-xl font-bold mb-4">
        {{ props.product && props.product.id ? 'Editar Producto' : 'Agregar Producto' }}
      </h2>

      <form @submit.prevent="submit">

        <!-- === DRAG & DROP === -->
        <div class="drag-area border-2 border-primary rounded flex flex-col items-center justify-center p-4 mb-5 transition cursor-pointer bg-gray-100 dark:bg-gray-800"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': isDragging }"
          @click="openFileDialog"
        >

          <!-- previw adentro -->
          <template v-if="previewImage">
            <img 
              :src="previewImage" 
              class="rounded border mb-2"
              style="width: 130px; height:130px; object-fit: cover;"
            />
            <p class="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Haz clic o arrastra para cambiar la imagen
            </p>
          </template>

          <template v-else>
            <i class="fa-solid fa-cloud-arrow-up text-primary text-3xl mb-2"></i>
            <h6 class="mb-1 dark:text-gray-200">Arrastra imagen aquí</h6>
            <p class="text-muted text-sm dark:text-gray-400">o haz clic para seleccionar</p>
          </template>

          <input 
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- CATEGORÍA -->
          <div>
            <label class="block text-sm mb-1">Categoría</label>
            <select v-model="form.categoria_id" required class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
              <option value="">Selecciona una categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.nombre }}
              </option>
            </select>
          </div>

          <!-- NOMBRE -->
          <div>
            <label class="block text-sm mb-1">Nombre</label>
            <input v-model="form.nombre" required class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" />
          </div>

          <!-- CLAVE -->
          <div>
            <label class="block text-sm mb-1">Clave</label>
            <input v-model="form.clave" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" type="text" required />
          </div>

          <!-- CÓDIGO -->
          <div>
            <label class="block text-sm mb-1">Código</label>
            <input v-model="form.codigo" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required/>
          </div>

          <!-- PRECIO COMPRA -->
          <div>
            <label class="block text-sm mb-1">Precio Compra</label>
            <input v-model.number="form.precio_compra" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />
          </div>

          <!-- PRECIO VENTA -->
          <div>
            <label class="block text-sm mb-1">Precio Venta</label>
            <input v-model.number="form.precio_venta" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />
          </div>

          <!-- STOCK -->
          <div>
            <label class="block text-sm mb-1">Stock</label>
            <input v-model.number="form.stock" type="number" min="0" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required/>
          </div>

        </div>

        <!-- DESCRIPCIÓN -->
        <div class="mt-4">
          <label class="block text-sm mb-1">Descripción</label>
          <textarea v-model="form.descripcion" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"></textarea>
        </div>

        <!-- BOTONES -->
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" class="btn-outline" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn">Guardar</button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
import { fetchCategories, createProduct, updateProduct } from '@/api/products'

const props = defineProps({
  show: Boolean,
  product: Object
})

const emits = defineEmits(['close', 'saved'])

const form = ref<any>({
  clave: '',
  nombre: '',
  codigo: '',
  descripcion: '',
  precio_compra: 0,
  precio_venta: 0,
  stock: 0,
  categoria_id: '',
  imagen: null
})

const previewImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const categories = ref([])

watch(() => props.show, async (val) => {
  if (val) {
    const res = await fetchCategories()
    categories.value = res.data.categories || []

    if (props.product) {
      form.value = { ...props.product}
      //visualizamos la imagen del prodcuto
      previewImage.value = props.product.imagen_url ?? null
    } else {
      resetForm()
    }
  }
})

function resetForm() {
  form.value = {
    clave: '',
    nombre: '',
    codigo: '',
    descripcion: '',
    precio_compra: 0,
    precio_venta: 0,
    stock: 0,
    categoria_id: '',
    imagen: null
  }
  previewImage.value = null
}

function openFileDialog() {
  fileInput.value?.click()
}

function onFileChange(e: any) {
  const file = e.target.files[0]
  if (file) processImage(file)
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) processImage(file)
}

function processImage(file: File) {
  form.value.imagen = file
  previewImage.value = URL.createObjectURL(file)
}

async function submit() {
  try {
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() })

    if (props.product && props.product.id) {
      await updateProduct({ ...form.value, id: props.product.id })
    } else {
      await createProduct(form.value)
    }

    Swal.close()
    Swal.fire({
      title: 'Éxito',
      text: 'Producto guardado correctamente',
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6'
    })

    emits('saved')
    emits('close')

  } catch (e) {
    Swal.close()
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar el producto',
      icon: 'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6'
    })
  }
}
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5em;
}

.drag-over {
  background: #e7f1ff !important;
  border-color: #0d6efd !important;
}

.btn {
  background: #0d6efd;
  color: #fff;
  border-radius: 4px;
  padding: 0.5em 1em;
}

.btn-outline {
  border: 1px solid #0d6efd;
  color: #0d6efd;
  background: transparent;
  border-radius: 4px;
  padding: 0.5em 1em;
}
</style>
