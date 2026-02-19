import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

/**
 * Base ESLint configuration for the monorepo.
 * Package-specific configs should import and extend this,
 * and add eslint-config-prettier at the end to disable formatting rules.
 */
export const baseConfig = defineConfig([
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/out',
      '**/dev',
      '**/main.plugin.d.ts',
      '**/renderer.plugin.d.ts',
      '**/templates/**'
    ]
  },

  // JavaScript recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  tseslint.configs.recommended,

  // TypeScript rules
  {
    files: ['**/*.{ts,tsx,mts,vue}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
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
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  },
  // Prettier - disables all formatting rules (MUST be last)
  prettier
])

export default baseConfig
