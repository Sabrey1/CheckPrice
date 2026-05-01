import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/routes/router.js'

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import '/node_modules/primeflex/primeflex.css'
import sidebar from "@/Layouts/sidebar.vue"
import 'primeicons/primeicons.css'

import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import Select from 'primevue/select'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const app = createApp(App)

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


app.component('DataTable', DataTable);
app.component('Button', Button);
app.component('Column', Column);
app.component('Dialog', Dialog);
app.component('InputText', InputText);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Select', Select);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);

app.mount('#app')
