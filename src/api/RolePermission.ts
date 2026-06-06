import axiosInstance from "@/utils/axios";

// Crear rol
export async function createRole(data: { name: string }) {
  const res = await axiosInstance.post(`/roles-permissions/roles`, data);
  return res.data;
}

// Obtener todos los roles
export async function getAllRoles(p0: { page: number; per_page: number; }) {
  const res = await axiosInstance.get(`/roles-permissions/roles`);
  return res.data;
}

// Obtener permisos de un rol
export async function getPermissionsToRole(role: string) {
  const res = await axiosInstance.get(`/roles-permissions/roles/${role}`);
  return res.data;
}

// Crear permiso
export async function createPermission(data: { name: string }) {
  const res = await axiosInstance.post(`/roles-permissions/permissions`, data);
  return res.data;
}

// Obtener todos los permisos
export async function getAllPermissions(p0: { page: number; per_page: number; }) {
  const res = await axiosInstance.get(`/roles-permissions/permissions`);
  return res.data;
}

// Actualizar permiso
export async function updatePermission(id: number, data: { name: string }) {
  const res = await axiosInstance.put(`/roles-permissions/permissions/${id}`, data);
  return res.data;
}

// Eliminar permiso
export async function deletePermission(id: number) {
  const res = await axiosInstance.delete(`/roles-permissions/permissions/${id}`);
  return res.data;
}

// Sincronizar permisos a un rol
export async function syncPermissionsToRole(data: {
  role: string;
  permissions: string[];
}) {
  const res = await axiosInstance.post(`/roles-permissions/sync-permissions`, data);
  return res.data;
}

// Asignar rol a usuario
export async function assignRoleToUser(data: {
  user_id: number;
  role: string;
}) {
  const res = await axiosInstance.post(`/roles-permissions/assign-role`, data);
  return res.data;
}

// Cambiar rol de usuario
export async function changeUserRole(data: {
  user_id: number;
  role: string;
}) {
  const res = await axiosInstance.post(`/roles-permissions/change-role`, data);
  return res.data;
}

// Crear categoría
export async function createCategory(data: { name: string }) {
  const res = await axiosInstance.post(`/roles-permissions/categories`, data);
  return res.data;
}

// Obtener todas las categorías
export async function getAllCategories() {
  const res = await axiosInstance.get(`/roles-permissions/categories`);
  return res.data;
}

// Obtener permisos por categoría (opcional)
export async function getPermissionsByCategory(categoryId?: number) {
  const url = categoryId
    ? `/roles-permissions/categories/${categoryId}/permissions`
    : `/roles-permissions/categories/permissions`;

  const res = await axiosInstance.get(url);
  return res.data;
}