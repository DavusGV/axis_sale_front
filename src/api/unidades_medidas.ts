import axiosInstance from '@/utils/axios'

export interface UnidadMedida {
  id: number
  unidad: string
  abreviatura: string
  descripcion?: string | null
}

export interface UnidadMedidaFilters {
  search?: string
  page?: number
  per_page?: number
}

// obtiene la lista paginada de unidades del establecimiento activo
export async function fetchUnidadesMedidas(params: UnidadMedidaFilters = {}) {
  const res = await axiosInstance.get('/unidades-medidas', {
    params: {
      page: params.page ?? 1,
      search: params.search ?? '',
      per_page: params.per_page ?? 15
    }
  })
  return res.data
}

// crea una nueva unidad de medida
export async function createUnidadMedida(data: Partial<UnidadMedida>) {
  const res = await axiosInstance.post('/unidades-medidas', data)
  return res.data
}

// actualiza una unidad existente
export async function updateUnidadMedida(id: number, data: Partial<UnidadMedida>) {
  const res = await axiosInstance.put(`/unidades-medidas/${id}`, data)
  return res.data
}

// elimina una unidad (el backend bloquea si hay productos vinculados)
export async function destroyUnidadMedida(id: number) {
  const res = await axiosInstance.delete(`/unidades-medidas/${id}`)
  return res.data
}