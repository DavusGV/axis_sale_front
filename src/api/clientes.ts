import axiosInstance from '@/utils/axios'

export const fetchClientes = async (params = {}) => {
  const res = await axiosInstance.get('clientes', { params })
  return res.data
}

export const crearCliente = async (data: FormData) => {
  const res = await axiosInstance.post('clientes', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const actualizarCliente = async (id: number, data: FormData) => {
  const res = await axiosInstance.post(`clientes/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const eliminarCliente = async (id: number) => {
  const res = await axiosInstance.delete(`clientes/${id}`)
  return res.data
}

export const buscarClientes = async (q: string) => {
  const res = await axiosInstance.get('clientes/buscar', { params: { q } })
  return res.data
}