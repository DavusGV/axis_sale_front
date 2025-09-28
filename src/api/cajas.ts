import axiosInstance from '@/utils/axios'

export async function fetchCajas() {
  const res = await axiosInstance.get('/cajas/', {

  })
  return res.data // { data: [...], total: ... }
}
