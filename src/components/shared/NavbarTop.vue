<script lang="ts" setup>
import ModeSwitcherVue from '@/components/topbar/ModeSwitcher.vue'
import { IconMenu2, IconSearch } from '@tabler/icons-vue'
import { useLayoutStore } from '@/stores/layoutStore'
import NotificationDropdown from '../topbar/NotificationDropdown.vue'
import SwitchLanguage from '../topbar/SwitchLanguage.vue'
import ProfileDropDown from '../topbar/ProfileDropDown.vue'
import useWindowSize from '@/utils/useWindowSize'
import { useAuthStore } from '@/stores/authStore'

const { windowSize } = useWindowSize()
const { theme } = useLayoutStore()
const authStore = useAuthStore()

defineProps<{
  isSidebarOpen: boolean
  toggleSidebar: () => void
}>() 
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
      <button
        @click="toggleSidebar"
        class="text-gray-600 dark:text-gray-300 hover:text-primary transition"
      >
        <IconMenu2 />
      </button>

      <form
        class="relative hidden md:flex items-center w-full max-w-[493px]
              rounded-full px-6 xxl:px-8
              bg-primary/5 dark:bg-bg3
              border border-transparent
              hover:border-primary/40
              focus-within:border-primary
              transition-colors"
      >
        <select
          v-model="authStore.establishmentActive"
          class="w-full pr-10 appearance-none bg-transparent
                py-2 md:py-2.5 xxl:py-3
                text-sm font-semibold
                text-gray-800 dark:text-gray-100
                focus:outline-none cursor-pointer"
        >
          <option
            v-for="est in authStore.establishments"
            :key="est.id"
            :value="est.id"
            class="bg-white dark:bg-bg4
                  text-gray-800 dark:text-gray-100"
          >
            {{ est.nombre }}
          </option>
        </select>

        <!-- Font Awesome dropdown icon -->
        <span
          class="absolute right-5 pointer-events-none
                text-gray-500 dark:text-gray-400"
        >
          <i class="fa-solid fa-chevron-down text-xs"></i>
        </span>
      </form>
    </div>


    <div class="flex items-center gap-3 sm:gap-4 xxl:gap-6">
      <ModeSwitcherVue />
      <NotificationDropdown />
      <SwitchLanguage />
      <ProfileDropDown />
    </div>
  </nav>
</template>
