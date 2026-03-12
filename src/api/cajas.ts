import axiosInstance from '@/utils/axios'

export async function fetchCajas() {
  const res = await axiosInstance.get('/cajas/', {
  })
  return res.data // { data: [...], total: ... }
}

// api/cajas.ts
export async function fetchHistoryBox(boxId: number,params: { page: number })
{ const { data } = await axiosInstance.get(`/cajas/${boxId}/history`,{ params })
  return data
}

export async function fetchHistorySales(historyId: number) {
  const res = await axiosInstance.get(`/cajas/${historyId}/sales`, {
  })
  return res.data
}