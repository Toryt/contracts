/*
 Copyright 2015 - 2017 by Jan Dockx

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

/* eslint-env mocha */

'use strict'

const must = require('must')
const orderOfKeysCommon = require('./_orderOfKeysCommon')

describe('js/Object', function () {
  describe('#keys()', function () {
    /*
     Does for ... iteration respect the order in which properties on an object are defined?
     And in what order are the properties of the prototype handled?

     According to the spec, the order is undefined. However,
     "All modern implementations of ECMAScript iterate through object properties in the order in which they were defined."
     (http://ejohn.org/blog/javascript-in-chrome/, "for loop order".)
     */

    it('should return all properties in the order they were defined', function () {
      // noinspection MagicNumberJS
      const nrOfProperties = 10000
      const o = orderOfKeysCommon.prepareAnObject(0, nrOfProperties)
      const keys = Object.keys(o)
      keys.length.must.equal(nrOfProperties)
      const keyNumbers = keys.map(orderOfKeysCommon.nFromRandomName)
      keyNumbers.reduce(
        (previous, current) => {
          current.must.equal(previous + 1)
          return current
        },
        -1
      )
    })
    it('does not return properties of the prototype', function () {
      const o = orderOfKeysCommon.prepareAnObjectWithAProto()
      const keys = Object.keys(o)
      // noinspection MagicNumberJS
      keys.length.must.not.equal(30)
      keys.length.must.equal(10)
    })
    it('should return all properties in the order they were defined in a literal', function () {
      const keys = Object.keys(orderOfKeysCommon.objectLiteral)
      keys.length.must.equal(5)
      const keyNumbers = keys.map(orderOfKeysCommon.nFromRandomName)
      keyNumbers.reduce(
        (previous, current) => {
          current.must.equal(previous + 1)
          return current
        },
        -1
      )
    })
    it('should return all properties in the order they were defined in a JSON object', function () {
      // noinspection NodeModulesDependencies
      const json = JSON.stringify(orderOfKeysCommon.objectLiteral)
      // noinspection NodeModulesDependencies
      const keys = Object.keys(JSON.parse(json))
      keys.length.must.equal(3) // undefined and function not stringified
      const keyNumbers = keys.map(orderOfKeysCommon.nFromRandomName)
      keyNumbers.reduce(
        (previous, current) => {
          current.must.equal(previous + 1)
          return current
        },
        -1
      )
    })
  })

  describe('Object.defineProperty()', function () {
    const propName = 'aProperty'

    function defineAProp (obj) {
      // noinspection MagicNumberJS
      Object.defineProperty(
        obj,
        propName,
        {
          configurable: true,
          enumerable: true,
          writable: false,
          value: 42
        }
      )
    }

    // noinspection JSPrimitiveTypeWrapperUsage
    [
      undefined,
      null,
      4,
      -1,
      '',
      'A string',
      new Date(),
      true,
      false,
      {},
      /foo/,
      function () { return 'This simulates a self' },
      () => 'This simulates a self',
      [],
      new ReferenceError(),
      Math,
      JSON,
      // eslint-disable-next-line
      new Number(4),
      // eslint-disable-next-line
      new String('abc'),
      // eslint-disable-next-line
      new Boolean(false)
    ].forEach(obj => {
      it(
        'sets a property on ' + obj + ' if it is non-primitive, and fails to do so if it is primitive',
        function () {
          const type = typeof obj
          if (obj === null || type === 'undefined' || type === 'number' || type === 'boolean' || type === 'string') {
            defineAProp.bind(null, obj).must.throw(TypeError)
          } else {
            defineAProp(obj)
            obj.must.have.ownProperty(propName)
            delete obj[propName] // cleanup
          }
        }
      )
    })
  })

  describe('Object.getOwnPropertyDescriptor()', function () {
    const propName = 'aProperty';

    // noinspection JSPrimitiveTypeWrapperUsage
    [
      undefined,
      null,
      4,
      -1,
      '',
      'A string',
      new Date(),
      true,
      false,
      {},
      /foo/,
      function () { return 'This simulates a self' },
      () => 'This simulates a self',
      [],
      new ReferenceError(),
      Math,
      JSON,
      // eslint-disable-next-line
      new Number(4),
      // eslint-disable-next-line
      new String('abc'),
      // eslint-disable-next-line
      new Boolean(false)
    ].forEach(obj => {
      it(
        'gets a property from ' +
        obj + ' if it is not null or undefined, and fails to do so if it is primitive',
        function () {
          if (obj === null || obj === undefined) {
            Object.getOwnPropertyDescriptor.bind(null, obj, propName).must.throw(TypeError)
          } else {
            const result = Object.getOwnPropertyDescriptor(obj, propName)
            must(result).be.falsy()
          }
        }
      )
    })
  })
})
