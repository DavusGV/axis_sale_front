import { useAuthStore } from '@/stores/authStore'

export const can = (permission: string): boolean => {
  const auth = useAuthStore()

  //super admin
  if (auth.permissions.has('*')) return true

  return auth.permissions.has(permission)
}