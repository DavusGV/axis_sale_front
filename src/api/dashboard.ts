import axiosInstance from '@/utils/axios'

// Obtener datos del dashboard
export async function fetchDashboard() {
  const res = await axiosInstance.get('/dashboard')
  return res.data.data
}

// Exportar dashboard en Excel
export async function exportDashboardExcel() {
  const res = await axiosInstance.get('/dashboard/export/excel', {
    responseType: 'blob'
  })
  return res
}

// Exportar dashboard en PDF
export async function exportDashboardPdf() {
  const res = await axiosInstance.get('/dashboard/export/pdf', {
    responseType: 'blob'
  })
  return res
}