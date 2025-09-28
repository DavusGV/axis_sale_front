<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-6 w-[95vw] max-w-md transition-colors duration-200">
      <h2 class="text-xl font-bold mb-4">Apertura de Caja</h2>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="block text-sm mb-1">Descripción</label>
          <textarea v-model="form.descripcion" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"></textarea>
        </div>
        
        <div class="mb-3">
          <label class="block text-sm mb-1">Saldo Inicial</label>
          <input v-model.number="form.saldo_inicial" type="number" class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />
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
import { ref, watch } from 'vue';
import axiosInstance from '@/utils/axios'
import Swal from 'sweetalert2'

const props = defineProps<{
  show: boolean,
  cajaId: number | null // ID de la caja a abrir
}>()
const emits = defineEmits(['close', 'saved'])
//vamos a obener al usuario logueado
const user = JSON.parse(localStorage.getItem('user') || '{}')
const usuario_id = user.id // <-- aquí tienes el id del usuario en sesión


const form = ref({
  descripcion: '',
  saldo_inicial: 0
})

watch(
  () => props.show,
  (val) => {
    if (val) resetForm()
  }
)

function resetForm() {
  form.value = {
    descripcion: '',
    saldo_inicial: 0
  }
}

async function submit() {
  try {
    Swal.fire({
      title: 'Abriendo caja...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    await axiosInstance.post('/cajas/open', {
      caja_id: props.cajaId,
      saldo_inicial: form.value.saldo_inicial,
      descripcion: form.value.descripcion,
      establecimiento_id: 1, // Cambia esto según tu lógica
      usuario_id: usuario_id 
      // usuario_id: si lo necesitas, agrégalo aquí desde auth
    })

    Swal.close();
    Swal.fire({
      icon: 'success',
      title: '¡Caja abierta!',
      text: 'La caja se abrió correctamente.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#22c55e'
    })
    emits('saved')
    emits('close')
  } catch (e: any) {
    Swal.close();
    let text = 'Ocurrió un error al abrir la caja.'
   if (e.response && e.response.data) {
    // Si hay un mensaje principal, lo muestra
    if (e.response.data.message) {
      text = e.response.data.message
    } else if (e.response.data.errors) {
      // Si hay errores de validación, muestra el primero
      const errors = e.response.data.errors
      const firstKey = Object.keys(errors)[0]
      const firstError = errors[firstKey]
      if (Array.isArray(firstError)) {
        text = firstError[0]
      } else if (typeof firstError === 'string') {
        text = firstError
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
