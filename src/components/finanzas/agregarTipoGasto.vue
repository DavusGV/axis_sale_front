<script setup lang="ts">
import { IconDeviceFloppy, IconX, IconSearch } from '@tabler/icons-vue'
import { ref, watch, nextTick  } from "vue";


const nameInput = ref<HTMLInputElement | null>(null)

const props = defineProps<{
  editData: any
}>()


interface TipoGastoForm {
  id?: number;
  name: string;
  description: string;
  state: 'activo' | 'inactivo' | '';
}

const emit = defineEmits<{
  (e: 'guardar', data: TipoGastoForm): void
  (e: 'search', filters: { search: string; status: string }): void
  (e: 'editar', data: TipoGastoForm): void
}>()


const formData = ref<TipoGastoForm>({
  id: 0,
  name: '',
  description: '',
  state: ''
})


const submitForm = () => {

  if (formData.value.id && formData.value.id !== 0) {
    // actualizar
    //emit('edit', { ...formData.value })
    emit('editar', { ...formData.value })
    resetForm()
  } else {
    
     emit('guardar', { ...formData.value })

    // Reset visual
    resetForm()
  }
}

const resetForm = () => {
  formData.value = {
    id : 0,
    name: '',
    description: '',
    state: ''
  }
}

const search = () => {
  emit('search', {
    search: formData.value.name,
    status: formData.value.state
  })
}

watch(
  () => props.editData,
  async (newValue) => {
    if (newValue) {
      formData.value = {
        id: newValue.id,
        name: newValue.name,
        description: newValue.description,
        state: newValue.state
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
    <!-- vamos a armar un formulario para agregar tipos de gastos, editar y filtrar, con campos nombre, descripcion y estado -->
    <div class="col-span-6 lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
      <form class="flex flex-wrap items-end gap-5">
        <!-- Nombre -->
        <div class="flex flex-col min-w-[200px] flex-1">
          <label class="text-sm text-gray-600 dark:text-gray-300 mb-2"> Nombre </label>
           <input
              type="text"
              style="display: none;"
              v-model="formData.id"
            />
          <input
            ref="nameInput"
              type="text"
              id="name"
              required
              placeholder="Ej: Alquiler, Servicios, etc."
              class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              v-model="formData.name"
            />
        </div>

        <!-- Descripción -->
        <div class="flex flex-col min-w-[250px] flex-1">
          <label class="text-sm text-gray-600 dark:text-gray-300 mb-2"> Descripción </label>
          <input
            type="text"
            v-model="formData.description"
            placeholder="Descripción opcional"
            class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <!-- Estado -->
        <div class="flex flex-col w-[160px]">
          <label class="text-sm text-gray-600 dark:text-gray-300 mb-2"> Estado </label>
          <select v-model="formData.state" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
            <option value="">Seleccione una opción</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button type="button" title="Buscar" class="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition" @click="search">
            <IconSearch size="20" />
          </button>

          <!-- Guardar -->
          <button type="button" title="Guardar" class="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-green-500 transition" @click="submitForm">
            <IconDeviceFloppy size="20" />
          </button>

          <!-- Cancelar -->
          <button
            type="button"
            title="Cancelar"
            class="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:text-green-400 transition"
            @click="resetForm"
          >
            <IconX size="20" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
