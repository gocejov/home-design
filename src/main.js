import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import VueKonva from 'vue-konva';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from "vuetify/iconsets/mdi";

const myCustomLightTheme = {
    dark: false,
    colors: {
      background: '#ECF2FA',
      surface: '#FFFFFF',
      'surface-bright': '#FFFFFF',
      'surface-light': '#EEEEEE',
      'surface-variant': '#424242',
      'on-surface-variant': '#EEEEEE',
      primary: '#6DCA52',
      'primary-darken-1': '#1F5592',
      secondary: '#48A9A6',
      'secondary-darken-1': '#018786',
      error: '#E84E1E',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
      'grey-color': '#717171',
      light_error: '#fdede8',
      gray: '#F1F1F1',
      gray_font: '#717171'
    },
    variables: {
      'border-color': '#000000',
      'border-opacity': 0.12,
      'high-emphasis-opacity': 0.87,
      'medium-emphasis-opacity': 0.60,
      'disabled-opacity': 0.38,
      'idle-opacity': 0.04,
      'hover-opacity': 0.04,
      'focus-opacity': 0.12,
      'selected-opacity': 0.08,
      'activated-opacity': 0.12,
      'pressed-opacity': 0.12,
      'dragged-opacity': 0.08,
      'theme-kbd': '#212529',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#F5F5F5',
      'theme-on-code': '#000000',
    }
  }
  const aliasesCustom = {
    ...aliases,
  }
const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'myCustomLightTheme',
      themes: {
        myCustomLightTheme,
      },
    },
    icons: {
      defaultSet: "mdi",
      aliases: {
        ...aliasesCustom,
      },
      sets: {
        mdi,
      },
    },
    //
})

const app = createApp(App);
// app.use(vuetify)
app.use(VueKonva);
app.mount('#app');


