import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import libsConfig from '../../../libs.config.json'

const subProjectPrefixes: string[] = (libsConfig.libs as any[])
  .filter((l) => l.type === 'dist')
  .map((l) => (l.group ? `/${l.group}/${l.name}/` : `/${l.name}/`));

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    router.onBeforeRouteChange = (to: string) => {
      if (subProjectPrefixes.some(p => to.startsWith(p) || to + '/' === p)) {
        window.location.href = to;
        return false;
      }
    };
  },
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // lahko dodamo custom slote za layout, če bo potrebno
    });
  },
} satisfies Theme;
