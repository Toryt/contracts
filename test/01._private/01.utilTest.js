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

const util = require('../../lib/_private/util')
const is = require('../../lib/_private/is')
const testUtil = require('../_util/testUtil')
const must = require('must')
const os = require('os')
const nodeUtil = require('util')
const stuff = require('./_stuff')

describe('_private/util', function () {
  describe('#callerLocation', function () {
    it('returns the expected line without arguments', function () {
      function aFirstFunction () {
        function aSecondFunction () {
          return util.callerLocation()
        }

        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.must.be.a.string()
      result.split(os.EOL).length.must.equal(1)
      if (testUtil.environment !== 'safari') {
        result.must.contain('aSecondFunction')
      }
      is.stackLocation(result).must.be.true()
    })
    it('returns the expected line 2 deep', function () {
      function aFirstFunction () {
        function aSecondFunction () {
          function aThirdFunction () {
            function aFourthFunction () {
              return util.callerLocation(2)
            }

            return aFourthFunction()
          }

          return aThirdFunction()
        }

        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.must.be.a.string()
      result.split(os.EOL).length.must.equal(1)
      if (testUtil.environment !== 'safari') {
        result.must.contain('aSecondFunction')
      }
      is.stackLocation(result).must.be.true()
    })
  })

  describe('#callerStack', function () {
    it('returns the expected stack without arguments', function () {
      function aFourthFunction () {
        function aFifthFunction () {
          return util.callerStack()
        }

        return aFifthFunction()
      }

      function aSecondFunction () {
        function aThirdFunction () {
          return aFourthFunction()
        }

        return aThirdFunction()
      }

      function aFirstFunction () {
        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.must.be.a.string()
      const lines = result.split(os.EOL)
      lines.length.must.be.at.least(1)
      if (testUtil.environment !== 'safari') {
        lines.length.must.be.at.least(5)
        lines[0].must.contain('aFifthFunction')
        lines[1].must.contain('aFourthFunction')
        lines[2].must.contain('aThirdFunction')
        lines[3].must.contain('aSecondFunction')
        lines[4].must.contain('aFirstFunction')
      }
      is.stack(result).must.be.true()
    })
    it('returns the expected stack. 2 deep', function () {
      function skipTwo (skip) {
        function skipOne (skip) {
          return util.callerStack(skip + 1)
        }

        return skipOne(skip + 1)
      }

      function skipThree (skip) {
        return skipTwo(skip + 1)
      }

      function aFourthFunction () {
        function aFifthFunction () {
          return skipThree(0)
        }

        return aFifthFunction()
      }

      function aSecondFunction () {
        function aThirdFunction () {
          return aFourthFunction()
        }

        return aThirdFunction()
      }

      function aFirstFunction () {
        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.must.be.a.string()
      const lines = result.split(os.EOL)
      lines.length.must.be.at.least(1)
      if (testUtil.environment !== 'safari') {
        lines.length.must.be.at.least(5)
        lines[0].must.contain('aFifthFunction')
        lines[1].must.contain('aFourthFunction')
        lines[2].must.contain('aThirdFunction')
        lines[3].must.contain('aSecondFunction')
        lines[4].must.contain('aFirstFunction')
      }
      is.stack(result).must.be.true()
    })
  })

  const truthy = function () { return true }
  const falsy = function () { return undefined }

  function escape (str) {
    let result = str.replace(/\(/g, '\\(')
    result = result.replace(/\)/g, '\\)')
    result = result.replace(/{}/g, '\\{')
    return result
  }

  const truthySelf = {truth: true}

  const falsySelf = {truth: undefined}

  function selfCondition () { return this.truth }

  describe('#pre()', function () {
    it('ends nominally with a condition that returns true without self', function () {
      util.pre.bind(null, truthy).must.not.throw()
    });
    [undefined, null, {a: 4}].forEach(self => {
      it('ends nominally with a condition that returns true with self === ' + self, function () {
        util.pre.bind(null, self, truthy).must.not.throw()
      })
    })
    it('throws with a condition that returns false without self', function () {
      util.pre.bind(null, falsy).must.throw(
        Error,
        new RegExp('^Precondition violation in Toryt Contracts: ' + escape('' + falsy) + '$')
      )
    });
    [undefined, null, {a: 4}].forEach(self => {
      it('throws with a condition that returns false with self === ' + self, function () {
        util.pre.bind(null, self, falsy).must.throw(
          Error,
          new RegExp('^Precondition violation in Toryt Contracts: ' + escape('' + falsy) + '$')
        )
      })
    })
    it('correctly uses self when given, with a nominal end with a condition that returns true', function () {
      util.pre.bind(null, truthySelf, selfCondition).must.not.throw()
    })
    it('correctly uses self when given, throwing with a condition that returns false', function () {
      util.pre.bind(null, falsySelf, selfCondition).must.throw(
        Error,
        new RegExp('^Precondition violation in Toryt Contracts: ' + escape('' + selfCondition) + '$')
      )
    })
  })

  describe('#setAndFreezeProperty()', function () {
    it('sets a property, with a value, and freezes it', function () {
      const subject = {a: 4}
      const propertyName = 'a new property'
      const propertyValue = 'a new value'
      util.setAndFreezeProperty(subject, propertyName, propertyValue)
      testUtil.expectOwnFrozenProperty(subject, propertyName)
      subject[propertyName].must.equal(propertyValue)
    })
    it('sets a property, without a value, and freezes it', function () {
      const subject = {a: 4}
      const propertyName = 'a new property'
      util.setAndFreezeProperty(subject, propertyName)
      testUtil.expectOwnFrozenProperty(subject, propertyName)
      must(subject[propertyName]).be.undefined()
    })
  })

  describe('#defineConfigurableDerivedProperty', function () {
    it('sets a read-only property, with a getter', function () {
      const subject = {
        a: 4,
        expectedOfGetter: {}
      }
      Object.setPrototypeOf(subject, {})
      const propertyName = 'a new property'

      function getter () { return this.expectedOfGetter }

      util.defineConfigurableDerivedProperty(Object.getPrototypeOf(subject), propertyName, getter)
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyName).must.be.an.object()
      must(Object.getOwnPropertyDescriptor(subject, propertyName)).be.undefined()
      testUtil.expectConfigurableDerivedPropertyOnAPrototype(subject, propertyName)
      subject[propertyName].must.equal(subject.expectedOfGetter)
    })
  })

  describe('#defineFrozenDerivedProperty', function () {
    it('sets a frozen read-only property, with a getter', function () {
      const subject = {
        a: 4,
        expectedOfGetter: {}
      }
      Object.setPrototypeOf(subject, {})
      const propertyName = 'a new property'

      function getter () { return this.expectedOfGetter }

      util.defineFrozenDerivedProperty(Object.getPrototypeOf(subject), propertyName, getter)
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyName).must.be.an.object()
      must(Object.getOwnPropertyDescriptor(subject, propertyName)).be.undefined()
      testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, propertyName)
      subject[propertyName].must.equal(subject.expectedOfGetter)
    })
  })

  describe('#defineFrozenReadOnlyArrayProperty', function () {
    it('sets a frozen read-only property, with a getter', function () {
      const subject = {a: 4}
      Object.setPrototypeOf(subject, {})
      const propertyName = 'a new property'
      const privatePropertyName = '_' + propertyName
      const array = [1, 2, 3]
      util.setAndFreezeProperty(subject, privatePropertyName, array)
      util.defineFrozenReadOnlyArrayProperty(Object.getPrototypeOf(subject), propertyName, privatePropertyName)
      testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, propertyName, privatePropertyName)
      subject[propertyName].must.not.equal(array)
      subject[propertyName].must.eql(array)
    })
  })

  describe('#conciseConditionRepresentation', function () {
    function isAConciseVersion (original, concise) {
      const split = ('' + concise).split(util.conciseSeparator)
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
      result.length.must.be.at.most(util.maxLengthOfConciseRepresentation)
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
      const result = util.conciseConditionRepresentation(prefix, f)
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

  describe('#extensiveThrownRepresentation', function () {
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
        const result = util.extensiveThrownRepresentation(thrown)
        result.must.be.a.string()
        result.indexOf(util.inspect(thrown)).must.equal(0)
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
        const result = util.type(s)
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

  describe('#inspect', function () {
    stuff.map(s => s.subject).forEach(s => {
      it(`returns a string that is expected for ${s}`, function () {
        const result = util.inspect(s)
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
          result.must.equal(util.conciseConditionRepresentation('', s))
        } else {
          result.must.equal(nodeUtil.inspect(s, {depth: 0, maxArrayLength: 5, breakLength: 120}))
        }
      })
    })
  })
})
