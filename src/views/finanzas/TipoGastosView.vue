<script setup lang="ts">
import agregarTipoGasto from '@/components/finanzas/agregarTipoGasto.vue';
import TopBanner from '@/components/shared/TopBanner.vue';
import DataTable from '@/components/plantillas/DataTable.vue';
import { registrarTipoGasto, fetchTgastos, deleteType, editarTipoGasto} from '@/api/finanzas'
import { ref, onMounted  } from "vue";
import PlaceloadList from '@/components/placeload/PlaceLoadList.vue'
import Swal from 'sweetalert2'

const tipoGastoEditando = ref<any>(null)
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

const columns = [
  {
    key: 'name',
    label: 'Nombre'
  },
  {
    key: 'description',
    label: 'Descripción'
  },
  {
    key: 'state',
    label: 'Estado'
  }
]


const obtenerTgastos = async (page = 1) => {
  try {
    load.value = true

    const pagination = await fetchTgastos({
      page,
      search: filters.value.search,
      status: filters.value.status
    })

    tgastos.value = pagination.data
    currentPage.value = pagination.current_page
    totalPages.value = pagination.last_page
    total.value = pagination.total

    startIndex.value = pagination.from - 1
    endIndex.value = pagination.to - 1

  } catch (error) {
    console.error('Error al obtener tipos de gasto:', error)
  } finally {
    load.value = false
  }
}

const paginate = (page: number) => {
  obtenerTgastos(page)
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    obtenerTgastos(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    obtenerTgastos(currentPage.value - 1)
  }
}



const guardarTipoGasto = async (data: any) => {
  try {
    load.value = true;
     
    // Convertimos al formato que espera la API
    const payload = {
      name: data.name,
      description: data.description,
      state: data.state
    }

    const result =  await registrarTipoGasto(payload)
    Swal.fire({
        icon: 'success',
        title: 'Tipo de gasto agregado',
        text: result.name,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

    await obtenerTgastos(currentPage.value)

    load.value = false;

    console.log('Tipo de gasto guardado correctamente:', result)

  } catch (error) {
     load.value = false;

  console.error('Error al guardar:', error)

  // Obtener mensaje dinámico
  const message =
    error.response?.data?.data ||
    error.response?.data?.message ||
    'Ocurrió un error al intentar guardar el tipo de gasto.';

    Swal.fire({
      icon: 'error',
      title: 'Error al guardar tipo de gasto',
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
  }
}

const handleDelete = async (id: number) => {

  const result = await Swal.fire({
    title: '¿Eliminar tipo de gasto?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {

    load.value = true

    await deleteType(id)

    Swal.fire({
      icon: 'success',
      title: 'Eliminado correctamente',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })

    // 🔥 refrescamos la lista
    await obtenerTgastos(tgastos.value.length === 1 && currentPage.value > 1
    ? currentPage.value - 1
    : currentPage.value)

  } catch (error: any) {

    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: error.response?.data?.message || 'Ocurrió un error',
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

const handleEdit = (item: any) => {
  console.log('Editar:', item)
  tipoGastoEditando.value = item
}

const handleSearch = (item: any) => {
  console.log(item);
  filters.value.search = item.search
  filters.value.status = item.status
  obtenerTgastos(1)
}

const handleUpdate = async (data: any) => {
   const result = await Swal.fire({
    title: '¿Actualizar el Registro?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2DC25F',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, Actualizar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {

    load.value = true

      const payload = {
      id : data.id,
      name: data.name,
      description: data.description,
      state: data.state
    }

    const result =  await editarTipoGasto(payload)
    tipoGastoEditando.value = null
    Swal.fire({
      icon: 'success',
      title: 'Registro actualizado correctamente',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })

    // 🔥 refrescamos la lista
    await obtenerTgastos(tgastos.value.length === 1 && currentPage.value > 1
    ? currentPage.value - 1
    : currentPage.value)

  } catch (error: any) {

    Swal.fire({
      icon: 'error',
      title: 'Error al Actualizar Registro',
      text: error.response?.data?.data || 'Ocurrió un error',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true
    })

  } finally {
    load.value = false
  }
}

onMounted(() => {
  obtenerTgastos()
})


</script>

<template>
    <PlaceloadList v-if="load" />

    <div v-else>
        <TopBanner title="Tipos de Gastos">
        </TopBanner>
        <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
            <div class="col-span-12 lg:col-span-12">
                <agregarTipoGasto
                  :editData="tipoGastoEditando"
                  @edit="handleUpdate" 
                  @guardar="guardarTipoGasto"
                  @search="handleSearch"
                  />
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
        </div>
    </div>
</template>
