import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchConfiguracion } from '@/api/configuracion'

export const useConfiguracionStore = defineStore('configuracion', () => {
    const descuento_con_decimales = ref(false)
    const modo_iva = ref<'sin_iva' | 'iva_incluido' | 'iva_adicional'>('sin_iva')
    const imprimir_ticket_venta = ref(true)
    const cargada = ref(false)

    // carga la configuracion del establecimiento activo desde la API
    async function cargar() {
        try {
            const data = await fetchConfiguracion()
            const config = data.configuracion
            descuento_con_decimales.value = Boolean(config.descuento_con_decimales)
            modo_iva.value                = config.modo_iva
            imprimir_ticket_venta.value   = Boolean(config.imprimir_ticket_venta)
            cargada.value                 = true
        } catch {
            // si falla dejamos los valores por defecto
        }
    }

    // resetea el store al cambiar de establecimiento
    function resetear() {
        descuento_con_decimales.value = false
        modo_iva.value                = 'sin_iva'
        imprimir_ticket_venta.value   = true
        cargada.value                 = false
    }

    return {
        descuento_con_decimales,
        modo_iva,
        imprimir_ticket_venta,
        cargada,
        cargar,
        resetear,
    }
})