<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

      <!-- encabezado del modal -->
      <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 class="font-bold text-lg flex items-center gap-2">
          <i class="fa-solid fa-receipt"></i>
          Ticket de venta
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- area del ticket con scroll -->
      <div class="overflow-y-auto flex-1 p-2">

        <!-- ticket imprimible -->
        <div id="ticket-imprimible" class="bg-white text-gray-900 p-4 rounded font-mono text-sm">

          <!-- logo del establecimiento si existe -->
          <div class="text-center mb-3">
            <img
              v-if="ticket.logo_url"
              :src="ticket.logo_url"
              class="h-16 mx-auto object-contain mb-2"
              alt="Logo"
            />
            <p class="font-bold text-base uppercase tracking-wide">
              {{ ticket.establecimiento ?? 'MI NEGOCIO' }}
            </p>
          </div>

          <hr class="border-dashed border-gray-400 my-2" />

          <!-- datos de la venta -->
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>FOLIO:</span>
            <span>{{ ticket.folio ?? '#' + ticket.id }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>FECHA:</span>
            <span>{{ ticket.fecha }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>METODO DE PAGO:</span>
            <span class="uppercase">{{ ticket.metodo_pago }}</span>
          </div>

          <hr class="border-dashed border-gray-400 my-2" />

          <!-- productos -->
          <div class="mb-2">
            <p class="font-bold text-xs uppercase mb-2">PRODUCTOS</p>

            <div
              v-for="(p, i) in ticket.productos"
              :key="i"
              class="mb-3"
            >
              <div class="flex items-start gap-2">
                <div class="flex-1">
                  <p class="font-semibold leading-tight uppercase">{{ p.nombre }}</p>
                  <p class="text-xs text-gray-500">
                    {{ p.cantidad }} x ${{ Number(p.precio_unitario).toFixed(2) }}
                  </p>
                  <!-- descuento si aplica -->
                  <p v-if="p.descuento_aplicado > 0" class="text-xs text-green-600">
                    DESC:
                    <span v-if="p.tipo_descuento === 'porcentaje'">{{ p.descuento }}%</span>
                    <span v-else>${{ Number(p.descuento).toFixed(2) }}</span>
                    (-${{ Number(p.descuento_aplicado).toFixed(2) }})
                  </p>
                </div>
                <div class="text-right">
                  <!-- precio original tachado si hay descuento -->
                  <p v-if="p.descuento_aplicado > 0" class="text-xs line-through text-gray-400">
                    ${{ Number(p.subtotal_bruto).toFixed(2) }}
                  </p>
                  <p class="font-bold text-sm">
                    ${{ Number(p.subtotal_neto).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr class="border-dashed border-gray-400 my-2" />

          <!-- totales -->
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>SUBTOTAL (SIN DESC):</span>
            <span>${{ Number(ticket.subtotal).toFixed(2) }}</span>
          </div>

          <!-- descuentos si aplica -->
          <div
            v-if="descuentoTotal > 0"
            class="flex justify-between text-xs text-green-600 mb-1"
          >
            <span>DESCUENTOS:</span>
            <span>-${{ descuentoTotal.toFixed(2) }}</span>
          </div>

          <!-- desglose iva incluido: muestra base + iva pero el total no cambia -->
          <template v-if="ticket.modo_iva === 'iva_incluido' && ticket.iva_total > 0">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>SUBTOTAL SIN IVA:</span>
              <span>${{ baseGravable.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-orange-500 mb-1">
              <span>IVA (INCLUIDO):</span>
              <span>${{ Number(ticket.iva_total).toFixed(2) }}</span>
            </div>
          </template>

          <!-- desglose iva adicional: muestra subtotal + iva y el total aumenta -->
          <template v-if="ticket.modo_iva === 'iva_adicional' && ticket.iva_total > 0">
            <div class="flex justify-between text-xs text-orange-500 mb-1">
              <span>IVA:</span>
              <span>+${{ Number(ticket.iva_total).toFixed(2) }}</span>
            </div>
          </template>

          <div class="flex justify-between font-bold text-base mt-1 border-t border-dashed border-gray-300 pt-1">
            <span>TOTAL:</span>
            <span>${{ Number(ticket.total).toFixed(2) }}</span>
          </div>

          <!-- datos de pago contado -->
          <template v-if="!ticket.es_credito">
            <div class="flex justify-between text-xs text-gray-600 mt-1">
              <span>PAGO RECIBIDO:</span>
              <span>${{ Number(ticket.pago).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600">
              <span>CAMBIO:</span>
              <span>${{ Number(ticket.cambio).toFixed(2) }}</span>
            </div>
          </template>

          <!-- datos de credito -->
          <template v-if="ticket.es_credito && ticket.plan_pago">
            <hr class="border-dashed border-gray-400 my-2" />
            <p class="font-bold text-xs uppercase mb-1">PLAN DE CREDITO</p>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>CLIENTE:</span>
              <span class="uppercase">{{ ticket.plan_pago.cliente }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>ANTICIPO:</span>
              <span>${{ Number(ticket.plan_pago.anticipo).toFixed(2) }}</span>
            </div>
            <div v-if="ticket.plan_pago.interes_aplicado > 0" class="flex justify-between text-xs text-orange-500 mb-1">
              <span>INTERES APLICADO:</span>
              <span>+${{ Number(ticket.plan_pago.interes_aplicado).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>SALDO PENDIENTE:</span>
              <span class="font-bold text-red-600">${{ Number(ticket.plan_pago.saldo_pendiente).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>PLAZOS:</span>
              <span>
                {{ ticket.plan_pago.num_plazos }}
                <template v-if="ticket.plan_pago.tipo_plazo === 'dias'">
                  PAGOS (CADA {{ ticket.plan_pago.intervalo_dias }} DIAS)
                </template>
                <template v-else>
                  {{ ticket.plan_pago.tipo_plazo.toUpperCase() }}
                </template>
              </span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>CUOTA:</span>
              <span>${{ Number(ticket.plan_pago.monto_cuota).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>PROXIMO PAGO:</span>
              <span>{{ ticket.plan_pago.fecha_proximo_pago }}</span>
            </div>
          </template>

          <!-- numero de cuenta si esta configurado -->
          <template v-if="ticket.num_cuenta">
            <hr class="border-dashed border-gray-400 my-2" />
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>NUM. CUENTA:</span>
              <span>{{ ticket.num_cuenta }}</span>
            </div>
          </template>

          <hr class="border-dashed border-gray-400 my-2" />

          <!-- pie del ticket -->
          <p class="text-center text-xs text-gray-500 mt-2">GRACIAS POR SU COMPRA</p>
          <p v-if="ticket.es_credito" class="text-center text-xs text-red-500 mt-1">
            LOS PRECIOS ESTAN SUJETOS A CAMBIOS SIN PREVIO AVISO
          </p>
        </div>
      </div>

    <!-- botones -->
    <div class="flex gap-2 p-4 border-t dark:border-gray-700">
        <button class="btn flex-1 flex items-center justify-center gap-2" @click="descargarPDF">
            <i class="fa-solid fa-download"></i>
            Descargar
        </button>
        <button class="btn flex-1 flex items-center justify-center gap-2" @click="imprimir">
            <i class="fa-solid fa-print"></i>
            Imprimir
        </button>
    </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const props = defineProps<{
  ticket: any
  impresora_ancho?: number
  impresora_alto?: number
}>()

defineEmits(['close'])

// calcula el total de descuentos aplicados en todos los productos
const descuentoTotal = computed(() => {
  if (!props.ticket?.productos) return 0
  return props.ticket.productos.reduce((acc: number, p: any) => {
    return acc + (Number(p.descuento_aplicado) || 0)
  }, 0)
})

// base gravable para modo iva_incluido: total menos el iva que ya esta adentro
const baseGravable = computed(() => {
  return Number(props.ticket?.total ?? 0) - Number(props.ticket?.iva_total ?? 0)
})

// al montar el modal se lanza la descarga automaticamente
onMounted(() => {
    // el logo ya viene como base64 desde el backend
    // esperamos a que el DOM este listo antes de descargar
    setTimeout(() => {
        descargarPDF()
    }, 300)
})

function imprimir() {
  const ventana = window.open('', '_blank', 'width=400,height=700')
  const ancho = props.impresora_ancho ?? 80
  const alto  = props.impresora_alto  ?? 200
  if (!ventana) return

  ventana.document.write(`
    <html>
      <head>
        <title>Ticket ${props.ticket.folio ?? '#' + props.ticket.id}</title>
        <style>
          /* reset general */
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            color: #000;
            background: #fff;
            width: ${ancho}mm;
            margin: 0 auto;
            padding: 4mm;
          }

          @media print {
            @page {
              margin: 0;
              size: ${ancho}mm auto;
            }
            body {
              width: ${ancho}mm;
              padding: 3mm;
            }
          }

          /* cabecera */
          .ticket-header { text-align: center; margin-bottom: 4mm; }
          .ticket-header img { max-height: 15mm; display: block; margin: 0 auto 2mm; }
          .ticket-header .nombre-negocio {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          /* separador */
          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 2mm 0;
          }

          /* fila de datos */
          .fila {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
            font-size: 10px;
          }
          .fila.bold { font-weight: bold; font-size: 12px; }
          .fila.verde { color: #166534; }
          .fila.naranja { color: #92400e; }
          .fila.rojo { color: #991b1b; }

          /* productos */
          .producto { margin-bottom: 3mm; }
          .producto .nombre { font-weight: bold; font-size: 11px; text-transform: uppercase; }
          .producto .detalle { font-size: 10px; color: #444; }
          .producto .descuento { font-size: 10px; color: #166534; }
          .producto .precio-tachado { text-decoration: line-through; color: #999; font-size: 10px; }
          .producto .precio-final { font-weight: bold; text-align: right; }

          /* totales */
          .totales { margin-top: 2mm; }

          /* pie */
          .pie {
            text-align: center;
            font-size: 10px;
            color: #555;
            margin-top: 3mm;
          }

          /* seccion de credito */
          .seccion-titulo {
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 1mm;
          }
        </style>
      </head>
      <body>${generarHtmlTicket()}</body>
    </html>
  `)

  ventana.document.close()

  // buscamos la imagen del logo en la ventana nueva
  const img = ventana.document.querySelector('img')

  // funcion que ejecuta la impresion y cierra la ventana
  const lanzarImpresion = () => {
      ventana.focus()
      ventana.print()
      ventana.close()
  }

  if (img && !img.complete) {
      // si hay imagen y aun no cargo, esperamos a que termine
      img.onload = lanzarImpresion
      img.onerror = lanzarImpresion  // si falla la imagen, imprimimos de todos modos
  } else {
      // si no hay imagen o ya esta cargada, imprimimos directo
      lanzarImpresion()
  }
}

// genera el html limpio del ticket optimizado para impresora termica
function generarHtmlTicket(): string {
  const t = props.ticket

  // cabecera del negocio
  let html = `<div class="ticket-header">`
  if (t.logo_url) {
    html += `<img src="${t.logo_url}" alt="Logo" />`
  }
  html += `<div class="nombre-negocio">${(t.establecimiento ?? 'MI NEGOCIO').toUpperCase()}</div>`
  html += `</div>`

  html += `<hr />`

  // datos de la venta
  html += `<div class="fila"><span>FOLIO:</span><span>${t.folio ?? '#' + t.id}</span></div>`
  html += `<div class="fila"><span>FECHA:</span><span>${t.fecha}</span></div>`
  html += `<div class="fila"><span>METODO DE PAGO:</span><span>${(t.metodo_pago ?? '').toUpperCase()}</span></div>`

  html += `<hr />`

  // productos
  html += `<div style="font-weight:bold;font-size:10px;text-transform:uppercase;margin-bottom:2mm;">PRODUCTOS</div>`

  for (const p of t.productos) {
    html += `<div class="producto">`
    html += `<div style="display:flex;justify-content:space-between;">`
    html += `<div style="flex:1;">`
    html += `<div class="nombre">${(p.nombre ?? '').toUpperCase()}</div>`
    html += `<div class="detalle">${p.cantidad} x $${Number(p.precio_unitario).toFixed(2)}</div>`

    if (Number(p.descuento_aplicado) > 0) {
      const descLabel = p.tipo_descuento === 'porcentaje'
        ? `${p.descuento}%`
        : `$${Number(p.descuento).toFixed(2)}`
      html += `<div class="descuento">DESC: ${descLabel} (-$${Number(p.descuento_aplicado).toFixed(2)})</div>`
    }

    html += `</div>`
    html += `<div class="precio-final">`

    if (Number(p.descuento_aplicado) > 0) {
      html += `<div class="precio-tachado">$${Number(p.subtotal_bruto).toFixed(2)}</div>`
    }

    html += `<div>$${Number(p.subtotal_neto).toFixed(2)}</div>`
    html += `</div>`
    html += `</div>`
    html += `</div>`
  }

  html += `<hr />`

  // totales
  html += `<div class="totales">`
  html += `<div class="fila"><span>SUBTOTAL (SIN DESC):</span><span>$${Number(t.subtotal).toFixed(2)}</span></div>`

  if (descuentoTotal.value > 0) {
    html += `<div class="fila verde"><span>DESCUENTOS:</span><span>-$${descuentoTotal.value.toFixed(2)}</span></div>`
  }

  if (t.modo_iva === 'iva_incluido' && Number(t.iva_total) > 0) {
    html += `<div class="fila"><span>SUBTOTAL SIN IVA:</span><span>$${baseGravable.value.toFixed(2)}</span></div>`
    html += `<div class="fila naranja"><span>IVA (INCLUIDO):</span><span>$${Number(t.iva_total).toFixed(2)}</span></div>`
  }

  if (t.modo_iva === 'iva_adicional' && Number(t.iva_total) > 0) {
    html += `<div class="fila naranja"><span>IVA:</span><span>+$${Number(t.iva_total).toFixed(2)}</span></div>`
  }

  html += `<div class="fila bold"><span>TOTAL:</span><span>$${Number(t.total).toFixed(2)}</span></div>`
  html += `</div>`

  // pago y cambio si es contado
  if (!t.es_credito) {
    html += `<div class="fila"><span>PAGO RECIBIDO:</span><span>$${Number(t.pago).toFixed(2)}</span></div>`
    html += `<div class="fila"><span>CAMBIO:</span><span>$${Number(t.cambio).toFixed(2)}</span></div>`
  }

  // plan de credito si aplica
  if (t.es_credito && t.plan_pago) {
    const p = t.plan_pago
    html += `<hr />`
    html += `<div class="seccion-titulo">PLAN DE CREDITO</div>`
    html += `<div class="fila"><span>CLIENTE:</span><span>${(p.cliente ?? '').toUpperCase()}</span></div>`
    html += `<div class="fila"><span>ANTICIPO:</span><span>$${Number(p.anticipo).toFixed(2)}</span></div>`

    if (Number(p.interes_aplicado) > 0) {
      html += `<div class="fila naranja"><span>INTERES APLICADO:</span><span>+$${Number(p.interes_aplicado).toFixed(2)}</span></div>`
    }

    html += `<div class="fila rojo"><span>SALDO PENDIENTE:</span><span>$${Number(p.saldo_pendiente).toFixed(2)}</span></div>`

    // plazos: formato diferente para dias vs semanal/mensual
    let plazosTexto = ''
    if (p.tipo_plazo === 'dias') {
      plazosTexto = `${p.num_plazos} PAGOS (CADA ${p.intervalo_dias} DIAS)`
    } else {
      plazosTexto = `${p.num_plazos} ${(p.tipo_plazo ?? '').toUpperCase()}`
    }
    html += `<div class="fila"><span>PLAZOS:</span><span>${plazosTexto}</span></div>`

    html += `<div class="fila"><span>CUOTA:</span><span>$${Number(p.monto_cuota).toFixed(2)}</span></div>`
    html += `<div class="fila"><span>PROXIMO PAGO:</span><span>${p.fecha_proximo_pago}</span></div>`
  }

  // numero de cuenta si existe en la configuracion
  if (t.num_cuenta) {
    html += `<hr />`
    html += `<div class="fila"><span>NUM. CUENTA:</span><span>${t.num_cuenta}</span></div>`
  }

  html += `<hr />`
  html += `<div class="pie">GRACIAS POR SU COMPRA</div>`
  if (t.es_credito) {
    html += `<div class="pie" style="color:#991b1b;margin-top:1mm;">LOS PRECIOS ESTAN SUJETOS A CAMBIOS SIN PREVIO AVISO</div>`
  }

  return html
}

async function descargarPDF() {
    // tomamos el elemento que contiene el ticket visible en el modal
    const elemento = document.getElementById('ticket-imprimible')
    if (!elemento) return

    // guardamos el ancho original del elemento
    const anchoPrincipal = elemento.style.width;
    // forzamos un ancho fijo para la descarga no se recorte
    elemento.style.width = "370px"

    // generamos un canvas a partir del html del ticket, ahora de manera fija
    const canvas = await html2canvas(elemento, {
        scale: 2,           // mayor resolucion
        useCORS: true,      // permite cargar imagenes externas como el logo
        backgroundColor: '#ffffff',
        windowWidth: 420
    })

    elemento.style.width = anchoPrincipal

    const imgData   = canvas.toDataURL('image/png')
    const ancho     = props.impresora_ancho ?? 80

    // convertimos mm a puntos para jspdf (1mm = 2.8346 pt)
    const anchoPt   = ancho * 2.8346
    const altoPt    = (canvas.height * anchoPt) / canvas.width

    const pdf = new jsPDF({
        orientation : 'portrait',
        unit        : 'pt',
        format      : [anchoPt, altoPt]   // tamanio dinamico segun el contenido
    })

    pdf.addImage(imgData, 'PNG', 0, 0, anchoPt, altoPt)

    const folio = props.ticket?.folio ?? ('venta-' + props.ticket?.id)
    pdf.save(`ticket-${folio}.pdf`)
}
</script>