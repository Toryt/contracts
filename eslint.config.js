/*
  Copyright 2015–2024 Jan Dockx

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

'use strict'

import neostandard from 'neostandard'
import globals from 'globals'
import depend from 'eslint-plugin-depend'
import json from 'eslint-plugin-json'
import noSecrets from 'eslint-plugin-no-secrets'

const { mocha } = globals
const stylistic = neostandard.plugins['@stylistic']
const typescriptEslint = neostandard.plugins['typescript-eslint'].plugin

export default neostandard({ ts: true }).concat([
  {
    name: 'prettier-overrides',
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always'
        }
      ]
    }
  },
  {
    name: 'mocha-globals',
    files: ['test-js/{*,**/*}.test.js'],
    languageOptions: {
      globals: {
        ...mocha
      }
    }
  },
  depend.configs['flat/recommended'],
  {
    files: ['**/*.json'],
    ...json.configs['recommended']
  },
  {
    files: ['**/*.js', '**/*.ts'],
    plugins: {
      'no-secrets': noSecrets
    },
    rules: {
      'no-secrets/no-secrets': [
        'error',
        {
          tolerance: 4.11
        }
      ]
    }
  },
  {
    files: ['**/*.ts'],
    plugins: { '@typescript-eslint': typescriptEslint },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn', // TODO probably remove this: we often want this in this code
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/no-misused-promises': 'error'
    }
  }
])
