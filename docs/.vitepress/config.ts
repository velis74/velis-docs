import { defineConfig } from 'vitepress';
import { createReadStream, existsSync, readFileSync, statSync } from 'fs';
import { dirname, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
// import vuetify from 'vite-plugin-vuetify';

const __dir = dirname(fileURLToPath(import.meta.url));
const publicRoot = resolve(__dir, '../public');
const libsConfig = JSON.parse(readFileSync(resolve(__dir, '../../libs.config.json'), 'utf-8'));

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// enforce: 'pre' places this plugin (and its configureServer middleware) before
// VitePress's own plugins, so our static-file handler wins over VitePress's
// indexHtmlMiddleware which would otherwise swallow sub-project routes.
function servePublicDistPlugin() {
  const prefixes: string[] = libsConfig.libs
    .filter((l: any) => l.type === 'dist')
    .map((l: any) => (l.group ? `/${l.group}/${l.name}/` : `/${l.name}/`));

  return {
    name: 'serve-public-dist',
    enforce: 'pre' as const,
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const urlPath = (req.url ?? '').split('?')[0];
        if (!prefixes.some(p => urlPath.startsWith(p) || urlPath + '/' === p)) return next();

        const candidates = [
          join(publicRoot, urlPath),
          join(publicRoot, urlPath, 'index.html'),
        ];
        for (const filePath of candidates) {
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            res.setHeader('Content-Type', MIME[extname(filePath)] ?? 'application/octet-stream');
            createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  title: 'Velis Docs',
  titleTemplate: ':title - Velis Docs',
  description: 'Documentation hub for Velis projects',
  ignoreDeadLinks: [
    /^https?:\/\/localhost/
  ],
  themeConfig: {
    logo: '/images/logo_icon.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'DynamicForms', link: '/dynamicforms/' },
    ],
    sidebar: {
      '/dynamicforms/': [
        {
          text: 'DynamicForms',
          items: [
            { text: 'Overview', link: '/dynamicforms/' },
          ],
        },
      ],
    },
    socialLinks: [],
  },
  vite: {
    plugins: [servePublicDistPlugin()],
    // plugins: [vuetify()],
    optimizeDeps: {
      // include: ['vuetify'],
    },
    ssr: {
      // noExternal: ['vuetify'],
    }
  },
});

