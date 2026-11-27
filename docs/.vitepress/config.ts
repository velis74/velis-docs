import { createReadStream, existsSync, readFileSync, statSync } from 'fs';
import { dirname, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vitepress';

import { demoPath, readmePagePath, readmePages } from '../../scripts/readme-pages.mjs';
// import vuetify from 'vite-plugin-vuetify';

const __dir = dirname(fileURLToPath(import.meta.url));
const publicRoot = resolve(__dir, '../public');
const libsConfig = JSON.parse(readFileSync(resolve(__dir, '../../libs.config.json'), 'utf-8'));

// Pages of private libraries are missing when the build has no access to their repository; links to them
// must not fail the build.
const missingPrivatePages: RegExp[] = libsConfig.libs
  .filter((lib: any) => lib.private)
  .flatMap((lib: any) => readmePages(lib).map((page: any) => readmePagePath(lib, page)))
  .filter((path: string) => !existsSync(resolve(__dir, `..${path}.md`)))
  .map((path: string) => new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\.html)?(#.*)?$`));

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
  const prefixes: string[] = [
    ...libsConfig.libs
      .filter((l: any) => l.type === 'dist')
      .map((l: any) => (l.group ? `/${l.group}/${l.name}/` : `/${l.name}/`)),
    ...libsConfig.libs.filter((l: any) => l.demo).map(demoPath),
  ];

  return {
    name: 'serve-public-dist',
    enforce: 'pre' as const,
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const urlPath = (req.url ?? '').split('?')[0];
        if (!prefixes.some((p) => urlPath.startsWith(p) || urlPath + '/' === p)) return next();

        const candidates = [join(publicRoot, urlPath), join(publicRoot, urlPath, 'index.html')];
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
  description: 'Documentation for Velis open-source libraries for Vue 3, Python, FastAPI and Django',
  // A page is reachable at several URLs (e.g. /dynamicforms/ and /dynamicforms/index.html); canonical names
  // the one search engines index.
  transformHead({ pageData }) {
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html');
    return [['link', { rel: 'canonical', href: `${libsConfig.siteUrl}/${path}` }]];
  },
  ignoreDeadLinks: [
    /^https?:\/\/localhost/,
    // Submodule READMEs link to files next to them in the source repository (e.g. ./LICENSE),
    // which are not copied into the docs
    /^(\.\/)?LICENSE$/,
    ...missingPrivatePages,
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
          items: [{ text: 'Overview', link: '/dynamicforms/' }],
        },
      ],
      '/vab/': [
        {
          text: 'Velis Auto Brightness',
          items: [
            { text: 'Overview', link: '/vab/' },
            { text: 'Manual', link: '/vab/manual' },
            { text: 'Changelog', link: '/vab/changelog' },
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
    },
  },
});
