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

const neostandard = require('neostandard')
const { mocha } = require('globals')
const stylistic = neostandard.plugins['@stylistic']
const depend = require('eslint-plugin-depend')
const json = require('eslint-plugin-json')
const noSecrets = require('eslint-plugin-no-secrets')

module.exports = neostandard({}).concat([
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
    files: ['test/{*,**/*}Test.js'],
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
    files: ['**/*.js'],
    plugins: {
      'no-secrets': noSecrets
    },
    rules: {
      'no-secrets/no-secrets': ['error']
    }
  }
])
