<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import axios from "axios"
import { IconX, IconDeviceFloppy } from "@tabler/icons-vue"
import { getType , getMethodPay} from '@/api/finanzas'


const props = defineProps({
  gasto: Object
})

const emit = defineEmits(["close","saved"])

const loading = ref(false)

const form = ref({
  tipo_gasto_id: '',
  metodo_pago_id: '',
  concepto: '',
  descripcion: '',
  monto: '',
  fecha: '',
  state: 1
})

const tiposGasto = ref<any[]>([])
const metodosPago = ref<any[]>([])


// cargar catalogos
const cargarCatalogos = async () => {

  try {

   const tg = await getType()
   const mp = await getMethodPay();

   tiposGasto.value = tg.data
   metodosPago.value = mp.data

  } catch (e) {
    console.error("Error cargando catálogos", e)
  }

}


watch(() => props.gasto, (val:any)=>{

  if(val){

    form.value = {
      tipo_gasto_id: val.tipo_gasto_id,
      metodo_pago_id: val.metodo_pago_id,
      concepto: val.concepto,
      descripcion: val.descripcion,
      monto: val.monto,
      fecha: val.fecha,
      state: val.state
    }

  }

})


const guardar = async () => {

  try{

    loading.value = true

    if(props.gasto){
      await axios.put(`/finance/gastos/${props.gasto.id}`, form.value)
    }else{
      await axios.post(`/finance/gastos`, form.value)
    }

    emit("saved")

  }catch(e){
    console.error(e)
  }finally{
    loading.value = false
  }

}


onMounted(()=>{
  cargarCatalogos()
})

</script>


<template>

<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <div class="w-[560px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl">

    <!-- header -->
    <div class="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">

      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {{ gasto ? 'Editar gasto' : 'Registrar gasto' }}
      </h2>

      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="$emit('close')"
      >
        <IconX size="18"/>
      </button>

    </div>


    <!-- body -->
    <div class="p-6 space-y-4">

      <!-- tipo gasto -->
      <div>
        <label class="text-xs text-gray-500">Tipo de gasto</label>
        <select
          v-model="form.tipo_gasto_id"
          class="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Seleccionar</option>

          <option
            v-for="tipo in tiposGasto"
            :key="tipo.id"
            :value="tipo.id"
          >
            {{ tipo.name }}
          </option>

        </select>
      </div>


      <!-- metodo pago -->
      <div>
        <label class="text-xs text-gray-500">Método de pago</label>
        <select
          v-model="form.metodo_pago_id"
          class="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >

          <option value="">Seleccionar</option>

          <option
            v-for="metodo in metodosPago"
            :key="metodo.id"
            :value="metodo.id"
          >
            {{ metodo.nombre }}
          </option>

        </select>
      </div>


      <!-- concepto -->
      <div>
        <label class="text-xs text-gray-500">Concepto</label>
        <input
          v-model="form.concepto"
          placeholder="Concepto del gasto"
          class="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>


      <!-- descripcion -->
      <div>
        <label class="text-xs text-gray-500">Descripción</label>
        <textarea
          v-model="form.descripcion"
          rows="2"
          placeholder="Descripción opcional"
          class="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        ></textarea>
      </div>


      <!-- monto -->
      <div>
        <label class="text-xs text-gray-500">Monto</label>
        <input
          type="number"
          step="0.01"
          v-model="form.monto"
          placeholder="0.00"
          class="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>


      <!-- fecha -->
      <div>
        <label class="text-xs text-gray-500">Fecha</label>
        <input
          type="date"
          v-model="form.fecha"
          class="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>


      <!-- estado -->
      <div>
        <label class="text-xs text-gray-500">Estado</label>

        <select
          v-model="form.state"
          class="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option :value="1">Activo</option>
          <option :value="0">Inactivo</option>
        </select>

      </div>

    </div>


    <!-- footer -->
    <div class="flex justify-end gap-3 px-6 py-4 border-t dark:border-gray-700">

      <button
        class="px-3 py-2 text-xs rounded-lg border"
        @click="$emit('close')"
      >
        Cancelar
      </button>

      <button
        class="flex items-center gap-2 px-3 py-2 text-xs
               bg-primary text-white rounded-lg
               hover:bg-green-500 transition"
        :disabled="loading"
        @click="guardar"
      >

        <IconDeviceFloppy size="16"/>

        {{ loading ? 'Guardando...' : 'Guardar' }}

      </button>

    </div>

  </div>

</div>

</template>