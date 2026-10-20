# TODO

## GitHub repository metadata

2026-10-20, session fa86de36-e744-4d21-8d85-8ebaed83b21e. None of the documented repositories has a homepage URL
or topics, and several descriptions are out of date. GitHub and npm link to the homepage, and topics are how GitHub
search finds a repository. Review the values, then run the commands; repository settings are not changed by a PR.

| Repository | Homepage | Description | Topics |
|---|---|---|---|
| `velis74/vitepress-plugin-crosslinks` | https://docs.velis.si/vitepress-plugin-crosslinks.html | VitePress plugin that resolves links between documentation sites at build time, with base URLs per environment | vitepress, vitepress-plugin, documentation, markdown |
| `velis74/vue-cached-icon` | https://docs.velis.si/vue-cached-icon.html | Vue icon component: Ionicons, MDI, Font Awesome, URLs or SVG by name, cached once and sanitised | vue, vue3, icons, svg, ionicons, mdi |
| `dynamicforms/vue-forms` | https://docs.velis.si/dynamicforms/vue-forms/ | UI-agnostic Vue 3 forms and application state: rules between fields, transactions, validation | vue, vue3, forms, validation, state-management, typescript |
| `dynamicforms/vuetify-inputs` | https://docs.velis.si/dynamicforms/vuetify-inputs/ | Vuetify 3 fields that share one layout; density and variant set per app, section or field | vue, vuetify, vuetify3, forms, inputs |
| `dynamicforms/vuetify-modal-form-kit` | https://docs.velis.si/dynamicforms/vuetify-modal-form-kit/ | Vuetify 3 dialogs opened from code, one on screen, and form layouts defined in TypeScript | vue, vuetify, dialog, modal, forms |
| `dynamicforms/vue-grid` | https://docs.velis.si/dynamicforms/vue-grid/ | Vue 3 data grid with responsive row layouts and virtual scrolling | vue, vue3, data-grid, datagrid, virtual-scroll, responsive |
| `dynamicforms/fastapi-viewsets` | https://docs.velis.si/dynamicforms/fastapi-viewsets/ | Django REST Framework-style viewsets for FastAPI with a typed TypeScript client | fastapi, django-rest-framework, viewsets, crud, typescript, celery |
| `dynamicforms/translatable` | https://docs.velis.si/dynamicforms/translatable.html | Connects the DynamicForms libraries' built-in strings to the application's translations | i18n, vue, translations |
| `velis74/configurable-redlock` | https://docs.velis.si/configurable-redlock.html | Redis distributed lock (Redlock) for Python with wait, skip or timeout and silent skip | redis, redlock, distributed-lock, python |
| `velis74/incremental-coverage-check` | https://docs.velis.si/incremental-coverage-check.html | GitHub Action that fails a pull request when its changed lines are not covered by tests | github-actions, code-coverage, diff-coverage, pull-requests |
| `velis74/allowances` | https://docs.velis.si/allowances/ | Grants and consumable budgets for Python and Django, with an append-only ledger and storno | python, django, quotas, credits, entitlements, ledger |
| `velis74/muxws` | https://docs.velis.si/muxws/ | HTTP/2-style streams over one WebSocket, in Python and TypeScript | websocket, multiplexing, python, typescript, fastapi |
| `velis74/taskwire` | https://docs.velis.si/taskwire/ | Talk to a job while it runs: progress, awaitable dialogs and cancellation, Python and TypeScript | progress, celery, fastapi, long-running-tasks, vue |
| `velis74/vue-i18n-python` | https://docs.velis.si/vue-i18n-python/ | vue-i18n in Python: the same JSON translation files, the same strings | vue-i18n, i18n, python, translations |
| `velis74/db-name-to-idx-mapper` | https://docs.velis.si/db-name-to-idx-mapper.html | Stable Redis/Valkey database numbers by name, Python API and CLI | redis, valkey, python, cli |

