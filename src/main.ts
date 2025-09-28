import './assets/main.css'
import PrimeVue from 'primevue/config';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueVectorMap from "vuevectormap";
import "jsvectormap/dist/maps/world.js";
import "jsvectormap/dist/css/jsvectormap.css";
import ToastService from 'primevue/toastservice';

const app = createApp(App)
app.use(ToastService);
app.use(VueVectorMap);
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    unstyled: true,
    ripple: true,
});
console.log('VITE_API_URL desde main.ts:', import.meta.env.VITE_API_URL);

app.mount('#app')
