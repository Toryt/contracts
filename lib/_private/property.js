/*
  Copyright 2016 - 2018 by Jan Dockx

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

const is = require('./is')
const assert = require('assert')

const property = {
  setAndFreeze: function (obj, propName, value) {
    assert.ok(!is.primitive(obj))
    assert.equal(typeof propName, 'string')

    Object.defineProperty(
      obj,
      propName,
      {
        configurable: false,
        enumerable: true,
        writable: false,
        value: value
      }
    )
  },

  configurableDerived: function (prototype, propertyName, derivation) {
    assert.ok(prototype)
    assert.ok(!is.primitive(prototype))
    assert.equal(typeof propertyName, 'string')
    assert.equal(typeof derivation, 'function')

    Object.defineProperty(
      prototype,
      propertyName,
      {
        configurable: true,
        enumerable: true,
        get: derivation,
        set: undefined
      }
    )
  },

  frozenDerived: function (prototype, propertyName, derivation) {
    assert.ok(prototype)
    assert.ok(!is.primitive(prototype))
    assert.equal(typeof propertyName, 'string')
    assert.equal(typeof derivation, 'function')

    Object.defineProperty(
      prototype,
      propertyName,
      {
        configurable: false,
        enumerable: true,
        get: derivation,
        set: undefined
      }
    )
  },

  frozenReadOnlyArray: function (prototype, propertyName, privatePropName) {
    assert.ok(prototype)
    assert.ok(!is.primitive(prototype))
    assert.equal(typeof propertyName, 'string')
    assert.equal(typeof privatePropName, 'string')
    assert.notEqual(propertyName, privatePropName)

    property.frozenDerived(
      prototype,
      propertyName,
      function () { return this[privatePropName].slice() }
    )
  }
}

module.exports = property
