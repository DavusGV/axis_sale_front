<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10"
    @click.self="handleClose"
  >
    <div class="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-6 w-[95vw] max-w-md">
      <!-- HEADER -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">Agregar Usuario</h2>
        <button class="text-n500 hover:text-red-500" @click="handleClose" :disabled="isSubmitting">
          ✕
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <!-- NOMBRE -->
        <div>
          <label class="block text-sm mb-1">Nombre</label>
          <input
            v-model="form.name"
            @input="clearError('name')"
            placeholder="Nombre completo"
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1">
            {{ errors.name[0] }}
          </p>
        </div>

        <!-- EMAIL -->
        <div>
          <label class="block text-sm mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            @input="clearError('email')"
            placeholder="example@correo.com"
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">
            {{ errors.email[0] }}
          </p>
        </div>

        <!-- PASSWORD -->
        <div>
          <label class="block text-sm mb-1">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            @input="clearError('password')"
            placeholder="Mínimo 8 caracteres"
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :class="{ 'border-red-500': errors.password }"
          />
          <p class="text-xs text-gray-500 mt-1">
            Mínimo 8 caracteres
          </p>
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">
            {{ errors.password[0] }}
          </p>
        </div>

        <!-- CONFIRMAR -->
        <div>
          <label class="block text-sm mb-1">Confirmar contraseña</label>
          <input
            v-model="form.password_confirmation"
            type="password"
            @input="clearError('password_confirmation')"
            placeholder="Repite la contraseña"
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :class="{ 'border-red-500': errors.password_confirmation }"
          />
          <p v-if="errors.password_confirmation" class="text-red-500 text-xs mt-1">
            {{ errors.password_confirmation[0] }}
          </p>
        </div>

        <!-- ACTIONS -->
        <div class="flex justify-end gap-2 pt-4">
          <button type="button" class="btn-outline" @click="handleClose" :disabled="isSubmitting">
            Cancelar
          </button>

          <button type="submit" class="btn" :disabled="isSubmitting">
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
import { createUser } from '@/api/user'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'success'])

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

watch(() => props.show, (val) => {
  if (!val) return
  resetForm()
})

function resetForm() {
  form.value = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  }
  errors.value = {}
}

function clearError(field: string) {
  if (errors.value[field]) delete errors.value[field]
}

function handleClose() {
  if (isSubmitting.value) return
  emit('close')
}

async function submit() {
  isSubmitting.value = true
  errors.value = {}

  try {
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() })

    await createUser(form.value)
    Swal.close()
    await Swal.fire('Éxito', 'Usuario creado correctamente', 'success')

    emit('success')
    emit('close')
  } catch (e: any) {
    Swal.close()

    if (e.response?.status === 422 && e.response.data?.errors) {
      errors.value = e.response.data.errors
      return
    }
    Swal.fire(
      'Error',
      e.response?.data?.message || 'No se pudo guardar el usuario',
      'error'
    )
  }
 finally {
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
