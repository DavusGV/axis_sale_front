<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'


import {
  getUserById,
  updateUser,
  getUserEstablecimientos,
  assignUserEstablecimiento,
  unassignUserEstablecimiento
} from '@/api/user'

// ---------------- ROUTER ----------------
const route = useRoute()
const router = useRouter()
const userId = Number(route.params.id)

// ---------------- STATE ----------------
const loading = ref(true)

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const errors = ref<Record<string, string[]>>({})

// establecimientos
const assignedEstablecimientos = ref<any[]>([])
const availableEstablecimientos = ref<any[]>([])
const selectedEstablecimientoId = ref<number | ''>('')
const originalAssignedIds = ref<number[]>([])
const toAssign = ref<number[]>([])
const toUnassign = ref<number[]>([])


// ---------------- LOAD DATA ----------------
async function loadUser() {
  const user = await getUserById(userId)

  form.value = {
    name: user.name ?? '',
    email: user.email ?? '',
    password: '',
    password_confirmation: ''
  }
}

async function loadEstablecimientos() {
  const res = await getUserEstablecimientos(userId)
  assignedEstablecimientos.value = [...res.assigned_establecimientos]
  availableEstablecimientos.value = [...res.available_establecimientos]
  // guardamos el estado original
  originalAssignedIds.value = res.assigned_establecimientos.map((e: any) => e.id)
  // limpiamos cambios pendientes
  toAssign.value = []
  toUnassign.value = []
}


