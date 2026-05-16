import axiosInstance from '@/utils/axios'
import { getMetodosPago } from '@/api/ventas'

export const crearPlanPago = async (data: object) => {
  const res = await axiosInstance.post('planes-pago', data)
  return res.data
}

export const fetchPlanesPago = async (params = {}) => {
  const res = await axiosInstance.get('planes-pago', { params })
  return res.data
}

export const fetchPlanPago = async (id: number) => {
  const res = await axiosInstance.get(`planes-pago/${id}`)
  return res.data
}

export const fetchPagosPlan = async (planId: number) => {
  const res = await axiosInstance.get(`planes-pago/${planId}/pagos`)
  return res.data
}

export const registrarAbono = async (planId: number, data: object) => {
  const res = await axiosInstance.post(`planes-pago/${planId}/pagos`, data)
  return res.data
}

export const fetchPlanesPorCliente = async (clienteId: number) => {
  const res = await axiosInstance.get('planes-pago', {
    params: { cliente_id: clienteId, estado: 'activo' }
  })
  return res.data
}

export const descargarTicketCredito = async (planId: number): Promise<Blob> => {
  const res = await axiosInstance.get(`planes-pago/${planId}/ticket-pdf`, {
    responseType: 'blob'
  })
  return res.data
}

export const descargarTicketAbono = async (planId: number, pagoId: number): Promise<Blob> => {
  const res = await axiosInstance.get(`planes-pago/${planId}/pagos/${pagoId}/ticket-pdf`, {
    responseType: 'blob'
  })
  return res.data
}

// obtiene el PDF del ticket de credito en base64 para impresion con QZ Tray
export const obtenerTicketCreditoBase64 = async (
    planId: number
): Promise<{ pdf_base64: string; nombre_archivo: string }> => {
    const res = await axiosInstance.get(`planes-pago/${planId}/ticket-credito-base64`)
    return res.data.data
}

// obtiene el PDF del ticket de abono en base64 para impresion con QZ Tray
export const obtenerTicketAbonoBase64 = async (
    planId: number,
    pagoId: number
): Promise<{ pdf_base64: string; nombre_archivo: string }> => {
    const res = await axiosInstance.get(`planes-pago/${planId}/pagos/${pagoId}/ticket-abono-base64`)
    return res.data.data
}

export { getMetodosPago }