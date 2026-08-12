<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import axiosInstance from '@/utils/axios'
import { guardarSuscripcion, actualizarSuscripcion } from '@/api/suscripcion'

const props = defineProps<{ show: boolean; suscripcion: any | null }>()
const emit = defineEmits(['close', 'saved'])

const establecimientos = ref<any[]>([])
const guardando = ref(false)
const errores = ref<Record<string, string[]>>({})

const esEdicion = computed(() => !!props.suscripcion?.id)

const meses = [
  { valor: 1, nombre: 'Enero' }, { valor: 2, nombre: 'Febrero' }, { valor: 3, nombre: 'Marzo' },
  { valor: 4, nombre: 'Abril' }, { valor: 5, nombre: 'Mayo' }, { valor: 6, nombre: 'Junio' },
  { valor: 7, nombre: 'Julio' }, { valor: 8, nombre: 'Agosto' }, { valor: 9, nombre: 'Septiembre' },
  { valor: 10, nombre: 'Octubre' }, { valor: 11, nombre: 'Noviembre' }, { valor: 12, nombre: 'Diciembre' },
]

const form = reactive({
  establecimiento_id: '' as string | number,
  monto: '',
  ciclo_pago: 'mensual',
  dia_pago: 1,
  mes_pago: 1 as number | null,
  dias_gracia: 0,
  dias_previos_aviso: 5,
  aviso_ventana: true,
  limitar_acceso: true,
  notificar_email: false,
  notificar_telefono: false,
  activo: true,
  notas: '',
})

// mes_pago solo aplica cuando el ciclo es anual
const esAnual = computed(() => form.ciclo_pago === 'anual')

function limpiarFormulario() {
  form.establecimiento_id = ''
  form.monto = ''
  form.ciclo_pago = 'mensual'
  form.dia_pago = 1
  form.mes_pago = 1
  form.dias_gracia = 0
  form.dias_previos_aviso = 5
  form.aviso_ventana = true
  form.limitar_acceso = true
  form.notificar_email = false
  form.notificar_telefono = false
  form.activo = true
  form.notas = ''
  errores.value = {}
}

function cargarDatos(item: any) {
  form.establecimiento_id = item.establecimiento_id
  form.monto = item.monto
  form.ciclo_pago = item.ciclo_pago
  form.dia_pago = item.dia_pago
  form.mes_pago = item.mes_pago ?? 1
  form.dias_gracia = item.dias_gracia
  form.dias_previos_aviso = item.dias_previos_aviso
  form.aviso_ventana = item.aviso_ventana
  form.limitar_acceso = item.limitar_acceso
  form.notificar_email = item.notificar_email
  form.notificar_telefono = item.notificar_telefono
  form.activo = item.activo
  form.notas = item.notas ?? ''
  errores.value = {}
}

async function loadEstablecimientos() {
  try {
    const res = await axiosInstance.get('/establecimientos')
    establecimientos.value = res.data.data?.establecimientos || res.data.data || []
  } catch {
    establecimientos.value = []
  }
}

function cerrar() {
  if (guardando.value) return
  emit('close')
}

async function guardar() {
  errores.value = {}
  guardando.value = true

  try {
    const payload: any = { ...form }

    // mes_pago solo se manda cuando el ciclo es anual
    if (!esAnual.value) {
      payload.mes_pago = null
    }

    if (esEdicion.value) {
      // el establecimiento no se cambia en la edicion
      delete payload.establecimiento_id
      await actualizarSuscripcion(props.suscripcion.id, payload)
    } else {
      await guardarSuscripcion(payload)
    }

    Swal.fire({
      title: esEdicion.value ? 'Suscripcion actualizada' : 'Suscripcion registrada',
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })

    emit('saved')
    emit('close')
  } catch (e: any) {
    if (e.response?.data?.data?.messages) {
      errores.value = e.response.data.data.messages
    } else {
      const mensaje = e.response?.data?.data?.message || e.response?.data?.message ||
        'No se pudo guardar la suscripcion'
      Swal.fire({
        title: 'Advertencia',
        text: mensaje,
        icon: 'warning',
        color: '#1f2937',
        confirmButtonColor: '#3b82f6',
      })
    }
  } finally {
    guardando.value = false
  }
}

