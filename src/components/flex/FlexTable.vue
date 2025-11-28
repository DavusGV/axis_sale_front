<script setup lang="ts">
import Pagination from '../shared/Pagination.vue'
import SearchBar from '../shared/SearchBar.vue'
import TableActions from '../shared/TableActions.vue'

const props = defineProps<{
  items: any[]
  total: number
  currentPage: number
  startIndex: number
  endIndex: number
  totalPages: number
  paginate: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  columns: { key: string, label: string }[]
  loading: boolean
  handleEdit: (item: any) => void
  handleDelete: (id: number) => void
  search: (event: any) => void
}>()
</script>

<template>
  <div class="box">

    <!-- Top tools -->
    <div class="flex flex-wrap gap-3 justify-between items-center bb-dashed mb-6 pb-6">
      <p class="font-medium">Lista</p>
      <SearchBar :search="props.search" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto p-4 lg:p-6 rounded-2xl bg-primary/5 dark:bg-bg3 mb-6">
      <div class="bg-n0 dark:bg-bg4 rounded-xl px-3 min-w-min">
        <table
          class="w-full whitespace-nowrap p-0 border-none border-separate"
          :style="{ borderSpacing: '0 12px' }"
        >
          <thead>
            <tr class="font-semibold">
              <th
                v-for="col in props.columns"
                :key="col.key"
                class="px-3 py-5"
              >
                {{ col.label }}
              </th>
              <th class="px-3 py-5 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in props.items"
              :key="item.id"
            >
              <td
                v-for="col in props.columns"
                :key="col.key"
                class="px-3 py-5"
              >
                {{ item[col.key] }}
              </td>

              <td class="text-center">
                <TableActions
                  :fromBottom="false"
                  :on-edit="() => props.handleEdit(item)"
                  :on-delete="() => props.handleDelete(item.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <Pagination
      :current-page="props.currentPage"
      :start-index="props.startIndex"
      :end-index="props.endIndex"
      :total-data="props.total"
      :total-pages="props.totalPages"
      :paginate="props.paginate"
      :next-page="props.nextPage"
      :prev-page="props.prevPage"
    />

    <!-- Empty State -->
    <div v-show="!props.items.length" class="text-center py-10">
      <div class="max-w-[500px] mx-auto flex flex-col items-center">
        <h3 class="h3 mb-3 lg:mb-6">No matching results</h3>
        <p>Try different search terms.</p>
      </div>
    </div>

  </div>
</template>
