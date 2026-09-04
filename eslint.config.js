import plugin from 'eslint-plugin-playwright';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      playwright: plugin,
    },
    rules: {
      'playwright/no-raw-locators': 'warn',
      'playwright/prefer-locator': 'warn',
      'playwright/prefer-web-first-assertions': 'warn',
      'playwright/no-page-pause': 'warn',
      'playwright/no-wait-for-selector': 'warn',
    },
  },
];
