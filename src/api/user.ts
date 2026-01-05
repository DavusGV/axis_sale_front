import axiosInstance from '@/utils/axios'


export interface UserPayload {
  name: string
  email: string
  password?: string
  password_confirmation?: string
}

export interface AssignEstablecimientoPayload {
  user_id: number
  establecimiento_id: number
}


// Obtener usuarios
export async function getUsers(params: any) {
  const res = await axiosInstance.get('/users', { params })
  return res.data
}

// Obtener usuario por ID
// - user
// - assigned_establecimientos
// - available_establecimientos
export async function getUserById(id: number) {
  const res = await axiosInstance.get(`/users/${id}`)
  return res.data.data.user
}

// Crear usuario
export async function createUser(payload: UserPayload) {
  const res = await axiosInstance.post('/users', payload)
  return res.data
}

// Actualizar usuario
export async function updateUser(id: number, payload: UserPayload) {
  const res = await axiosInstance.put(`/users/${id}`, payload)
  return res.data
}

// Eliminar usuario
export async function deleteUser(id: number) {
  const res = await axiosInstance.delete(`/users/${id}`)
  return res.data
}

// Establecimientos asignados a un usuario
export async function getUserEstablecimientos(userId: number) {
  const res = await axiosInstance.get(`/users/${userId}/establecimientos`)
  return res.data.data
}

// Asignar establecimiento a un usuario
export async function assignUserEstablecimiento(userId: number, establecimientoId: number) {
  const res = await axiosInstance.post(`/users/${userId}/establecimientos`, {
    establecimiento_id: establecimientoId
  })
  return res.data
}

// Desasignar establecimiento de un usuario
export async function unassignUserEstablecimiento(userId: number, establecimientoId: number) {
  const res = await axiosInstance.delete(`/users/${userId}/establecimientos/${establecimientoId}`)
  return res.data
}
