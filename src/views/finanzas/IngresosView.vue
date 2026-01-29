<script setup lang="ts">
import PlaceloadList from '@/components/placeload/PlaceLoadList.vue'
import { getIncome } from '@/api/ventas'
import { useAuthStore } from '@/stores/authStore'
import { ref, onMounted, computed, watch } from 'vue'
import Ingresos from '@/components/finanzas/Ingresos.vue'

const authStore        = useAuthStore();
const income          = ref<any[]>([])
const methodpay       = ref<any[]>([])
const year            = ref<number>(0)
const month           = ref<number>(0)
const load            = ref<boolean>(true)
const created_at      = ref<string>('');
const idestablishment = ref<number>(authStore.establishmentActive || 0);

    const today = new Date()

const currentYear = today.getFullYear()
const currentMonth = today.getMonth() + 1

const createdDate = computed(() => {
  return created_at.value ? new Date(created_at.value) : null
})

const createdYear = computed(() => createdDate.value?.getFullYear())
const createdMonth = computed(() => createdDate.value?.getMonth()! + 1)


const years = computed(() => {
  if (!createdYear.value) return []

  const list = []
  for (let y = createdYear.value; y <= currentYear; y++) {
    list.push(y)
  }
  return list
})


const months = computed(() => {
  if (!year.value) return []

  let start = 1
  let end = 12

  // Año de creación
  if (year.value === createdYear.value) {
    start = createdMonth.value
  }

  // Año actual
  if (year.value === currentYear) {
    end = currentMonth
  }

  const list = []
  for (let m = start; m <= end; m++) {
    list.push({
      value: m,
      label: new Date(0, m - 1).toLocaleString('es-MX', { month: 'long' })
    })
  }

  return list
})


watch(year, () => {
  if (!months.value.find(m => m.value === month.value)) {
    month.value = months.value[0]?.value ?? null
  }
})

watch([year, month], ([newYear, newMonth]) => {
  if (newYear && newMonth) {
    Income()
  }
})



async function Income() {

    const payload = {
        year: year.value,
        month: month.value,
        idestablishment: idestablishment.value,
    }
    load.value = true

    const res = await getIncome(payload)
    income.value = res.data.income
    methodpay.value = res.data.paymentMethod
    created_at.value = res.data.created_at;
    console.log(methodpay.value);

     // Inicializar filtros SOLO la primera vez
    if (!year.value && createdYear.value) {
        year.value = currentYear
        month.value = currentMonth
    }
    load.value = false
}

onMounted(async () => {
  await Income()
})

</script>

<template>
    <PlaceloadList v-if="load" />
    <div v-else
  class=" min-w-[140px] flex flex-wrap items-center justify-end gap-3 mb-6
         bg-white dark:bg-gray-800
         border border-gray-200 dark:border-gray-700
         rounded-2xl px-4 py-3 shadow-sm" 
>

<div class="relative">
  <i class="fas fa-calendar-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
  <select
  v-model="year"
  class="pl-12 pr-4 py-2 text-sm rounded-xl
         min-w-[160px]
         bg-gray-50 dark:bg-gray-700
         text-gray-800 dark:text-gray-100
         border border-gray-300 dark:border-gray-600
         focus:ring-2 focus:ring-green-400 focus:border-green-500
         transition"
>

    <option v-for="y in years" :key="y" :value="y">
      {{ y }}
    </option>
  </select>
</div>


       <div class="relative">
  <i class="fas fa-calendar-day absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

  <select
    v-model="month"
    class="pl-12 pr-4 py-2 text-sm rounded-xl
           bg-gray-50 dark:bg-gray-700
           text-gray-800 dark:text-gray-100
           border border-gray-300 dark:border-gray-600
           focus:ring-2 focus:ring-green-400 focus:border-green-500
         min-w-[160px]
           transition capitalize "
  >
    <option
      v-for="m in months"
      :key="m.value"
      :value="m.value"
    >
      {{ m.label }}
    </option>
  </select>
</div>

    </div>
    <Ingresos :income="income" :methodpay="methodpay" v-if="!load"/>
</template>
