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

const is = require('../../lib/_private/is')
const { x, log, safeToString, showStack } = require('../_util/testUtil')
const should = require('should')
const stuff = require('./_stuff')
const eol = require('../../lib/_private/eol')
const cases = require('../_cases')

describe('_private/is', function () {
  describe('#arguments', function () {
    stuff.forEach(s => {
      it(`returns ${s.expected === 'arguments' ? 'true' : 'false'} for ${safeToString(s.subject)}`, function () {
        const result = is.functionArguments(s.subject)
        if (s.expected === 'arguments') {
          result.should.be.true()
        } else {
          should(result).not.be.ok()
        }
      })
    })
  })

  describe('#primitive()', function () {
    stuff.forEach(record => {
      it(`correctly decides whether the argument is a primitive for ${safeToString(record.subject)}`, function () {
        const result = is.primitive(record.subject)
        result.should.be.a.Boolean()
        result.should.equal(record.isPrimitive)
      })
    })
  })

  describe('#stackLocation', function () {
    stuff
      .map(s => s.subject)
      .filter(s => typeof s !== 'string')
      .forEach(s => {
        it(`says no to ${safeToString(s)}`, function () {
          const result = is.stackLocation(s)
          result.should.be.false()
        })
      })
    it("says no to ''", function () {
      const result = is.stackLocation('')
      result.should.be.false()
    })
    it("says yes to 'abc'", function () {
      const result = is.stackLocation('abc')
      result.should.be.true()
    })
    it('says no to a multi-line string with \\n as EOL', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = is.stackLocation('this is a' + eol.n + 'multi-line' + eol.n + 'string')
      result.should.be.false()
    })
    it('says no to a multi-line string with \\r\\n as EOL', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = is.stackLocation('this is a' + eol.rn + 'multi-line' + eol.rn + 'string')
      result.should.be.false()
    })
    it('says yes to all lines of a stack trace', function () {
      // sadly, also to the message
      const error = new Error('This is an error to get a platform dependent stack')
      const lines = error.stack.split(eol.stack)
      lines
        .filter((line, index) => index !== lines.length - 1 || line.length > 0) // FF adds an empty line at the end
        .filter(line => line.length > 0) // Safari has lots of empty lines, but only when used remotely (with WebDriver)
        .forEach(line => {
          const result = is.stackLocation(line)
          log(`${result}: ${line}`)
          result.should.be.true()
        })
    })
  })

  describe('#stack', function () {
    stuff
      .map(s => s.subject)
      .filter(s => typeof s !== 'string')
      .forEach(s => {
        it(`says no to ${safeToString(s)}`, function () {
          const result = is.stack(s)
          result.should.be.false()
        })
      })
    it("says no to ''", function () {
      const result = is.stack('')
      result.should.be.false()
    })
    it("says yes to 'abc'", function () {
      const result = is.stack('abc')
      result.should.be.true()
    })
    it('says yes to a multi-line string with eol.stack', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const candidate = 'this is a' + eol.stack + 'multi-line' + eol.stack + 'string'
      const result = is.stack(candidate)
      result.should.be.true()
    })
    it('says no to a multi-line string with the other EOL', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const candidate = 'this is a' + cases.notStackEOL + 'multi-line' + cases.notStackEOL + 'string'
      const result = is.stack(candidate)
      result.should.be.true()
    })
    it('says no to a multi-line string with a blank line with eol.stack', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = is.stack(
        'this is a' + eol.stack + 'multi-line' + eol.stack + 'string, with a' + eol.stack + eol.stack + 'blank line'
      )
      result.should.be.false()
    })
    it('says yes to a multi-line string with a blank line with other EOL (looks like a single line)', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = is.stack(
        'this is a' +
          cases.notStackEOL +
          'multi-line' +
          cases.notStackEOL +
          'string, with a' +
          cases.notStackEOL +
          cases.notStackEOL +
          'blank line'
      )
      // with the other EOL, it looks like a single line, which is a good stack
      result.should.be.true()
    })
    it('says yes to a stack trace', function () {
      const message = 'This is an error to get a platform dependent stack'
      // sadly, also to the message, on some platforms
      const error = new Error(message)
      showStack(error)
      const stackLines = error.stack.split(eol.stack)
      const rawStack = stackLines
        // remove message line
        .filter(sl => sl && sl.indexOf(message) < 0)
        .join(eol.stack)
      log('rawStack:')
      log(`▷${rawStack}◁`)
      const result = is.stack(rawStack)
      result.should.be.true()
    })
  })

  describe('#frozenOwnProperty()', function () {
    const propName = 'test prop name'
    const propValue = 'dummy value'
    const truths = [true, false]
    x(truths, truths, truths).forEach(values => {
      const subject = {}
      Object.defineProperty(subject, propName, {
        configurable: values[0],
        enumerable: values[1],
        writable: values[2],
        value: propValue
      })
      if (!values[0] && values[1] && !values[2] && Object.prototype.hasOwnProperty.call(subject, propName)) {
        it(
          'reports true if the property is an own property, ' +
            'and it is enumerable, not configurable and not writable',
          function () {
            const result = is.frozenOwnProperty(subject, propName)
            result.should.be.ok()
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
            should(result).not.be.ok()
          }
        )
      }
      it('reports false if the property does not exist', function () {
        const result = is.frozenOwnProperty(subject, 'some other, non-existing property name')
        should(result).not.be.ok()
      })
      const specialized = {}
      Object.setPrototypeOf(specialized, subject)
      specialized[propName].should.equal(propValue) // check inheritance - test code validity
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
          should(specializedResult).not.be.ok()
        }
      )
    })
    const notObjects = [0, false, '', 'lala']
    notObjects.forEach(notAnObject => {
      // cannot set a property on primitives
      it(`reports false if the first parameter is a primitive (${typeof notAnObject})`, function () {
        const result = is.frozenOwnProperty(notAnObject, propName)
        should(result).not.be.ok()
      })
    })
    const fCandidates = [undefined, function () {}]
    x(truths, truths, fCandidates, fCandidates).forEach(values => {
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
        Object.prototype.hasOwnProperty.call(subject, propName)
      ) {
        it(
          'reports true if the property is an own property, and it is enumerable, and not configurable, has a ' +
            'getter, but not a setter',
          function () {
            const result = is.frozenOwnProperty(subject, propName)
            result.should.be.ok()
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
            should(result).not.be.ok()
          }
        )
      }
    })
  })
})
