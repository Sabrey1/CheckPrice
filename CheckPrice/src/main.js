import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/routes/router.js'

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import '/node_modules/primeflex/primeflex.css'
import sidebar from "@/Layouts/sidebar.vue"

import Button from "primevue/button"
const app = createApp(App)

import 'primeicons/primeicons.css'
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
app.component('Button', Button);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
app.use(router)
app.use(ToastService);
app.use(ConfirmationService);
app.component('sidebar', sidebar)
app.mount('#app')
