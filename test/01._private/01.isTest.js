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

const is = require('../../lib/_private/is')
const testUtil = require('../_util/testUtil')
const must = require('must')
const os = require('os')
const stuff = require('./_stuff')
const cases = require('../_cases')
const stack = require('../../lib/_private/stack')

describe('_private/is', function () {
  describe('#arguments', function () {
    stuff.forEach(s => {
      it(`returns ${s.expected === 'arguments' ? 'true' : 'false'} for ${s.subject}`, function () {
        const result = is.functionArguments(s.subject)
        if (s.expected === 'arguments') {
          result.must.be.true()
        } else {
          must(result).be.falsy()
        }
      })
    })
  })

  describe('#primitive()', function () {
    stuff.forEach(record => {
      it(`correctly decides whether the argument is a primitive for ${record.subject}`, function () {
        const result = is.primitive(record.subject)
        result.must.be.a.boolean()
        result.must.equal(record.isPrimitive)
      })
    })
  })

  describe('#stackLocation', function () {
    stuff
      .map(s => s.subject)
      .filter(s => typeof s !== 'string')
      .forEach(s => {
        it(`says no to ${s}`, function () {
          const result = is.stackLocation(s)
          result.must.be.false()
        })
      })
    it(`says no to ''`, function () {
      const result = is.stackLocation('')
      result.must.be.false()
    })
    it(`says yes to 'abc'`, function () {
      const result = is.stackLocation('abc')
      result.must.be.true()
    })
    it(`says no to a multi-line string with \\n as EOL`, function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = is.stackLocation('this is a' + cases.nEOL + 'multi-line' + cases.nEOL + 'string')
      result.must.be.false()
    })
    it(`says no to a multi-line string with \\r\\n as EOL`, function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = is.stackLocation('this is a' + cases.rnEOL + 'multi-line' + cases.rnEOL + 'string')
      result.must.be.false()
    })
    it(`says yes to all lines of a stack trace`, function () {
      // sadly, also to the message
      const error = new Error('This is an error to get a platform dependent stack')
      const lines = error.stack.split(stack.EOL)
      lines
        .filter((line, index) => index !== lines.length - 1 || line.length > 0) // FF adds an empty line at the end
        .filter((line, index) => line.length > 0) // Safari has lots of empty lines, but only when used remotely (with WebDriver)
        .forEach(line => {
          const result = is.stackLocation(line)
          testUtil.log(`${result}: ${line}`)
          result.must.be.true()
        })
    })
  })

  describe('#stack', function () {
    stuff
      .map(s => s.subject)
      .filter(s => typeof s !== 'string')
      .forEach(s => {
        it(`says no to ${s}`, function () {
          const result = is.stack(s)
          result.must.be.false()
        })
      })
    it(`says no to ''`, function () {
      const result = is.stack('')
      result.must.be.false()
    })
    it(`says yes to 'abc'`, function () {
      const result = is.stack('abc')
      result.must.be.true()
    })
    it(`says yes to a multi-line string`, function () {
      const candidate = `this is a 
multi-line
string`
      const result = is.stack(candidate)
      result.must.be.true()
    })
    it(`says no to a multi-line string with a blank line`, function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = is.stack('this is a' + os.EOL + 'multi-line' + os.EOL + 'string, with a' + os.EOL + os.EOL +
                              'blank line')
      result.must.be.false()
    })
    it(`says yes to a stack trace`, function () {
      const message = 'This is an error to get a platform dependent stack'
      // sadly, also to the message, on some platforms
      const error = new Error(message)
      testUtil.showStack(error)
      const stackLines = error.stack.split(os.EOL)
      const rawStack = stackLines
        // remove message line
        .filter(sl => sl && sl.indexOf(message) < 0)
        .join(os.EOL)
      testUtil.log('rawStack:')
      testUtil.log(`▷${rawStack}◁`)
      const result = is.stack(rawStack)
      result.must.be.true()
    })
  })

  describe('#frozenOwnProperty()', function () {
    const propName = 'test prop name'
    const propValue = 'dummy value'
    const truths = [true, false]
    testUtil.x(truths, truths, truths).forEach(values => {
      const subject = {}
      Object.defineProperty(subject, propName, {
        configurable: values[0],
        enumerable: values[1],
        writable: values[2],
        value: propValue
      })
      if (!values[0] && values[1] && !values[2] && subject.hasOwnProperty(propName)) {
        it(
          'reports true if the property is an own property, ' +
            'and it is enumerable, not configurable and not writable',
          function () {
            const result = is.frozenOwnProperty(subject, propName)
            result.must.be.truthy()
          }
        )
      } else {
        it(
          'reports false if the property is an own property, and' +
            ' enumerable === ' +
            values[1] +
            ' configurable === ' +
            values[0] +
            ' writable === ' +
            values[2],
          function () {
            const result = is.frozenOwnProperty(subject, propName)
            must(result).be.falsy()
          }
        )
      }
      it('reports false if the property does not exist', function () {
        const result = is.frozenOwnProperty(subject, 'some other, non-existing property name')
        must(result).be.falsy()
      })
      const specialized = {}
      Object.setPrototypeOf(specialized, subject)
      specialized[propName].must.equal(propValue) // check inheritance - test code validity
      it(
        'reports false if the property is not an own property, and' +
          ' enumerable === ' +
          values[1] +
          ' configurable === ' +
          values[0] +
          ' writable === ' +
          values[2],
        function () {
          const specializedResult = is.frozenOwnProperty(specialized, propName)
          must(specializedResult).be.falsy()
        }
      )
    })
    const notObjects = [0, false, '', 'lala']
    notObjects.forEach(notAnObject => {
      // cannot set a property on primitives
      it(`reports false if the first parameter is a primitive (${typeof notAnObject})`, function () {
        const result = is.frozenOwnProperty(notAnObject, propName)
        must(result).be.falsy()
      })
    })
    const fCandidates = [undefined, function () {}]
    testUtil.x(truths, truths, fCandidates, fCandidates).forEach(values => {
      const subject = {}
      Object.defineProperty(subject, propName, {
        configurable: values[0],
        enumerable: values[1],
        get: values[2],
        set: values[3]
      })
      if (
        !values[0] &&
        values[1] &&
        typeof values[2] === 'function' &&
        values[3] === undefined &&
        subject.hasOwnProperty(propName)
      ) {
        it(
          'reports true if the property is an own property, and it is enumerable, and not configurable, has a ' +
            'getter, but not a setter',
          function () {
            const result = is.frozenOwnProperty(subject, propName)
            result.must.be.truthy()
          }
        )
      } else {
        it(
          'reports false if the property is an own property,' +
            ' enumerable === ' +
            values[1] +
            ' configurable === ' +
            values[0] +
            ' get === ' +
            values[2] +
            ' set === ' +
            values[3],
          function () {
            const result = is.frozenOwnProperty(subject, propName)
            must(result).be.falsy()
          }
        )
      }
    })
  })
})
