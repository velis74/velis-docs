import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { readmePagePath, readmePages } from './readme-pages.mjs';

// Zapiše dist/sitemap.xml z vsemi stranmi končnega builda: hub strani in vse dist podstrani knjižnic.
// Seznam strani je izpeljan iz dist/, zato se nove, preimenovane ali odstranjene strani odrazijo same.

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const config = JSON.parse(readFileSync(join(root, 'libs.config.json'), 'utf-8'));
const distDir = join(root, 'dist');

// Strani, ki niso vsebina: 404 in razvojni readme.md, ki ga dist knjižnice objavijo poleg dokumentacije.
const EXCLUDED = [/(^|\/)404\.html$/, /^(.+\/)?readme\.html$/i];

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

// index.html je kanonično dosegljiva kot imenik, ostale strani s končnico .html (tako jih linka VitePress).
function urlPath(file) {
  return '/' + relative(distDir, file).split('\\').join('/').replace(/(^|\/)index\.html$/, '$1');
}

function lastCommitDate(cwd, file) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd, encoding: 'utf-8' }).trim() || null;
  } catch {
    return null;
  }
}

// lastmod je naveden samo za strani, ki imajo izvorno .md datoteko v tem repozitoriju ali v readme submodulu.
// Dist podstrani ga nimajo, ker build output ne pove, iz katere izvorne datoteke je stran nastala.
function lastmod(path) {
  if (!path.endsWith('/') && !path.endsWith('.html')) return null;
  const page = path.endsWith('/') ? `${path}index` : path.slice(0, -'.html'.length);
  for (const lib of config.libs.filter((l) => l.type === 'readme')) {
    const source = readmePages(lib).find((p) => readmePagePath(lib, p) === page);
    if (source) return lastCommitDate(join(root, lib.submodule), source.readme);
  }
  const source = join('docs', `${page.slice(1)}.md`);
  return existsSync(join(root, source)) ? lastCommitDate(root, source) : null;
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const paths = htmlFiles(distDir)
  .map(urlPath)
  .filter((path) => !EXCLUDED.some((pattern) => pattern.test(path.slice(1))))
  .sort();

if (!paths.length) {
  console.error(`sitemap: no pages found in ${distDir}`);
  process.exit(1);
}

const entries = paths.map((path) => {
  const date = lastmod(path);
  const loc = `    <loc>${escapeXml(config.siteUrl + path)}</loc>\n`;
  return `  <url>\n${loc}${date ? `    <lastmod>${date}</lastmod>\n` : ''}  </url>\n`;
});

writeFileSync(
  join(distDir, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + entries.join('')
    + '</urlset>\n',
);
console.log(`sitemap: ${paths.length} pages → dist/sitemap.xml`);
