import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';

import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import './custom.css';
import libsConfig from '../../../libs.config.json';
import { demoPath } from '../../../scripts/readme-pages.mjs';

const subProjectPrefixes: string[] = [
  ...(libsConfig.libs as any[])
    .filter((l) => l.type === 'dist')
    .map((l) => (l.group ? `/${l.group}/${l.name}/` : `/${l.name}/`)),
  ...(libsConfig.libs as any[]).filter((l) => l.demo).map(demoPath),
];

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    router.onBeforeRouteChange = (to: string) => {
      if (subProjectPrefixes.some((p) => to.startsWith(p) || to + '/' === p)) {
        window.location.href = to;
        return false;
      }
    };
  },
  Layout: () => {
    return h(DefaultTheme.Layout, null, {});
  },
} satisfies Theme;
