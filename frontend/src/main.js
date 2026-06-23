import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './assets/main.css'

import ToastService from 'primevue/toastservice'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'system' // or '.p-dark'
    }
  }
})

app.use(ToastService)
app.use(router)
app.use(vue3GoogleLogin, {
  clientId: '1094295943535-k6dmt5i8mmc114ccod72sp150gpuf33j.apps.googleusercontent.com'
})

app.mount('#app')
