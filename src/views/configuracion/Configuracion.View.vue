<template>
  <TopBanner title="Configuracion" />

  <div class="max-w-6xl mx-auto p-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- columna izquierda: configuraciones -->
      <div class="flex flex-col gap-4">

        <!-- bloque de opciones generales -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 class="font-bold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
            Opciones generales
          </h2>

          <!-- logo del establecimiento -->
          <div class="flex items-center gap-4 py-3 border-b dark:border-gray-700">
            <div class="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                v-if="logoUrl"
                :src="logoUrl"
                class="w-full h-full object-contain"
                alt="Logo"
              />
              <i v-else class="fa-solid fa-image text-gray-400 text-xl"></i>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-800 dark:text-gray-100 text-sm">Logo del negocio</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Se muestra en el encabezado del ticket. JPG, PNG o WebP, max 2MB.
              </p>
              <div class="flex gap-2">
                <label
                  class="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 
                        text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 
                        cursor-pointer transition"
                >
                  <i class="fa-solid fa-upload mr-1"></i>
                  Seleccionar
                  <input
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp"
                    class="hidden"
                    @change="onLogoSeleccionado"
                  />
                </label>
                <button
                  v-if="logoFile"
                  class="px-3 py-1 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                  :disabled="subiendoLogo"
                  @click="guardarLogo"
                >
                  <i class="fa-solid fa-check mr-1"></i>
                  {{ subiendoLogo ? 'Subiendo...' : 'Guardar logo' }}
                </button>
              </div>
            </div>
          </div>

          <!-- toggle: imprimir ticket al finalizar venta -->
          <div class="flex items-center justify-between py-3 border-b dark:border-gray-700">
            <div>
              <p class="font-semibold text-gray-800 dark:text-gray-100 text-sm">Imprimir ticket al finalizar venta</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Muestra la previsualizacion del ticket al completar una venta.
              </p>
            </div>
            <button
              @click="form.imprimir_ticket_venta = !form.imprimir_ticket_venta"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition flex-shrink-0"
              :class="form.imprimir_ticket_venta ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition"
                :class="form.imprimir_ticket_venta ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>

          <!-- tamano de la impresora -->
          <div class="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-3">
            <div>
              <p class="font-semibold text-gray-800 dark:text-gray-100">Tamano del papel</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Define el ancho de tu impresora de tickets.
              </p>
            </div>
            <div class="flex flex-col gap-2 items-end">
              <!-- selector de ancho -->
              <div class="flex items-center gap-2">
                <label class="text-xs text-gray-500 dark:text-gray-400">Ancho:</label>
                <select
                  v-model.number="form.impresora_ancho"
                  class="text-sm px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500"
                >
                  <option :value="58">58 mm</option>
                  <option :value="80">80 mm</option>
                </select>
              </div>
              <!-- alto personalizado -->
              <div class="flex items-center gap-2">
                <label class="text-xs text-gray-500 dark:text-gray-400">Alto max (mm):</label>
                <input
                  v-model.number="form.impresora_alto"
                  type="number"
                  min="100"
                  max="500"
                  class="w-20 text-sm px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>

          <!-- formato de hora del ticket -->
          <div class="flex items-center justify-between py-3 border-b dark:border-gray-700">
            <div>
              <p class="font-semibold text-gray-800 dark:text-gray-100 text-sm">Formato de hora</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Define como se muestra la hora en el ticket.
              </p>
            </div>
            <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                @click="form.formato_hora = '12h'"
                class="px-3 py-1 text-xs font-medium rounded-md transition"
                :class="form.formato_hora === '12h'
                  ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
              >
                12 HRS
              </button>
              <button
                @click="form.formato_hora = '24h'"
                class="px-3 py-1 text-xs font-medium rounded-md transition"
                :class="form.formato_hora === '24h'
                  ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
              >
                24 HRS
              </button>
            </div>
          </div>

          <!-- formato de fecha del ticket -->
          <div class="flex items-center justify-between py-3 border-b dark:border-gray-700">
            <div>
              <p class="font-semibold text-gray-800 dark:text-gray-100 text-sm">Formato de fecha</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Define como se muestra la fecha en el ticket.
              </p>
            </div>
            <select
              v-model="form.formato_fecha"
              class="text-sm px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500"
            >
              <option value="d/m/Y">DD/MM/AAAA</option>
              <option value="m/d/Y">MM/DD/AAAA</option>
              <option value="Y-m-d">AAAA-MM-DD</option>
            </select>
          </div>

          <!-- numero de cuenta para transferencias -->
          <div class="flex flex-col gap-1 py-3">
            <div>
              <p class="font-semibold text-gray-800 dark:text-gray-100 text-sm">Numero de cuenta</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Se mostrara en el ticket para pagos por transferencia o deposito. Dejalo vacio si no aplica.
              </p>
            </div>
            <input
              v-model="form.num_cuenta"
              type="text"
              maxlength="50"
              placeholder="Ej: 1234 5678 9012 3456"
              class="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500
                    placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <!-- Agregan mas toggles aqui siguiendo el mismo patron -->

        </div>

        <!-- bloque de modo IVA -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 class="font-bold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Modo de IVA
          </h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Solo un modo puede estar activo. El preview del ticket se actualiza al seleccionar.
          </p>

          <div class="flex flex-col gap-2">

            <!-- sin iva -->
            <label
              class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition"
              :class="form.modo_iva === 'sin_iva'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'"
            >
              <input
                type="radio"
                v-model="form.modo_iva"
                value="sin_iva"
                class="accent-green-500 w-4 h-4 flex-shrink-0"
              />
              <div>
                <p class="font-semibold text-sm text-gray-800 dark:text-gray-100">Sin IVA</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  No se aplica IVA. Solo precios y total.
                </p>
              </div>
            </label>

            <!-- iva incluido -->
            <label
              class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition"
              :class="form.modo_iva === 'iva_incluido'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'"
            >
              <input
                type="radio"
                v-model="form.modo_iva"
                value="iva_incluido"
                class="accent-green-500 w-4 h-4 flex-shrink-0"
              />
              <div>
                <p class="font-semibold text-sm text-gray-800 dark:text-gray-100">IVA incluido en el precio</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  El precio ya contiene IVA. Se desglosa en el ticket sin cambiar el total.
                </p>
              </div>
            </label>

            <!-- iva adicional -->
            <label
              class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition"
              :class="form.modo_iva === 'iva_adicional'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'"
            >
              <input
                type="radio"
                v-model="form.modo_iva"
                value="iva_adicional"
                class="accent-green-500 w-4 h-4 flex-shrink-0"
              />
              <div>
                <p class="font-semibold text-sm text-gray-800 dark:text-gray-100">IVA adicional al precio</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  El IVA se suma al total. El cliente paga mas del precio base.
                </p>
              </div>
            </label>

          </div>
        </div>

        <!-- boton guardar -->
        <button
          class="btn w-full justify-center"
          @click="guardar"
          :disabled="loading"
        >
          <i class="fa-solid fa-floppy-disk"></i>
          {{ loading ? 'Guardando...' : 'Guardar configuracion' }}
        </button>

      </div>

      <!-- columna derecha: preview del ticket -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 class="font-bold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
          Preview del ticket
        </h2>

        <!-- contenedor del ticket simulado -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex justify-center">
          <div class="w-64 bg-white rounded shadow-md p-4 font-mono text-xs text-gray-800">

            <!-- cabecera del ticket -->
            <div class="text-center mb-3">
              <div class="w-12 h-12 rounded mx-auto mb-2 flex items-center justify-center overflow-hidden"
                  :class="logoUrl ? '' : 'bg-gray-200'">
                <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain" alt="Logo" />
                <i v-else class="fa-solid fa-image text-gray-400 text-lg"></i>
              </div>
              <p class="font-bold text-sm uppercase">{{ nombreEstablecimiento }}</p>
              <p class="text-gray-400 text-xs">Folio: #VTA-GH26001</p>
              <p class="text-gray-400 text-xs">
                {{ form.formato_fecha === 'd/m/Y' ? '12/03/2026' : form.formato_fecha === 'm/d/Y' ? '03/12/2026' : '2026-03-12' }}
                {{ form.formato_hora === '12h' ? '10:30 AM' : '10:30' }}
              </p>
              <!-- num cuenta en el preview si existe -->
              <template v-if="form.num_cuenta">
                <hr class="border-dashed border-gray-300 my-2" />
                <div class="flex justify-between text-gray-400">
                  <span>NUM. CUENTA:</span>
                  <span class="text-right">{{ form.num_cuenta }}</span>
                </div>
              </template>
            </div>

            <hr class="border-dashed border-gray-300 my-2" />

            <!-- productos de ejemplo -->
            <div class="mb-2">
              <div class="flex justify-between mb-1">
                <span class="flex-1">Producto A</span>
                <span>$100.00</span>
              </div>
              <div class="text-gray-400 text-xs mb-2">1 x $100.00</div>

              <div class="flex justify-between mb-1">
                <span class="flex-1">Producto B</span>
                <span>$200.00</span>
              </div>
              <div class="text-gray-400 text-xs mb-2">1 x $200.00</div>
            </div>

            <hr class="border-dashed border-gray-300 my-2" />

            <!-- totales segun modo iva -->

            <!-- sin iva -->
            <template v-if="form.modo_iva === 'sin_iva'">
              <div class="flex justify-between font-bold mt-1">
                <span>Total</span>
                <span>$300.00</span>
              </div>
            </template>

            <!-- iva incluido -->
            <template v-else-if="form.modo_iva === 'iva_incluido'">
              <div class="flex justify-between text-gray-500 mb-1">
                <span>Subtotal</span>
                <span>$258.62</span>
              </div>
              <div class="flex justify-between text-orange-500 mb-1">
                <span>IVA 16% (incluido)</span>
                <span>$41.38</span>
              </div>
              <div class="flex justify-between font-bold mt-1">
                <span>Total</span>
                <span>$300.00</span>
              </div>
            </template>

            <!-- iva adicional -->
            <template v-else-if="form.modo_iva === 'iva_adicional'">
              <div class="flex justify-between text-gray-500 mb-1">
                <span>Subtotal</span>
                <span>$300.00</span>
              </div>
              <div class="flex justify-between text-orange-500 mb-1">
                <span>IVA 16%</span>
                <span>$48.00</span>
              </div>
              <div class="flex justify-between font-bold mt-1 border-t border-dashed border-gray-300 pt-1">
                <span>Total</span>
                <span>$348.00</span>
              </div>
            </template>

            <!-- metodo de pago y cambio -->
            <div class="flex justify-between text-gray-400 mt-2">
              <span>Pago</span>
              <span>$350.00</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span>Cambio</span>
              <!-- el cambio depende del modo iva -->
              <span v-if="form.modo_iva === 'iva_adicional'">$2.00</span>
              <span v-else>$50.00</span>
            </div>

            <hr class="border-dashed border-gray-300 my-2" />

            <p class="text-center text-gray-400">Gracias por su compra</p>

          </div>
        </div>

        <!-- etiqueta que indica el modo activo -->
        <div class="mt-4 text-center">
          <span
            class="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full"
            :class="{
              'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300': form.modo_iva === 'sin_iva',
              'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400': form.modo_iva === 'iva_incluido',
              'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400': form.modo_iva === 'iva_adicional',
            }"
          >
            <i class="fa-solid fa-circle-dot text-xs"></i>
            <span v-if="form.modo_iva === 'sin_iva'">Sin IVA activo</span>
            <span v-else-if="form.modo_iva === 'iva_incluido'">IVA incluido activo</span>
            <span v-else-if="form.modo_iva === 'iva_adicional'">IVA adicional activo</span>
          </span>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TopBanner from '@/components/shared/TopBanner.vue'
