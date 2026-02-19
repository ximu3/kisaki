/**
 * ESLint Configuration
 *
 * TypeScript-based ESLint config requiring jiti for execution.
 * Uses the same rules as the main Kisaki project for consistency.
 */

import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default defineConfig([
  // Ignored paths
  {
    ignores: ['node_modules', 'dist', '*.d.ts']
  },

  // JavaScript recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  tseslint.configs.recommended,

  // Vue rules
  ...pluginVue.configs['flat/recommended'],

  // TypeScript and Vue files configuration
  {
    files: ['**/*.{ts,tsx,mts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // TypeScript rules
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Vue rules
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-v-html': 'off'
    }
  },

  // Prettier - disables all formatting rules (MUST be last)
  prettier
])
