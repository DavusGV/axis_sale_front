<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue'
import Pagination from '../shared/Pagination.vue'
// Eliminado: ahora la paginación viene del padre
import { IconSelector } from '@tabler/icons-vue'
import SearchBar from '../shared/SearchBar.vue'
import TableActions from '../shared/TableActions.vue'
import CommonDropdown from '../shared/CommonDropdown.vue'

const props = defineProps({
  items: Array,
  total: Number,
  currentPage: Number,
  pageSize: Number,
  columns: Array,
  loading: Boolean,
  startIndex: Number,
  endIndex: Number,
  totalPages: Number,
  nextPage: Function,
  prevPage: Function,
  paginate: Function
})



</script>

<template>
  <div class="box">
    <div class="flex flex-wrap gap-3 justify-between items-center bb-dashed mb-6 pb-6">
      <p class="font-medium">Lista</p>
      <div class="flex items-center gap-4 lg:gap-8 xl:gap-10">
        <SearchBar :search="search" />
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
              <th v-for="col in props.columns" :key="col.key" class="px-3 py-5 select-none cursor-pointer">
                {{ col.label }}
              </th>
              <th class="px-3 py-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
             <tr v-for="item in props.items" :key="item.id">
              <td
                v-for="col in props.columns"
                :key="col.key"
                class="px-3 py-5"
              >
                {{ item[col.key] }}
              </td>
              <td>
                <TableActions :on-delete="() => handleDelete(item.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <Pagination
      :current-page="props.currentPage"
      :end-index="props.endIndex"
      :next-page="props.nextPage"
      :paginate="props.paginate"
      :prev-page="props.prevPage"
      :start-index="props.startIndex"
      :total-data="props.total"
      :total-pages="props.totalPages"
    />

  <div v-show="!props.items.length" class="text-center py-10">
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
</template>
