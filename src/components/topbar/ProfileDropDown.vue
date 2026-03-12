<script setup lang="ts">
import { IconMessage } from '@tabler/icons-vue'
import { IconLogout } from '@tabler/icons-vue'
import { IconSettings } from '@tabler/icons-vue'
import { IconUser } from '@tabler/icons-vue'
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const isOpen = ref(false)
const authStore = useAuthStore()
const profileLinks = [
  {
    icon: IconUser,
    url: '/profile',
    title: 'Mi Perfil'
  },
  {
    icon: IconMessage,
    url: '/dashboards/messaging',
    title: 'Mensajes'
  },
  {
    icon: IconSettings,
    url: '/settings',
    title: 'Configuracion'
  },
  {
    icon: IconLogout,
    url: '',
    title: 'Cerrar Sesion',
    action: () => authStore.logout()
  }
]

const target = ref(null)
onClickOutside(target, () => (isOpen.value = false))
</script>

<template>
  <div class="relative" ref="target">
    <div @click="isOpen = !isOpen" class="cursor-pointer">
      <img v-if="authStore.user.foto_perfil" :src="authStore.user.foto_perfil" class="rounded-full w-10 h-10 md:w-12 md:h-12 object-cover" :width="48" :height="48" alt="profile img"  @error="authStore.user.foto_perfil = null" />
      <div v-else class="rounded-full w-10 h-10 md:w-12 md:h-12 bg-primary/10 flex items-center justify-center" >
        <IconUser :size="22" class="text-primary" />
      </div>
    </div>
    <div
      class="bg-n0 border dark:border-n500 ltr:origin-top-right rtl:origin-top-left dark:bg-n800 rounded-md ltr:right-0 rtl:left-0 shadow-lg absolute top-full duration-300 z-10"
      :class="{ 'opacity-100 scale-100 visible': isOpen, 'opacity-0 scale-0 invisible': !isOpen }"
    >
      <div class="flex flex-col text-center items-center lg:p-4 p-3 border-b dark:border-n500">
        <img v-if="authStore.user.foto_perfil" :src="authStore.user.foto_perfil" :width="60" :height="60" class="rounded-full object-cover" alt="profile img" @error="authStore.user.foto_perfil = null" />
        <div v-else class="w-[60px] h-[60px] rounded-full bg-primary/10 flex items-center justify-center" >
          <IconUser :size="28" class="text-primary" />
        </div>
        <h6 class="mt-2">{{ authStore.user.name }}</h6>
        <span class="text-sm">{{ authStore.user.email }}</span>
      </div>
      <ul class="flex flex-col w-[250px] p-2 md:p-4">
        <li v-for="item in profileLinks" :key="item.title">
          <RouterLink :to="item.url" class="flex items-center gap-2 p-2 rounded-md text-sm lg:text-base duration-300 hover:bg-primary/20 hover:text-primary" @click="item.action && item.action()">
            <span>
              <component :size="20" :is="item.icon"></component>
            </span>
            {{ item.title }}
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
