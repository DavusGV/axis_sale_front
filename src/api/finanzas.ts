import axiosInstance from '@/utils/axios'

// Interfaz para los datos de venta
export interface payload {
  id?: number
  name: string
  description: string
  state: string
}

export interface filter { 
  search?:string
  page?: number 
  per_page?: number 
  status?:  string
}

export interface filtergasto { 
  search?:string
  page?: number 
  per_page?: number 
  status?:  string,
  month?: number,
  year?: numer
}

// Función para registrar tipo de gastos
export async function registrarTipoGasto(tipoGastoData: payload) {
  const res = await axiosInstance.post('/finance/tgasto', tipoGastoData)
  return res.data
}


export async function fetchTgastos(params: filter = {}) {
  const res = await axiosInstance.get('/finance/tgasto', {
    params: {
      page: params.page ?? 1,
      search: params.search ?? '',
      status: params.status ?? ''
    }
  })

  return res.data.data 
}

export async function deleteType(id: number) {
  const res = await axiosInstance.delete(`/finance/tgasto/${id}`)
  return res.data
}

export async function editarTipoGasto(tipoGastoData: payload) {
  const res = await axiosInstance.put('/finance/tgasto', tipoGastoData)
  return res.data
}

export async function fetchGastos(params: filtergasto = {}) {
  const res = await axiosInstance.get('/finance/gasto', {
    params: {
      page: params.page ?? 1,
      search: params.search ?? '',
      status: params.status ?? '',
      month: params.month ?? null,
      year: params.year ?? null
    }
  })

  return res.data.data 
}

export async function getType() {
  const res = await axiosInstance.get('/finance/getType')

  return res.data 
}

export async function getMethodPay() {
  const res = await axiosInstance.get('/finance/getmethodpay')

  return res.data 
}