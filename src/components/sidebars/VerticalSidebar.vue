<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AnimateHeight from 'vue-animate-height'
const activeMenu = ref('')
const { theme } = useLayoutStore()
const props = defineProps<{
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebar: (value: boolean) => void
}>()

import { RouterLink, useRouter } from 'vue-router'
import { IconChevronRight, IconX, IconLogout } from '@tabler/icons-vue'
import { sidebarData } from '@/data/sidebarData'
import useWindowSize from '@/utils/useWindowSize'
import { useLayoutStore } from '@/stores/layoutStore'

const router = useRouter()
const pathName = ref(router.currentRoute.value.fullPath)

function setActiveMenu(name: string) {
  if (activeMenu.value == name) {
    activeMenu.value = ''
  } else {
    activeMenu.value = name
  }
}
const updateActiveMenu = async () => {
  await router.isReady()
  sidebarData.map(({ items }) => items.map(({ submenus, name }) => submenus.map(({ url }) => (url == pathName.value ? (activeMenu.value = name) : ''))))
}

const updatePathName = () => {
  pathName.value = router.currentRoute.value.fullPath
}
onMounted(() => {
  router.afterEach(updatePathName)
})
onMounted(updateActiveMenu)

const { windowSize } = useWindowSize()
const handleRouteClick = () => {
  if (windowSize.value < 1400) {
    props.setSidebar(false)
  }
}
const isActive = (submenus: any[]) => {
  return submenus.some(({ url }) => pathName.value == url)
}
</script>
<template>
  <div>
    <div
      @click="setSidebar(false)"
      class="duration-500"
      :class="{
        'xxl:hidden max-xxl:inset-0 max-xxl:fixed z-20 bg-n800/10 ': isSidebarOpen && theme.layout == 'Vertical'
      }"
    ></div>
    <div
      @click="setSidebar(false)"
      class="duration-500"
      :class="{
        'xxl:hidden max-xxl:inset-0 max-xxl:fixed z-20 bg-n800/20 ': isSidebarOpen && theme.layout == 'Horizontal'
      }"
    ></div>

    <aside
      v-if="theme.layout == 'Vertical' || (theme.layout == 'Horizontal' && windowSize < 1400)"
      ref="target"
      class="w-[280px] xxxl:w-[336px] shadow-sm z-[21] min-h-screen duration-300 fixed bg-n0 dark:bg-bg4"
      :class="{
        'translate-x-0 visible': isSidebarOpen,
        'ltr:-translate-x-full rtl:translate-x-full invisible': !isSidebarOpen
      }"
    >
      <div class="p-4 xxl:px-6 xxxl:px-[30px] xxl:py-5">
        <div class="flex justify-between items-center">
          <RouterLink to="/">
            <img :width="174" :height="38" src="/images/logo-with-text.png" alt="logo" />
          </RouterLink>
          <button class="xxl:hidden" @click="toggleSidebar">
            <IconX />
          </button>
        </div>
      </div>
      <div class="overflow-y-auto fixed right-0 left-0 h-full">
        <div class="px-4 xxl:px-6 xxxl:px-8 pb-24">
          <div v-for="sidebar in sidebarData" :key="sidebar.id">
            <p class="text-xs font-semibold py-4 xl:py-5 border-t-2 border-dashed border-primary/20">
              {{ sidebar.title }}
            </p>
            <ul class="mb-5 flex flex-col gap-2">
              <li v-for="menu in sidebar.items" :key="menu.id" class="relative rounded-xl duration-300" :class="{ 'bg-primary/5 dark:bg-bg3': activeMenu == menu.name }">
                <button
                  @click="setActiveMenu(menu.name)"
                  class="px-4 w-full group flex justify-between items-center xxxl:px-5 py-2.5 xxl:py-3.5 rounded-lg hover:bg-primary hover:text-n0 duration-300"
                  :class="{
                    'bg-primary text-n0': isActive(menu.submenus) || activeMenu == menu.name
                  }"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-primary group-hover:text-n0" :class="{ '!text-n0': isActive(menu.submenus) || activeMenu == menu.name }">
                      <component :size="20" :is="menu.icon"></component>
                    </span>
                    <span class="text-sm">
                      {{ menu.name }}
                    </span>
                  </span>
                  <IconChevronRight :size="18" class="duration-300 rtl:rotate-180 transition-transform" :class="{ 'ltr:rotate-90 rtl:rotate-90': activeMenu == menu.name }" />
                </button>
                <AnimateHeight :height="activeMenu == menu.name ? 'auto' : 0" :duration="500" :id="menu.name">
                  <ul class="px-2 xl:px-3 py-2">
                    <li @click="handleRouteClick" v-for="submenu in menu.submenus" :key="submenu.title">
                      <RouterLink class="block py-1.5 xl:py-2 text-sm hover:text-primary duration-300 capitalize px-3 xxl:px-4" :to="submenu.url">
                        <span class="ltr:pr-2 rtl:pl-2">•</span>
                        <span class="whitespace-nowrap text-sm">{{ submenu.title }}</span>
                      </RouterLink>
                    </li>
                  </ul>
                </AnimateHeight>
              </li>
            </ul>
          </div>
        </div>
        <div class="px-4 xxl:px-6 xxxl:px-8 pb-28">
          <RouterLink to="/login-1" class="px-4 w-full group flex justify-between items-center xxxl:px-6 py-2.5 lg:py-3 rounded-2xl hover:bg-primary hover:text-n0 duration-300">
            <span class="flex items-center gap-2">
              <span class="text-primary group-hover:text-n0">
                <IconLogout class="w-5 h-5 lg:w-6 lg:h-6" />
              </span>
              <span class="text-sm">Log Out</span>
            </span>
          </RouterLink>
        </div>
      </div>
    </aside>
  </div>
</template>

<style lang="css" scoped>
.router-link-exact-active {
  color: rgb(var(--primary-color));
}
</style>
