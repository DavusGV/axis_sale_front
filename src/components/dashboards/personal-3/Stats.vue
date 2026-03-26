<script setup lang="ts">
import {
  IconCashBanknote,
  IconCash,
  IconReceiptTax,
  IconReceipt,
  IconCreditCard,
  IconFileInvoice
} from '@tabler/icons-vue'
import { useRouter } from 'vue-router'

// Recibimos los datos como props desde el padre
const props = defineProps<{
  ingresos: number
  gastos: number
  ganancias: number
  creditos: number
  cotizaciones: number
  descuentos: number
}>()

const router = useRouter()

// Armamos el array de tarjetas con los datos
const states = [
  {
    amount: `$${props.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    icon: IconCashBanknote,
    title: 'Ingresos del dia',
    color: 'text-primary',
    bg: 'bg-primary/20',
    url: '/finanzas/ingresos',
  },
  {
    amount: `$${props.gastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    icon: IconReceipt,
    title: 'Gastos del dia',
    color: 'text-secondary2',
    bg: 'bg-secondary2/20',
    url: '/finanzas/gastos',
  },
  {
    amount: `$${props.ganancias.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    icon: IconCash,
    title: 'Ganancias en inversion producto',
    color: 'text-secondary4',
    bg: 'bg-secondary4/20',
    url: '/reportes/ventas',
  },
  {
    amount: `$${props.descuentos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    icon: IconReceiptTax,
    title: 'Total de descuento realizado',
    color: 'text-secondary3',
    bg: 'bg-secondary3/20',
    url: '/ventas/historial',
  },
  {
    amount: props.creditos.toString(),
    icon: IconCreditCard,
    title: 'Creditos pendientes',
    color: 'text-secondary1',
    bg: 'bg-secondary1/20',
    url: '/credito',
  },
  {
    amount: props.cotizaciones.toString(),
    icon: IconFileInvoice,
    title: 'Cotizaciones pendientes',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/20',
    url: '/cotizacion',
  },
]
</script>

<template>
  <div class="col-span-12 grid grid-cols-2 lg:grid-cols-3 gap-4 xxxl:gap-6">
    <div
      v-for="{ amount, bg, color, icon, title, url } in states"
      :key="title"
      class="col-span-1 box cursor-pointer hover:shadow-md transition"
      @click="router.push(url)"
    >
      <div class="flex justify-between items-center">
        <div>
          <h4 class="h4 mb-3">{{ amount }}</h4>
          <p class="font-medium text-sm">{{ title }}</p>
        </div>
        <div :class="[color, bg]" class="p-3 rounded-xl">
          <component :is="icon" />
        </div>
      </div>
    </div>
  </div>
</template>