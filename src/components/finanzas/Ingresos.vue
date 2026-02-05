<script setup lang="ts">
const props = defineProps<{
  income: any[]
  methodpay: string[]
}>()

// Colores suaves por método (light + dark)
const colores: Record<string, string> = {
  efectivo:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  tarjeta:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  transferencia:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
}
</script>

<template>
  <div class="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow dark:shadow-none">
    <div class="overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-y-2">

        <!-- HEAD -->
        <thead>
          <tr class="text-left text-sm text-gray-500 dark:text-gray-400">
            <th class="px-4 py-2">Día</th>
            <th class="px-4 py-2">Fecha</th>

            <th
              v-for="metodo in methodpay"
              :key="metodo"
              class="px-4 py-2 capitalize"
            >
              {{ metodo }}
            </th>

            <th class="px-4 py-2 text-right font-semibold">
              Total
            </th>
          </tr>
        </thead>

        <!-- BODY -->
        <tbody>
          <tr
            v-for="(dia, index) in income"
            :key="index"
            class="transition rounded-xl
                   bg-gray-50 dark:bg-gray-700
                   hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <td class="px-3 py-2 font-medium capitalize text-gray-700 dark:text-gray-200 text-xs">
              {{ dia.name }}
            </td>

            <td class="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">
              {{ dia.date }}
            </td>

            <!-- MÉTODOS DE PAGO -->
            <td
              v-for="metodo in methodpay"
              :key="metodo"
              class="px-3 py-2"
            >
              <span
                class="px-3 py-1 rounded-lg text-sm font-medium inline-block min-w-[72px] text-center text-xs cursor-pointer"
                :class="colores[metodo] || 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'"
                :title="metodo"

              >
                ${{ dia.paymentMethod?.[metodo] ?? 0 }}
              </span>
            </td>

            <!-- TOTAL -->
            <td class="px-3 py-2 text-right font-bold text-gray-800 dark:text-gray-100 text-xs">
              ${{ dia.total ?? 0 }}
            </td>
          </tr>

          <tr class="border-t pt-2 mt-2">
            <td colspan="2" class="px-3 py-2 font-semibold text-gray-800 dark:text-gray-100 text-sm">
              Total
            </td>
           

            <!-- TOTALES POR MÉTODO -->
            <td
              v-for="metodo in methodpay"
              :key="metodo"
              class="px-3 py-2"
              
            >
            <span class="px-3 py-1 rounded-lg text-sm font-medium inline-block min-w-[72px] text-center text-xs cursor-pointer"
              :class="colores[metodo] || 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'"
                :title="metodo"
              >
              ${{ income.reduce((sum, dia) => sum + (dia.paymentMethod?.[metodo] ?? 0), 0).toFixed(2) }}

            </span>
            </td>

            <!-- TOTAL GENERAL -->
            <td class="px-3 py-2 text-right font-bold text-gray-800 dark:text-gray-100 text-sm">
              ${{ income.reduce((sum, dia) => sum + (dia.total ?? 0), 0).toFixed(2) }}
            </td>
          </tr>
        </tbody>

      </table>
    </div>

  </div>
</template>