async function init() {
  try {
    loading.value = true
    await Promise.all([loadUser(), loadEstablecimientos()])
  } catch {
    Swal.fire('Error', 'No se pudo cargar el usuario', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(init)

// ---------------- ACTIONS ----------------
function clearError(field: string) {
  if (errors.value[field]) delete errors.value[field]
}

async function saveUser() {
  try {
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() })
    // 1. actualizar datos del usuario
    const payload: any = {
      name: form.value.name,
      email: form.value.email
    }
    if (form.value.password) {
      payload.password = form.value.password
      payload.password_confirmation = form.value.password_confirmation
    }
    await updateUser(userId, payload)
    //asignar establecimientos
    for (const id of toAssign.value) {
      await assignUserEstablecimiento(userId, id)
    }

    //quitar establecimientos
    for (const id of toUnassign.value) {
      await unassignUserEstablecimiento(userId, id)
    }
    Swal.close()
    await Swal.fire({
      title: 'Éxito',
      text: 'Cambios guardados correctamente',
      icon: 'success',
      confirmButtonColor: '#3b82f6'
    })
  
    //redirigir a la lista de usuarios
    router.push({ name: 'usuarios' })

  } catch (e: any) {
    Swal.close()
    const respData = (e as any)?.response?.data
    if (respData?.message) {
      Swal.fire('Error', respData.message, 'error')
    } else if (respData?.messages) {
      const messages = respData.messages as Record<string, string[]> | string[][]
      const firstError = Array.isArray(messages)
        ? messages[0]?.[0]
        : Object.values(messages)[0]?.[0]
      Swal.fire('Error', firstError ?? 'Error inesperado del servidor', 'error')
    } else {
      Swal.fire('Error', 'Error inesperado del servidor', 'error')
    }
  }
}


function addEstablecimiento() {
  if (!selectedEstablecimientoId.value) {
    Swal.fire('Atención', 'Selecciona un establecimiento', 'warning')
    return
  }

  const id = Number(selectedEstablecimientoId.value)
  const est = availableEstablecimientos.value.find(e => e.id === id)
  if (!est) return
  // mover a asignados
  assignedEstablecimientos.value.push(est)
  availableEstablecimientos.value =
  availableEstablecimientos.value.filter(e => e.id !== id)
  // marcar como pendiente de asignar
  if (!originalAssignedIds.value.includes(id)) {
    toAssign.value.push(id)
  }
  // si estaba marcado para quitar, lo quitamos de esa lista
  toUnassign.value = toUnassign.value.filter(x => x !== id)
  selectedEstablecimientoId.value = ''
}

function removeEstablecimiento(id: number) {
  const est = assignedEstablecimientos.value.find(e => e.id === id)
  if (!est) return
  // mover a disponibles
  availableEstablecimientos.value.push(est)
  assignedEstablecimientos.value =
  assignedEstablecimientos.value.filter(e => e.id !== id)
  // marcar como pendiente de quitar
  if (originalAssignedIds.value.includes(id)) {
    toUnassign.value.push(id)
  }
  // si estaba marcado para asignar, lo quitamos
  toAssign.value = toAssign.value.filter(x => x !== id)
}

</script>
<template>
  <div v-if="!loading" class="grid grid-cols-12 gap-4 xxxl:gap-6">

    <div class="col-span-12">
      <div class="box xl:p-8">


        <!-- HEADER -->
        <div class="flex justify-between items-center bb-dashed pb-6 mb-6">
          <p class="font-medium">Editar usuario</p>
          <button class="btn" @click="router.back()">
            <i class="fas fa-arrow-left fa-sm"></i>
            Regresar
          </button>
        </div>

        <!-- ================= FORM USER ================= -->
        <div class="box bg-primary/5 dark:bg-bg3 md:p-4 xl:p-6 xxxl:gap-6 mb-6">

          <div class="bb-dashed pb-6 mb-6">
            <p class="font-medium mb-1">Datos del usuario</p>
            <span class="text-xs text-n500">Editar información del usuario</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label class="md:text-lg font-medium block mb-2">Nombre</label>
              <input
                v-model="form.name"
                @input="clearError('name')"
                class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4
                       border border-n30 dark:border-n500 rounded-3xl px-6 py-3"
              />
              <p v-if="errors.name" class="text-xs text-red-500 mt-1">
                {{ errors.name[0] }}
              </p>
            </div>

            <div>
              <label class="md:text-lg font-medium block mb-2">Correo</label>
              <input
                v-model="form.email"
                type="email"
                @input="clearError('email')"
                class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4
                       border border-n30 dark:border-n500 rounded-3xl px-6 py-3"
              />
              <p v-if="errors.email" class="text-xs text-red-500 mt-1">
                {{ errors.email[0] }}
              </p>
            </div>

            <div>
              <label class="md:text-lg font-medium block mb-2">Contraseña</label>
              <input
                v-model="form.password"
                type="password"
                class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4
                       border border-n30 dark:border-n500 rounded-3xl px-6 py-3"
              />
            </div>

            <div>
              <label class="md:text-lg font-medium block mb-2">
                Confirmar contraseña
              </label>
              <input
                v-model="form.password_confirmation"
                type="password"
                class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4
                       border border-n30 dark:border-n500 rounded-3xl px-6 py-3"
              />
            </div>

          </div>
        </div>

        <!-- ESTABLECIMIENTOS-->
        <div class="box bg-primary/5 dark:bg-bg3 md:p-4 xl:p-6 xxxl:gap-6 mb-6">

          <div class="bb-dashed pb-6 mb-6">
            <p class="font-medium mb-1">Acceso a establecimientos</p>
            <span class="text-xs text-n500">
              Asignar o quitar establecimientos al usuario
            </span>
          </div>

          <div class="flex flex-col md:flex-row gap-3 mb-6">
            <div class="flex-1">
              <select
                v-model="selectedEstablecimientoId"
                class="w-full text-sm focus:outline-none
                      bg-n0 dark:bg-bg4
                      border border-n30 dark:border-n500
                      rounded-3xl px-6 py-3"
                :disabled="!availableEstablecimientos.length"
              >
                <option value="">
                  {{ availableEstablecimientos.length
                    ? 'Seleccione un establecimiento'
                    : 'No hay establecimientos disponibles'
                  }}
                </option>

                <option
                  v-for="e in availableEstablecimientos"
                  :key="e.id"
                  :value="e.id"
                >
                  {{ e.nombre }}
                </option>
              </select>
            </div>
            <button
              type="button"
              class="btn flex items-center gap-2 justify-center md:w-auto"
              @click="addEstablecimiento"
              :disabled="!selectedEstablecimientoId"
            >
              <i class="far fa-plus"></i>
              <span>Agregar</span>
            </button>
          </div>
          <!-- TABLE -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-n30 dark:border-n500">
                  <th class="text-left py-3">ID</th>
                  <th class="text-left py-3">Nombre</th>
                  <th class="text-left py-3">Dirección</th>
                  <th class="text-right py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="e in assignedEstablecimientos"
                  :key="e.id"
                  class="border-b border-n30 dark:border-n500"
                >
                  <td class="py-3">{{ e.id }}</td>
                  <td class="py-3">{{ e.nombre }}</td>
                  <td class="py-3">{{ e.direccion }}</td>
                  <td class="py-3 text-right">
                    <button
                      class="btn-outline text-red-600"
                      @click="removeEstablecimiento(e.id)"
                    >
                      <i class="fas fa-trash-alt fa-sm"></i>
                      Quitar
                    </button>
                  </td>
                </tr>

                <tr v-if="!assignedEstablecimientos.length">
                  <td colspan="4" class="text-center py-6 text-n500">
                    Sin establecimientos asignados
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        <!-- ================= ACTIONS ================= -->
        <div class="flex gap-4">
          <button type="button" class="btn" @click="saveUser">
            Guardar
          </button>

          <button type="button" class="btn-outline" @click="router.back()">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

