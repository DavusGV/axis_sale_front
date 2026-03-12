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
              {{ ticket.establecimiento ?? 'Mi Negocio' }}
            </p>
          </div>

          <hr class="border-dashed border-gray-400 my-2" />

          <!-- datos de la venta -->
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>Folio:</span>
            <span>{{ ticket.folio ?? '#' + ticket.id }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>Fecha:</span>
            <span>{{ ticket.fecha }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>Metodo de pago:</span>
            <span class="capitalize">{{ ticket.metodo_pago }}</span>
          </div>

          <hr class="border-dashed border-gray-400 my-2" />

          <!-- productos -->
          <div class="mb-2">
            <p class="font-bold text-xs uppercase mb-2">Productos</p>

            <div
              v-for="(p, i) in ticket.productos"
              :key="i"
              class="mb-3"
            >
              <div class="flex items-start gap-2">
                <div class="flex-1">
                  <p class="font-semibold leading-tight">{{ p.nombre }}</p>
                  <p class="text-xs text-gray-500">
                    {{ p.cantidad }} x ${{ Number(p.precio_unitario).toFixed(2) }}
                  </p>
                  <!-- descuento si aplica -->
                  <p v-if="p.descuento_aplicado > 0" class="text-xs text-green-600">
                    Desc:
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
            <span>Subtotal (sin desc):</span>
            <span>${{ Number(ticket.subtotal).toFixed(2) }}</span>
          </div>

          <!-- descuentos si aplica -->
          <div
            v-if="descuentoTotal > 0"
            class="flex justify-between text-xs text-green-600 mb-1"
          >
            <span>Descuentos:</span>
            <span>-${{ descuentoTotal.toFixed(2) }}</span>
          </div>

          <!-- desglose iva incluido: muestra base + iva pero el total no cambia -->
          <template v-if="ticket.modo_iva === 'iva_incluido' && ticket.iva_total > 0">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Subtotal sin IVA:</span>
              <span>${{ baseGravable.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-orange-500 mb-1">
              <span>IVA (incluido):</span>
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
            <span>Total:</span>
            <span>${{ Number(ticket.total).toFixed(2) }}</span>
          </div>

          <!-- datos de pago contado -->
          <template v-if="!ticket.es_credito">
            <div class="flex justify-between text-xs text-gray-600 mt-1">
              <span>Pago recibido:</span>
              <span>${{ Number(ticket.pago).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600">
              <span>Cambio:</span>
              <span>${{ Number(ticket.cambio).toFixed(2) }}</span>
            </div>
          </template>

          <!-- datos de credito -->
          <template v-if="ticket.es_credito && ticket.plan_pago">
            <hr class="border-dashed border-gray-400 my-2" />
            <p class="font-bold text-xs uppercase mb-1">Plan de credito</p>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Cliente:</span>
              <span>{{ ticket.plan_pago.cliente }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Anticipo:</span>
              <span>${{ Number(ticket.plan_pago.anticipo).toFixed(2) }}</span>
            </div>
            <div v-if="ticket.plan_pago.interes_aplicado > 0" class="flex justify-between text-xs text-orange-500 mb-1">
              <span>Interes aplicado:</span>
              <span>+${{ Number(ticket.plan_pago.interes_aplicado).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Saldo pendiente:</span>
              <span class="font-bold text-red-600">${{ Number(ticket.plan_pago.saldo_pendiente).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Plazos:</span>
              <span>{{ ticket.plan_pago.num_plazos }} {{ ticket.plan_pago.tipo_plazo }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Cuota:</span>
              <span>${{ Number(ticket.plan_pago.monto_cuota).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Proximo pago:</span>
              <span>{{ ticket.plan_pago.fecha_proximo_pago }}</span>
            </div>
          </template>

          <hr class="border-dashed border-gray-400 my-2" />

          <!-- pie del ticket -->
          <p class="text-center text-xs text-gray-500 mt-2">Gracias por su compra</p>

        </div>
      </div>

      <!-- botones -->
      <div class="flex gap-2 p-4 border-t dark:border-gray-700">
        <button class="btn-outline flex-1 flex items-center justify-center gap-2" @click="$emit('close')">
          Cerrar
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

// al montar el modal se lanza la impresion automaticamente
onMounted(() => {
    // esperamos un tick para que el DOM este listo antes de imprimir
    setTimeout(() => {
        imprimir()
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
            width: ${ancho}mm; /* cambia de acurdo a lo que haya configurado */
            margin: 0 auto;
            padding: 4mm;
          }

          @media print {
            @page {
            /* sin margenes del sistema, el ticket controla su propio espacio */
              margin: 0;
            /* ancho del papel de la impresora */
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
          .producto .nombre { font-weight: bold; font-size: 11px; }
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
  ventana.focus()
  ventana.print()
  ventana.close()
}

// genera el html limpio del ticket optimizado para impresora termica
function generarHtmlTicket(): string {
  const t = props.ticket

  // cabecera del negocio
  let html = `<div class="ticket-header">`
  if (t.logo_url) {
    html += `<img src="${t.logo_url}" alt="Logo" />`
  }
  html += `<div class="nombre-negocio">${t.establecimiento ?? 'Mi Negocio'}</div>`
  html += `</div>`

  html += `<hr />`

  // datos de la venta
  html += `<div class="fila"><span>Folio:</span><span>${t.folio ?? '#' + t.id}</span></div>`
  html += `<div class="fila"><span>Fecha:</span><span>${t.fecha}</span></div>`
  html += `<div class="fila"><span>Metodo de pago:</span><span>${t.metodo_pago}</span></div>`

  html += `<hr />`

  // productos
  html += `<div style="font-weight:bold;font-size:10px;text-transform:uppercase;margin-bottom:2mm;">Productos</div>`

  for (const p of t.productos) {
    html += `<div class="producto">`
    html += `<div style="display:flex;justify-content:space-between;">`
    html += `<div style="flex:1;">`
    html += `<div class="nombre">${p.nombre}</div>`
    html += `<div class="detalle">${p.cantidad} x $${Number(p.precio_unitario).toFixed(2)}</div>`

    if (Number(p.descuento_aplicado) > 0) {
      const descLabel = p.tipo_descuento === 'porcentaje'
        ? `${p.descuento}%`
        : `$${Number(p.descuento).toFixed(2)}`
      html += `<div class="descuento">Desc: ${descLabel} (-$${Number(p.descuento_aplicado).toFixed(2)})</div>`
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
  html += `<div class="fila"><span>Subtotal (sin desc):</span><span>$${Number(t.subtotal).toFixed(2)}</span></div>`

  if (descuentoTotal.value > 0) {
    html += `<div class="fila verde"><span>Descuentos:</span><span>-$${descuentoTotal.value.toFixed(2)}</span></div>`
  }

  if (t.modo_iva === 'iva_incluido' && Number(t.iva_total) > 0) {
    html += `<div class="fila"><span>Subtotal sin IVA:</span><span>$${baseGravable.value.toFixed(2)}</span></div>`
    html += `<div class="fila naranja"><span>IVA (incluido):</span><span>$${Number(t.iva_total).toFixed(2)}</span></div>`
  }

  if (t.modo_iva === 'iva_adicional' && Number(t.iva_total) > 0) {
    html += `<div class="fila naranja"><span>IVA:</span><span>+$${Number(t.iva_total).toFixed(2)}</span></div>`
  }

  html += `<div class="fila bold"><span>Total:</span><span>$${Number(t.total).toFixed(2)}</span></div>`
  html += `</div>`

  // pago y cambio si es contado
  if (!t.es_credito) {
    html += `<div class="fila"><span>Pago recibido:</span><span>$${Number(t.pago).toFixed(2)}</span></div>`
    html += `<div class="fila"><span>Cambio:</span><span>$${Number(t.cambio).toFixed(2)}</span></div>`
  }

  // plan de credito si aplica
  if (t.es_credito && t.plan_pago) {
    const p = t.plan_pago
    html += `<hr />`
    html += `<div class="seccion-titulo">Plan de credito</div>`
    html += `<div class="fila"><span>Cliente:</span><span>${p.cliente}</span></div>`
    html += `<div class="fila"><span>Anticipo:</span><span>$${Number(p.anticipo).toFixed(2)}</span></div>`

    if (Number(p.interes_aplicado) > 0) {
      html += `<div class="fila naranja"><span>Interes:</span><span>+$${Number(p.interes_aplicado).toFixed(2)}</span></div>`
    }

    html += `<div class="fila rojo"><span>Saldo pendiente:</span><span>$${Number(p.saldo_pendiente).toFixed(2)}</span></div>`
    html += `<div class="fila"><span>Plazos:</span><span>${p.num_plazos} ${p.tipo_plazo}</span></div>`
    html += `<div class="fila"><span>Cuota:</span><span>$${Number(p.monto_cuota).toFixed(2)}</span></div>`
    html += `<div class="fila"><span>Proximo pago:</span><span>${p.fecha_proximo_pago}</span></div>`
  }

  html += `<hr />`
  html += `<div class="pie">Gracias por su compra</div>`

  return html
}
</script>