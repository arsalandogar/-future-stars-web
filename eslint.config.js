import js from '@eslint/js';
import globals from 'globals';
import pluginRouter from '@tanstack/eslint-plugin-router';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';
import checkFile from 'eslint-plugin-check-file';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'src/routeTree.gen.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
      pluginRouter.configs['flat/recommended'],
      prettier,
    ],
    plugins: {
      'check-file': checkFile,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/!(__tests__)': 'KEBAB_CASE',
        },
      ],
    },
  },
  {
    files: ['**/routes/_*.tsx'],
    rules: {
      'check-file/filename-naming-convention': 'off',
    },
  },
  // Enforce unidirectional codebase architecture for features
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // Features should not import from other features' internals
            {
              group: ['@/features/*/*'],
              message:
                'Do not import directly from feature internals. Import from the feature root instead.',
            },
            // Features should not import from app layer
            {
              group: ['@/app/*'],
              message:
                'Features should not import from the app layer. This violates unidirectional flow.',
            },
          ],
        },
      ],
    },
  },
]);
