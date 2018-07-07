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

const testUtil = require('../_util/testUtil')
const must = require('must')
const orderOfKeysCommon = require('./_orderOfKeysCommon')

describe('js/syntax', function () {
  describe('#for-in', function () {
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
      let count = 0
      let previous = -1
      for (let key in o) {
        count++
        const current = orderOfKeysCommon.nFromRandomName(key)
        current.must.equal(previous + 1)
        previous = current
      }
      count.must.equal(nrOfProperties)
    })
    it('should return all properties in the order they were defined, but those of the prototype last', function () {
      const o = orderOfKeysCommon.prepareAnObjectWithAProto()
      let count = 0
      let previous = -1
      for (const key in o) {
        count++
        const current = orderOfKeysCommon.nFromRandomName(key)
        current.must.equal(previous + 1)
        // noinspection MagicNumberJS
        previous = current === 9 ? 99 : (current === 109 ? 199 : current)
      }
      // noinspection MagicNumberJS
      count.must.equal(30)
    })
    it('should return all properties in the order they were defined in a literal', function () {
      let count = 0
      let previous = -1
      for (const key in orderOfKeysCommon.objectLiteral) {
        count++
        const current = orderOfKeysCommon.nFromRandomName(key)
        current.must.equal(previous + 1)
        previous = current
      }
      count.must.equal(5)
    })
    it('should return all properties in the order they were defined in a JSON object', function () {
      const json = JSON.stringify(orderOfKeysCommon.objectLiteral)
      let count = 0
      let previous = -1
      for (const key in JSON.parse(json)) {
        count++
        const current = orderOfKeysCommon.nFromRandomName(key)
        current.must.equal(previous + 1)
        previous = current
      }
      count.must.equal(3) // undefined and function not stringified
    })
  })

  function throwTest (toThrow) {
    function thrower () {
      throw toThrow
    }

    thrower.must.throw(toThrow)
  }

  describe('#throw', function () {
    it('can throw a truthy thing', function () {
      throwTest('a string to throw')
    })
    it('can throw ""', function () {
      throwTest('')
    })
    it('can throw false', function () {
      throwTest(false)
    })
    it('can throw 0', function () {
      throwTest(0)
    })
    it('can throw undefined', function () {
      throwTest(undefined)
    })
    it('can throw null', function () {
      throwTest(null)
    })
  })

  describe('#typeof', function () {
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
      function () {},
      () => '',
      [],
      new ReferenceError(),
      Math,
      JSON,
      // eslint-disable-next-line
      new Number(4),
      // eslint-disable-next-line
      new String('abc'),
      // eslint-disable-next-line
      new Boolean(false),
      Object,
      arguments
    ].forEach(function (a) {
      it('reports the typeof ' + a, function () {
        testUtil.log(a + ': ' + typeof a)
      })
    })
  })

  describe('string', function () {
    it('cannot take properties', function () {
      const subject = 'This is a string'
      subject.must.not.have.property('name')
      const name = 'This is a name'
      let thrown = false
      try {
        // noinspection JSPrimitiveTypeWrapperUsage,JSUndefinedPropertyAssignment
        subject.name = name
      } catch (err) {
        thrown = true
        err.must.be.an.error(TypeError)
      }

      thrown.must.be.true()
    })
  })

  describe('an array entry past the length of the array', function () {
    it('is undefined', function () {
      const array = [1, '2', {three: 3}]
      const result = array[array.length]
      must(result).be.undefined()
    })
  })

  describe('instanceof', function () {
    it('does not depend on the constructor property of a prototype', function () {
      // noinspection FunctionNamingConventionJS
      function Base () {}
      Base.prototype.constructor = 'Second something else'

      // noinspection FunctionNamingConventionJS
      function Derived () {}
      Derived.prototype = Object.create(Base.prototype, {constructor: {value: 'First something else'}})

      // noinspection FunctionNamingConventionJS
      function Unrelated () {}

      const instance = new Derived()

      /* ;'s necessary with this strange syntax */
      ; (instance instanceof Derived).must.be.true()
      ; (instance instanceof Base).must.be.true()
      ; (instance instanceof Unrelated).must.be.false()
      ; (instance instanceof Object).must.be.true()
    })
    it('is not true for the prototype itself', function () {
      // noinspection FunctionNamingConventionJS
      function Base () {}
      Base.prototype.constructor = 'Second something else'

      // noinspection FunctionNamingConventionJS
      function Derived () {}
      Derived.prototype = Object.create(Base.prototype, {constructor: {value: 'First something else'}})

      // noinspection FunctionNamingConventionJS
      function Unrelated () {}

      (Derived.prototype instanceof Derived).must.be.false()
      /* ;'s necessary with this strange syntax */
      ; (Derived.prototype instanceof Base).must.be.true()
      ; (Derived.prototype instanceof Unrelated).must.be.false()
      ; (Derived.prototype instanceof Object).must.be.true()
      ; (Base.prototype instanceof Derived).must.be.false()
      ; (Base.prototype instanceof Base).must.be.false()
      ; (Base.prototype instanceof Unrelated).must.be.false()
      ; (Base.prototype instanceof Object).must.be.true()
      ; (Unrelated.prototype instanceof Derived).must.be.false()
      ; (Unrelated.prototype instanceof Base).must.be.false()
      ; (Unrelated.prototype instanceof Unrelated).must.be.false()
      ; (Unrelated.prototype instanceof Object).must.be.true()
    })
  })
})