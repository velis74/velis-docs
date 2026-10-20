// Strani, ki jih knjižnica tipa "readme" prispeva v docs/: ena (readme, name, title, description na vnosu)
// ali več (seznam `pages`, vsaka s svojimi readme, name, title, description).
export function readmePages(lib) {
  return lib.pages ?? [{ readme: lib.readme, name: lib.name, title: lib.title, description: lib.description }];
}

// URL pot strani brez končnice, npr. /dynamicforms/translatable ali /vab/manual.
export function readmePagePath(lib, page) {
  return lib.group ? `/${lib.group}/${page.name}` : `/${page.name}`;
}
