<script setup lang="ts">
import SocialLinks from '../shared/SocialLinks.vue';
</script>

<template>
    <footer class="bg-n0 footer dark:bg-bg4">
        <div class="py-6 px-3 flex flex-wrap justify-between items-center gap-4 container">
            <p class="text-sm lg:text-base max-md:text-center max-md:w-full">
                Copyright ©{{ new Date().getFullYear() }}
                <RouterLink class="text-primary" to="/">
                    Axis
                </RouterLink>
                . All rights reserved.
            </p>
            <div class="max-md:w-full max-md:flex justify-center">
                <SocialLinks />
            </div>

            <ul class="flex gap-3 lg:gap-4 text-sm lg:text-base max-lg:justify-center max-lg:w-full">
                <li>
                    <RouterLink to="#">Privacy Policy</RouterLink>
                </li>
                <li>
                    <RouterLink to="#">Terms of condition</RouterLink>
                </li>
            </ul>
        </div>
    </footer>
</template>