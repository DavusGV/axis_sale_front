<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-6 w-[95vw] max-w-md transition-colors duration-200">
      <h2 class="text-xl font-bold mb-4">
        {{ props.product && props.product.id ? 'Editar Producto' : 'Agregar Producto' }}
      </h2>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="block text-sm mb-1">Categoría</label>
          <select v-model="form.categoria_id" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required>
            <option value="">Selecciona una categoría</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="block text-sm mb-1">Nombre</label>
          <input v-model="form.nombre" type="text" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />
        </div>
        <div class="mb-3">
          <label class="block text-sm mb-1">Código</label>
          <input v-model="form.codigo" type="text" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" />
        </div>
        <div class="mb-3">
          <label class="block text-sm mb-1">Descripción</label>
          <textarea v-model="form.descripcion" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"></textarea>
        </div>
        <div class="mb-3">
          <label class="block text-sm mb-1">Precio Compra</label>
          <input v-model.number="form.precio_compra" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />
        </div>
        <div class="mb-3">
          <label class="block text-sm mb-1">Precio Venta</label>
          <input v-model.number="form.precio_venta" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />
        </div>
        <div class="mb-3">
          <label class="block text-sm mb-1">Stock</label>
          <input v-model.number="form.stock" type="number" min="0" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" class="btn-outline" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { fetchCategories, createProduct, updateProduct } from '@/api/products'
import Swal from 'sweetalert2'

const props = defineProps<{
  show: boolean,
  product?: any 
}>()
const emits = defineEmits(['close', 'saved'])
interface Product {
  id?: number
  nombre: string
  codigo: string
  descripcion: string
  precio_compra: number
  precio_venta: number
  stock: number
  categoria_id: string | number
}
  
const form = ref<Product>({
  nombre: '',
  codigo: '',
  descripcion: '',
  precio_compra: 0,
  precio_venta: 0,
  stock: 0,
  categoria_id: ''
})

const categories = ref([])

const loadCategories = async () => {
  // Ajusta el API si tu endpoint es diferente
  const res = await fetchCategories()
  console.log(res)
  categories.value = res.data.categories || []
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      loadCategories()
      if (!props.product) {
        resetForm()
      }
    }
  }
)

watch(
  () => props.product,
  (newProduct) => {
    if (props.show && newProduct) {
      // Si hay producto, lo clonamos al form
      form.value = { ...newProduct }
    }
  },
  { immediate: true }
)

function resetForm() {
  form.value = {
    nombre: '',
    codigo: '',
    descripcion: '',
    precio_compra: 0,
    precio_venta: 0,
    stock: 0,
    categoria_id: ''
  }
}

async function submit() {
  try {

    Swal.fire({
       title: props.product && props.product.id ? 'Actualizando producto...' : 'Guardando producto...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    if (props.product && props.product.id) {
      // Si tiene id, editar
      await updateProduct({ ...form.value, id: props.product.id })
    } else {
      // Si no tiene id, crear
      await createProduct(form.value)
    }
    
    Swal.close(); 
    Swal.fire({
      icon: 'success',
      title: '¡Producto guardado!',
      text: 'El producto se guardó correctamente.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#22c55e'
    })
    emits('saved')
    emits('close')
  } catch (e) {
    Swal.close(); 
    // Intenta extraer el mensaje de error del backend
    let text = 'Ocurrió un error al guardar el producto.'
    if (e.response && e.response.data && e.response.data.data) {
      const { messages } = e.response.data.data
      if (messages) {
        // Toma el primer mensaje de validación
        const firstMessage = Object.values(messages)[0]
        if (Array.isArray(firstMessage)) {
          text = firstMessage[0]
        } else if (typeof firstMessage === 'string') {
          text = firstMessage
        }
      }
    }
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#22c55e'
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
