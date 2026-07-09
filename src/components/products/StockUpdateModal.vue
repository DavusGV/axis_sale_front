<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
    <div class="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-6 w-[95vw] max-w-md">

      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Actualizar stock</h2>
        <button class="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300" @click="cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- info del producto -->
      <div v-if="producto" class="bg-gray-50 dark:bg-gray-800 rounded p-3 mb-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Producto</p>
        <p class="font-semibold">{{ producto.nombre }}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-gray-500">Codigo: {{ producto.codigo || 'Sin codigo' }}</span>
          <span class="text-sm font-bold text-primary">
            Stock actual: {{ producto.stock ?? 0 }}
          </span>
        </div>
      </div>

      <form @submit.prevent="guardar">
        <!-- tipo de movimiento -->
        <div class="mb-4">
          <label class="block text-sm mb-2 font-medium">Tipo de movimiento</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="form.tipo = 'entrada'"
              :class="[
                'py-3 rounded-lg border-2 transition flex items-center justify-center gap-2',
                form.tipo === 'entrada'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              ]"
            >
              <i class="fa-solid fa-arrow-up"></i>
              Entrada
            </button>
            <button
              type="button"
              @click="form.tipo = 'reduccion'"
              :class="[
                'py-3 rounded-lg border-2 transition flex items-center justify-center gap-2',
                form.tipo === 'reduccion'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
              ]"
            >
              <i class="fa-solid fa-arrow-down"></i>
              Reduccion
            </button>
          </div>
        </div>

        <!-- cantidad -->
        <div class="mb-4">
          <label class="block text-sm mb-1 font-medium">Cantidad</label>
          <input
            v-model.number="form.cantidad"
            type="number"
            min="1"
            required
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :placeholder="form.tipo === 'entrada' ? 'Cuantos productos entraron' : 'Cuantos productos reducir'"
          />
          <!-- preview del stock resultante -->
          <p v-if="stockResultanteValido" class="text-xs mt-1" :class="form.tipo === 'entrada' ? 'text-green-600' : 'text-amber-600'">
            Stock resultante: <b>{{ stockResultante }}</b>
          </p>
          <p v-if="stockResultanteNegativo" class="text-xs mt-1 text-red-600">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i>
            La reduccion deja stock negativo. Maximo: {{ producto?.stock ?? 0 }}
          </p>
        </div>

        <!-- motivo -->
        <div class="mb-4">
          <label class="block text-sm mb-1 font-medium">
            Motivo
            <span v-if="form.tipo === 'reduccion'" class="text-red-500">*</span>
            <span v-else class="text-gray-400 text-xs">(opcional)</span>
          </label>
          <textarea
            v-model="form.motivo"
            rows="3"
            class="input w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            :placeholder="form.tipo === 'reduccion' ? 'Producto danado, caducado, robo...' : 'Compra a proveedor, devolucion...'"
            :required="form.tipo === 'reduccion'"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button type="button" class="btn-outline" @click="cerrar">Cancelar</button>
          <button type="submit" class="btn" :disabled="guardando || !puedeGuardar">
            {{ guardando ? 'Guardando...' : 'Registrar movimiento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import { registrarMovimientoStock } from '@/api/stock'

const props = defineProps<{
  show: boolean
  producto: { id: number; nombre: string; codigo?: string | null; stock?: number | null } | null
}>()

const emits = defineEmits(['close', 'saved'])

const form = ref<{ tipo: 'entrada' | 'reduccion'; cantidad: number | null; motivo: string }>({
  tipo: 'entrada',
  cantidad: null,
  motivo: '',
})

const guardando = ref(false)

// resetea el formulario cuando se abre o cierra el modal
watch(() => props.show, (val) => {
  if (val) {
    form.value = { tipo: 'entrada', cantidad: null, motivo: '' }
  }
})

const stockResultante = computed(() => {
  const stockActual = props.producto?.stock ?? 0
  const cantidad    = Number(form.value.cantidad) || 0
  return form.value.tipo === 'entrada'
    ? stockActual + cantidad
    : stockActual - cantidad
})

const stockResultanteValido = computed(() => {
  return Number(form.value.cantidad) > 0 && stockResultante.value >= 0
})

const stockResultanteNegativo = computed(() => {
  return form.value.tipo === 'reduccion'
    && Number(form.value.cantidad) > 0
    && stockResultante.value < 0
})

const puedeGuardar = computed(() => {
  if (!form.value.cantidad || form.value.cantidad <= 0) return false
  if (form.value.tipo === 'reduccion') {
    if (stockResultanteNegativo.value) return false
    if (!form.value.motivo || form.value.motivo.trim() === '') return false
  }
  return true
})

function cerrar() {
  emits('close')
}

async function guardar() {
  if (!props.producto || !puedeGuardar.value) return

  guardando.value = true
  try {
    await registrarMovimientoStock({
      producto_id: props.producto.id,
      tipo:        form.value.tipo,
      cantidad:    Number(form.value.cantidad),
      motivo:      form.value.motivo.trim() || null,
    })

    Swal.fire({
      title: 'Movimiento registrado',
      text:  'El stock se actualizo correctamente.',
      icon:  'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })

    emits('saved')
    cerrar()
  } catch (e: any) {
    const msg = e?.response?.data?.message
             || e?.response?.data?.error
             || 'No se pudo registrar el movimiento.'
    Swal.fire({
      title: 'Error',
      text:  msg,
      icon:  'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
  } finally {
    guardando.value = false
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