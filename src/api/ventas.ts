import axiosInstance from '@/utils/axios'

// Interfaz para los datos de venta
export interface VentaData {
  usuario_id: number
  total: number
  pago: number
  cambio: number
  metodo_pago: string
  detalles: Array<{
    producto_id: number
    cantidad: number
    precio: number
    precio_compra: number
  }>
}

// Interfaz para respuesta de código de barras
export interface ProductoPorCodigo {
  id: number
  nombre: string
  codigo: string
  precio_compra: number
  precio_venta: number
  stock: number
  imagen: string
}

export interface ProductFilters { 
  search?:string
  page?: number 
  per_page?: number 
  categoria_id?: number | string
}

export interface payload {
  year: number
  month: number
  idestablishment: number
}

export async function fetchProducts(params: ProductFilters = {}) {
  const res = await axiosInstance.get('/ventas/products', {
    params: {
      page: params.page ?? 1,
      search: params.search ?? '',
      categoria_id: params.categoria_id ?? ''
    }
  })
  return res.data
}

// Función para buscar producto por código de barras
export async function buscarPorCodigoBarras(codigo: string) {
  const res = await axiosInstance.post('/ventas/read-code', { codigo })
  return res.data
}

// Función para registrar una venta
export async function registrarVenta(ventaData: VentaData) {
  const res = await axiosInstance.post('/ventas/store', ventaData)
  return res.data
}


//función para obtener las ventas del dia
export async function getIncome(payload: payload) {
  const res = await axiosInstance.post('/finance/getIncome', payload)
  return res.data
}
