<script setup lang="ts">
import Pagination from '../shared/Pagination.vue'
import TableActions from '@/components/shared/TableActions.vue'

interface Column {
  key: string
  label: string
}

interface Item {
  id: number | string
  state?: number | string
  [key: string]: any
}

const props = defineProps<{
  items: Item[]
  columns: Column[]
  currentPage: number
  totalPages: number
  total: number
  startIndex: number
  endIndex: number
  paginate: (page: number) => void
  nextPage: () => void
  prevPage: () => void
}>()

const emit = defineEmits<{
  (e: 'changePage', page: number): void
  (e: 'delete', id: number): void
  (e: 'edit', item: Item): void
}>()

const changePage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('changePage', page)
  }
}

const emitDelete = (id: number) => {
  emit('delete', id)
}

const emitEdit = (item: Item) => {
  emit('edit', item)
}

function getValue(obj: any, path: string) {
  return path.split('.').reduce((o, i) => (o ? o[i] : null), obj)
}
</script>

<template>
  <div class="col-span-12 lg:col-span-6 box">
   
    <div class="w-full overflow-x-auto">
      <table class="w-full whitespace-nowrap">
        <thead>
            <tr class="bg-primary/5 dark:bg-bg3">
              <th v-for="col in columns" :key="col.key" class="py-3 font-semibold px-4 text-start text-sm">
                {{ col.label }}
              </th>

              <th class="py-3 font-semibold px-4 text-center text-sm">Acciones</th>
            </tr>
        </thead>

<tbody>
  <tr 
    v-for="(item, index) in items" 
    :key="item.id" 
    class="even:bg-primary/5 dark:even:bg-bg3"
  >

    <!-- Columnas dinámicas -->
    <td
      v-for="col in columns"
      :key="col.key"
      class="px-4 py-2 text-xs"
    >
      
      <!-- Render especial para estado -->
      <template v-if="col.key === 'state'">
      <span
  :class="item.state === 1 || item.state === 'activo'
    ? 'bg-secondary4/5 text-secondary4' 
    : 'bg-secondary2/5 text-secondary2'"
  class="inline-block text-xs px-3 py-1 text-center rounded-full border"
>
  {{ item.state === 1 || item.state === 'activo' ? 'Activo' : 'Inactivo' }}
</span>
      </template>

      <!-- Render normal -->
      <template v-else>
        {{ getValue(item, col.key) ?? '--' }}
      </template>

    </td>

    <!-- Acciones -->
    <td class="py-3">
      <div class="flex justify-center items-center">
        <TableActions
          :from-bottom="index >= items.length - 2"
          :on-edit="() => emitEdit(item)"
          :on-delete="() => emitDelete(Number(item.id))"
        />
      </div>
    </td>

  </tr>
</tbody>
      </table>

      <Pagination
        v-if="items.length"
        :current-page="currentPage"
        :start-index="startIndex"
        :end-index="endIndex"
        :total-data="total"
        :total-pages="totalPages"
        :paginate="paginate"
        :next-page="nextPage"
        :prev-page="prevPage"
      />

    </div>
  </div>
</template>