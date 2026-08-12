<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import DataTable from '@/components/plantillas/DataTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import CuentaDepositoForm from '@/components/suscripcion/CuentaDepositoForm.vue'
import { fetchCuentasAdmin, eliminarCuenta } from '@/api/suscripcion'
import { descargarCuentasActivasPdf, descargarCuentaPdf } from '@/api/suscripcion'
import { descargarBlob } from '@/utils/descargarArchivo'

const router = useRouter()

const cuentas      = ref<any[]>([])
const total        = ref(0)
const currentPage  = ref(1)
const totalPages   = ref(1)
const startIndex   = ref(0)
const endIndex     = ref(0)
const loading      = ref(false)

const cuentaSeleccionada = ref<any | null>(null)
const exportandoTodas = ref(false)
const exportandoId = ref<number | null>(null)

// columnas que se renderizaran en la tabla
const columns = [
  { key: 'banco',       label: 'Banco' },
  { key: 'titular',     label: 'Titular' },
  { key: 'tipo_cuenta', label: 'Tipo' },
  { key: 'numero',      label: 'Numero' },
  { key: 'concepto',    label: 'Concepto' },
  { key: 'activo',      label: 'Activo' },
]

const etiquetasTipo: Record<string, string> = {
  cuenta:  'Cuenta',
  tarjeta: 'Tarjeta',
  clabe:   'CLABE',
  otro:    'Otro',
}

async function loadCuentas(p = 1) {
  loading.value = true
  try {
    const res = await fetchCuentasAdmin({ page: p })
    const data = res.data.cuentas
    cuentas.value    = data.data
    currentPage.value = data.current_page
    totalPages.value  = data.last_page
    total.value       = data.total
    startIndex.value  = (data.from ?? 1) - 1
    endIndex.value    = (data.to ?? 0) - 1
  } catch {
    cuentas.value = []
  } finally {
    loading.value = false
  }
}

function paginate(page: number) {
  currentPage.value = page
  loadCuentas(page)
}

function nextPage() {
  if (currentPage.value < totalPages.value) paginate(currentPage.value + 1)
}

function prevPage() {
  if (currentPage.value > 1) paginate(currentPage.value - 1)
}

function seleccionar(item: any) {
  cuentaSeleccionada.value = { ...item }
}

function onGuardado() {
  cuentaSeleccionada.value = null
  loadCuentas(currentPage.value)
}

async function handleDelete(item: any) {
  const result = await Swal.fire({
    title: 'Eliminar cuenta?',
    text: 'La cuenta dejara de mostrarse, pero los pagos registrados la conservan',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor:  '#d33',
    confirmButtonText:  'Si, eliminar',
    cancelButtonText:   'Cancelar',
  })

  if (!result.isConfirmed) return

  try {
    await eliminarCuenta(item.id)

    Swal.fire({
      title: 'Eliminada',
      text: 'La cuenta ha sido eliminada.',
      icon: 'success',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })

    // si estaba en edicion se limpia el formulario
    if (cuentaSeleccionada.value?.id === item.id) {
      cuentaSeleccionada.value = null
    }

    await loadCuentas(currentPage.value)
  } catch (e: any) {
    const mensaje = e.response?.data?.data?.message || e.response?.data?.message ||
      'No se pudo eliminar la cuenta'
    Swal.fire({
      title: 'Advertencia',
      text: mensaje,
      icon: 'warning',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
  }
}

async function exportarTodas() {
  exportandoTodas.value = true
  try {
    const blob = await descargarCuentasActivasPdf()
    descargarBlob(blob, 'cuentas-deposito.pdf')
  } catch {
    Swal.fire({
      title: 'No se pudo exportar',
      icon: 'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
  } finally {
    exportandoTodas.value = false
  }
}

async function exportarUna(item: any) {
  exportandoId.value = item.id
  try {
    const blob = await descargarCuentaPdf(item.id)
    descargarBlob(blob, `cuenta-deposito-${item.id}.pdf`)
  } catch {
    Swal.fire({
      title: 'No se pudo exportar',
      icon: 'error',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
    })
  } finally {
    exportandoId.value = null
  }
}

onMounted(() => {
  loadCuentas()
})
</script>

<template>
  <TopBanner title="Cuentas de deposito">
    <div class="flex justify-end gap-4 lg:gap-6">
      <button class="btn-outline" @click="router.push({ name: 'suscripciones' })">
        <i class="fa-solid fa-arrow-left"></i>
        Suscripciones
      </button>
      <button class="btn-outline" :disabled="exportandoTodas" @click="exportarTodas">
        <i class="fa-solid" :class="exportandoTodas ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i>
        {{ exportandoTodas ? 'Exportando...' : 'Exportar activas' }}
      </button>
    </div>
  </TopBanner>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 xxl:gap-6">

    <!-- formulario en la misma vista -->
    <div class="xl:col-span-1">
      <CuentaDepositoForm
        :cuenta="cuentaSeleccionada"
        @saved="onGuardado"
        @cancel="cuentaSeleccionada = null"
      />
    </div>

    <!-- listado -->
    <div class="xl:col-span-2">
      <DataTable
        :items="cuentas"
        :columns="columns"
        :currentPage="currentPage"
        :totalPages="totalPages"
        :total="total"
        :startIndex="startIndex"
        :endIndex="endIndex"
        :paginate="paginate"
        :nextPage="nextPage"
        :prevPage="prevPage"
      >
        <template #cell="{ column, value }">
          <template v-if="column.key === 'tipo_cuenta'">
            {{ etiquetasTipo[value] || value }}
          </template>

          <template v-else-if="column.key === 'activo'">
            <span
              class="inline-block px-2 py-0.5 rounded text-xs font-medium"
              :class="value
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300'"
            >
              {{ value ? 'Si' : 'No' }}
            </span>
          </template>

          <template v-else>
            {{ value ?? '--' }}
          </template>
        </template>

        <template #actions="{ item }">
          <div class="flex justify-center gap-1">
            <button
              class="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-blue-600 dark:text-blue-400"
              title="Editar"
              @click="seleccionar(item)"
            >
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button
              class="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-red-600 dark:text-red-400"
              title="Eliminar"
              @click="handleDelete(item)"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
            <button
              class="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300 disabled:opacity-50"
              title="Exportar PDF"
              :disabled="exportandoId === item.id"
              @click="exportarUna(item)"
            >
              <i class="fa-solid" :class="exportandoId === item.id ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

  </div>
</template>