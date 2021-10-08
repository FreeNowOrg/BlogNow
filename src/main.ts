import { createApp } from 'vue'

// Create App
import App from './App.vue'
const app = createApp(App)

// Router
import { router } from './router'
app.use(router)

// Style
import './styles/index.sass'

// Mount
app.mount('#app')
