import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import checkFile from 'eslint-plugin-check-file'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      'check-file': checkFile,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
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
])