import { fetchConfiguracion, guardarConfiguracion, subirLogo } from '@/api/configuracion'
import Swal from 'sweetalert2'

const loading = ref(false)

const form = ref({
    modo_iva: 'sin_iva' as 'sin_iva' | 'iva_incluido' | 'iva_adicional',
    imprimir_ticket_venta: true,
    impresora_ancho: 80,
    impresora_alto: 200,
    formato_hora: '12h' as '12h' | '24h',
    formato_fecha: 'd/m/Y',
    num_cuenta: '' as string,
})

const nombreEstablecimiento = ref<string>('Mi Negocio')
const logoUrl = ref<string | null>(null)
const logoFile = ref<File | null>(null)
const subiendoLogo = ref(false)

onMounted(async () => {
    try {
        const data = await fetchConfiguracion()
        const config = data.configuracion
        logoUrl.value = data.logo_url
        form.value.modo_iva = config.modo_iva
        nombreEstablecimiento.value = data.nombre_establecimiento ?? 'Mi Negocio'
    } catch {
    }
})

function onLogoSeleccionado(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  logoFile.value = input.files[0]
  // preview local inmediato
  logoUrl.value = URL.createObjectURL(input.files[0])
}

async function guardarLogo() {
  if (!logoFile.value) return
  subiendoLogo.value = true
  try {
    const res = await subirLogo(logoFile.value)
    logoUrl.value = res.logo_url
    logoFile.value = null
    Swal.fire({
      icon: 'success',
      title: 'Logo actualizado',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    })
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir el logo.' })
  } finally {
    subiendoLogo.value = false
  }
}

async function guardar() {
    loading.value = true
    try {
        await guardarConfiguracion(form.value)
        Swal.fire({
            icon: 'success',
            title: 'Configuracion guardada',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        })
    } catch {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar la configuracion.'
        })
    } finally {
        loading.value = false
    }
}
</script>