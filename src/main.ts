import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { registerAllTools } from './tools'
import { registerAllConverters } from './utils/converters'

// Registra ferramentas e conversores via auto-discovery (síncrono)
registerAllTools()
registerAllConverters()

// Monta a aplicação com router
const app = createApp(App)
app.use(router)
app.mount('#app')
