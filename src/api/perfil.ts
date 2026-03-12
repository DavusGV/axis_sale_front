import axiosInstance from '@/utils/axios'

// Obtener datos del usuario autenticado
export async function getPerfil() {
  const res = await axiosInstance.get('perfil')
  return res.data.data.user
}

// Actualizar datos personales
export async function updatePerfil(data: Record<string, any>) {
  const res = await axiosInstance.put('perfil', data)
  return res.data
}

// Subir foto de perfil
export async function uploadFotoPerfil(file: File) {
  const formData = new FormData()
  formData.append('foto', file)
  const res = await axiosInstance.post('perfil/foto', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data.data
}