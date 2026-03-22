<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { IconX, IconDeviceFloppy, IconCalendar } from "@tabler/icons-vue"
import { getType, getMethodPay, registrarGasto, editarGasto } from '@/api/finanzas'
import Swal from 'sweetalert2'

const props = defineProps({
  gasto: Object
})

const emit = defineEmits(["close","saved"])

const loading = ref(false)

const form = ref({
  tipo_gasto_id: '',
  metodo_pago_id: '',
  concepto: '',
  descripcion: '',
  monto: '',
  fecha: new Date().toISOString().slice(0, 10),
  state: 1
})

const tiposGasto = ref<any[]>([])
const metodosPago = ref<any[]>([])

// cargar catalogos de tipos de gasto y metodos de pago
const cargarCatalogos = async () => {
  try {
    const tg = await getType()
    const mp = await getMethodPay()
    tiposGasto.value = tg.data
    metodosPago.value = mp.data
  } catch (e) {
    console.error("Error cargando catalogos", e)
  }
}

// si recibe un gasto para editar, carga los datos en el formulario
watch(() => props.gasto, (val:any) => {
  if (val) {
    form.value = {
      tipo_gasto_id: val.tipo_gasto_id,
      metodo_pago_id: val.metodo_pago_id,
      concepto: val.concepto,
      descripcion: val.descripcion ?? '',
      monto: val.monto,
      fecha: val.fecha,
      state: val.state
    }
  }
}, { immediate: true })

// validacion basica antes de enviar
function validarFormulario(): boolean {
  if (!form.value.tipo_gasto_id) {
    Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Selecciona un tipo de gasto.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 })
    return false
  }
  if (!form.value.metodo_pago_id) {
    Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Selecciona un metodo de pago.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 })
    return false
  }
  if (!form.value.concepto.trim()) {
    Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Ingresa el concepto del gasto.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 })
    return false
  }
  if (!form.value.monto || Number(form.value.monto) <= 0) {
    Swal.fire({ icon: 'warning', title: 'Monto invalido', text: 'Ingresa un monto mayor a 0.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 })
    return false
  }
  if (!form.value.fecha) {
    Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Selecciona la fecha del gasto.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 })
    return false
  }
  return true
}

const guardar = async () => {
  if (!validarFormulario()) return

  try {
    loading.value = true

    if (props.gasto) {
      // editar gasto existente
      await editarGasto({
        id: props.gasto.id,
        ...form.value
      })

      Swal.fire({
        icon: 'success',
        title: 'Gasto actualizado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      })
    } else {
      // registrar nuevo gasto
      await registrarGasto(form.value)

      Swal.fire({
        icon: 'success',
        title: 'Gasto registrado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      })
    }

    emit("saved")

  } catch (e: any) {
    const mensaje = e?.response?.data?.message
      || e?.response?.data?.data
      || 'Error al guardar el gasto.'

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarCatalogos()
})
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="w-[560px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

      <!-- header -->
      <div class="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {{ gasto ? 'Editar gasto' : 'Registrar gasto' }}
        </h2>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="$emit('close')"
        >
          <IconX :size="18"/>
        </button>
      </div>

      <!-- body -->
      <div class="p-6 space-y-4">

        <!-- tipo gasto -->
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Tipo de gasto</label>
          <select
            v-model="form.tipo_gasto_id"
            class="w-full mt-1 px-3 py-2 text-sm border rounded-lg
                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                   focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
          >
            <option value="">Seleccionar</option>
            <option v-for="tipo in tiposGasto" :key="tipo.id" :value="tipo.id">
              {{ tipo.name }}
            </option>
          </select>
        </div>

        <!-- metodo pago -->
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Metodo de pago</label>
          <select
            v-model="form.metodo_pago_id"
            class="w-full mt-1 px-3 py-2 text-sm border rounded-lg
                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                   focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
          >
            <option value="">Seleccionar</option>
            <option v-for="metodo in metodosPago" :key="metodo.id" :value="metodo.id">
              {{ metodo.nombre }}
            </option>
          </select>
        </div>

        <!-- concepto -->
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Concepto</label>
          <input
            v-model="form.concepto"
            placeholder="Concepto del gasto"
            class="w-full mt-1 px-3 py-2 text-sm border rounded-lg
                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                   focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
          />
        </div>

        <!-- descripcion -->
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Descripcion <span class="text-gray-400">(opcional)</span></label>
          <textarea
            v-model="form.descripcion"
            rows="2"
            placeholder="Descripcion opcional"
            class="w-full mt-1 px-3 py-2 text-sm border rounded-lg resize-none
                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                   focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
          ></textarea>
        </div>

        <!-- monto y fecha en la misma fila -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Monto</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              v-model="form.monto"
              placeholder="0.00"
              class="w-full mt-1 px-3 py-2 text-sm border rounded-lg
                     dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                     focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
            />
          </div>
          <!-- fecha -->
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Fecha</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none">
                <IconCalendar :size="16" />
              </span>
              <input
                type="date"
                v-model="form.fecha"
                @click="($event.target as HTMLInputElement).showPicker()"
                class="w-full mt-1 pl-9 pr-3 py-2 text-sm border rounded-lg
                      dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                      focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400
                      [&::-webkit-calendar-picker-indicator]:cursor-pointer
                      [&::-webkit-calendar-picker-indicator]:dark:invert"
              />
            </div>
          </div>
        </div>

        <!-- estado -->
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Estado</label>
          <select
            v-model="form.state"
            class="w-full mt-1 px-3 py-2 text-sm border rounded-lg
                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                   focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
          >
            <option :value="1">Activo</option>
            <option :value="0">Inactivo</option>
          </select>
        </div>

      </div>

      <!-- footer -->
      <div class="flex justify-end gap-3 px-6 py-4 border-t dark:border-gray-700">
        <button
          class="px-4 py-2 text-xs rounded-lg border dark:border-gray-600 dark:text-gray-300
                 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 text-xs
                 bg-primary text-white rounded-lg
                 hover:bg-green-500 transition"
          :disabled="loading"
          @click="guardar"
        >
          <IconDeviceFloppy :size="16"/>
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>

    </div>
  </div>
</template>