---
layout: home

hero:
  name: "Velis Docs"
  text: "Open-source library documentation"
  tagline: Building Affordable Life-Savers — documentation hub for all Velis projects and libraries.
  image:
    src: /images/logo_icon.png
    alt: Velis

features:
  - title: DynamicForms
    icon:
      src: /images/dynamicforms-logo.png
      alt: DynamicForms
      width: 64
      height: 64
    details: A Vue 3 ecosystem for building schema-driven forms. Define your form as data and let DynamicForms
             handle rendering, validation, and layout. Includes vue-forms as the core package.
    link: /dynamicforms/
    linkText: Explore DynamicForms
  - title: muxws
    icon:
      src: /muxws/muxws-icon.svg
      alt: muxws
      width: 64
      height: 64
    details: HTTP/3 stream semantics over a WebSocket. Many independent, cancellable, bidirectional streams on
             one socket, either end able to open one — no QUIC or HTTP/3 stack needed. Python and TypeScript ports,
             with a frozen wire spec and conformance fixtures.
    link: /muxws/
    linkText: Read docs
  - title: taskwire
    icon:
      src: /taskwire/taskwire-icon.svg
      alt: taskwire
      width: 64
      height: 64
    details: Progress reporting and awaitable dialogs for long-running server-side operations, in Python and
             TypeScript. Nested progress, dialogs the worker blocks on, cooperative cancellation and collectable
             results, over local, REST or muxws transport.
    link: /taskwire/
    linkText: Read docs
  - title: vue-cached-icon
    details: A caching icon loader for Vue with emphasis on CDN loading. Supports Ionicons, Material Design Icons,
             Font Awesome, custom providers, SVG literals and URLs. Renders sanitised SVG with currentColor support.
    link: /vue-cached-icon
    linkText: Read docs
  - title: vitepress-plugin-crosslinks
    details: A VitePress plugin that resolves cross-project documentation links at build time. Write 
             :project-name:/some/path in markdown and the plugin replaces it with the absolute URL for that project.
    link: /vitepress-plugin-crosslinks
    linkText: Read docs
  - title: configurable-redlock
    details: A Python distributed locking library built on Redis. Provides a cleaner API than pottery's Redlock,
             "silent skip" to bypass locked code blocks without try/except, and Redis-based lock contention statistics.
    link: /configurable-redlock
    linkText: Read docs
  - title: incremental-coverage-check
    details: A GitHub Action that fails a pull request when the lines it changes are not covered by tests.
             Grades only the diff, merges multiple coverage formats, and posts self-updating reports.
    link: /incremental-coverage-check
    linkText: Read docs
  - title: allowances
    details: Grants and budgets, enforced and auditable. Ask "may this happen, and can they afford it?" — 
             get an answer, a ledger entry, and a way to undo it. Storage-agnostic, with a Django backend.
    link: /allowances/
    linkText: Read docs
  - title: vue-i18n-python
    details: An unofficial Python port of vue-i18n. Same JSON message files, same API, same behaviour —
             so a Vue front end and a Python back end read one set of translations and produce the same
             strings. Verified against real vue-i18n with recorded conformance fixtures.
    link: /vue-i18n-python/
    linkText: Read docs
---
