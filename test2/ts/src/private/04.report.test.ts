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
import {
  conciseSeparator,
  maxLengthOfConciseRepresentation,
  conciseCondition,
  value,
  extensiveThrown
} from '../../../../src/private/report.ts'
import { n, rn, stack as stackEOL } from '../../../../src/private/eol.ts'
import { setAndFreeze } from '../../../../src/private/property.ts'
import { generateMutableStuff, generateStuff } from '../../../util/_stuff.ts'
import { safeToString, log, anyCasesGenerators } from '../../../util/testUtil.ts'

describe('_private/report', function () {
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
        toString: function () {
          return toStringString
        }
      }
    }

    function stackDoesContainToString(): unknown {
      return {
        stack: toStringString + stackEOL + stackString,
        toString: function () {
          return toStringString
        }
      }
    }

    caseGenerators.push(stackDoesNotContainToString)
    caseGenerators.push(stackDoesContainToString)
    caseGenerators = caseGenerators.concat(
      anyCasesGenerators('throw stack').map(ac => (): unknown => ({
        stack: ac(),
        toString: function () {
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

  // describe('#type', function () {
  //   stuff
  //     .map(s => s.subject)
  //     .forEach(s => {
  //       it(`returns a string that is expected for ${safeToString(s)}`, function () {
  //         const result = type(s)
  //         log(result)
  //         result.should.be.a.String()
  //         result.should.not.equal('')
  //         // noinspection IfStatementWithTooManyBranchesJS
  //         if (s === null) {
  //           result.should.equal('null')
  //         } else if (typeof s === 'object') {
  //           // noinspection IfStatementWithTooManyBranchesJS
  //           if (s === Math) {
  //             result.should.equal('Math')
  //           } else if (s === JSON) {
  //             result.should.equal('JSON')
  //           } else if (Array.isArray(s)) {
  //             result.should.equal('Array')
  //           } else if (s.toString().indexOf('Arguments') >= 0) {
  //             result.should.equal('arguments')
  //           } else {
  //             result.should.equal(s.constructor.name)
  //           }
  //         } else {
  //           result.should.equal(typeof s)
  //         }
  //       })
  //     })
  // })
  //
  // describe('#value', function () {
  //   stuff
  //     .map(s => s.subject)
  //     .forEach(s => {
  //       it(`returns a string that is expected for ${safeToString(s)}`, function () {
  //         const result = value(s)
  //         log(result)
  //         result.should.be.a.String()
  //         result.should.not.equal('')
  //         // noinspection IfStatementWithTooManyBranchesJS
  //         if (s === global) {
  //           result.should.equal('{global}')
  //         } else if (typeof s === 'string' || s instanceof String) {
  //           result.should.equal(`'${s}'`)
  //         } else if (
  //           primitive(s) ||
  //           s instanceof Date ||
  //           s instanceof Error ||
  //           s instanceof Number ||
  //           s instanceof Boolean
  //         ) {
  //           result.should.equal('' + s)
  //         } else if (typeof s === 'function') {
  //           result.should.equal(conciseCondition('', s))
  //         } else {
  //           const expected = util.inspect(s, {
  //             depth: 0,
  //             maxArrayLength: 5,
  //             breakLength: 120
  //           })
  //           result.should.equal(expected)
  //         }
  //       })
  //     })
  //   describe('failing util.inspect', function () {
  //     before(function () {
  //       // poor man's stub, without sinon
  //       this.utilInspect = util.inspect
  //       this.error = null
  //       util.inspect = () => {
  //         throw this.error
  //       }
  //     })
  //     after(function () {
  //       util.inspect = this.utilInspect
  //     })
  //     it('returns a message when `util.inspect` fails with an error with a message', function () {
  //       this.error = cases.intentionalError
  //       const v = {} // an object triggers the interesting branch
  //       const result = value(v)
  //       log(result)
  //       result.should.match(/𝕋⚖️ \[\[failed to represent the value]] /)
  //       result.should.endWith(`(${cases.intentionalError.message})`)
  //       log()
  //     })
  //     it('returns a message when `util.inspect` fails with an error without a message', function () {
  //       this.error = new Error()
  //       const v = {} // an object triggers the interesting branch
  //       const result = value(v)
  //       log(result)
  //       result.should.match(/𝕋⚖️ \[\[failed to represent the value]] /)
  //       result.should.endWith(`(${this.error})`)
  //       log()
  //     })
  //   })
  // })
})
