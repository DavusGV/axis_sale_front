import axiosInstance from '@/utils/axios'

// tipos para tipado fuerte en el componente
export interface StockKpis {
  stock_actual: number
  total_entradas: number
  total_vendido: number
  total_reducido: number
  ultimo_movimiento: string | null
  es_servicio: boolean
}

export interface StockTimelineItem {
  id: number | string
  tipo: 'entrada' | 'reduccion' | 'venta'
  cantidad: number
  stock_anterior: number | null
  stock_nuevo: number | null
  motivo: string | null
  usuario: string
  fecha: string
  hora: string
  fecha_completa: string
  referencia: string | null
}

export interface StockChartData {
  categorias: string[]
  series: { name: string; data: number[] }[]
}

export interface StockProductoSelect {
  id: number
  nombre: string
  codigo: string | null
  stock: number
  es_servicio: boolean
}

export interface StockCronologiaResponse {
  producto: {
    id: number
    nombre: string
    codigo: string | null
    stock_actual: number
    es_servicio: boolean
  }
  kpis: StockKpis
  grafica: StockChartData
  timeline: StockTimelineItem[]
  rango: { inicio: string; fin: string }
}

// trae el listado de productos para el select del dashboard
export async function fetchStockProductos(search: string = ''): Promise<StockProductoSelect[]> {
  const res = await axiosInstance.get('/stock/productos', { params: { search } })
  return res.data.data?.productos ?? res.data.productos ?? []
}

// obtiene la cronologia de un producto en el rango dado
export async function fetchStockCronologia(
  productoId: number,
  fechaInicio: string,
  fechaFin: string
): Promise<StockCronologiaResponse> {
  const res = await axiosInstance.get('/stock/cronologia', {
    params: {
      producto_id:  productoId,
      fecha_inicio: fechaInicio,
      fecha_fin:    fechaFin,
    },
  })
  return res.data.data ?? res.data
}

// registra un movimiento manual de entrada o reduccion
export interface MovimientoStockPayload {
  producto_id: number
  tipo: 'entrada' | 'reduccion'
  cantidad: number
  motivo?: string | null
}

export async function registrarMovimientoStock(payload: MovimientoStockPayload) {
  const res = await axiosInstance.post('/stock/movimientos', payload)
  return res.data.data ?? res.data
}