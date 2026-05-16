import axiosInstance from '@/utils/axios'

export interface ConfiguracionEstablecimiento {
    id: number
    establecimiento_id: number
    modo_iva: 'sin_iva' | 'iva_incluido' | 'iva_adicional'
    imprimir_ticket_venta: boolean
    impresora_ancho: number
    impresora_alto: number
    impresora_ticket: string | null
    impresion_automatica: boolean
    formato_hora: '12h' | '24h'
    formato_fecha: string
    num_cuenta: string | null
    descuento_con_decimales: boolean
}

// sube o actualiza el logo del establecimiento
export async function subirLogo(file: File): Promise<{ logo_url: string }> {
    const formData = new FormData()
    formData.append('logo', file)
    const res = await axiosInstance.post('/configuracion/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
}

// elimina el logo del establecimiento
export async function eliminarLogo(): Promise<void> {
    await axiosInstance.delete('/configuracion/logo')
}

// obtiene la configuracion del establecimiento activo
export interface ConfiguracionResponse {
    configuracion: ConfiguracionEstablecimiento
    logo_url: string | null
    nombre_establecimiento: string
}

export async function fetchConfiguracion(): Promise<ConfiguracionResponse> {
    const res = await axiosInstance.get('/configuracion')
    return res.data.data
}

// guarda la configuracion del establecimiento activo
export async function guardarConfiguracion(data: Partial<ConfiguracionEstablecimiento>) {
    const res = await axiosInstance.post('/configuracion', data)
    return res.data.data.configuracion
}