<script setup lang="ts">
import { IconDeviceFloppy, IconX, IconSearch } from '@tabler/icons-vue'
import { ref, watch, nextTick } from "vue"

const nameInput = ref<HTMLInputElement | null>(null)

const props = defineProps<{
  editData: any
}>()

interface CategoriaForm {
  id?: number
  nombre: string
  descripcion: string
}

const emit = defineEmits<{
  (e: 'guardar', data: CategoriaForm): void
  (e: 'search', filters: { search: string }): void
  (e: 'editar', data: CategoriaForm): void
}>()

const formData = ref<CategoriaForm>({
  id: 0,
  nombre: '',
  descripcion: ''
})

const submitForm = () => {
  if (formData.value.id && formData.value.id !== 0) {
    emit('editar', { ...formData.value })
    resetForm()
  } else {
    emit('guardar', { ...formData.value })
    resetForm()
  }
}

const resetForm = () => {
  formData.value = {
    id: 0,
    nombre: '',
    descripcion: ''
  }
}

const search = () => {
  emit('search', {
    search: formData.value.nombre
  })
}

watch(
  () => props.editData,
  async (newValue) => {
    if (newValue) {
      formData.value = {
        id: newValue.id,
        nombre: newValue.nombre,
        descripcion: newValue.descripcion
      }
      await nextTick()
      nameInput.value?.focus()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="box mb-4 xxxl:mb-6 space-y-6">
    <div class="col-span-6 lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
      <form class="flex flex-wrap items-end gap-5">
        <!-- Nombre -->
        <div class="flex flex-col min-w-[200px] flex-1">
          <label class="text-sm text-gray-600 dark:text-gray-300 mb-2">Nombre</label>
          <input type="text" style="display: none;" v-model="formData.id" />
          <input
            ref="nameInput"
            type="text"
            required
            placeholder="Ej: Bebidas, Electrónica, etc."
            class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            v-model="formData.nombre"
          />
        </div>

        <!-- Descripcion -->
        <div class="flex flex-col min-w-[250px] flex-1">
          <label class="text-sm text-gray-600 dark:text-gray-300 mb-2">Descripción</label>
          <input
            type="text"
            v-model="formData.descripcion"
            placeholder="Descripción opcional"
            class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button type="button" title="Buscar" class="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition" @click="search">
            <IconSearch :size="20" />
          </button>
          <button type="button" title="Guardar" class="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-green-500 transition" @click="submitForm">
            <IconDeviceFloppy :size="20" />
          </button>
          <button type="button" title="Cancelar" class="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:text-green-400 transition" @click="resetForm">
            <IconX :size="20" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>