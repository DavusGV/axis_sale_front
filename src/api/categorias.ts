import axiosInstance from '@/utils/axios'

// Listado paginado para la vista de categorias
export async function fetchCategorias(params: { page?: number; search?: string } = {}) {
  const res = await axiosInstance.get('/category/list', {
    params: {
      page: params.page ?? 1,
      search: params.search ?? ''
    }
  })
  return res.data
}

// Crear categoria
export async function registrarCategoria(data: { nombre: string; descripcion: string }) {
  const res = await axiosInstance.post('/category', data)
  return res.data
}

// Editar categoria
export async function editarCategoria(data: { id: number; nombre: string; descripcion: string }) {
  const res = await axiosInstance.put(`/category/${data.id}`, data)
  return res.data
}

// Eliminar categoria
export async function deleteCategoria(id: number) {
  const res = await axiosInstance.delete(`/category/${id}`)
  return res.data
}