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

import * as util from 'util'
import should from 'should'
import { primitive } from '../../../../src/private/is.ts'
import {
  conciseSeparator,
  maxLengthOfConciseRepresentation,
  conciseCondition,
  value,
  extensiveThrown,
  type
} from '../../../../src/private/report.ts'
import { n, rn, stack as stackEOL } from '../../../../src/private/eol.ts'
import { setAndFreeze } from '../../../../src/private/property.ts'
import { generateMutableStuff, generateStuff } from '../../../util/_stuff.ts'
import { safeToString, log, anyCasesGenerators } from '../../../util/testUtil.ts'
import { testName } from '../../../util/testName.ts'

describe(testName(import.meta), function () {
  describe('conciseCondition', function () {
    function isAConciseVersion(original: string, concise: string): boolean {
      const split = ('' + concise).split(conciseSeparator)
      const cleanOriginal = original
        .replace(/[\r\n]/g, ' ')
        .replace(/\s\s+/g, ' ')
        .trim()
      let result
      if (split.length < 2) {
        result = cleanOriginal === concise
      } else {
        // > 2 is not supported right now, and will fail
        result =
          split[0] !== undefined &&
          split[1] !== undefined &&
          cleanOriginal.indexOf(split[0]) === 0 &&
          cleanOriginal.indexOf(split[1]) === cleanOriginal.length - split[1].length
      }
      return result
    }

    function expectGeneralPostconditions(result: unknown, expected: string): void {
      log('result: %s', result)
      should(result).be.a.String()
      const stringResult = result as string
      stringResult.should.not.containEql(n)
      stringResult.should.not.containEql(rn)
      stringResult.length.should.be.lessThanOrEqual(maxLengthOfConciseRepresentation)
      stringResult.trim().should.equal(result)
      isAConciseVersion(expected, stringResult).should.be.ok()
    }

    const prefix = 'This is a test prefix'
    const alternativeName = 'This is an alternative name'
    const namedStuff = generateMutableStuff()
    namedStuff.forEach(({ subject }): void => {
      setAndFreeze(subject, 'name', alternativeName)
    })

    function generateMultiLineAnonymousFunction(): () => string {
      return function (): string {
        // trim: spaces at start
        let x = '  This is a multi-line function'
        x += 'The intention of this test'
        x += 'is to verify'
        // start of white line

        // end of white line
        x += 'whether we get an acceptable'
        x += 'is to shortened version of this'
        x += 'as a concise representation'
        x += 'this function should have no name  ' // trim
        return x
      }
    }

    const stuffToo = generateStuff()
      .concat(namedStuff)
      .map(s => s.subject)
    stuffToo.push(generateMultiLineAnonymousFunction())
    const other = generateMultiLineAnonymousFunction()
    setAndFreeze(
      other,
      'name',
      `   This is a multi-line name
The intention of this test
is to verify

whether we get an acceptable
is to shortened version of this
as a concise representation
this function should have a name   ` // trim
    )
    stuffToo.push(other)

    stuffToo.forEach((f: unknown): void => {
      if (!f || (typeof f !== 'object' && typeof f !== 'function') || !('name' in f)) {
        it(`returns the string representation with the prefix, when there is no f, or it has no name, for ${safeToString(
          f
        )}`, function () {
          const result = conciseCondition(prefix, f)
          expectGeneralPostconditions(result, prefix + ' ' + safeToString(f))
        })
      } else {
        it(`returns the name with the prefix, when there is an \`f\` and it has a name, for ${safeToString(
          f
        )}`, function () {
          const result = conciseCondition(prefix, f)
          expectGeneralPostconditions(result, prefix + ' ' + f.name)
        })
      }
    })
  })

  describe('extensiveThrown', function () {
    let caseGenerators = anyCasesGenerators('thrown')
    const toStringString = 'This is the toString'
    const stackString = 'This is the stack'

    function stackDoesNotContainToString(): unknown {
      return {
        stack: stackString,
        toString: function (): string {
          return toStringString
        }
      }
    }

    function stackDoesContainToString(): unknown {
      return {
        stack: toStringString + stackEOL + stackString,
        toString: function (): string {
          return toStringString
        }
      }
    }

    caseGenerators.push(stackDoesNotContainToString)
    caseGenerators.push(stackDoesContainToString)
    caseGenerators = caseGenerators.concat(
      anyCasesGenerators('throw stack').map(ac => (): unknown => ({
        stack: ac(),
        toString: function (): string {
          return toStringString
        }
      }))
    )

    caseGenerators.forEach(thrownGenerator => {
      const thrown = thrownGenerator()

      it(`returns the expected, normalized string representation for ${thrown}`, function () {
        const result = extensiveThrown(thrown)

        result.should.be.a.String()
        result.indexOf(value(thrown)).should.equal(0)
        const stack =
          thrown && (typeof thrown === 'object' || typeof thrown === 'function') && 'stack' in thrown && thrown.stack
        if (stack) {
          const prefixedStack = stackEOL + stack
          const expectedStart = result.length - prefixedStack.length
          result.lastIndexOf(prefixedStack).should.equal(expectedStart)
        }
        log(result)
      })
    })
  })

  describe('type', function () {
    generateStuff().forEach(({ subject }) => {
      it(`returns a string that is expected for ${safeToString(subject)}`, function () {
        const result = type(subject)
        log(result)
        result.should.be.a.String()
        result.should.not.equal('')
        if (subject === null) {
          result.should.equal('null')
        } else if (typeof subject === 'object') {
          if (subject === Math) {
            result.should.equal('Math')
          } else if (subject === JSON) {
            result.should.equal('JSON')
          } else if (Array.isArray(subject)) {
            result.should.equal('Array')
          } else if (subject.toString().indexOf('Arguments') >= 0) {
            result.should.equal('arguments')
          } else {
            result.should.equal(subject.constructor.name)
          }
        } else {
          result.should.equal(typeof subject)
        }
      })
    })
  })

  describe('value', function () {
    generateStuff().forEach(({ subject }) => {
      it(`returns a string that is expected for ${safeToString(subject)}`, function () {
        const result = value(subject)
        log(result)
        result.should.be.a.String()
        result.should.not.equal('')
        // noinspection IfStatementWithTooManyBranchesJS
        if (subject === global) {
          result.should.equal('{global}')
        } else if (typeof subject === 'string' || subject instanceof String) {
          result.should.equal(`'${subject}'`)
        } else if (
          primitive(subject) ||
          subject instanceof Date ||
          subject instanceof Error ||
          subject instanceof Number ||
          subject instanceof Boolean
        ) {
          result.should.equal('' + subject)
        } else if (typeof subject === 'function') {
          result.should.equal(conciseCondition('', subject))
        } else {
          const expected = util.inspect(subject, {
            depth: 0,
            maxArrayLength: 5,
            breakLength: 120
          })
          result.should.equal(expected)
        }
      })
    })
  })
})
