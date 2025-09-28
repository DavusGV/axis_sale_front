import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env': process.env // Asegura que las variables de entorno sean accesibles
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
