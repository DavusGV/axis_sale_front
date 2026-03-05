<script setup lang="ts">
import { useLayoutStore } from '@/stores/layoutStore';
import type { ApexOptions } from 'apexcharts';
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const { theme } = useLayoutStore()
let chartData = computed<ApexOptions>(() => {
    return {
        series: [44, 55, 67, 83],
        chart: {
            type: "radialBar",
        },
        plotOptions: {
            radialBar: {
                track: {
                    background: theme.isDark ? "#343E56" : "#EBECEF",
                },
                hollow: {
                    size: '57%',
                },
                dataLabels: {
                    name: {
                        fontSize: "22px",
                    },
                    value: {
                        fontSize: "16px",
                        color: !theme.isDark ? "#404A60" : "#EBECEF",
                    },
                    total: {
                        show: true,
                        label: "Total",
                        color: "#5D69F4",
                        fontSize: "22px",
                        formatter: function () {
                            return "9845";
                        },
                    },
                },
            },
        },
        legend: {
            show: false,
            position: "bottom",
        },
        colors: ["#5D69F4", "#00998B", "#FFC861", "#FF6161"],
        labels: ["Application", "Components", "Widgets", "Revenue"],
        responsive: [
            {
                breakpoint: 1200,
                options: {
                    chart: {
                        height: 400,
                    },
                },
            },
            {
                breakpoint: 400,
                options: {
                    chart: {
                        height: 200,
                    },
                },
            },
        ],
    };
}) 
</script>
<template>
    <div class="col-span-12 lg:col-span-6 box mb-4 xxxl:mb-6">
        
        <VueApexCharts :height="400" width="100%" :series="chartData.series" :options="chartData" type="radialBar" />
        <div class="flex items-center justify-around">
            <div class="flex flex-col text-center">
                <p class="font-medium">8953</p>
                <span>Completed</span>
            </div>
            <div class="flex flex-col text-center">
                <p class="font-medium">2345</p>
                <span>In Progress</span>
            </div>
        </div>
    </div>
</template>

