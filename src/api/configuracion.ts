import axiosInstance from '@/utils/axios'

export interface ConfiguracionEstablecimiento {
    id: number
    establecimiento_id: number
    modo_iva: 'sin_iva' | 'iva_incluido' | 'iva_adicional'
    imprimir_ticket_venta: boolean
    impresora_ancho: number
    impresora_alto: number
}

// obtiene la configuracion del establecimiento activo
export async function fetchConfiguracion(): Promise<ConfiguracionEstablecimiento> {
    const res = await axiosInstance.get('/configuracion')
    return res.data.data.configuracion
}

// guarda la configuracion del establecimiento activo
export async function guardarConfiguracion(data: Partial<ConfiguracionEstablecimiento>) {
    const res = await axiosInstance.post('/configuracion', data)
    return res.data.data.configuracion
}