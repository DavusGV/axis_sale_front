<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FlexListTwo from '@/components/cajas/CajasTable.vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import HistorialCaja from '@/components/cajas/historialCaja.vue'

const selectedBoxId = ref<number | null>(null)
const currentView = ref<'cajas' | 'historial'>('cajas')

function openHistory(boxId: number) {
  console.log('Box seleccionada:', boxId)

  // Guardar el ID de la caja seleccionada y la vista actual en sessionStorage
  sessionStorage.setItem('activeBoxId', String(boxId))
  sessionStorage.setItem('currentView', 'historial')

  selectedBoxId.value = boxId
  currentView.value = 'historial'
}

// Función para cerrar el modal de historial y regresar a la vista de cajas
function closeHistoryModal() {
  sessionStorage.removeItem('activeBoxId')
  sessionStorage.removeItem('currentView')

  currentView.value = 'cajas'
  selectedBoxId.value = null
}

onMounted(() => {
  // Al recargar el componente verifica si hay una vista guardada en sessionStorage  
  const savedView = sessionStorage.getItem('currentView')
  const savedBoxId = sessionStorage.getItem('activeBoxId')

  if (savedView === 'historial' && savedBoxId) {
    currentView.value = 'historial'
    selectedBoxId.value = Number(savedBoxId)
  }
})

const PagesTitle = computed(() => {
  return currentView.value === 'historial' 
      ? 'Historial de Caja' 
      : 'Cajas'
})
</script>

<template>

  <div class="flex items-center justify-between mb-4">
    <TopBanner :title="PagesTitle" />

    <button
      v-if="currentView === 'historial'"
      class="btn btn-sm"
      @click="closeHistoryModal"
    >
      <i class="fas fa-arrow-left fa-sm"></i>
      Regresar
    </button>
  </div>

  <FlexListTwo
v-if="currentView === 'cajas'"
    @view-history="openHistory"
  />

  <HistorialCaja
    :show="currentView === 'historial' && !!selectedBoxId"
    :historyId="selectedBoxId"
    @close="closeHistoryModal"
  />
</template>