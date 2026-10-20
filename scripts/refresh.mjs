import { readFileSync, writeFileSync, copyFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import { readmePages } from './readme-pages.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const config = JSON.parse(readFileSync(join(root, 'libs.config.json'), 'utf-8'));
const distOnly = process.argv.includes('--dist-only');
const scriptArgs = process.argv.slice(2);
const targetLib = scriptArgs.includes('--lib')
  ? scriptArgs[scriptArgs.indexOf('--lib') + 1]
  : scriptArgs.find((arg) => !arg.startsWith('-')) ?? null;

// Zasebnih submodulov (`private: true`) brez dostopa do repozitorija ni mogoče posodobiti. Build se nadaljuje
// z obstoječim checkoutom, če ga ni, pa brez strani te knjižnice.
function updateSubmodules(libs) {
  const publicPaths = libs.filter((lib) => !lib.private).map((lib) => lib.submodule);
  if (publicPaths.length) {
    execSync(`git submodule update --init --remote --force ${publicPaths.join(' ')}`, { cwd: root, stdio: 'inherit' });
  }
  for (const lib of libs.filter((l) => l.private)) {
    try {
      execSync(`git submodule update --init --remote --force ${lib.submodule}`, { cwd: root, stdio: 'inherit' });
    } catch {
      console.warn(`  ${lib.name}: private submodule ${lib.submodule} could not be updated`);
    }
  }
}

if (!distOnly && !targetLib) {
  console.log('Updating git submodules...');
  updateSubmodules(config.libs);
} else if (targetLib) {
  const lib = config.libs.find(l => l.name === targetLib);
  if (lib) {
    console.log(`Updating git submodule for ${targetLib}...`);
    updateSubmodules([lib]);
  } else {
    console.error(`Library ${targetLib} not found in libs.config.json`);
    process.exit(1);
  }
}

// README-ji submodulov kažejo na datoteke poleg sebe v izvornem repozitoriju (LICENSE, CONTRIBUTING, ...),
// ki jih v dokumentacijo ne kopiramo. V buildani dokumentaciji naj to ostane samo besedilo, ne link.
function stripRepoFileLinks(markdown, extraFiles) {
  return markdown.replace(/\[([^\]]+)\]\((?:\.\/)?([A-Za-z0-9_.-]+)\)/g, (match, text, target) =>
    target.endsWith('.md') || extraFiles.includes(target) ? match : text
  );
}

// npm install/build za dist knjižnice traja od nekaj do nekaj deset sekund; teh je lahko precej,
// zato tečejo vzporedno namesto ena za drugo. Izpis vsakega ukaza je prefiksiran z imenom knjižnice,
// ker se vrstice vzporednih procesov na stdout prepletajo.
function runStreamed(label, cmd, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { cwd, shell: true });
    const pipe = (stream, out) => {
      let buffer = '';
      stream.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) out.write(`[${label}] ${line}\n`);
      });
      stream.on('end', () => {
        if (buffer) out.write(`[${label}] ${buffer}\n`);
      });
    };
    pipe(child.stdout, process.stdout);
    pipe(child.stderr, process.stderr);
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`[${label}] "${cmd}" exited with code ${code}`));
    });
  });
}

// Naslov in opis strani (<title>, meta description) za iskalnike pridejo iz libs.config.json, ker README
// nima frontmatterja. JSON niz je veljaven YAML niz v dvojnih narekovajih.
function withFrontmatter(markdown, page) {
  const fields = ['title', 'description']
    .filter((key) => page[key])
    .map((key) => `${key}: ${JSON.stringify(page[key])}\n`)
    .join('');
  if (!fields) return markdown;
  if (markdown.startsWith('---\n')) return `---\n${fields}${markdown.slice(4)}`;
  return `---\n${fields}---\n\n${markdown}`;
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff) return diff;
  }
  return 0;
}

