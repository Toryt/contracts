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
const testUtil = require('../_util/testUtil')
const os = require('os')
const util = require('util')
const stuff = require('./_stuff')

describe('_private/report', function () {
  describe('#conciseCondition', function () {
    function isAConciseVersion (original, concise) {
      const split = ('' + concise).split(report.conciseSeparator)
      const cleanOriginal = original.replace(/\s\s+/g, ' ')
      let result
      if (split.length < 2) {
        result = (original.trim() === concise)
      } else {
        // > 2 is not supported right now, and will fail
        result = cleanOriginal.indexOf(split[0]) === 0 &&
                 cleanOriginal.indexOf(split[1]) === cleanOriginal.length - split[1].length
      }
      return result
    }

    function expectGeneralPostconditions (result, expected) {
      testUtil.log('result: %s', result)
      result.must.not.contain(os.EOL)
      result.length.must.be.at.most(report.maxLengthOfConciseRepresentation)
      isAConciseVersion(expected, result).must.be.truthy()
    }

    const prefix = 'This is a test prefix'
    const alternativeName = 'This is an alternative name'
    const namedStuff = stuff.generateMutableStuff()
    namedStuff
      .filter(ms => testUtil.propertyIsWritable(ms.subject, 'name'))
      .forEach(ms => { ms.subject.name = alternativeName })
    const displayNamedStuff = stuff.generateMutableStuff()
    displayNamedStuff
      .forEach(ms => { ms.subject.displayName = alternativeName })

    // noinspection FunctionNamingConventionJS
    function generateMultiLineAnonymousFunction () {
      return function () {
        let x = 'This is a multi-line function'
        x += 'The intention of this test'
        x += 'is to verify'
        x += 'whether we get an acceptable'
        x += 'is to shortened version of this'
        x += 'as a concise representation'
        x += 'this function should have no name'
        x += 'and no display name'
        return x
      }
    }

    const stuffToo = stuff
      .concat(namedStuff)
      .concat(displayNamedStuff)
      .map(s => s.subject)
    stuffToo.push(generateMultiLineAnonymousFunction())
    const other = generateMultiLineAnonymousFunction()
    other.displayName = 'This is a multi-line display name'
    other.displayName += 'The intention of this test'
    other.displayName += 'is to verify'
    other.displayName += 'whether we get an acceptable'
    other.displayName += 'is to shortened version of this'
    other.displayName += 'as a concise representation'
    other.displayName += 'this function should have a display name'
    stuffToo.push(other)

    stuffToo.forEach(f => {
      const result = report.conciseCondition(prefix, f)
      if (!f || (!f.displayName && !f.name)) {
        it('returns the string representation with the prefix, ' +
           'when there is no f, or it has no display name and no name, for ' + f, function () {
          expectGeneralPostconditions(result, prefix + ' ' + f)
        })
      } else if (!f.displayName && !!f.name) {
        it('returns the name with the prefix, ' +
           'when there is no f and it has no display name, but it has a name, for ' + f, function () {
          expectGeneralPostconditions(result, prefix + ' ' + f.name)
        })
      } else {
        it('returns the display name if there is an f, and it has a display name, for ' + f, function () {
          expectGeneralPostconditions(result, f.displayName)
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
        toString: function () { return toStringString }
      }
    }

    function stackDoesContainToString () {
      return {
        stack: toStringString + os.EOL + stackString,
        toString: function () { return toStringString }
      }
    }

    caseGenerators.push(stackDoesNotContainToString)
    caseGenerators.push(stackDoesContainToString)
    caseGenerators = caseGenerators
      .concat(
        testUtil
          .anyCasesGenerators('throw stack')
          .map(ac =>
            () => ({
              stack: ac(),
              toString: function () { return toStringString }
            })
          )
      )
    caseGenerators.forEach(thrownGenerator => {
      const thrown = thrownGenerator()
      it('returns the expected, normalized string representation for ' + thrown, function () {
        const result = report.extensiveThrown(thrown)
        result.must.be.a.string()
        result.indexOf(report.value(thrown)).must.equal(0)
        let stack = thrown && thrown.stack
        if (stack) {
          stack = os.EOL + stack
          const expectedStart = result.length - stack.length
          result.lastIndexOf(stack).must.equal(expectedStart)
        }
        testUtil.log(result)
      })
    })
  })

  describe('#type', function () {
    stuff.map(s => s.subject).forEach(s => {
      it(`returns a string that is expected for ${s}`, function () {
        const result = report.type(s)
        testUtil.log(result)
        result.must.be.a.string()
        result.must.not.equal('')
        // noinspection IfStatementWithTooManyBranchesJS
        if (s === null) {
          result.must.equal('null')
        } else if (typeof s === 'object') {
          // noinspection IfStatementWithTooManyBranchesJS
          if (s === Math) {
            result.must.equal('Math')
          } else if (s === JSON) {
            result.must.equal('JSON')
          } else if (Array.isArray(s)) {
            result.must.equal('Array')
          } else if (s.toString().indexOf('Arguments') >= 0) {
            result.must.equal('arguments')
          } else {
            result.must.equal(s.constructor.displayName || s.constructor.name)
          }
        } else {
          result.must.equal(typeof s)
        }
      })
    })
  })

  describe('#value', function () {
    stuff.map(s => s.subject).forEach(s => {
      it(`returns a string that is expected for ${s}`, function () {
        const result = report.value(s)
        testUtil.log(result)
        result.must.be.a.string()
        result.must.not.equal('')
        // noinspection IfStatementWithTooManyBranchesJS
        if (typeof s === 'string' || s instanceof String) {
          result.must.equal(`'${s}'`)
        } else if (is.primitive(s) ||
                   s instanceof Date ||
                   s instanceof Error ||
                   s instanceof Number ||
                   s instanceof Boolean) {
          result.must.equal('' + s)
        } else if (typeof s === 'function') {
          result.must.equal(report.conciseCondition('', s))
        } else {
          result.must.equal(util.inspect(s, {depth: 0, maxArrayLength: 5, breakLength: 120}))
        }
      })
    })
  })
})
