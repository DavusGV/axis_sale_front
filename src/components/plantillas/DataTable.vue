<script setup lang="ts">
import Pagination from '../shared/Pagination.vue'

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
            <th
              v-for="col in columns"
              :key="col.key"
              class="py-3 font-semibold px-4 text-start text-sm"
            >
              {{ col.label }}
            </th>
            <!-- acciones solo si existe slot -->
            <th v-if="$slots.actions" class="py-3 font-semibold px-4 text-center text-sm">
              Acciones
            </th>
          </tr>
        </thead>

        <!-- body -->
        <tbody>
          <tr v-for="(item, index) in items" :key="item.id"
            class="even:bg-primary/5 dark:even:bg-bg3"
          >

            <!-- columnas -->
            <td v-for="col in columns" :key="col.key"
              class="px-4 py-2 text-xs"
            >
              <!-- estado -->
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

              <template v-else>
                {{ getValue(item, col.key) ?? '--' }}
              </template>

            </td>
            <td v-if="$slots.actions" class="py-3">
              <div class="flex justify-center items-center gap-2">
                <slot
                  name="actions"
                  :item="item"
                  :index="index"
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