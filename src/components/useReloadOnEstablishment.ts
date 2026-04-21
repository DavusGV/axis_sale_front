import { watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

export const useReloadOnEstablishment = (callback: () => void | Promise<void>) => {
  const authStore = useAuthStore()

  watch(
    () => authStore.establishmentActive,
    async (newVal, oldVal) => {
      if (!newVal || newVal === oldVal) return
      await callback()
    }
  )
}