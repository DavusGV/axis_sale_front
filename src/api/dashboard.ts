import axiosInstance from '@/utils/axios'

// Obtener datos del dashboard
export async function fetchDashboard() {
  const res = await axiosInstance.get('/dashboard')
  return res.data.data
}