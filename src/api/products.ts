import axiosInstance from '@/utils/axios'

export interface ProductFilters { 
  search?:string
  page?: number 
  per_page?: number 
  categoria_id?: number | string
  unidad_medida_id?: number | string 
}

export async function fetchProducts(params: ProductFilters = {}) {
  const res = await axiosInstance.get('/products/', {
    params: {
      page: params.page ?? 1,
      search: params.search ?? '',
      categoria_id: params.categoria_id ?? '',
      unidad_medida_id: params.unidad_medida_id ?? '' 
    }
  })
  return res.data
}

// Puedes agregar aquí las funciones para crear, editar y eliminar si lo necesitas después.
//vamos a crear una función para obtener las categorías
export async function fetchCategories() {
  const res = await axiosInstance.get('/category', {
})
  return res.data 
}

//función para crear un producto
export async function createProduct(product: any) {
  const form = new FormData()

  Object.keys(product).forEach(key => {
    if (product[key] !== null && product[key] !== undefined) {
      // convertir booleanos a 1/0 para que PHP los interprete bien
      if (typeof product[key] === 'boolean') {
        form.append(key, product[key] ? '1' : '0')
      } else {
        form.append(key, product[key])
      }
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
      // convertir booleanos a 1/0 para que PHP los interprete bien
      if (typeof product[key] === 'boolean') {
        form.append(key, product[key] ? '1' : '0')
      } else {
        form.append(key, product[key])
      }
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

// obtiene todas las unidades de medida del establecimiento para el select del modal
export async function fetchUnidadesMedidasSelect() {
  const res = await axiosInstance.get('/unidades-medidas', {
    params: { per_page: 100 }
  })
  // retorna solo el array para uso en select
  return res.data.data as { id: number; unidad: string; abreviatura: string }[]
}

// descarga el template Excel del establecimiento activo
export async function downloadProductsTemplate() {
  const res = await axiosInstance.get('/products/template/download', {
    responseType: 'blob'
  })
 
  // disparamos descarga en el navegador
  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `plantilla_productos_${Date.now()}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
 
// envia el archivo al backend para validacion y preview
export interface ImportPreviewResponse {
  token: string | null
  total_filas: number
  validas: number
  con_errores: number
  errores: { fila: number; errores: string[] }[]
  mensaje?: string
}
 
export async function previewProductsImport(file: File): Promise<ImportPreviewResponse> {
  const form = new FormData()
  form.append('archivo', file)
 
  const res = await axiosInstance.post('/products/import/preview', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
 
  // el backend usa el helper Success que envuelve la data
  return res.data.data ?? res.data
}
 
// ejecuta la importacion definitiva
// si hay filas fallidas el backend devuelve un blob (.xlsx)
// si todo salio bien devuelve JSON
export interface ImportExecuteResult {
  insertados: number
  total_fallidas: number
  archivoDescargado: boolean
}
 
export async function executeProductsImport(token: string): Promise<ImportExecuteResult> {
  const res = await axiosInstance.post(
    '/products/import',
    { token },
    { responseType: 'blob' }
  )
 
  // detectamos si la respuesta es JSON o binario
  // si es JSON el content-type es application/json y el blob lo podemos leer como texto
  const contentType = res.headers['content-type'] || ''
 
  if (contentType.includes('application/json')) {
    // todo salio bien, no hubo fallidas
    const text = await (res.data as Blob).text()
    const json = JSON.parse(text)
    const data = json.data ?? json
    return {
      insertados: data.insertados ?? 0,
      total_fallidas: 0,
      archivoDescargado: false
    }
  }
 
  // hubo fallidas, descargamos el archivo de errores automaticamente
  const insertados = parseInt(res.headers['x-insertados'] ?? '0', 10)
  const totalFallidas = parseInt(res.headers['x-total-fallidas'] ?? '0', 10)
 
  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `productos_fallidos_${Date.now()}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
 
  return {
    insertados,
    total_fallidas: totalFallidas,
    archivoDescargado: true
  }
}