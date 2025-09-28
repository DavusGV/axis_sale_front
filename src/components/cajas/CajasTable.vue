<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconSearch } from '@tabler/icons-vue'
import Pagination from '../shared/Pagination.vue'
import { useTableFunctions } from '@/utils/tableFunction'
import { flexListTwo } from '@/data/fakedata'
import { IconSelector } from '@tabler/icons-vue'
import SearchBar from '../shared/SearchBar.vue'
import TableActions from '../shared/TableActions.vue'
import CommonDropdown from '../shared/CommonDropdown.vue'
import { fetchCajas } from '@/api/cajas' // Ajusta la ruta si es diferente
import AbrirCajaModal from '@/components/cajas/AbrirCajaModal.vue'
import CerrarCajaModal from '@/components/cajas/CerrarCajaModal.vue'

// Carga y manejo de datos desde la API
const cajas = ref([])
const isLoading = ref(true)
const error = ref('')
const showModal = ref(false)
const showModalClose = ref(false)
const cajaSeleccionadaId = ref<number|null>(null)

const {
  currentPage,
  deleteItem,
  endIndex,
  nextPage,
  paginate,
  paginatedData,
  prevPage,
  search,
  sortData,
  startIndex,
  tableData,
  totalData,
  totalPages
} = useTableFunctions(flexListTwo, 10)

const handleDelete = (id: number) => {
  if (confirm('Are you sure?')) {
    deleteItem(id)
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
      // actualiza los datos en el composable
      await onCajaSaved()
  } catch (err: any) {
    isLoading.value = false
    error.value = err.message || 'Error al cargar cajas'
  }
})

function openAperturaModal(cajaId: number) {
  cajaSeleccionadaId.value = cajaId
  showModal.value = true
}

function closeCajaModal(cajaId: number) {
  cajaSeleccionadaId.value = cajaId
  showModalClose.value = true
}

async function onCajaSaved() {
   const res = await fetchCajas()
    cajas.value = res.data      // Ajusta según la respuesta de tu API
    // Si tu API retorna solo el array, usa: cajas.value = res
    isLoading.value = false
    setTableData(cajas.value) // Esta función debe llamar fetchCajas y setTableData
}

</script>

<template>
  <div class="box">
    <div class="flex flex-wrap gap-3 justify-between items-center bb-dashed mb-6 pb-6">
      <p class="font-medium">Lista de cajas</p>
      <div class="flex items-center gap-4 lg:gap-8 xl:gap-10">
        <SearchBar :search="search" />
        <div class="flex items-center gap-2">
          <p class="whitespace-nowrap">Sort By :</p>
          <CommonDropdown :options="[{ name: 'id' }, { name: 'nombre' }, { name: 'status' }]" />
        </div>
      </div>
    </div>
    <div class="overflow-x-auto p-4 lg:p-6 rounded-2xl bg-primary/5 dark:bg-bg3 mb-6">
      <div class="bg-n0 dark:bg-bg4 rounded-xl px-3 min-w-min">
        <table
          :border="0"
          :cellPadding="0"
          :cellSpacing="0"
          :style="{ borderSpacing: '0 12px' }"
          class="w-full whitespace-nowrap p-0 border-none border-separate"
        >
          <thead>
            <tr class="font-semibold">
              <td @click="sortData('id')" class="w-14">
                <div
                  class="px-3 py-5 pl-6 bg-primary/5 dark:bg-bg3 flex items-center gap-1 select-none cursor-pointer rounded-s-xl"
                >
                  # <IconSelector :size="18" />
                </div>
              </td>
              <td @click="sortData('name')">
                <div
                  class="bg-primary/5 dark:bg-bg3 flex items-center gap-1 select-none cursor-pointer px-3 py-5"
                >
                  Nombre <IconSelector :size="18" />
                </div>
              </td>
              
              <td @click="sortData('status')">
                <div
                  class="bg-primary/5 dark:bg-bg3 flex items-center gap-1 select-none cursor-pointer px-3 py-5"
                >
                  Status <IconSelector :size="18" />
                </div>
              </td>
              <td @click="sortData('status')">
                
                <div
                  class="bg-primary/5 dark:bg-bg3 flex items-center gap-1 select-none cursor-pointer px-3 py-5"
                >
                  Cambiar Estado <IconSelector :size="18" />
                </div>
              </td>
              
              <td>
                <div class="bg-primary/5 dark:bg-bg3 px-3 py-5 text-center rounded-e-xl">
                  Action
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(
                { id, nombre, abierta }, index
              ) in cajas"
              :key="id"
            >
              <td>
                <div class="py-5 pl-6 px-3 bg-primary/5 dark:bg-bg3 rounded-s-lg">
                  {{  id }}
                </div>
              </td>
              <td>
                <div class="py-5 pl-6 px-3 bg-primary/5 dark:bg-bg3 rounded-s-lg">
                  {{ nombre }}
                </div>
              </td>
              
              <td>
                <div class="bg-primary/5 dark:bg-bg3 px-3 py-[13px]">
                  <span
                    class="block text-xs w-28 xxl:w-36 text-center rounded-[30px] dark:border-n500 border border-n30 py-2.5"
                    :class="{
                      'bg-primary/10 dark:bg-bg3 text-primary': abierta == 1,
                      'bg-secondary2/10 dark:bg-bg3 text-secondary2': abierta == 0,
            
                    }"
                  >
                    {{ abierta == 1 ? 'Abierta' : 'Cerrada' }}
                  </span>
                </div>
              </td>

              <td>
                <div class="bg-primary/5 dark:bg-bg3 px-3 py-[13px] flex justify-center">
                <button
                  v-if="!abierta"
                  @click="openAperturaModal(id)"
                  class="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Abrir
                </button>
                <button
                  v-else
                  @click="closeCajaModal(id)"
                  class="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Cerrar
                </button>
                </div>
              </td>
              <td>
                <div
                  class="flex justify-center items-center py-[21px] px-3 bg-primary/5 dark:bg-bg3 rounded-e-xl"
                >
                  <TableActions
                    :from-bottom="
                      index == paginatedData.length - 1 || index == paginatedData.length - 2
                    "
                    :on-delete="() => handleDelete(id)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <Pagination
      :current-page="currentPage"
      :end-index="endIndex"
      :next-page="nextPage"
      :paginate="paginate"
      :prev-page="prevPage"
      :start-index="startIndex"
      :total-data="totalData"
      :total-pages="totalPages"
    />

    <div v-show="!tableData.length" class="text-center py-10">
      <div class="text-center mx-auto max-w-[500px] max-md:flex flex-col items-center">
        <div class="flex justify-center mb-5">
          <IconSearch :size="60" class="text-primary" />
        </div>
        <h3 class="h3 mb-3 lg:mb-6">No matching results</h3>
        <p>
          Looks like we couldn&nbsp;t find any matching results for your search terms. Try other
          search terms.
        </p>
      </div>
    </div>
  </div>
  <AbrirCajaModal
  :show="showModal"
  :cajaId="cajaSeleccionadaId"
  @close="showModal = false"
  @saved="onCajaSaved"
/>

<CerrarCajaModal
  :show="showModalClose"
  :cajaId="cajaSeleccionadaId"
  @close="showModalClose = false"
  @saved="onCajaSaved"
/>
</template>

