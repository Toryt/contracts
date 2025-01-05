/*
  Copyright 2015–2025 Jan Dockx

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

import should from 'should'
import { functionArguments, primitive, stackLocation, stack, frozenOwnProperty } from '../../../../src/private/is.ts'
import { n, rn, stack as stackEOL } from '../../../../src/private/eol.ts'
import { notStackEOL } from '../../../util/cases.ts'
import { generateStuff } from '../../../util/_stuff.ts'
import { x, log, safeToString, showStack } from '../../../util/testUtil.ts'

describe('_private/is', function () {
  describe('#arguments', function () {
    generateStuff().forEach(({ subject, expected }) => {
      it(`returns ${expected === 'arguments' ? 'true' : 'false'} for ${safeToString(subject)}`, function () {
        const result = functionArguments(subject)
        if (expected === 'arguments') {
          result.should.be.true()
        } else {
          should(result).not.be.ok()
        }
      })
    })
  })

  describe('#primitive()', function () {
    generateStuff().forEach(({ subject, isPrimitive }) => {
      it(`correctly decides whether the argument is a primitive for ${safeToString(subject)}`, function () {
        const result = primitive(subject)
        result.should.be.a.Boolean()
        result.should.equal(isPrimitive)
      })
    })
  })

  describe('#stackLocation', function () {
    generateStuff()
      .filter(({ subject }) => typeof subject !== 'string')
      .forEach(({ subject }) => {
        it(`says no to ${safeToString(subject)}`, function () {
          const result = stackLocation(subject)
          result.should.be.false()
        })
      })
    it("says no to ''", function () {
      const result = stackLocation('')
      result.should.be.false()
    })
    it("says yes to 'abc'", function () {
      const result = stackLocation('abc')
      result.should.be.true()
    })
    it('says no to a multi-line string with \\n as EOL', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = stackLocation('this is a' + n + 'multi-line' + n + 'string')
      result.should.be.false()
    })
    it('says no to a multi-line string with \\r\\n as EOL', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = stackLocation('this is a' + rn + 'multi-line' + rn + 'string')
      result.should.be.false()
    })
    it('says yes to all lines of a stack trace', function () {
      // sadly, also to the message
      const error = new Error('This is an error to get a platform dependent stack')
      const lines = error.stack!.split(stackEOL)
      lines
        .filter((line, index) => index !== lines.length - 1 || line.length > 0) // FF adds an empty line at the end
        .filter(line => line.length > 0) // Safari has lots of empty lines, but only when used remotely (with WebDriver)
        .forEach(line => {
          const result = stackLocation(line)
          log(`${result}: ${line}`)
          result.should.be.true()
        })
    })
  })

  describe('#stack', function () {
    generateStuff()
      .filter(({ subject }) => typeof subject !== 'string')
      .forEach(({ subject }) => {
        it(`says no to ${safeToString(subject)}`, function () {
          const result = stack(subject)
          result.should.be.false()
        })
      })
    it("says no to ''", function () {
      const result = stack('')
      result.should.be.false()
    })
    it("says yes to 'abc'", function () {
      const result = stack('abc')
      result.should.be.true()
    })
    it('says yes to a multi-line string with `eol.stack`', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const candidate = 'this is a' + stackEOL + 'multi-line' + stackEOL + 'string'
      const result = stack(candidate)
      result.should.be.true()
    })
    it('says no to a multi-line string with the other EOL', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const candidate = 'this is a' + notStackEOL + 'multi-line' + notStackEOL + 'string'
      const result = stack(candidate)
      result.should.be.true()
    })
    it('says no to a multi-line string with a blank line with `eol.stack`', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = stack(
        'this is a' + stackEOL + 'multi-line' + stackEOL + 'string, with a' + stackEOL + stackEOL + 'blank line'
      )
      result.should.be.false()
    })
    it('says yes to a multi-line string with a blank line with other EOL (looks like a single line)', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = stack(
        'this is a' +
          notStackEOL +
          'multi-line' +
          notStackEOL +
          'string, with a' +
          notStackEOL +
          notStackEOL +
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
      const stackLines = error.stack!.split(stackEOL)
      const rawStack = stackLines
        // remove message line
        .filter(sl => sl && sl.indexOf(message) < 0)
        .join(stackEOL)
      log('rawStack:')
      log(`▷${rawStack}◁`)
      const result = stack(rawStack)
      result.should.be.true()
    })
  })

  describe('#frozenOwnProperty()', function () {
    const propName = 'test prop name'
    const propValue = 'dummy value'
    const truths = [true, false]
    x(truths, truths, truths).forEach(([configurable, enumerable, writable]) => {
      const subject = {}
      Object.defineProperty(subject, propName, {
        configurable,
        enumerable,
        writable,
        value: propValue
      })
      if (!configurable && enumerable && !writable && Object.prototype.hasOwnProperty.call(subject, propName)) {
        it('reports true if the property is an own property, and it is enumerable, not configurable and not writable', function () {
          const result = frozenOwnProperty(subject, propName)
          should(result).be.ok()
        })
      } else {
        it(`reports false if the property is an own property, and enumerable === ${enumerable} configurable === ${configurable} writable === ${writable}`, function () {
          const result = frozenOwnProperty(subject, propName)
          should(result).not.be.ok()
        })
      }

      it('reports false if the property does not exist', function () {
        const result = frozenOwnProperty(subject, 'some other, non-existing property name')
        should(result).not.be.ok()
      })

      const specialized: Record<string, string> = {}
      Object.setPrototypeOf(specialized, subject)
      should(specialized[propName]).equal(propValue) // check inheritance — test code validity

      it(`reports false if the property is not an own property, and enumerable === ${enumerable} configurable === ${configurable} writable === ${writable}`, function () {
        const specializedResult = frozenOwnProperty(specialized, propName)
        should(specializedResult).not.be.ok()
      })
    })

    const notObjects = [0, false, '', 'lala']
    notObjects.forEach(notAnObject => {
      // cannot set a property on primitives
      it(`reports false if the first parameter is a primitive (${typeof notAnObject})`, function () {
        const result = frozenOwnProperty(notAnObject, propName)
        should(result).not.be.ok()
      })
    })

    const fCandidates = [undefined, function (): void {}]
    x(truths, truths, fCandidates, fCandidates).forEach(([configurable, enumerable, get, set]) => {
      const subject = {}
      Object.defineProperty(subject, propName, {
        configurable,
        enumerable,
        ...(get && { get }),
        ...(set && { set })
      })
      if (
        !configurable &&
        enumerable &&
        typeof get === 'function' &&
        set === undefined &&
        Object.prototype.hasOwnProperty.call(subject, propName)
      ) {
        it('reports true if the property is an own property, and it is enumerable, and not configurable, has a getter, but not a setter', function () {
          const result = frozenOwnProperty(subject, propName)
          should(result).be.ok()
        })
      } else {
        it(`reports false if the property is an own property, enumerable === ${enumerable} configurable === ${configurable} get === ${get} set === ${set}`, function () {
          const result = frozenOwnProperty(subject, propName)
          should(result).not.be.ok()
        })
      }
    })
  })
})
