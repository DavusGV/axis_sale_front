import { defineStore } from 'pinia'
import { reactive, toRefs, ref } from 'vue'
import { fetchConfiguracion, configuracionDefaults } from '@/api/configuracion'

export const useConfiguracionStore = defineStore('configuracion', () => {
    const state = reactive({ ...configuracionDefaults })
    const cargada = ref(false)

    // carga la configuracion del establecimiento activo desde la API
    async function cargar() {
        try {
            const data = await fetchConfiguracion()
            // copia todos los campos que vengan de la respuesta, sin listarlos uno por uno
            Object.assign(state, data.configuracion)
            cargada.value = true
        } catch (error) {
            // dejamos los valores por defecto pero registramos el error para poder depurarlo
            console.error('Error al cargar la configuracion del establecimiento:', error)
        }
    }

    // resetea el store al cambiar de establecimiento
    function resetear() {
        Object.assign(state, configuracionDefaults)
        cargada.value = false
    }

    return {
        ...toRefs(state),
        cargada,
        cargar,
        resetear,
    }
})