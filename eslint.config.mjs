// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  { ignores: ['dist', 'node_modules'] },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  eslintPluginPrettierRecommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },

  {
    files: ['**/*.ts'],
    plugins: {
      import: importPlugin
    },

    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },

    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',

      'no-undef': 'error',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',

      'no-unreachable': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      eqeqeq: 'error',

      'no-console': 'error',
      'no-debugger': 'error',

      'no-constant-condition': 'error',
      'no-empty': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',

      'no-return-await': 'error',
      'require-await': 'error',

      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'array-callback-return': 'error',

      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'object-curly-spacing': ['error', 'always'],
      'arrow-parens': ['error', 'always'],
      'arrow-body-style': ['error', 'as-needed'],
      'max-len': ['error', { code: 100 }],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      curly: ['error', 'multi-line'],
      'prefer-template': 'error',
      'newline-before-return': 'error',
      'no-magic-numbers': ['error', { ignore: [-1, 0, 1], ignoreEnums: true }],

      'import/no-cycle': 'error',
      'import/no-duplicates': 'error',
      'import/no-unused-modules': 'error',
      'import/prefer-default-export': 'off',
      'import/newline-after-import': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',

      'prettier/prettier': [
        'error',
        { endOfLine: 'auto', trailingComma: 'none' }
      ]
    }
  }
];
