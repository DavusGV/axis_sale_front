import axiosInstance from '@/utils/axios'

export async function fetchCajas() {
  const res = await axiosInstance.get('/cajas/', {

  })
  return res.data // { data: [...], total: ... }
}

export async function fetchHistoryBoxes(boxId: number) {
  const res = await axiosInstance.get(`/cajas/${boxId}/history`, {
  })
  return res.data
}

 export async function fetchHistorySales(historyId: number) {
  const res = await axiosInstance.get(`/cajas/${historyId}/sales`, {
  })
  return res.data
}