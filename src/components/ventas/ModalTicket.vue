<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full flex flex-col" style="height: 75vh; max-width: 520px;">

      <!-- encabezado del modal -->
      <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 class="font-bold text-lg flex items-center gap-2">
          <i class="fa-solid fa-receipt"></i>
          {{
            props.tipo === 'cotizacion' ? 'Ticket de cotizacion'
            : props.tipo === 'credito'  ? 'Ticket de credito'
            : props.tipo === 'abono'    ? 'Ticket de abono'
            : 'Ticket de venta'
          }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- area del PDF con scroll -->
      <div class="flex-1 overflow-auto bg-gray-800">

        <!-- loading mientras carga el PDF -->
        <div v-if="cargando" class="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
          <i class="fa-solid fa-spinner fa-spin text-2xl"></i>
          <span class="text-sm">Generando ticket...</span>
        </div>

        <!-- error si fallo -->
        <div v-else-if="error" class="flex flex-col items-center justify-center h-full gap-3 text-red-500 p-4 text-center">
          <i class="fa-solid fa-circle-exclamation text-2xl"></i>
          <span class="text-sm">{{ error }}</span>
          <button @click="cargarPdf" class="text-xs text-blue-500 hover:underline">Reintentar</button>
        </div>

        <!-- PDF embebido -->
        <iframe
          v-else-if="pdfUrl"
          :src="pdfUrl ?? undefined"
          class="w-full border-0"
          style="height: 100%; display: block;"
        ></iframe>

      </div>

      <!-- botones -->
      <div class="flex gap-2 p-4 border-t dark:border-gray-700">
        <button
          class="btn flex-1 flex items-center justify-center gap-2"
          :disabled="!pdfBlob"
          @click="descargarPDF"
        >
          <i class="fa-solid fa-download"></i>
          Descargar
        </button>
        <button
          class="btn flex-1 flex items-center justify-center gap-2"
          :disabled="!pdfUrl || imprimiendo"
          @click="imprimir"
        >
          <i
              class="fa-solid"
              :class="imprimiendo ? 'fa-spinner fa-spin' : 'fa-print'"
          ></i>
          {{ imprimiendo ? 'Imprimiendo...' : 'Imprimir' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axiosInstance from '@/utils/axios'
import { useQzTray } from '@/utils/useQzTray'
import { obtenerTicketBase64 } from '@/api/ventas'
import { useConfiguracionStore } from '@/stores/configuracionStore'
import { obtenerTicketCreditoBase64, obtenerTicketAbonoBase64 } from '@/api/planes_pago'
import Swal from 'sweetalert2'

const props = defineProps<{
  id: number
  tipo: 'venta' | 'cotizacion' | 'credito' | 'abono'
  descargar?: boolean // descarga automatica
  autoImprimir?: boolean
  folio?: string  // folio real para el nombre del archivo descargado
  pagoId?: number
}>()

defineEmits(['close'])

const cargando = ref(true)
const error    = ref<string | null>(null)
const pdfUrl   = ref<string | null>(null)
const pdfBlob  = ref<Blob | null>(null)
const folio = ref(props.folio ?? '')
const zoomPdf = ref(220) // zoom base para ticket termico 80mm
const imprimiendo   = ref(false)

const configuracionStore = useConfiguracionStore()

const { imprimirPdf } = useQzTray()

onMounted(async () => {
  cargarPdf()
})

// liberamos la URL del blob cuando se destruye el componente
onUnmounted(() => {
  if (pdfUrl.value) {
    window.URL.revokeObjectURL(pdfUrl.value)
  }
})

async function cargarPdf() {
  cargando.value = true
  error.value    = null

  try {
      let ruta = ''
      if (props.tipo === 'cotizacion') {
          ruta = `/cotizaciones/${props.id}/ticket-pdf`
      } else if (props.tipo === 'credito') {
          ruta = `/planes-pago/${props.id}/ticket-pdf`
      } else if (props.tipo === 'abono') {
          ruta = `/planes-pago/${props.id}/pagos/${props.pagoId}/ticket-pdf`
      } else {
          ruta = `/ventas/${props.id}/ticket-pdf`
      }

      const res = await axiosInstance.get(ruta, { responseType: 'blob' })

      const disposition = res.headers['content-disposition'] ?? ''
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match) {
          const nombreCompleto = match[1].replace(/['"]/g, '')
          folio.value = nombreCompleto.replace('.pdf', '')
      }

      const blob = new Blob([res.data], { type: 'application/pdf' })
      pdfBlob.value = blob
      pdfUrl.value  = window.URL.createObjectURL(blob) + `#zoom=${zoomPdf.value}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`

      if (props.descargar) {
          setTimeout(() => descargarPDF(), 500)
      }

      // impresion automatica: solo desde flujo de venta nueva con el prop activado
      if (
          props.autoImprimir &&
          configuracionStore.impresion_automatica &&
          configuracionStore.impresora_ticket &&
          props.tipo !== 'cotizacion'
      ) {
          await imprimir()
      }

  } catch (e: any) {
      console.error('Error al cargar el PDF:', e)
      error.value = 'No se pudo generar el ticket. Intente de nuevo.'
  } finally {
      cargando.value = false
  }
}

function descargarPDF() {
  if (!pdfBlob.value) return

  const url  = window.URL.createObjectURL(pdfBlob.value)
  const link = document.createElement('a')
  link.href     = url
  link.download = `${folio.value}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

async function imprimir() {
  if (!pdfUrl.value) return

  if (props.tipo === 'cotizacion') {
      const ventana = window.open(pdfUrl.value, '_blank')
      if (ventana) {
          ventana.addEventListener('load', () => {
              ventana.focus()
              ventana.print()
          })
      }
      return
  }

  if (!configuracionStore.impresora_ticket) {
      Swal.fire({
          icon: 'warning',
          title: 'Sin impresora configurada',
          text: 'Ve a Configuracion y selecciona una impresora de tickets.',
          confirmButtonText: 'Entendido',
      })
      return
  }

  imprimiendo.value = true
  try {
      let resultado: { pdf_base64: string; nombre_archivo: string }

      if (props.tipo === 'venta') {
          resultado = await obtenerTicketBase64(props.id)
      } else if (props.tipo === 'credito') {
          resultado = await obtenerTicketCreditoBase64(props.id)
      } else {
          resultado = await obtenerTicketAbonoBase64(props.id, props.pagoId!)
      }

      await imprimirPdf(
          configuracionStore.impresora_ticket,
          resultado.pdf_base64,
          configuracionStore.impresora_ancho
      )

      Swal.fire({
          icon: 'success',
          title: 'Imprimiendo...',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
      })

  } catch (e: any) {
      console.error('Error al imprimir con QZ Tray:', e)
      Swal.fire({
          icon: 'error',
          title: 'Error al imprimir',
          text: 'Verifique que QZ Tray este instalado y ejecutandose.',
          confirmButtonText: 'Entendido',
      })
  } finally {
      imprimiendo.value = false
  }
}
</script>
