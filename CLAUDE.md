# velis-docs

Skupna VitePress dokumentacija za vse Velis open-source projekte/knjižnice.

## Arhitektura

- **`libs/`** — git submoduli
- **`docs/`** — osnovna dokumentacija; sem copy skripta tudi skopira vsebino iz submodulov
- **`libs.config.json`** — konfiguracija za vsak submodule (`type: "readme"` ali `type: "dist"`)

## Dva tipa submodulov

1. **`type: "readme"`** — samo dokumentacija (readme.md); kopira se v `docs/<ime>.md`
2. **`type: "dist"`** — workspace projekt z lastnim build-om (docs:build); dist output se kopira v `dist/<ime>/`

## Ključna pravila

- `libs/` je za VitePress **off-limits** — brez izjem
- Ko dodajaš nov submodule: `git submodule add <url> libs/<ime>` + vnos v `libs.config.json` + feature kartica v
  `index.md`
