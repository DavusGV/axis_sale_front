import axiosInstance from '@/utils/axios'

export async function fetchProducts() {
  const res = await axiosInstance.get('/products/', {
   
  })
  return res.data // { data: [...], total: ... }
}

// Puedes agregar aquí las funciones para crear, editar y eliminar si lo necesitas después.

//vamos a crear una función para obtener las categorías
export async function fetchCategories() {
  const res = await axiosInstance.get('/category/', {

  })
  return res.data // { data: [...], total: ... }
}

//función para crear un producto
// función para crear un producto
export async function createProduct(product: any) {
  const res = await axiosInstance.post('/products/', product)
  return res.data // puedes retornar la respuesta del backend
}