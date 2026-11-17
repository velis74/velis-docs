import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { demoPath, readmePagePath, readmePages } from './readme-pages.mjs';

// Writes dist/sitemap.xml listing every page of the final build: hub pages and all dist subpages of libraries.
// The page list is derived from dist/.

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const config = JSON.parse(readFileSync(join(root, 'libs.config.json'), 'utf-8'));
const distDir = join(root, 'dist');

// Pages that are not content: 404 and the developer readme.md that dist libraries publish next to their docs.
const EXCLUDED = [/(^|\/)404\.html$/, /^(.+\/)?readme\.html$/i];
// Library demos are applications, not documentation pages.
const demoPaths = config.libs.filter((lib) => lib.demo).map(demoPath);

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

// index.html is canonical as its directory, other pages with the .html extension (as VitePress links them).
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

// lastmod is given only for pages with a source .md file in this repository or in a readme submodule.
// Dist subpages have none: the build output does not identify a page's source file.
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
  .filter((path) => !demoPaths.some((prefix) => path.startsWith(prefix)))
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
