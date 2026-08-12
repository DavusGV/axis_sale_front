<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import { guardarCuenta, actualizarCuenta } from '@/api/suscripcion'

const props = defineProps<{ cuenta: any | null }>()
const emit = defineEmits(['saved', 'cancel'])

const guardando = ref(false)
const errores = ref<Record<string, string[]>>({})

const esEdicion = computed(() => !!props.cuenta?.id)

const form = reactive({
  banco: '',
  titular: '',
  tipo_cuenta: 'cuenta',
  numero: '',
  concepto: '',
  activo: true,
  observaciones: '',
})

function limpiarFormulario() {
  form.banco = ''
  form.titular = ''
  form.tipo_cuenta = 'cuenta'
  form.numero = ''
  form.concepto = ''
  form.activo = true
  form.observaciones = ''
  errores.value = {}
}

function cargarDatos(item: any) {
  form.banco = item.banco
  form.titular = item.titular
  form.tipo_cuenta = item.tipo_cuenta
  form.numero = item.numero
  form.concepto = item.concepto ?? ''
  form.activo = item.activo
  form.observaciones = item.observaciones ?? ''
  errores.value = {}
}

function cancelar() {
  limpiarFormulario()
  emit('cancel')
}

async function guardar() {
  errores.value = {}
  guardando.value = true

  try {
    if (esEdicion.value) {
      await actualizarCuenta(props.cuenta.id, { ...form })
    } else {
      await guardarCuenta({ ...form })
    }

    Swal.fire({
      title: esEdicion.value ? 'Cuenta actualizada' : 'Cuenta registrada',
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
      showConfirmButton: false,
    })

    limpiarFormulario()
    emit('saved')
  } catch (e: any) {
    if (e.response?.data?.data?.messages) {
      errores.value = e.response.data.data.messages
    } else {
      const mensaje = e.response?.data?.data?.message || e.response?.data?.message ||
        'No se pudo guardar la cuenta'
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

// al seleccionar una cuenta desde la tabla se cargan sus datos en el formulario
watch(() => props.cuenta, (val) => {
  if (val) {
    cargarDatos(val)
  } else {
    limpiarFormulario()
  }
})
</script>

<template>
  <div class="box p-4 md:p-5">

    <div class="pb-3 mb-4 bb-dashed">
      <h4 class="h4">{{ esEdicion ? 'Editar cuenta' : 'Nueva cuenta' }}</h4>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Banco</label>
      <input
        v-model="form.banco"
        type="text"
        maxlength="100"
        placeholder="Nombre del banco"
        class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
      />
      <span v-if="errores.banco" class="text-xs text-red-500 mt-1 block">{{ errores.banco[0] }}</span>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Titular</label>
      <input
        v-model="form.titular"
        type="text"
        maxlength="150"
        placeholder="Nombre del titular"
        class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
      />
      <span v-if="errores.titular" class="text-xs text-red-500 mt-1 block">{{ errores.titular[0] }}</span>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Tipo de cuenta</label>
      <select
        v-model="form.tipo_cuenta"
        class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
      >
        <option value="cuenta">Cuenta</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="clabe">CLABE</option>
        <option value="otro">Otro</option>
      </select>
      <span v-if="errores.tipo_cuenta" class="text-xs text-red-500 mt-1 block">{{ errores.tipo_cuenta[0] }}</span>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Numero</label>
      <input
        v-model="form.numero"
        type="text"
        maxlength="50"
        placeholder="Numero de cuenta o tarjeta"
        class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
      />
      <span v-if="errores.numero" class="text-xs text-red-500 mt-1 block">{{ errores.numero[0] }}</span>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Concepto (opcional)</label>
      <input
        v-model="form.concepto"
        type="text"
        maxlength="255"
        placeholder="Concepto del deposito"
        class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Observaciones (opcional)</label>
      <textarea
        v-model="form.observaciones"
        rows="2"
        maxlength="500"
        class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-lg px-3 py-2"
      ></textarea>
    </div>

    <label class="flex items-center gap-2 cursor-pointer text-sm mb-6">
      <input v-model="form.activo" type="checkbox" class="accent-primary" />
      <span>Cuenta activa</span>
    </label>

    <div class="flex gap-3">
      <button class="btn px-5 flex-1 justify-center" :disabled="guardando" @click="guardar">
        {{ guardando ? 'Guardando...' : 'Guardar' }}
      </button>
      <button v-if="esEdicion" class="btn-outline px-5" :disabled="guardando" @click="cancelar">
        Cancelar
      </button>
    </div>

  </div>
</template>