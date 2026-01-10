import axiosInstance from '@/utils/axios'

export interface ProductFilters { 
  search?:string
  page?: number 
  per_page?: number 
  categoria_id?: number | string
}

export async function fetchProducts(params: ProductFilters = {}) {
  const res = await axiosInstance.get('/products/', {
    params: {
      page: params.page ?? 1,
      search: params.search ?? '',
      categoria_id: params.categoria_id ?? ''
    }
  })
  return res.data
}

// Puedes agregar aquí las funciones para crear, editar y eliminar si lo necesitas después.
//vamos a crear una función para obtener las categorías
export async function fetchCategories() {
  const res = await axiosInstance.get('/category/', {
})
  return res.data 
}

//función para crear un producto
export async function createProduct(product: any) {
  const form = new FormData()

  Object.keys(product).forEach(key => {
    if (product[key] !== null && product[key] !== undefined) {
      form.append(key, product[key])
    }
  })
  const res = await axiosInstance.post("/products", form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return res.data
}



// función para editar un producto
export async function updateProduct(product: any) {
  const form = new FormData()

  // Agregar todos los campos
  Object.keys(product).forEach(key => {
    if (product[key] !== null && product[key] !== undefined) {
      form.append(key, product[key])
    }
  })
  // Asegurar que imagen se mande como archivo si existe
  if (product.imagen instanceof File) {
    form.append('imagen', product.imagen)
  }
  const res = await axiosInstance.post(`/products/${product.id}?_method=PUT`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return res.data
}


// eliminamos un producto
export async function DestroyProduct(id: number){
  const res = await axiosInstance.delete(`/products/${id}`)
  return res.data
}