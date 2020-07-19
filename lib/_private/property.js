/*
  Copyright 2016 - 2020 by Jan Dockx

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

/// <reference path="./property.d.ts" />

'use strict'

const is = require('./is')

/**
 * @type {import('assert')}
 */
const assert = require('assert')

/**
 * @typedef {import('./property').PropertyName} PropertyName
 */

/**
 * @template O
 * @template R
 * @typedef {import('./property').Derivation<O, R>} Derivation<O, R>
 */

const property = {
  /**
   * @param {object} obj
   * @param {PropertyName} propName
   * @param {any} value
   * @return {void}
   */
  setAndFreeze: function (obj, propName, value) {
    assert.ok(!is.primitive(obj))
    assert.strictEqual(typeof propName, 'string')

    Object.defineProperty(obj, propName, {
      configurable: false,
      enumerable: true,
      writable: false,
      value: value
    })
  },

  /**
   * @template O
   * @template R
   * @param {object} prototype
   * @param {PropertyName} propertyName
   * @param {Derivation<O, R>} derivation
   * @return {void}
   */
  configurableDerived: function (prototype, propertyName, derivation) {
    assert.ok(prototype)
    assert.ok(!is.primitive(prototype))
    assert.strictEqual(typeof propertyName, 'string')
    assert.strictEqual(typeof derivation, 'function')

    Object.defineProperty(prototype, propertyName, {
      configurable: true,
      enumerable: true,
      get: derivation,
      set: undefined
    })
  },

  /**
   * @template O
   * @template R
   * @param {object} prototype
   * @param {PropertyName} propertyName
   * @param {Derivation<O, R>} derivation
   * @return {void}
   */
  frozenDerived: function (prototype, propertyName, derivation) {
    assert.ok(prototype)
    assert.ok(!is.primitive(prototype))
    assert.strictEqual(typeof propertyName, 'string')
    assert.strictEqual(typeof derivation, 'function')

    Object.defineProperty(prototype, propertyName, {
      configurable: false,
      enumerable: true,
      get: derivation,
      set: undefined
    })
  },

  /**
   * @param {object} prototype
   * @param {PropertyName} propertyName
   * @param {PropertyName} privatePropName
   * @return {void}
   */
  frozenReadOnlyArray: function (prototype, propertyName, privatePropName) {
    assert.ok(prototype)
    assert.ok(!is.primitive(prototype))
    assert.strictEqual(typeof propertyName, 'string')
    assert.strictEqual(typeof privatePropName, 'string')
    assert.notStrictEqual(propertyName, privatePropName)

    /**
     * @function
     * @template O
     * @template R
     * @this {O}
     * @return {R}
     */
    const derivation = function derivation () {
      return this[privatePropName].slice()
    }

    property.frozenDerived(prototype, propertyName, derivation)
  }
}

module.exports = property
