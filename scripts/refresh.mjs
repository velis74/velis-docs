import { readFileSync, copyFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const config = JSON.parse(readFileSync(join(root, 'libs.config.json'), 'utf-8'));
const distOnly = process.argv.includes('--dist-only');

if (!distOnly) {
  console.log('Updating git submodules...');
  execSync('git submodule update --init --remote --force', { cwd: root, stdio: 'inherit' });
}

for (const lib of config.libs) {
  if (lib.type === 'readme' && distOnly) continue;
  if (lib.type === 'readme') {
    const src = join(root, lib.submodule, lib.readme);
    const dest = join(root, 'docs', `${lib.name}.md`);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log(`  copied ${lib.submodule}/${lib.readme} → docs/${lib.name}.md`);
  } else if (lib.type === 'dist') {
    const submoduleDir = join(root, lib.submodule);
    const urlBase = lib.group ? `/${lib.group}/${lib.name}/` : `/${lib.name}/`;
    const destDir = lib.group
      ? join(root, 'docs', 'public', lib.group, lib.name)
      : join(root, 'docs', 'public', lib.name);
    const destRelative = lib.group ? `docs/public/${lib.group}/${lib.name}` : `docs/public/${lib.name}`;
    const buildCmd = lib.docsWorkspace
      ? `npm run docs:build -w ${lib.docsWorkspace} -- --base ${urlBase}`
      : `npm run docs:build -- --base ${urlBase}`;
    console.log(`  installing dependencies in ${lib.submodule}...`);
    execSync('npm install', { cwd: submoduleDir, stdio: 'inherit' });
    console.log(`  building ${lib.submodule} (base: ${urlBase})...`);
    execSync(buildCmd, { cwd: submoduleDir, stdio: 'inherit' });
    const builtDir = join(submoduleDir, ...(lib.distOutput ?? '.vitepress/dist').split('/'));
    if (existsSync(destDir)) rmSync(destDir, { recursive: true });
    mkdirSync(destDir, { recursive: true });
    cpSync(builtDir, destDir, { recursive: true });
    console.log(`  copied ${lib.submodule}/${lib.distOutput ?? '.vitepress/dist'} → ${destRelative}`);
  }
}
