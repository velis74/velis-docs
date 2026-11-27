import velis from 'eslint-config-velis';

// eslint-config-velis applies its parser, plugins and rules to `.js`, `.ts` and `.vue` files.
const velisRules = velis.find((config) => config.files?.includes('**/*.{js,ts,vue}'));

export default [
  ...velis,
  {
    // The build scripts are Node ESM (`.mjs`), linted with the same rules.
    ...velisRules,
    files: ['scripts/**/*.mjs'],
  },
  {
    ignores: [
      'dist/*',
      'coverage/*',
      'node_modules/*',
      'libs/*',
      'docs/.vitepress/cache/*',
      'docs/.vitepress/dist/*',
      'docs/public/*',
    ],
  },
];
