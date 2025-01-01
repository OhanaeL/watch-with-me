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
  icons: {
    iconfont: 'mdi', // This sets the icon font to Material Design Icons
  },
})

createApp(App)
    .use(vuetify)
    .use(router)
    .mount('#app')