// Changelog vodi tudi verzijo v delu, z datumom, kot da bi bila že izdana. Izdana verzija se prebere iz datoteke
// v submodulu (`releasedVersion.file`, prva skupina regexa `releasedVersion.pattern`, npr. versionName v
// build.gradle); naslov višje verzije dobi namesto datuma oznako "(unreleased)".
function markUnreleased(markdown, lib, page) {
  if (!page.releasedVersion) return markdown;
  const { file, pattern } = page.releasedVersion;
  const match = readFileSync(join(root, lib.submodule, file), 'utf-8').match(new RegExp(pattern));
  if (!match) throw new Error(`${lib.name}: released version not found in ${lib.submodule}/${file}`);
  return markdown.replace(/^(#{1,6}) (\d+(?:\.\d+)*)(?=\s|$).*$/gm, (line, hashes, version) =>
    compareVersions(version, match[1]) > 0 ? `${hashes} ${version} (unreleased)` : line
  );
}

function processReadmeLib(lib) {
  const pages = readmePages(lib);
  if (lib.private && pages.some((page) => !existsSync(join(root, lib.submodule, page.readme)))) {
    console.warn(`  ${lib.name}: private submodule ${lib.submodule} is not checked out, its pages are skipped`);
    return;
  }
  const destRelative = lib.group ? `docs/${lib.group}` : 'docs';
  const destDir = join(root, ...destRelative.split('/'));
  mkdirSync(destDir, { recursive: true });
  // Dodatne datoteke pristanejo poleg strani, zato jih strani linkajo z imenom datoteke. `assetUrlPrefix` je
  // shema, s katero jih vir naslavlja namesto relativne poti (npr. asset:// v Android assets).
  const extraNames = (lib.extraFiles ?? []).map((extra) => basename(extra));
  for (const page of pages) {
    let markdown = readFileSync(join(root, lib.submodule, page.readme), 'utf-8');
    if (lib.assetUrlPrefix) markdown = markdown.replaceAll(`](${lib.assetUrlPrefix}`, '](./');
    markdown = markUnreleased(stripRepoFileLinks(markdown, extraNames), lib, page);
    writeFileSync(join(destDir, `${page.name}.md`), withFrontmatter(markdown, page));
    console.log(`  copied ${lib.submodule}/${page.readme} → ${destRelative}/${page.name}.md`);
  }
  for (const extra of lib.extraFiles ?? []) {
    copyFileSync(join(root, lib.submodule, extra), join(destDir, basename(extra)));
    console.log(`  copied ${lib.submodule}/${extra} → ${destRelative}/${basename(extra)}`);
  }
}

async function processDistLib(lib) {
  const submoduleDir = join(root, lib.submodule);
  const urlBase = lib.group ? `/${lib.group}/${lib.name}/` : `/${lib.name}/`;
  const destDir = lib.group
    ? join(root, 'docs', 'public', lib.group, lib.name)
    : join(root, 'docs', 'public', lib.name);
  const destRelative = lib.group ? `docs/public/${lib.group}/${lib.name}` : `docs/public/${lib.name}`;
  const buildCmd = lib.docsWorkspace
    ? `npm run docs:build -w ${lib.docsWorkspace} -- --base ${urlBase}`
    : `npm run docs:build -- --base ${urlBase}`;
  // A submodule bump can change dependency ranges (e.g. a peer requirement) between commits.
  // A leftover node_modules/package-lock.json from the previous checkout can pin versions that
  // no longer satisfy the new package.json, so npm install has to start from a clean slate.
  rmSync(join(submoduleDir, 'node_modules'), { recursive: true, force: true });
  rmSync(join(submoduleDir, 'package-lock.json'), { force: true });
  await runStreamed(lib.name, 'npm install', submoduleDir);
  await runStreamed(lib.name, buildCmd, submoduleDir);
  const builtDir = join(submoduleDir, ...(lib.distOutput ?? '.vitepress/dist').split('/'));
  if (existsSync(destDir)) rmSync(destDir, { recursive: true });
  mkdirSync(destDir, { recursive: true });
  cpSync(builtDir, destDir, { recursive: true });
  console.log(`  copied ${lib.submodule}/${lib.distOutput ?? '.vitepress/dist'} → ${destRelative}`);
}

const libsToProcess = config.libs.filter((lib) => {
  if (targetLib && lib.name !== targetLib) return false;
  if (lib.type === 'readme' && distOnly) return false;
  return true;
});

for (const lib of libsToProcess.filter((l) => l.type === 'readme')) {
  processReadmeLib(lib);
}

const distLibs = libsToProcess.filter((l) => l.type === 'dist');
const results = await Promise.allSettled(distLibs.map((lib) => processDistLib(lib)));
const failures = results
  .map((result, i) => ({ result, lib: distLibs[i] }))
  .filter(({ result }) => result.status === 'rejected');

if (failures.length) {
  for (const { lib, result } of failures) {
    console.error(`  ${lib.name} failed: ${result.reason.message}`);
  }
  process.exit(1);
}
