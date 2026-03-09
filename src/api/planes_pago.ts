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

export { getMetodosPago }