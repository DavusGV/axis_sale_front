<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10"
  >
    <div
      class="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-6 w-[95vw] max-w-md"
    >

      <!-- HEADER -->
      <h2 class="text-xl font-bold mb-6">
        {{ establecimiento && establecimiento.id
          ? 'Editar Establecimiento'
          : 'Agregar Establecimiento'
        }}
      </h2>

      <form @submit.prevent="submit" class="space-y-4">

        <!-- NOMBRE -->
        <div>
          <label class="block text-sm mb-1">Establecimiento</label>
          <input
            v-model="form.nombre"
            @input="clearError('nombre')"
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :class="{ 'border-red-500': errors.nombre }"
          />
          <p v-if="errors.nombre" class="text-red-500 text-xs mt-1">
            {{ errors.nombre[0] }}
          </p>
        </div>

        <!-- TELÉFONO -->
        <div>
          <label class="block text-sm mb-1">Teléfono</label>
          <input
            v-model="form.telefono"
            @input="clearError('telefono')"
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :class="{ 'border-red-500': errors.telefono }"
          />
          <p v-if="errors.telefono" class="text-red-500 text-xs mt-1">
            {{ errors.telefono[0] }}
          </p>
        </div>

        <!-- EMAIL -->
        <div>
          <label class="block text-sm mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            @input="clearError('email')"
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">
            {{ errors.email[0] }}
          </p>
        </div>

        <!-- DIRECCIÓN -->
        <div>
          <label class="block text-sm mb-1">Dirección</label>
          <textarea
            v-model="form.direccion"
            @input="clearError('direccion')"
            rows="3"
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :class="{ 'border-red-500': errors.direccion }"
          ></textarea>
          <p v-if="errors.direccion" class="text-red-500 text-xs mt-1">
            {{ errors.direccion[0] }}
          </p>
        </div>

        <!-- BOTONES -->
        <div class="flex justify-end gap-2 pt-4">
          <button
            type="button"
            class="btn-outline"
            @click="$emit('close')"
            :disabled="isSubmitting"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="btn"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
import { createEstablecimiento, updateEstablecimiento } from '@/api/establecimiento'

const props = defineProps<{
  show: boolean
  establecimiento: any | null
}>()

const emits = defineEmits(['close', 'saved'])

const form = ref({
  nombre: '',
  direccion: '',
  telefono: '',
  email: ''
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

watch(() => props.show, (val) => {
  if (!val) return

  errors.value = {}

  if (props.establecimiento) {
    form.value = {
      nombre: props.establecimiento.nombre ?? '',
      direccion: props.establecimiento.direccion ?? '',
      telefono: props.establecimiento.telefono ?? '',
      email: props.establecimiento.email ?? ''
    }
  } else {
    resetForm()
  }
})

function resetForm() {
  form.value = {
    nombre: '',
    direccion: '',
    telefono: '',
    email: ''
  }
  errors.value = {}
}

function clearError(field: string) {
  if (errors.value[field]) delete errors.value[field]
}

async function submit() {
  isSubmitting.value = true

  try {
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() })

    if (props.establecimiento && props.establecimiento.id) {
      await updateEstablecimiento(props.establecimiento.id, form.value)
    } else {
      await createEstablecimiento(form.value)
    }

    Swal.close()
    await Swal.fire({
      title: 'Éxito',
      text: 'Establecimiento guardado correctamente',
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6'
    })

    emits('saved')
    emits('close')

  } catch (e: any) {
    Swal.close()

    // 👇 si tu backend manda errors como objeto
    if (e.response?.data?.message && typeof e.response.data.message === 'object') {
      errors.value = e.response.data.message
      return
    }

    Swal.fire({
      title: 'Error',
      text: e.response?.data?.message || 'No se pudo guardar el establecimiento',
      icon: 'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5em;
}
</style>
