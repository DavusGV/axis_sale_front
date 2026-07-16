import axiosInstance from '@/utils/axios'

export type BarcodeModo = 'todos' | 'especifico'
export type BarcodeTipoCantidad = 'unica' | 'personalizada' | 'stock'

export interface BarcodeParams {
  modo: BarcodeModo
  producto_id?: number | null
  tipo_cantidad: BarcodeTipoCantidad
  cantidad?: number
  incluir_precio?: boolean
}

export interface BarcodeEtiqueta {
  nombre: string
  codigo: string
  precio: number | null
  barcode: string
}

export interface BarcodePreviewResponse {
  total_etiquetas: number
  total_paginas: number
  por_pagina: number
  columnas: number
  filas: number
  primera_pagina: BarcodeEtiqueta[]
}

// preview liviano: totales + primera pagina con barcodes reales
export async function previewBarcodes(params: BarcodeParams): Promise<BarcodePreviewResponse> {
  const res = await axiosInstance.post('/products/barcodes/preview', params)
  // el backend envuelve la data con el helper Success
  return res.data.data ?? res.data
}

// genera y descarga el PDF de etiquetas
export async function downloadBarcodesPdf(params: BarcodeParams): Promise<void> {
  const res = await axiosInstance.post('/products/barcodes/pdf', params, {
    responseType: 'blob'
  })

  const blob = new Blob([res.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `codigos_barras_${Date.now()}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}