<script setup lang="ts">
import Course from '@/components/dashboards/course/Course.vue';
import CourseMaterials from '@/components/dashboards/course/CourseMaterials.vue';
import StudentHistory from '@/components/dashboards/course/StudentHistory.vue';
import TopBanner from '@/components/shared/TopBanner.vue';
import { RouterLink } from 'vue-router';


</script>

<template>
    <TopBanner title="Course Dashboard">
        <div class="flex justify-end gap-4 lg:gap-6">
            <RouterLink to="#" class="btn">Settings</RouterLink>
            <RouterLink to="#" class="btn-outline">Schedules</RouterLink>
        </div>
    </TopBanner>
    <Course />
    <div class="grid grid-cols-12 gap-4 xxxl:gap-6">
        <StudentHistory />
        <CourseMaterials />
    </div>
</template>