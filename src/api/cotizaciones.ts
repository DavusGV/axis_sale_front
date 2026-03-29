import axiosInstance from '@/utils/axios'

// obtiene el listado paginado de cotizaciones con filtro por folio
export const fetchCotizaciones = async (params = {}) => {
  const res = await axiosInstance.get('/cotizaciones', { params })
  return res.data
}

// guarda una nueva cotizacion desde el carrito
export const registrarCotizacion = async (data: any) => {
  const res = await axiosInstance.post('/cotizaciones', data)
  return res.data
}

export async function descargarTicketCotizacionPdf(id: number) {
  const res = await axiosInstance.get(`/cotizaciones/${id}/ticket-pdf`, {
    responseType: 'blob'
  })
  return res
}

// comprueba el stock de los productos de una cotizacion
export const comprobarStockCotizacion = async (id: number) => {
  const res = await axiosInstance.get(`/cotizaciones/${id}/comprobar`)
  return res.data
}

// actualiza los datos de los prodcutos de cotizacion detalle
export const actualizarDetallesCotizacion = (id: number, data: any) =>
  axiosInstance.put(`/cotizaciones/${id}/detalles`, data).then(res => res.data)

// convierte una cotizacion en venta enviando los datos de pago
export const convertirCotizacion = async (id: number, data: any) => {
  const res = await axiosInstance.post(`/cotizaciones/${id}/convertir`, data)
  return res.data
}

// cancela una cotizacion pendiente sin afectar productos
export const cancelarCotizacion = async (id: number) => {
  const res = await axiosInstance.patch(`/cotizaciones/${id}/cancelar`, {})
  return res.data
}