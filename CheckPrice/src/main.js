import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/routes/router.js'

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import '/node_modules/primeflex/primeflex.css'
import sidebar from "@/Layouts/sidebar.vue"
import Button from "primevue/button"
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Menu from 'primevue/menu'
import Select from 'primevue/select'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import ConfirmDialog from 'primevue/confirmdialog'


const app = createApp(App)

import 'primeicons/primeicons.css'
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
app.component('Button', Button);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Dialog', Dialog);
app.component('InputText', InputText);
app.component('Menu', Menu);
app.component('Select', Select);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('ConfirmDialog', ConfirmDialog);
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
