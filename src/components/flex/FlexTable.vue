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
    <div
      class="flex flex-wrap gap-4 justify-between items-center
             border-b border-dashed border-gray-300 dark:border-gray-700
             mb-6 pb-5"
    >
      <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">
        Lista
      </p>

      <SearchBar :search="props.search" />
    </div>

    <!-- Table wrapper -->
    <div
      class="overflow-x-auto p-5 lg:p-7 rounded-2xl
             bg-primary/5 dark:bg-bg3 mb-6"
    >
      <div
        class="bg-white dark:bg-bg4 rounded-xl px-4 py-2 min-w-min shadow-sm"
      >
        <table
          class="w-full whitespace-nowrap border-separate"
          :style="{ borderSpacing: '0 14px' }"
        >
          <!-- HEAD -->
          <thead>
            <tr class="text-gray-700 dark:text-gray-200">
              <th
                v-for="col in props.columns"
                :key="col.key"
                class="px-4 py-4 text-left text-base font-semibold"
              >
                {{ col.label }}
              </th>

              <th class="px-4 py-4 text-center text-base font-semibold">
                Acciones
              </th>
            </tr>
          </thead>

          <!-- BODY -->
          <tbody>
            <tr
              v-for="item in props.items"
              :key="item.id"
              class="bg-white dark:bg-bg4
                     hover:bg-primary/10 dark:hover:bg-bg3
                     transition rounded-xl shadow-sm"
            >
              <td
                v-for="col in props.columns"
                :key="col.key"
                class="px-4 py-5 text-base text-gray-800 dark:text-gray-100"
              >
                {{ item[col.key] ?? '—' }}
              </td>

              <td class="px-4 py-5 text-center">
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
      v-if="props.items.length"
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
    <div
      v-if="!props.items.length && !props.loading"
      class="text-center py-16"
    >
      <div class="max-w-[520px] mx-auto flex flex-col items-center">
        <h3 class="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
          No hay resultados
        </h3>
        <p class="text-base text-gray-500">
          Intenta con otros términos de búsqueda.
        </p>
      </div>
    </div>

  </div>
</template>

