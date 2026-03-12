<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { IconEye, IconEyeOff, IconCamera } from '@tabler/icons-vue'
import Swal from 'sweetalert2'
import { getPerfil, updatePerfil, uploadFotoPerfil } from '@/api/perfil'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()

// ---------------- STATE ----------------
const loading = ref(true)
const isSubmitting = ref(false)

const user = ref<any>(null)

// foto previa para mostrar en el banner antes de guardar
const fotoPreview = ref<string | null>(null)

const form = ref({
  name: '',
  email: '',
  telefono: '',
  direccion: '',
  fecha_nacimiento: '',
})

const passForm = ref({
  password: '',
  password_confirmation: '',
})

const errors = ref<Record<string, string[]>>({})
const mostrarPassword = ref(false)
const mostrarPasswordConfirm = ref(false)

// ---------------- COMPUTED ----------------

// Muestra foto de preview si se selecciono una, si no la del servidor, si no un placeholder
const fotoPerfil = computed(() => {
  if (fotoPreview.value) return fotoPreview.value
  if (user.value?.foto_perfil) return user.value.foto_perfil
  return '/images/profile-img.png'
})

// ---------------- LOAD ----------------
async function init() {
   try {
    loading.value = true
    user.value = await getPerfil()
    // actualizar el store para que el navbar tenga la foto
    await authStore.refreshUser()
    form.value = {
      name:             user.value.name             ?? '',
      email:            user.value.email            ?? '',
      telefono:         user.value.telefono         ?? '',
      direccion:        user.value.direccion        ?? '',
      fecha_nacimiento: user.value.fecha_nacimiento ?? '',
    }
  } catch (e) {
    Swal.fire('Error', 'No se pudo cargar el perfil', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(init)

onUnmounted(() => {
  if (fotoPreview.value) {
    URL.revokeObjectURL(fotoPreview.value)
    fotoPreview.value = null
  }
})

// ---------------- ACTIONS ----------------
function clearError(field: string) {
  if (errors.value[field]) delete errors.value[field]
}

// Click en la foto: abre el input file oculto
function triggerFotoInput() {
  const input = document.getElementById('inputFotoPerfil') as HTMLInputElement
  input?.click()
}

// Cuando selecciona un archivo: muestra preview y sube al servidor
async function onFotoChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // preview local inmediato
  fotoPreview.value = URL.createObjectURL(file)

  try {
    Swal.fire({ title: 'Subiendo foto...', didOpen: () => Swal.showLoading() })
    const datos = await uploadFotoPerfil(file)
    // actualizar la vista
    if (user.value) user.value.foto_perfil = datos.foto_perfil
    // actualizar el navbar
    authStore.user.foto_perfil = datos.foto_perfil
    localStorage.setItem('user', JSON.stringify(authStore.user))
    Swal.close()
    await Swal.fire('Listo', 'Foto actualizada correctamente', 'success')
  } catch {
    Swal.close()
    Swal.fire('Error', 'No se pudo subir la foto', 'error')
    fotoPreview.value = null
  }
}

// Guardar datos personales
async function saveDatos() {
  isSubmitting.value = true
  errors.value = {}
  try {
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() })
    await updatePerfil(form.value)
    // actualizar el navbar con los nuevos datos
    authStore.user.name = form.value.name
    authStore.user.email = form.value.email
    localStorage.setItem('user', JSON.stringify(authStore.user))
    Swal.close()
    await Swal.fire('Exito', 'Datos actualizados correctamente', 'success')
  } catch (e: any) {
    Swal.close()
    if (e.response?.status === 422 && e.response.data?.errors) {
      errors.value = e.response.data.errors
      return
    }
    Swal.fire('Error', e.response?.data?.message ?? 'Error inesperado', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Guardar nueva contrasena
async function savePassword() {
  isSubmitting.value = true
  errors.value = {}
  try {
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() })
    await updatePerfil({
      password:              passForm.value.password,
      password_confirmation: passForm.value.password_confirmation,
    })
    Swal.close()
    passForm.value = { password: '', password_confirmation: '' }
    await Swal.fire('Exito', 'Contrasena actualizada correctamente', 'success')
  } catch (e: any) {
    Swal.close()
    if (e.response?.status === 422 && e.response.data?.errors) {
      errors.value = e.response.data.errors
      return
    }
    Swal.fire('Error', e.response?.data?.message ?? 'Error inesperado', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-center py-20 text-n500">
    Cargando perfil...
  </div>

  <div v-else-if="user">

    <!-- ===== BANNER CON FOTO Y DATOS RESUMIDOS ===== -->
    <div class="bg-[url(/images/profile-bg.png)] bg-contain bg-top bg-no-repeat -mx-3 sm:-mx-4 xxxl:-mx-6 mb-6 overflow-x-hidden">
      <div class="pt-10 min-[450px]:pt-14 sm:pt-24 md:pt-32 lg:pt-44 xl:pt-52 4xl:pt-[280px] px-3 lg:px-4 xxxl:px-6">
        <div class="box p-2 sm:p-3 xxxl:p-5">
          <div class="box p-2 bg-primary/5 4xl:px-12 xxl:py-8 flex flex-wrap xl:flex-nowrap lg:divide-x divide-dashed divide-primary/20 gap-5">

            <!-- FOTO DE PERFIL (click para cambiar) -->
            <div class="flex flex-wrap xl:flex-nowrap items-center gap-3 4xl:gap-5 4xl:pr-8">
              <div class="relative shrink-0 cursor-pointer group" @click="triggerFotoInput">
                <div class="p-1 sm:p-1.5 rounded-2xl max-[465px]:w-full bg-n0 dark:bg-bg3 lg:-mt-32 shadow-[0px_4px_40px_0px_rgba(0,0,0,0.16)]">
                  <img
                    :src="fotoPerfil"
                    :width="220"
                    :height="280"
                    class="rounded-xl max-[465px]:w-full object-cover"
                    alt="foto perfil"
                  />
                </div>
                <!-- overlay al pasar el mouse -->
                <div class="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconCamera :size="32" class="text-white" />
                </div>
              </div>

              <!-- input file oculto -->
              <input
                id="inputFotoPerfil"
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                class="hidden"
                @change="onFotoChange"
              />

              <!-- NOMBRE Y ESTABLECIMIENTO(S) -->
              <div class="max-[465px]:flex flex-col items-center max-[465px]:w-full">
                <h4 class="h4 mb-1">{{ user.name }}</h4>
                <span class="text-sm text-n500">{{ user.email }}</span>
                <div class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="est in user.establecimientos"
                    :key="est.id"
                    class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {{ est.nombre }}
                  </span>
                </div>
              </div>
            </div>

            <!-- DATOS RESUMIDOS -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-xl:w-full xl:px-3 xxxl:px-5">
              <div class="flex flex-col gap-1">
                <p class="font-semibold text-sm">Telefono</p>
                <span class="text-sm text-n500">{{ user.telefono ?? '—' }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <p class="font-semibold text-sm">Direccion</p>
                <span class="text-sm text-n500">{{ user.direccion ?? '—' }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <p class="font-semibold text-sm">Fecha de nacimiento</p>
                <span class="text-sm text-n500">{{ user.fecha_nacimiento ?? '—' }}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- ===== CONTENIDO DEBAJO DEL BANNER ===== -->
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
      <div class="col-span-12">

        <!-- SECCION: DATOS PERSONALES -->
        <div class="box xl:p-8 mb-6">
          <div class="bb-dashed pb-6 mb-6">
            <p class="font-medium mb-1">Datos personales</p>
            <span class="text-xs text-n500">Actualiza tu informacion de perfil</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label class="md:text-lg font-medium block mb-2">Nombre</label>
              <input
                v-model="form.name"
                @input="clearError('name')"
                class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-6 py-3"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name[0] }}</p>
            </div>

            <div>
              <label class="md:text-lg font-medium block mb-2">Correo</label>
              <input
                v-model="form.email"
                type="email"
                @input="clearError('email')"
                class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-6 py-3"
                :class="{ 'border-red-500': errors.email }"
              />
              <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email[0] }}</p>
            </div>

            <div>
              <label class="md:text-lg font-medium block mb-2">Telefono</label>
              <input
                v-model="form.telefono"
                @input="clearError('telefono')"
                class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-6 py-3"
              />
            </div>

            <div>
              <label class="md:text-lg font-medium block mb-2">Fecha de nacimiento</label>
              <input
                v-model="form.fecha_nacimiento"
                type="date"
                @input="clearError('fecha_nacimiento')"
                class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-6 py-3"
              />
            </div>

            <div class="md:col-span-2">
              <label class="md:text-lg font-medium block mb-2">Direccion</label>
              <input
                v-model="form.direccion"
                @input="clearError('direccion')"
                class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-6 py-3"
              />
            </div>

          </div>

          <div class="flex gap-4 mt-6">
            <button class="btn" :disabled="isSubmitting" @click="saveDatos">
              {{ isSubmitting ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>

        <!-- SECCION: CAMBIAR CONTRASENA -->
        <div class="box xl:p-8">
          <div class="bb-dashed pb-6 mb-6">
            <p class="font-medium mb-1">Cambiar contrasena</p>
            <span class="text-xs text-n500">Deja los campos vacios si no deseas cambiarla</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label class="md:text-lg font-medium block mb-2">Nueva contrasena</label>
              <div class="relative">
                <input
                  v-model="passForm.password"
                  :type="mostrarPassword ? 'text' : 'password'"
                  @input="clearError('password')"
                  class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-6 py-3 pr-12"
                  :class="{ 'border-red-500': errors.password }"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-n500 hover:text-primary"
                  @click="mostrarPassword = !mostrarPassword"
                >
                  <IconEyeOff v-if="mostrarPassword" :size="18" />
                  <IconEye v-else :size="18" />
                </button>
              </div>
              <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password[0] }}</p>
            </div>

            <div>
              <label class="md:text-lg font-medium block mb-2">Confirmar contrasena</label>
              <div class="relative">
                <input
                  v-model="passForm.password_confirmation"
                  :type="mostrarPasswordConfirm ? 'text' : 'password'"
                  @input="clearError('password_confirmation')"
                  class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-6 py-3 pr-12"
                  :class="{ 'border-red-500': errors.password_confirmation }"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-n500 hover:text-primary"
                  @click="mostrarPasswordConfirm = !mostrarPasswordConfirm"
                >
                  <IconEyeOff v-if="mostrarPasswordConfirm" :size="18" />
                  <IconEye v-else :size="18" />
                </button>
              </div>
              <p v-if="errors.password_confirmation" class="text-xs text-red-500 mt-1">{{ errors.password_confirmation[0] }}</p>
            </div>

          </div>

          <div class="flex gap-4 mt-6">
            <button class="btn" :disabled="isSubmitting" @click="savePassword">
              {{ isSubmitting ? 'Guardando...' : 'Cambiar contrasena' }}
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>