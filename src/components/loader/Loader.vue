<template>
    <div class="loader" v-if="loading">
      <div class="spinner"></div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, defineProps } from 'vue';
  
  const props = defineProps({
    loading: {
      type: Boolean,
      required: true
    }
  });
  </script>
  
  <style scoped>
 .loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(91, 89, 89, 0.2); /* Ajusta la opacidad aquí */
  z-index: 9999;
}
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #000;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  </style>