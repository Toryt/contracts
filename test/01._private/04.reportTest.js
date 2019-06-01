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

const report = require('../../lib/_private/report')
const is = require('../../lib/_private/is')
const property = require('../../lib/_private/property')
const testUtil = require('../_util/testUtil')
const os = require('os')
const util = require('util')
const stuff = require('./_stuff')
const cases = require('../_cases')

describe('_private/report', function () {
  describe('#conciseCondition', function () {
    function isAConciseVersion (original, concise) {
      const split = ('' + concise).split(report.conciseSeparator)
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
          cleanOriginal.indexOf(split[0]) === 0 &&
          cleanOriginal.indexOf(split[1]) === cleanOriginal.length - split[1].length
      }
      return result
    }

    function expectGeneralPostconditions (result, expected) {
      testUtil.log('result: %s', result)
      result.must.not.contain(os.EOL)
      result.length.must.be.at.most(report.maxLengthOfConciseRepresentation)
      result.trim().should.equal(result)
      isAConciseVersion(expected, result).should.be.ok()
    }

    const prefix = 'This is a test prefix'
    const alternativeName = 'This is an alternative name'
    const namedStuff = stuff.generateMutableStuff()
    namedStuff.forEach(ms => {
      property.setAndFreeze(ms.subject, 'name', alternativeName)
    })

    // noinspection FunctionNamingConventionJS
    function generateMultiLineAnonymousFunction () {
      return function () {
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

    const stuffToo = stuff.concat(namedStuff).map(s => s.subject)
    stuffToo.push(generateMultiLineAnonymousFunction())
    const other = generateMultiLineAnonymousFunction()
    property.setAndFreeze(
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

    stuffToo.forEach(f => {
      const result = report.conciseCondition(prefix, f)
      if (!f || !f.name) {
        it(`returns the string representation with the prefix, when there is no f, or it has no name, for ${f}`, function () {
          expectGeneralPostconditions(result, prefix + ' ' + f)
        })
      } else {
        it(`returns the name with the prefix, when there is an f and it has a name, for ${f}`, function () {
          expectGeneralPostconditions(result, prefix + ' ' + f.name)
        })
      }
    })
  })

  describe('#extensiveThrown', function () {
    let caseGenerators = testUtil.anyCasesGenerators('thrown')
    const toStringString = 'This is the toString'
    const stackString = 'This is the stack'

    function stackDoesNotContainToString () {
      return {
        stack: stackString,
        toString: function () {
          return toStringString
        }
      }
    }

    function stackDoesContainToString () {
      return {
        stack: toStringString + os.EOL + stackString,
        toString: function () {
          return toStringString
        }
      }
    }

    caseGenerators.push(stackDoesNotContainToString)
    caseGenerators.push(stackDoesContainToString)
    caseGenerators = caseGenerators.concat(
      testUtil.anyCasesGenerators('throw stack').map(ac => () => ({
        stack: ac(),
        toString: function () {
          return toStringString
        }
      }))
    )
    caseGenerators.forEach(thrownGenerator => {
      const thrown = thrownGenerator()
      it(`returns the expected, normalized string representation for ${thrown}`, function () {
        const result = report.extensiveThrown(thrown)
        result.should.be.a.String()
        result.indexOf(report.value(thrown)).should.equal(0)
        let stack = thrown && thrown.stack
        if (stack) {
          stack = os.EOL + stack
          const expectedStart = result.length - stack.length
          result.lastIndexOf(stack).should.equal(expectedStart)
        }
        testUtil.log(result)
      })
    })
  })

  describe('#type', function () {
    stuff
      .map(s => s.subject)
      .forEach(s => {
        it(`returns a string that is expected for ${s}`, function () {
          const result = report.type(s)
          testUtil.log(result)
          result.should.be.a.String()
          result.should.not.equal('')
          // noinspection IfStatementWithTooManyBranchesJS
          if (s === null) {
            result.should.equal('null')
          } else if (typeof s === 'object') {
            // noinspection IfStatementWithTooManyBranchesJS
            if (s === Math) {
              result.should.equal('Math')
            } else if (s === JSON) {
              result.should.equal('JSON')
            } else if (Array.isArray(s)) {
              result.should.equal('Array')
            } else if (s.toString().indexOf('Arguments') >= 0) {
              result.should.equal('arguments')
            } else {
              result.should.equal(s.constructor.name)
            }
          } else {
            result.should.equal(typeof s)
          }
        })
      })
  })

  describe('#value', function () {
    stuff
      .map(s => s.subject)
      .forEach(s => {
        it(`returns a string that is expected for ${s}`, function () {
          const result = report.value(s)
          testUtil.log(result)
          result.should.be.a.String()
          result.should.not.equal('')
          // noinspection IfStatementWithTooManyBranchesJS
          if (s === global) {
            result.should.equal('{global}')
          } else if (typeof s === 'string' || s instanceof String) {
            result.should.equal(`'${s}'`)
          } else if (
            is.primitive(s) ||
            s instanceof Date ||
            s instanceof Error ||
            s instanceof Number ||
            s instanceof Boolean
          ) {
            result.should.equal('' + s)
          } else if (typeof s === 'function') {
            result.should.equal(report.conciseCondition('', s))
          } else {
            const expected = util.inspect(s, {
              depth: 0,
              maxArrayLength: 5,
              breakLength: 120
            })
            result.should.equal(expected)
          }
        })
      })
    describe('failing util.inspect', function () {
      before(function () {
        // poor man's stub, without sinon
        this.utilInspect = util.inspect
        this.error = null
        util.inspect = () => {
          throw this.error
        }
      })
      after(function () {
        util.inspect = this.utilInspect
      })
      it('returns a message when util.inspect fails with an error with a message', function () {
        this.error = cases.intentionalError
        const v = {} // an object triggers the interesting branch
        const result = report.value(v)
        testUtil.log(result)
        result.should.match(/𝕋⚖️ \[\[failed to represent the value]] /)
        result.should.endWith(`(${cases.intentionalError.message})`)
        testUtil.log()
      })
      it('returns a message when util.inspect fails with an error without a message', function () {
        this.error = new Error()
        const v = {} // an object triggers the interesting branch
        const result = report.value(v)
        testUtil.log(result)
        result.should.match(/𝕋⚖️ \[\[failed to represent the value]] /)
        result.should.endWith(`(${this.error})`)
        testUtil.log()
      })
    })
  })
})
