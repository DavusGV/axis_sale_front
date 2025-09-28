<script setup lang="ts">
import { IconEyeOff } from '@tabler/icons-vue'
import { IconEye } from '@tabler/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Loader from '@/components/loader/Loader.vue'
import { useAuthStore } from '@/stores/authStore'
 // Importa SweetAlert2 // Importa el componente Loader

const showPass = ref(false)
const email = ref('')
const password = ref('')
const router = useRouter()
const loading = ref(false)
const authStore = useAuthStore()

const handleLogin = async () => {
  await authStore.login(email.value, password.value)
}
</script>

<template>
  <div class="min-h-screen py-10 md:py-16 lg:py-20 xl:py-28 px-3 md:px-5 flex items-center justify-center bg-[url(/images/login-3.png)] bg-cover">
    <div class="box w-full p-3 md:p-4 xl:p-6 items-center max-w-[805px]">
      <form @submit.prevent="handleLogin" class="box bg-primary/5 dark:bg-bg3 lg:p-6 xl:p-8">
        <h3 class="h3 my-4">Bienvenido!</h3>
        <p class="md:mb-6 md:pb-6 mb-4 pb-4 bb-dashed text-sm md:text-base">Inicia sesion para disfrutar del servicio de la plataforma</p>
        <label for="email" class="md:text-lg font-medium block mb-4"> Email </label>
        <input
          v-model="email"
          type="email"
          class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-5"
          placeholder="Enter Your Email"
          id="email"
          required
        />
        <label for="password" class="md:text-lg font-medium block mb-4"> Password </label>
        <div class="bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-4 relative">
          <input v-model="password" :type="showPass ? 'text' : 'password'" class="w-11/12 text-sm focus:outline-none bg-transparent" placeholder="Enter Your Password" id="password" required />
          <span @click="showPass = !showPass" class="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 cursor-pointer">
            <IconEye v-if="showPass" />
            <IconEyeOff v-else />
          </span>
        </div>

        <RouterLink to="#" class="flex justify-end text-primary text-sm"> Has olvidado tu contraseña </RouterLink>
        <!-- <p class="mt-3">
          ¿No tienes cuenta?
          <RouterLink class="text-primary" to="/signup-1"> Registarte </RouterLink>
        </p> -->
        <div class="mt-6 lg:mt-8 flex gap-6">
          <button class="btn px-5">Iniciar Sesion</button>
        </div>
      </form>
    </div>
  </div>
  <Loader :loading="authStore.loading" />
</template>
