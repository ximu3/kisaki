import { defineConfig } from 'eslint/config'
import { baseConfig } from '../../eslint.config'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

const rendererImportBoundaryPatterns = [
  {
    group: ['@renderer/components/ui/*/*'],
    message: 'Import UI modules only from first-level boundary: @renderer/components/ui/<module>.'
  },
  {
    group: ['@renderer/components/shared/*/*'],
    message: 'Import shared modules only from first-level boundary: @renderer/components/shared/<domain>.'
  },
  {
    group: ['@renderer/features/*/*'],
    message: 'Import features only from first-level boundary: @renderer/features/<feature>.'
  }
]

/**
 * ESLint configuration for the desktop Electron app.
 * Extends base config with Vue-specific settings for this app.
 */
export default defineConfig([
  {
    extends: [baseConfig]
  },
  // Vue 3 recommended rules (flat config)
  pluginVue.configs['flat/recommended'],
  // Vue SFC with TypeScript parsing and browser globals
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaFeatures: {
          jsx: true
        },
        extraFileExtensions: ['.vue']
      }
    },
    rules: {
      // Vue specific rules (code quality only, not formatting)
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-v-html': 'off',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-setup-props-reactivity-loss': 'error',
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/prefer-separate-static-class': 'error'
    }
  },
  {
    files: ['src/renderer/src/**/*.{ts,vue}'],
    ignores: [
      'src/renderer/src/composables/index.ts',
      'src/renderer/src/stores/index.ts',
      'src/renderer/src/types/index.ts'
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message: 'Use explicit named exports instead of export *.'
        }
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: rendererImportBoundaryPatterns
        }
      ]
    }
  },
  // Prevent shared/ui components from being route-aware (routing belongs to pages/features)
  {
    files: [
      'src/renderer/src/components/shared/**/*.{ts,vue}',
      'src/renderer/src/components/ui/**/*.{ts,vue}'
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue-router',
              importNames: [
                '*',
                'useRouter',
                'useRoute',
                'useLink',
                'onBeforeRouteLeave',
                'onBeforeRouteUpdate'
              ],
              message:
                'Do not use vue-router composables in components/shared or components/ui. Emit events and handle routing in pages/features.'
            }
          ],
          patterns: rendererImportBoundaryPatterns
        }
      ]
    }
  },
  // Prettier - disables all formatting rules (MUST be last)
  prettier
])
