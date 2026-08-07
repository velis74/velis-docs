# velis-docs

Skupna VitePress dokumentacija za vse Velis open-source projekte/knjižnice.

## Arhitektura

- **`libs/`** — git submoduli
- **`docs/`** — osnovna dokumentacija; sem copy skripta tudi skopira vsebino iz submodulov
- **`libs.config.json`** — konfiguracija za vsak submodule (`type: "readme"` ali `type: "dist"`)

## Dva tipa submodulov

1. **`type: "readme"`** — samo dokumentacija (readme.md); kopira se v `docs/<ime>.md`
2. **`type: "dist"`** — workspace projekt z lastnim build-om (docs:build); dist output se kopira v `dist/<ime>/`

## Konfiguracija (`libs.config.json`)

Seznam knjižnic v polju `libs`. Vsak vnos vsebuje:

- `name` — Ime dokumentacijske strani (v `docs/`) in identifikator za `--lib`
- `type` — `"readme"` ali `"dist"`
- `submodule` — Pot do submodula v `libs/` (npr. `libs/ime-projekta`)

### Tip `readme`

- `readme` — Pot do README datoteke znotraj submodula (npr. `"README.md"` ali `"readme.md"`)
- `extraFiles` (opcijsko) — Seznam dodatnih datotek (slike, gif) za kopiranje v `docs/` (npr. `["demo.gif"]`)

### Tip `dist`

- `group` (opcijsko) — Podmapa v `docs/public/` za organizacijo več projektov
- `distOutput` (opcijsko) — Pot do build outputa v submodulu (privzeto `"docs/.vitepress/dist"`)
- `docsWorkspace` (opcijsko) — Ime workspace-a za build (npr. `"docs"`), če projekt uporablja npm workspaces
- `.gitignore` - Če knjižnica ni del sklopa "dynamicforms", jo je treba dati v izjemo. glej 
  npr. `/docs/public/allowances/`


## Ključna pravila

- `libs/` je za VitePress **off-limits** — brez izjem
- Ko dodajaš nov submodule: `git submodule add <url> libs/<ime>` + vnos v `libs.config.json` + feature kartica v
  `index.md`. Priporočljivo je dodati `ignore = untracked` v `.gitmodules` za nov submodule, da lokalni buildi ne smetijo statusa.
- po dodajanju kliči `npm run refresh` (ali `npm run refresh -- --lib <ime>` za hitrejše osveževanje posamezne knjižnice)
