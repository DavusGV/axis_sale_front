import axiosInstance from '@/utils/axios'

// obtener lista de establecimientos
export async function getEstablecimientos(params: any) {
  const res = await axiosInstance.get('/establecimientos', { params })
  return res.data
}
// obtener un establecimiento por id
export async function getEstablecimiento(id: number) {
  const res = await axiosInstance.get(`/establecimientos/${id}`)
  return res.data
}
//crear un establecimiento
export async function createEstablecimiento(payload: any) {
  const res = await axiosInstance.post('/establecimientos', payload)
  return res.data
}
// actualizar un establecimiento
export async function updateEstablecimiento(id: number, payload: any) {
  const res = await axiosInstance.put(`/establecimientos/${id}`, payload)
  return res.data
}
// eliminar un establecimiento
export async function deleteEstablecimiento(id: number) {
  const res = await axiosInstance.delete(`/establecimientos/${id}`)
  return res.data
}
// obtener usuarios asignados a un establecimiento
export async function getEstablecimientoUsers(id: number) {
  const res = await axiosInstance.get(`/establecimientos/${id}/users`)
  return res.data
}
// asignar un usuario a un establecimiento
export async function assignUserToEstablecimiento(payload: any) {
  const res = await axiosInstance.post('/establecimientos/assign-user', payload)
  return res.data
}
// desasignar un usuario de un establecimiento
export async function unassignUserFromEstablecimiento(payload: any) {
  const res = await axiosInstance.post('/establecimientos/unassign-user', payload)
  return res.data
}

