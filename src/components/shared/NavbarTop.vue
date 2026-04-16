<script lang="ts" setup>
import ModeSwitcherVue from '@/components/topbar/ModeSwitcher.vue'
import { IconMenu2, IconSearch } from '@tabler/icons-vue'
import { useLayoutStore } from '@/stores/layoutStore'
import NotificationDropdown from '../topbar/NotificationDropdown.vue'
import SwitchLanguage from '../topbar/SwitchLanguage.vue'
import ProfileDropDown from '../topbar/ProfileDropDown.vue'
import useWindowSize from '@/utils/useWindowSize'
import { useAuthStore } from '@/stores/authStore'
import { useConfiguracionStore } from '@/stores/configuracionStore'
import { onMounted, watch } from 'vue'

const { windowSize } = useWindowSize()
const { theme } = useLayoutStore()
const authStore = useAuthStore()
const configuracionStore = useConfiguracionStore()

defineProps<{
  isSidebarOpen: boolean
  toggleSidebar: () => void
}>()

onMounted(async () => {
  // cargamos la configuracion al montar si ya hay un establecimiento activo
  if (authStore.establishmentActive) {
    await configuracionStore.cargar()
  }
})

// cuando el usuario cambia de establecimiento recargamos la configuracion
watch(
  () => authStore.establishmentActive,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    configuracionStore.resetear()
    await configuracionStore.cargar()
  }
)
</script>
<template>
  <nav
    class="px-4 xxl:px-6 py-2 xl:py-3 shadow-sm duration-300 dark:border-b dark:border-n700 navbar-top z-20 xxl:py-3.5 gap-3 bg-n0 dark:bg-bg4 fixed flex justify-between items-center"
    :class="{
      'w-full xxxl:w-[calc(100%-336px)] xxl:w-[calc(100%-280px)] ltr:xxxl:ml-[336px] ltr:xxl:ml-[280px] rtl:xxxl:mr-[336px] rtl:xxl:mr-[280px]':
        (isSidebarOpen && theme.layout == 'Vertical') || (theme.layout == 'Horizontal' && windowSize < 1400),
      'w-full xxxl:w-[calc(100%-360px)] xxl:w-[calc(100%-280px)] ltr:xxxl:ml-[360px] ltr:xxl:ml-[280px] rtl:xxxl:mr-[360px] rtl:xxl:mr-[280px]': isSidebarOpen && theme.layout == 'Two Column',
      'w-full xxl:w-[calc(100%-80px)] ltr:xxl:ml-[80px] rtl:xxl:mr-[80px]': isSidebarOpen && theme.layout == 'Hovered',
      'w-full': !isSidebarOpen
    }"
  >
    <div class="flex grow md:gap-4 xxl:gap-6 items-center">
  
  <!-- Botón menú -->
  <button
    @click="toggleSidebar"
    class="text-gray-600 dark:text-gray-300 hover:text-primary transition"
  >
    <IconMenu2 />
  </button>

  <!-- Selector de establecimiento -->
  <div
    class="relative hidden md:flex items-center w-full max-w-[493px]"
  >
    <select
      v-model="authStore.establishmentActive"
      class="w-full appearance-none
             bg-white dark:bg-bg3
             border border-gray-300 dark:border-gray-600
             rounded-xl
             py-2.5 md:py-3
             pl-4 pr-10
             text-sm font-medium
             text-gray-700 dark:text-gray-100
             shadow-sm
             hover:border-primary
             focus:ring-2 focus:ring-primary focus:border-primary
             transition-all duration-200
             cursor-pointer"
    >
      <!-- Placeholder -->
      <option disabled value="">
        Selecciona un establecimiento
      </option>

      <option
        v-for="est in authStore.establishments"
        :key="est.id"
        :value="est.id"
      >
        {{ est.nombre }}
      </option>
    </select>

    <!-- Icono dropdown -->
    <span
      class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
             text-gray-400"
    >
      <i class="fa-solid fa-chevron-down text-xs"></i>
    </span>
  </div>

</div>

    <div class="flex items-center gap-3 sm:gap-4 xxl:gap-6">
      <ModeSwitcherVue />
      <NotificationDropdown />
      <SwitchLanguage />
      <ProfileDropDown />
    </div>
  </nav>
</template>