watch(() => props.show, (val) => {
  if (!val) return

  loadEstablecimientos()

  if (props.suscripcion) {
    cargarDatos(props.suscripcion)
  } else {
    limpiarFormulario()
  }
})
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center px-3 py-6"
    @click.self="cerrar"
  >
    <div class="box w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-4 md:p-6">

      <div class="flex items-center justify-between pb-4 mb-4 bb-dashed">
        <h4 class="h4">{{ esEdicion ? 'Editar suscripcion' : 'Nueva suscripcion' }}</h4>
        <button class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition" @click="cerrar">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- establecimiento, solo en alta -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Establecimiento</label>
        <select
          v-model="form.establecimiento_id"
          :disabled="esEdicion"
          class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2 disabled:opacity-60"
        >
          <option value="">Seleccione un establecimiento</option>
          <option v-for="est in establecimientos" :key="est.id" :value="est.id">
            {{ est.nombre }}
          </option>
        </select>
        <span v-if="errores.establecimiento_id" class="text-xs text-red-500 mt-1 block">
          {{ errores.establecimiento_id[0] }}
        </span>
      </div>

      <!-- monto y ciclo -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2">Monto</label>
          <input
            v-model="form.monto"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
          />
          <span v-if="errores.monto" class="text-xs text-red-500 mt-1 block">{{ errores.monto[0] }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Ciclo de pago</label>
          <select
            v-model="form.ciclo_pago"
            class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
          >
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </select>
          <span v-if="errores.ciclo_pago" class="text-xs text-red-500 mt-1 block">{{ errores.ciclo_pago[0] }}</span>
        </div>
      </div>

      <!-- dia de pago, siempre; mes de pago, solo si es anual -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2">Dia de pago</label>
          <select
            v-model.number="form.dia_pago"
            class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
          >
            <option v-for="dia in 31" :key="dia" :value="dia">{{ dia }}</option>
          </select>
          <span v-if="errores.dia_pago" class="text-xs text-red-500 mt-1 block">{{ errores.dia_pago[0] }}</span>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Si el mes no tiene ese dia, se ajusta al ultimo dia del mes.
          </p>
        </div>

        <div v-if="esAnual">
          <label class="block text-sm font-medium mb-2">Mes de pago</label>
          <select
            v-model.number="form.mes_pago"
            class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
          >
            <option v-for="mes in meses" :key="mes.valor" :value="mes.valor">{{ mes.nombre }}</option>
          </select>
          <span v-if="errores.mes_pago" class="text-xs text-red-500 mt-1 block">{{ errores.mes_pago[0] }}</span>
        </div>
      </div>

      <!-- dias -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2">Dias de gracia</label>
          <input
            v-model.number="form.dias_gracia"
            type="number"
            min="0"
            max="60"
            class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
          />
          <span v-if="errores.dias_gracia" class="text-xs text-red-500 mt-1 block">{{ errores.dias_gracia[0] }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Dias previos de aviso</label>
          <input
            v-model.number="form.dias_previos_aviso"
            type="number"
            min="0"
            max="60"
            class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
          />
          <span v-if="errores.dias_previos_aviso" class="text-xs text-red-500 mt-1 block">
            {{ errores.dias_previos_aviso[0] }}
          </span>
        </div>
      </div>

      <!-- banderas -->
      <div class="border border-n30 dark:border-n500 rounded-lg p-4 mb-4">
        <p class="text-sm font-medium mb-3">Opciones</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.activo" type="checkbox" class="accent-primary" />
            <span>Suscripcion activa</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.aviso_ventana" type="checkbox" class="accent-primary" />
            <span>Mostrar ventana de aviso</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.limitar_acceso" type="checkbox" class="accent-primary" />
            <span>Limitar acceso al vencer</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.notificar_email" type="checkbox" class="accent-primary" />
            <span>Notificar por correo</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.notificar_telefono" type="checkbox" class="accent-primary" />
            <span>Notificar por numero</span>
          </label>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Si la suscripcion no esta activa, el establecimiento tiene acceso libre y no recibe avisos.
        </p>
      </div>

      <!-- notas -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Notas (opcional)</label>
        <textarea
          v-model="form.notas"
          rows="2"
          maxlength="500"
          class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
        ></textarea>
      </div>

      <div class="flex gap-3 justify-end">
        <button class="btn-outline px-5" :disabled="guardando" @click="cerrar">Cancelar</button>
        <button class="btn px-5" :disabled="guardando" @click="guardar">
          {{ guardando ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>

    </div>
  </div>
</template>