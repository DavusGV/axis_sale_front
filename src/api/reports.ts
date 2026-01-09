import axiosInstance from '@/utils/axios'

//función para crear un producto
// función para crear un producto
export async function getSales(payload: any) {
  const res = await axiosInstance.post('/reportes/ventas', payload)
  return res.data // puedes retornar la respuesta del backend
}
