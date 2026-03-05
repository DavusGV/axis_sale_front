<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">

      <div class="flex items-center justify-between p-6 border-b dark:border-gray-700">
        <h2 class="font-bold text-lg flex items-center gap-2">
          <i class="fa-solid fa-user"></i>
          {{ props.cliente ? 'Editar Cliente' : 'Nuevo Cliente' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- nombre -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre"
            type="text"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
            placeholder="Nombre"
          />
        </div>

        <!-- apellido paterno -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Apellido Paterno <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.apellido_p"
            type="text"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
            placeholder="Apellido paterno"
          />
        </div>

        <!-- apellido materno -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Apellido Materno
          </label>
          <input
            v-model="form.apellido_m"
            type="text"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
            placeholder="Apellido materno"
          />
        </div>

        <!-- telefono 1 -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Telefono <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.telefono1"
            type="text"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
            placeholder="Telefono principal"
          />
        </div>

        <!-- telefono 2 -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Telefono 2
          </label>
          <input
            v-model="form.telefono2"
            type="text"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
            placeholder="Telefono alternativo"
          />
        </div>

        <!-- email -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            v-model="form.email"
            type="email"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <!-- fecha nacimiento -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha de Nacimiento
          </label>
          <input
            v-model="form.fecha_nacimiento"
            type="date"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
          />
        </div>

        <!-- genero -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Genero
          </label>
          <select
            v-model="form.genero"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
          >
            <option value="">Sin especificar</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <!-- direccion -->
        <div class="md:col-span-2">
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Direccion
          </label>
          <input
            v-model="form.direccion"
            type="text"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition"
            placeholder="Calle, colonia, ciudad"
          />
        </div>

        <!-- observaciones -->
        <div class="md:col-span-2">
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Observaciones
          </label>
          <textarea
            v-model="form.observaciones"
            rows="2"
            class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition resize-none"
            placeholder="Notas adicionales del cliente"
          />
        </div>

        <!-- foto -->
        <div class="md:col-span-2">
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Foto
          </label>
          <div class="flex items-center gap-4">
            <img
              v-if="fotoPreview"
              :src="fotoPreview"
              class="w-16 h-16 rounded-full object-cover border-2 border-green-400"
            />
            <div
              v-else
              class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
            >
              <i class="fa-solid fa-user text-2xl text-gray-400"></i>
            </div>
            <input
              type="file"
              accept="image/*"
              @change="onFotoChange"
              class="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg
                     file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700
                     hover:file:bg-green-100"
            />
          </div>
        </div>

      </div>

      <div class="flex justify-end gap-2 p-6 border-t dark:border-gray-700">
        <button class="btn-outline flex items-center gap-2" @click="$emit('close')">
          Cancelar
        </button>
        <button class="btn flex items-center gap-2" @click="guardar" :disabled="loading">
          <i class="fa-solid fa-floppy-disk"></i>
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
import { crearCliente, actualizarCliente } from '@/api/clientes'

const props = defineProps(['cliente'])
const emits = defineEmits(['close', 'guardado'])

const loading = ref(false)
const fotoPreview = ref(null)
const fotoFile = ref(null)

// inicializamos el form con los datos del cliente si viene en edicion
const form = ref({
  nombre:           props.cliente?.nombre           ?? '',
  apellido_p:       props.cliente?.apellido_p       ?? '',
  apellido_m:       props.cliente?.apellido_m       ?? '',
  telefono1:        props.cliente?.telefono1         ?? '',
  telefono2:        props.cliente?.telefono2         ?? '',
  email:            props.cliente?.email             ?? '',
  fecha_nacimiento: props.cliente?.fecha_nacimiento  ?? '',
  genero:           props.cliente?.genero            ?? '',
  direccion:        props.cliente?.direccion         ?? '',
  observaciones:    props.cliente?.observaciones     ?? '',
})

// si viene cliente en edicion mostramos su foto actual
watch(() => props.cliente, (val) => {
  if (val?.foto) {
    fotoPreview.value = `/storage/${val.foto}`
  }
}, { immediate: true })

function onFotoChange(event) {
  const file = event.target.files[0]
  if (!file) return
  fotoFile.value = file
  fotoPreview.value = URL.createObjectURL(file)
}

async function guardar() {
  if (!form.value.nombre || !form.value.apellido_p || !form.value.telefono1) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos requeridos',
      text: 'Nombre, apellido paterno y telefono son obligatorios.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  loading.value = true

  // usamos FormData porque puede venir foto
  const data = new FormData()
  Object.entries(form.value).forEach(([key, val]) => {
    if (val !== null && val !== '') data.append(key, val)
  })

  if (fotoFile.value) {
    data.append('foto', fotoFile.value)
  }

  try {
    if (props.cliente) {
      await actualizarCliente(props.cliente.id, data)
    } else {
      await crearCliente(data)
    }

    emits('guardado')
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.response?.data?.message || 'No se pudo guardar el cliente.'
    })
  } finally {
    loading.value = false
  }
}
</script>