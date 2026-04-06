import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'


export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
  },
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // lahko dodamo custom slote za layout, če bo potrebno
    });
  },
} satisfies Theme;
