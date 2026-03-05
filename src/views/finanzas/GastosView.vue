<script setup lang="ts">
import ResumenGasto from '@/components/finanzas/ResumenGasto.vue'
import { fetchGastos, deleteGasto } from '@/api/finanzas'
import { ref, onMounted, watch, computed } from "vue"
import DataTable from '@/components/plantillas/DataTable.vue'
import PlaceloadList from '@/components/placeload/PlaceLoadList.vue'
import ModalGasto from '@/components/finanzas/ModalGastos.vue'
import Swal from 'sweetalert2'

const year            = ref<number>(0)
const month           = ref<number>(0)

const showModal = ref(false)
const gastoEdit = ref<any | null>(null)

const load = ref<boolean>(false)
const tgastos = ref<any[]>([])
const totalPages = ref<number>(1)
const currentPage = ref<number>(1)

const total = ref<number>(0)
const startIndex = ref<number>(0)
const endIndex = ref<number>(0)
const filters = ref({
  search: '',
  status: ''
})

// columnas de la tabla 
const columns = [
  {
    key: 'fecha',
    label: 'Fecha'
  },
  {
    key: 'tipo_gasto.name',
    label: 'Tipo Gasto'
  },
  {
    key: 'concepto',
    label: 'Concepto'
  },
  {
    key: 'monto',
    label: 'Monto'
  },
  {
    key: 'metodo_pago.nombre',
    label: 'Método de Pago'
  },
  {
    key: 'state',
    label: 'Estado'
  }
]

onMounted(() => {
  obtenerGastos()
})

const obtenerGastos = async (page = 1) => {
  try {
    load.value = true

    const pagination = await fetchGastos({
      page,
      search: filters.value.search,
      status: filters.value.status,
      month: month.value,
      year: year.value,
    })

    tgastos.value = pagination.gastos.data
    created_at.value = pagination.created_at
    currentPage.value = pagination.gastos.current_page
    totalPages.value = pagination.gastos.last_page
    total.value = pagination.gastos.total

    startIndex.value = pagination.gastos.from - 1
    endIndex.value = pagination.gastos.to - 1

    // inicializar filtros solo la primera vez
    if (!year.value && createdYear.value) {
      year.value = currentYear
      month.value = currentMonth
    }

  } catch (error) {
    console.error('Error al obtener gastos:', error)
  } finally {
    load.value = false
  }
}

const created_at = ref<string>('')

const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth() + 1

const createdDate = computed(() => {
  return created_at.value ? new Date(created_at.value) : null
})

const createdYear = computed(() => createdDate.value?.getFullYear())
const createdMonth = computed(() => createdDate.value?.getMonth()! + 1)

const years = computed(() => {
  if (!createdYear.value) return []
  const list = []
  for (let y = createdYear.value; y <= currentYear; y++) {
    list.push(y)
  }
  return list
})

const months = computed(() => {
  if (!year.value) return []

  let start = 1
  let end = 12

  // Año de creación
  if (year.value === createdYear.value) {
    start = createdMonth.value
  }

  // Año actual
  if (year.value === currentYear) {
    end = currentMonth
  }

  const list = []
  for (let m = start; m <= end; m++) {
    list.push({
      value: m,
      label: new Date(0, m - 1).toLocaleString('es-MX', { month: 'long' })
    })
  }

  return list
})

watch(year, () => {
  if (!months.value.find(m => m.value === month.value)) {
    month.value = months.value[0]?.value ?? 0
  }
})

watch([year, month], ([newYear, newMonth]) => {
  if (newYear && newMonth) {
    obtenerGastos()
  }
})

// funciones de paginacion
const paginate = (page: number) => {
  obtenerGastos(page)
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    obtenerGastos(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    obtenerGastos(currentPage.value - 1)
  }
}

// abrir modal para crear
const openCreateModal = () => {
  gastoEdit.value = null
  showModal.value = true
}

// abrir modal para editar
const handleEdit = (item: any) => {
  gastoEdit.value = item
  showModal.value = true
}

// eliminar gasto
const handleDelete = async (id: number) => {
  const result = await Swal.fire({
    title: 'Eliminar gasto?',
    text: 'Esta accion no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Si, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    load.value = true

    await deleteGasto(id)

    Swal.fire({
      icon: 'success',
      title: 'Gasto eliminado',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })

    // refrescamos la lista, si era el ultimo de la pagina retrocedemos
    await obtenerGastos(
      tgastos.value.length === 1 && currentPage.value > 1
        ? currentPage.value - 1
        : currentPage.value
    )

  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: error.response?.data?.message || 'Ocurrio un error',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    })
  } finally {
    load.value = false
  }
}

// cuando se guarda un gasto desde el modal
const gastoGuardado = () => {
  showModal.value = false
  obtenerGastos(currentPage.value)
}



</script>

<template>
  <PlaceloadList v-if="load" />

  <!-- filtros de fecha -->
  <div v-else
    class="min-w-[140px] flex flex-wrap items-center justify-end gap-3 mb-6
           bg-white dark:bg-gray-800
           border border-gray-200 dark:border-gray-700
           rounded-2xl px-4 py-3 shadow-sm"
  >
    <div class="relative">
      <i class="fas fa-calendar-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      <select
        v-model="year"
        class="pl-12 pr-4 py-2 text-sm rounded-xl min-w-[160px]
               bg-gray-50 dark:bg-gray-700
               text-gray-800 dark:text-gray-100
               border border-gray-300 dark:border-gray-600
               focus:ring-2 focus:ring-green-400 focus:border-green-500
               transition"
      >
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <div class="relative">
      <i class="fas fa-calendar-day absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      <select
        v-model="month"
        class="pl-12 pr-4 py-2 text-sm rounded-xl min-w-[160px]
               bg-gray-50 dark:bg-gray-700
               text-gray-800 dark:text-gray-100
               border border-gray-300 dark:border-gray-600
               focus:ring-2 focus:ring-green-400 focus:border-green-500
               transition capitalize"
      >
        <option v-for="m in months" :key="m.value" :value="m.value">
          {{ m.label }}
        </option>
      </select>
    </div>
  </div>

  <!-- contenido principal -->
  <div v-if="!load">
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">

      <!-- tabla de gastos -->
      <div class="col-span-12 lg:col-span-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Gastos
          </h2>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5
                   text-xs font-medium
                   bg-primary text-white
                   rounded-lg shadow-sm
                   hover:bg-green-500
                   transition"
            title="Registrar nuevo gasto"
            @click="openCreateModal"
          >
            <i class="fas fa-plus text-[11px]"></i>
            Registrar
          </button>
        </div>

        <!-- modal de gasto -->
        <ModalGasto
          v-if="showModal"
          :gasto="gastoEdit"
          @close="showModal = false"
          @saved="gastoGuardado"
        />

        <!-- tabla -->
        <DataTable
          :items="tgastos"
          :columns="columns"
          :currentPage="currentPage"
          :totalPages="totalPages"
          :total="total"
          :startIndex="startIndex"
          :endIndex="endIndex"
          :paginate="paginate"
          :nextPage="nextPage"
          :prevPage="prevPage"
          @delete="handleDelete"
          @edit="handleEdit"
        />
      </div>

      <!-- resumen lateral con grafica -->
      <div class="col-span-12 lg:col-span-4">
        <ResumenGasto
          :month="month"
          :year="year"
        />
      </div>

    </div>
  </div>
</template>