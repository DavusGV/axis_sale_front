<script setup lang="ts">
import { IconDeviceFloppy, IconX } from '@tabler/icons-vue'
import { abreviaturasComunes } from '@/utils/abreviaturas'
import { ref, watch, nextTick } from 'vue'

const nameInput = ref<HTMLInputElement | null>(null)

const props = defineProps<{
  editData: any
}>()

interface UnidadForm {
  id?: number
  unidad: string
  abreviatura: string
  descripcion: string
}

// controla si el usuario eligio "Otra"
const abreviaturaPersonalizada = ref(false)

// cuando cambia el select verificamos si eligio "otra"
function onSelectAbreviatura(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  if (val === '__otra__') {
    abreviaturaPersonalizada.value = true
    formData.value.abreviatura = ''
  } else {
    abreviaturaPersonalizada.value = false
    formData.value.abreviatura = val
  }
}

const emit = defineEmits<{
  (e: 'guardar', data: UnidadForm): void
  (e: 'editar',  data: UnidadForm): void
}>()

const formData = ref<UnidadForm>({
  id:          0,
  unidad:      '',
  abreviatura: '',
  descripcion: ''
})

function submitForm() {
  if (formData.value.id && formData.value.id !== 0) {
    emit('editar', { ...formData.value })
  } else {
    emit('guardar', { ...formData.value })
  }
  resetForm()
}

function resetForm() {
  formData.value = {
    id:          0,
    unidad:      '',
    abreviatura: '',
    descripcion: ''
  }
}

// cuando llega un item a editar lo cargamos en el form
watch(
  () => props.editData,
  async (newValue) => {
    if (newValue) {
      formData.value = {
        id:          newValue.id,
        unidad:      newValue.unidad      ?? '',
        abreviatura: newValue.abreviatura ?? '',
        descripcion: newValue.descripcion ?? ''
      }
      // si la abreviatura no esta en la lista predefinida, activamos el input libre
      const enLista = abreviaturasComunes.some(a => a.valor === newValue.abreviatura)
      abreviaturaPersonalizada.value = !enLista && !!newValue.abreviatura

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

        <!-- unidad -->
        <div class="flex flex-col min-w-[200px] flex-1">
          <label class="text-sm text-gray-600 dark:text-gray-300 mb-2">Unidad</label>
          <input type="hidden" v-model="formData.id" />
          <input
            ref="nameInput"
            type="text"
            required
            placeholder="Unidad de medida"
            class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            v-model="formData.unidad"
          />
        </div>

        <!-- ABREVIATURA -->
        <div class="flex flex-col min-w-[150px] flex-1">
        <label class="text-sm text-gray-600 dark:text-gray-300 mb-2">Abreviatura</label>

        <!-- select con opciones comunes -->
        <select
            v-if="!abreviaturaPersonalizada"
            :value="formData.abreviatura"
            @change="onSelectAbreviatura"
            class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        >
            <option value="" disabled>Selecciona una abreviatura</option>
            <option
            v-for="op in abreviaturasComunes"
            :key="op.valor"
            :value="op.valor"
            >
            {{ op.label }} ({{ op.valor }})
            </option>
            <option value="__otra__">Otra...</option>
        </select>

        <!-- input libre cuando eligio "Otra" -->
        <div v-else class="flex gap-2">
            <input
            type="text"
            v-model="formData.abreviatura"
            placeholder="Ej: tn, ft, gl"
            class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <!-- boton para volver al select -->
            <button
            type="button"
            title="Volver al listado"
            class="px-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition text-xs whitespace-nowrap"
            @click="abreviaturaPersonalizada = false; formData.abreviatura = ''"
            >
            <i class="fa-solid fa-arrow-left"></i>
            </button>
        </div>
        </div>

        <!-- DESCRIPCION -->
        <div class="flex flex-col min-w-[250px] flex-1">
          <label class="text-sm text-gray-600 dark:text-gray-300 mb-2">Descripcion</label>
          <input
            type="text"
            v-model="formData.descripcion"
            placeholder="Opcional"
            class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <!-- BOTONES -->
        <div class="flex gap-3">
          <button
            type="button"
            title="Guardar"
            class="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-green-500 transition"
            @click="submitForm"
          >
            <IconDeviceFloppy :size="20" />
          </button>
          <button
            type="button"
            title="Cancelar"
            class="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:text-green-400 transition"
            @click="resetForm"
          >
            <IconX :size="20" />
          </button>
        </div>

      </form>
    </div>
  </div>
</template>