// Pages a "readme" library contributes to docs/: one (readme, name, title, description on the entry)
// or several (the `pages` list, each with its own readme, name, title, description).
export function readmePages(lib) {
  return lib.pages ?? [{ readme: lib.readme, name: lib.name, title: lib.title, description: lib.description }];
}

// URL path of a page without extension, e.g. /dynamicforms/translatable or /vab/manual.
export function readmePagePath(lib, page) {
  return lib.group ? `/${lib.group}/${page.name}` : `/${page.name}`;
}
