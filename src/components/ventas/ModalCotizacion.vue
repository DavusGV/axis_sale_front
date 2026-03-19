<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">

      <!-- encabezado -->
      <div class="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
        <h2 class="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-file-invoice-dollar text-blue-500"></i>
          Generar Cotizacion
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- cuerpo -->
      <div class="p-5 flex flex-col gap-4">

        <!-- seleccion de cliente -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cliente <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                v-model="busquedaCliente"
                type="text"
                placeholder="Buscar cliente por nombre..."
                class="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                      bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                      placeholder-gray-400 focus:outline-none focus:border-blue-500
                      focus:ring-1 focus:ring-blue-400 transition text-sm"
                @input="buscarClientes"
                autocomplete="off"
              />

              <!-- resultados de busqueda -->
              <ul
                v-if="resultadosClientes.length && !clienteSeleccionado"
                class="absolute z-10 w-full border border-gray-200 dark:border-gray-600 rounded-lg mt-1
                      max-h-36 overflow-y-auto bg-white dark:bg-gray-700 shadow-lg"
              >
                <li
                  v-for="cliente in resultadosClientes"
                  :key="cliente.id"
                  class="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600
                        text-sm transition border-b last:border-0 dark:border-gray-600"
                  @click="seleccionarCliente(cliente)"
                >
                  <span class="font-medium">{{ cliente.nombre }} {{ cliente.apellido_p }}</span>
                  <span class="text-gray-400 ml-2 text-xs">{{ cliente.telefono1 ?? 'Sin telefono' }}</span>
                </li>
              </ul>
            </div>

            <!-- boton nuevo cliente -->
            <button
              class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg
                    bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300
                    hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              title="Registrar nuevo cliente"
              @click="showFormCliente = !showFormCliente"
            >
              <i class="fa-solid fa-user-plus text-sm"></i>
            </button>
          </div>

          <!-- cliente seleccionado -->
          <div
            v-if="clienteSeleccionado"
            class="mt-2 flex items-center justify-between
                  bg-blue-50 dark:bg-blue-900/30
                  border border-blue-200 dark:border-blue-700
                  rounded-lg px-3 py-2"
          >
            <div class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 font-medium">
              <i class="fa-solid fa-circle-check text-blue-500"></i>
              {{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido_p }}
            </div>
            <button class="text-blue-400 hover:text-red-500 transition" @click="limpiarCliente">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          <!-- mini formulario nuevo cliente -->
          <div
            v-if="showFormCliente && !clienteSeleccionado"
            class="mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex flex-col gap-2
                  border border-gray-200 dark:border-gray-600"
          >
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nuevo cliente</p>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="nuevoCliente.nombre"
                type="text"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Nombre *"
              />
              <input
                v-model="nuevoCliente.apellido_p"
                type="text"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Apellido paterno *"
              />
              <input
                v-model="nuevoCliente.telefono1"
                type="text"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Teléfono *"
              />
              <input
                v-model="nuevoCliente.email"
                type="email"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Email"
              />
            </div>
            <button
              class="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium
                    hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
              @click="registrarNuevoCliente"
              :disabled="loadingCliente"
            >
              <i class="fa-solid fa-user-plus"></i>
              {{ loadingCliente ? 'Guardando...' : 'Registrar cliente' }}
            </button>
          </div>
        </div>

        <!-- fecha de expiracion -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de expiracion <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i class="fa-solid fa-calendar-days text-gray-400"></i>
            </span>
            <input
              v-model="expiresAt"
              type="date"
              @click="($event.target as HTMLInputElement).showPicker()"
              :min="hoy"
              class="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400
                    transition text-sm"
            />
          </div>
          <p class="text-xs text-gray-400 mt-1">Fecha limite de vigencia de la cotizacion</p>
        </div>

        <!-- notas -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas
          </label>
          <textarea
            v-model="notas"
            rows="2"
            placeholder="Observaciones para el cliente..."
            class="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                  placeholder-gray-400 focus:outline-none focus:border-blue-500
                  focus:ring-1 focus:ring-blue-400 transition text-sm resize-none"
          ></textarea>
        </div>

      </div>

      <!-- footer -->
      <div class="flex gap-3 px-5 py-4 border-t dark:border-gray-700">
        <button
          class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          class="flex-1 px-4 py-2 rounded-lg border border-blue-600
                 bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :disabled="!clienteSeleccionado || cargando"
          @click="confirmar"
        >
          <i class="fa-solid fa-floppy-disk"></i>
          {{ cargando ? 'Guardando...' : 'Guardar Cotizacion' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { buscarClientes as buscarClientesApi, crearCliente } from '@/api/clientes'
import Swal from 'sweetalert2'

const emit = defineEmits(['close', 'confirmar'])

// define la forma del objeto cliente
interface Cliente {
  id:         number
  nombre:     string
  apellido_p: string
  telefono1:  string | null
}

const busquedaCliente     = ref('')
const resultadosClientes  = ref<Cliente[]>([])
const clienteSeleccionado = ref<Cliente | null>(null)
const expiresAt           = ref('')
const notas               = ref('')
const cargando            = ref(false)

// variables para crear cliente nuevo
const showFormCliente = ref(false)
const loadingCliente  = ref(false)
const nuevoCliente    = ref({
  nombre: '', apellido_p: '', telefono1: '', email: ''
})

// fecha minima para el datepicker es hoy
const hoy = computed(() => new Date().toISOString().split('T')[0])

let timeoutBusqueda: any = null

async function buscarClientes() {
  if (clienteSeleccionado.value) clienteSeleccionado.value = null

  if (!busquedaCliente.value.trim()) {
    resultadosClientes.value = []
    return
  }

  clearTimeout(timeoutBusqueda)
  timeoutBusqueda = setTimeout(async () => {
    try {
        // usa la funcion existente que envia el parametro q
        const res = await buscarClientesApi(busquedaCliente.value)
        resultadosClientes.value = res.data?.clientes ?? []
    } catch {
        resultadosClientes.value = []
    }
  }, 300)
}

function seleccionarCliente(cliente: any) {
  clienteSeleccionado.value  = cliente
  busquedaCliente.value      = `${cliente.nombre} ${cliente.apellido_p}`
  resultadosClientes.value   = []
}

function limpiarCliente() {
  clienteSeleccionado.value = null
  busquedaCliente.value     = ''
}

async function registrarNuevoCliente() {
  if (!nuevoCliente.value.nombre || !nuevoCliente.value.apellido_p || !nuevoCliente.value.telefono1) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos requeridos',
      text: 'Nombre, apellido paterno y teléfono son obligatorios.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  loadingCliente.value = true
  try {
    const data = new FormData()
    Object.entries(nuevoCliente.value).forEach(([k, v]) => {
      if (v) data.append(k, v)
    })

    const res = await crearCliente(data)
    // la respuesta viene envuelta en data por el wrapper del API
    const cliente = res.data?.cliente ?? res.cliente
    seleccionarCliente(cliente)
    showFormCliente.value = false
    nuevoCliente.value = { nombre: '', apellido_p: '', telefono1: '', email: '' }

    Swal.fire({
      icon: 'success',
      title: 'Cliente registrado',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e?.response?.data?.message || 'No se pudo registrar el cliente.'
    })
  } finally {
    loadingCliente.value = false
  }
}

function confirmar() {
  if (!clienteSeleccionado.value) return

  if (!expiresAt.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Fecha requerida',
      text: 'Selecciona una fecha de expiración para la cotización.',
      confirmButtonColor: '#ef4444'
    })
    return
  }

  emit('confirmar', {
    cliente_id: clienteSeleccionado.value.id,
    expires_at: expiresAt.value,
    notas:      notas.value || null,
  })
}
</script>