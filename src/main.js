import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// MDI Icons
import '@mdi/font/css/materialdesignicons.css';

// Router
import router from './router';

// Components
import App from './App.vue'
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        primary: '#FF5722',  // Set your custom primary color (example: orange)
        secondary: '#4CAF50', // Set your custom secondary color (example: green)
        accent: '#9C27B0',    // Set your custom accent color (example: purple)
        error: '#F44336',     // Set error color (example: red)
        info: '#2196F3',      // Set info color (example: blue)
        success: '#4CAF50',   // Set success color (example: green)
        warning: '#FFC107',   // Set warning color (example: yellow)
      },
    },
  },
  icons: {
    iconfont: 'mdi', // This sets the icon font to Material Design Icons
  },
})

createApp(App)
    .use(vuetify)
    .use(router)
    .mount('#app')