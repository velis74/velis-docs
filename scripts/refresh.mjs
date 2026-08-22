import { readFileSync, writeFileSync, copyFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const config = JSON.parse(readFileSync(join(root, 'libs.config.json'), 'utf-8'));
const distOnly = process.argv.includes('--dist-only');
const scriptArgs = process.argv.slice(2);
const targetLib = scriptArgs.includes('--lib')
  ? scriptArgs[scriptArgs.indexOf('--lib') + 1]
  : scriptArgs.find((arg) => !arg.startsWith('-')) ?? null;

if (!distOnly && !targetLib) {
  console.log('Updating git submodules...');
  execSync('git submodule update --init --remote --force', { cwd: root, stdio: 'inherit' });
} else if (targetLib) {
  const lib = config.libs.find(l => l.name === targetLib);
  if (lib) {
    console.log(`Updating git submodule for ${targetLib}...`);
    execSync(`git submodule update --init --remote --force ${lib.submodule}`, { cwd: root, stdio: 'inherit' });
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

function processReadmeLib(lib) {
  const src = join(root, lib.submodule, lib.readme);
  const dest = join(root, 'docs', `${lib.name}.md`);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, stripRepoFileLinks(readFileSync(src, 'utf-8'), lib.extraFiles ?? []));
  console.log(`  copied ${lib.submodule}/${lib.readme} → docs/${lib.name}.md`);
  for (const extra of lib.extraFiles ?? []) {
    const extraSrc = join(root, lib.submodule, extra);
    const extraDest = join(root, 'docs', extra);
    copyFileSync(extraSrc, extraDest);
    console.log(`  copied ${lib.submodule}/${extra} → docs/${extra}`);
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