```sh
gh repo edit velis74/vitepress-plugin-crosslinks --homepage 'https://docs.velis.si/vitepress-plugin-crosslinks.html' --description 'VitePress plugin that resolves links between documentation sites at build time, with base URLs per environment' --add-topic vitepress,vitepress-plugin,documentation,markdown
gh repo edit velis74/vue-cached-icon --homepage 'https://docs.velis.si/vue-cached-icon.html' --description 'Vue icon component: Ionicons, MDI, Font Awesome, URLs or SVG by name, cached once and sanitised' --add-topic vue,vue3,icons,svg,ionicons,mdi
gh repo edit dynamicforms/vue-forms --homepage 'https://docs.velis.si/dynamicforms/vue-forms/' --description 'UI-agnostic Vue 3 forms and application state: rules between fields, transactions, validation' --add-topic vue,vue3,forms,validation,state-management,typescript
gh repo edit dynamicforms/vuetify-inputs --homepage 'https://docs.velis.si/dynamicforms/vuetify-inputs/' --description 'Vuetify 3 fields that share one layout; density and variant set per app, section or field' --add-topic vue,vuetify,vuetify3,forms,inputs
gh repo edit dynamicforms/vuetify-modal-form-kit --homepage 'https://docs.velis.si/dynamicforms/vuetify-modal-form-kit/' --description 'Vuetify 3 dialogs opened from code, one on screen, and form layouts defined in TypeScript' --add-topic vue,vuetify,dialog,modal,forms
gh repo edit dynamicforms/vue-grid --homepage 'https://docs.velis.si/dynamicforms/vue-grid/' --description 'Vue 3 data grid with responsive row layouts and virtual scrolling' --add-topic vue,vue3,data-grid,datagrid,virtual-scroll,responsive
gh repo edit dynamicforms/fastapi-viewsets --homepage 'https://docs.velis.si/dynamicforms/fastapi-viewsets/' --description 'Django REST Framework-style viewsets for FastAPI with a typed TypeScript client' --add-topic fastapi,django-rest-framework,viewsets,crud,typescript,celery
gh repo edit dynamicforms/translatable --homepage 'https://docs.velis.si/dynamicforms/translatable.html' --description 'Connects the DynamicForms libraries' built-in strings to the application's translations' --add-topic i18n,vue,translations
gh repo edit velis74/configurable-redlock --homepage 'https://docs.velis.si/configurable-redlock.html' --description 'Redis distributed lock (Redlock) for Python with wait, skip or timeout and silent skip' --add-topic redis,redlock,distributed-lock,python
gh repo edit velis74/incremental-coverage-check --homepage 'https://docs.velis.si/incremental-coverage-check.html' --description 'GitHub Action that fails a pull request when its changed lines are not covered by tests' --add-topic github-actions,code-coverage,diff-coverage,pull-requests
gh repo edit velis74/allowances --homepage 'https://docs.velis.si/allowances/' --description 'Grants and consumable budgets for Python and Django, with an append-only ledger and storno' --add-topic python,django,quotas,credits,entitlements,ledger
gh repo edit velis74/muxws --homepage 'https://docs.velis.si/muxws/' --description 'HTTP/2-style streams over one WebSocket, in Python and TypeScript' --add-topic websocket,multiplexing,python,typescript,fastapi
gh repo edit velis74/taskwire --homepage 'https://docs.velis.si/taskwire/' --description 'Talk to a job while it runs: progress, awaitable dialogs and cancellation, Python and TypeScript' --add-topic progress,celery,fastapi,long-running-tasks,vue
gh repo edit velis74/vue-i18n-python --homepage 'https://docs.velis.si/vue-i18n-python/' --description 'vue-i18n in Python: the same JSON translation files, the same strings' --add-topic vue-i18n,i18n,python,translations
gh repo edit velis74/db-name-to-idx-mapper --homepage 'https://docs.velis.si/db-name-to-idx-mapper.html' --description 'Stable Redis/Valkey database numbers by name, Python API and CLI' --add-topic redis,valkey,python,cli
```

## After the next deploy

2026-10-20, session fa86de36-e744-4d21-8d85-8ebaed83b21e.

- Search Console: submit `https://docs.velis.si/sitemap.xml`. `robots.txt` already lets Google find it; submitting
  adds the report of submitted versus indexed pages.
- Check that `/vab/`, `/vab/manual.html` and `/vab/changelog.html` load (first deploy with the private submodule).
- With velis74/ansible-docker#13 deployed, `curl -I https://docs.velis.si/configurable-redlock` returns 200.
- Blogspot (velisthoughts.blogspot.com, 2012 Velis Auto Brightness posts): replace the body with a short summary and
  links to `https://docs.velis.si/vab/manual.html` and `…/changelog.html`; keep the posts.
- Velis Auto Brightness store listing: update it; set the website field to velis.si.
