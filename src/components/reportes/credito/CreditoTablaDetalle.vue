<script setup lang="ts">
defineProps<{ detalle: any[] }>()

function formatFecha(fecha: string) {
  if (!fecha) return '—'
  const date = new Date(fecha)
  if (isNaN(date.getTime())) return fecha
  return date.toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    timeZone: 'America/Mexico_City'
  })
}

function etiquetaEstado(estado: string) {
  const map: Record<string, string> = {
    activo:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    liquidado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    vencido:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    cancelado: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <div class="bg-n0 dark:bg-bg4 rounded-2xl border dark:border-n500 p-4 xxl:p-6">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
      <i class="fa-solid fa-table-list text-indigo-500"></i>
      Detalle de creditos
    </h3>

    <div v-if="!detalle.length" class="text-center text-gray-400 py-8">
      <i class="fa-regular fa-face-meh text-2xl mb-2"></i>
      <p class="text-sm">No hay creditos en este periodo</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase">
            <th class="px-3 py-2 text-left">Cliente</th>
            <th class="px-3 py-2 text-center">Venta</th>
            <th class="px-3 py-2 text-right">Mercancia</th>
            <th class="px-3 py-2 text-right">Anticipo</th>
            <th class="px-3 py-2 text-right">Comision</th>
            <th class="px-3 py-2 text-right">Cobrado</th>
            <th class="px-3 py-2 text-right">Saldo</th>
            <th class="px-3 py-2 text-center">Plazos</th>
            <th class="px-3 py-2 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in detalle"
            :key="item.plan_id"
            class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
          >
            <td class="px-3 py-2 font-medium text-gray-800 dark:text-gray-100">
              {{ item.cliente }}
              <span class="block text-[10px] text-gray-400">{{ item.telefono }}</span>
            </td>
            <td class="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
              #{{ item.venta_id }}
            </td>
            <td class="px-3 py-2 text-right font-medium">
              ${{ Number(item.total_venta).toFixed(2) }}
            </td>
            <td class="px-3 py-2 text-right text-green-600 font-medium">
              ${{ Number(item.anticipo).toFixed(2) }}
            </td>
            <td class="px-3 py-2 text-right text-yellow-500 font-medium">
              ${{ Number(item.comision).toFixed(2) }}
            </td>
            <td class="px-3 py-2 text-right font-bold text-emerald-600">
              ${{ Number(item.total_cobrado).toFixed(2) }}
            </td>
            <td class="px-3 py-2 text-right font-bold"
              :class="item.saldo_pendiente > 0 ? 'text-orange-500' : 'text-green-600'"
            >
              ${{ Number(item.saldo_pendiente).toFixed(2) }}
            </td>
            <td class="px-3 py-2 text-center text-gray-500 dark:text-gray-400 capitalize">
              {{ item.num_plazos }} {{ item.tipo_plazo }}
            </td>
            <td class="px-3 py-2 text-center">
              <span :class="['px-2 py-0.5 rounded-full text-[10px] font-medium capitalize', etiquetaEstado(item.estado)]">
                {{ item.estado }}
              </span>
            </td>
          </tr>
        </tbody>

        <!-- fila de totales -->
        <tfoot>
          <tr class="border-t-2 border-gray-300 dark:border-gray-600 font-semibold text-gray-800 dark:text-gray-100">
            <td class="px-3 py-3" colspan="2">Totales</td>
            <td class="px-3 py-3 text-right">
              ${{ detalle.reduce((s, i) => s + Number(i.total_venta), 0).toFixed(2) }}
            </td>
            <td class="px-3 py-3 text-right text-green-600">
              ${{ detalle.reduce((s, i) => s + Number(i.anticipo), 0).toFixed(2) }}
            </td>
            <td class="px-3 py-3 text-right text-yellow-500">
              ${{ detalle.reduce((s, i) => s + Number(i.comision), 0).toFixed(2) }}
            </td>
            <td class="px-3 py-3 text-right text-emerald-600">
              ${{ detalle.reduce((s, i) => s + Number(i.total_cobrado), 0).toFixed(2) }}
            </td>
            <td class="px-3 py-3 text-right text-orange-500">
              ${{ detalle.reduce((s, i) => s + Number(i.saldo_pendiente), 0).toFixed(2) }}
            </td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>