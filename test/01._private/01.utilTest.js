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
const testUtil = require('../_util/testUtil')
const must = require('must')
const os = require('os')
const nodeUtil = require('util')

// eslint-disable-next-line
const getGlobal = new Function('return this;')

function generateMutableStuff () {
  // noinspection JSPrimitiveTypeWrapperUsage
  const result = [
    {subject: {a: 4}, expected: 'object'},
    {subject: [1, 2, 3], expected: 'array'},
    {subject: function () {}, expected: 'function'},
    {subject: () => 0, expected: 'function'},
    {subject: new ReferenceError(), expected: 'error'},
    {subject: new Date(), expected: 'date'},
    {subject: /a-z/, expected: 'regexp'},
    // eslint-disable-next-line
    {subject: new Number(4), expected: 'number'},
    // eslint-disable-next-line
    {subject: new String('abc'), expected: 'string'},
    // eslint-disable-next-line
    {subject: new String(''), expected: 'string'},
    // eslint-disable-next-line
    {subject: new Boolean(true), expected: 'boolean'},
    {subject: arguments, expected: 'arguments'}
  ]
  result.forEach(r => { r.isPrimitive = false })
  return result
}

// noinspection JSPrimitiveTypeWrapperUsage
const stuff = [
  {subject: undefined, expected: 'undefined', isPrimitive: false},
  {subject: null, expected: 'null', isPrimitive: false},
  {subject: Math, expected: 'math', isPrimitive: false},
  {subject: JSON, expected: 'json', isPrimitive: false},
  {subject: 'abc', expected: 'string', isPrimitive: true},
  {subject: '', expected: 'string', isPrimitive: true},
  {subject: 4, expected: 'number', isPrimitive: true},
  {subject: false, expected: 'boolean', isPrimitive: true},
  {subject: getGlobal(), expected: 'object', isPrimitive: false}
].concat(generateMutableStuff())

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
      util.isAStackLocation(result).must.be.true()
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
      util.isAStackLocation(result).must.be.true()
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
      util.isAStack(result).must.be.true()
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
      util.isAStack(result).must.be.true()
    })
  })

  describe('#isArguments', function () {
    stuff.concat(generateMutableStuff()).forEach(s => {
      it(`returns ${s.expected === 'arguments' ? 'true' : 'false'} for ${s.subject}`, function () {
        const result = util.isArguments(s.subject)
        if (s.expected === 'arguments') {
          result.must.be.true()
        } else {
          must(result).be.falsy()
        }
      })
    })
  })

  describe('#isPrimitive()', function () {
    stuff.forEach(record => {
      it('correctly decides whether the argument is a primitive for ' + record.subject, function () {
        const result = util.isPrimitive(record.subject)
        result.must.be.a.boolean()
        result.must.equal(record.isPrimitive)
      })
    })
  })

  describe('#isInteger()', function () {
    stuff
      .map(record => record.subject)
      .filter(thing => typeof thing !== 'number')
      .forEach(thing => {
        it('should return false for ' + thing, function () {
          const result = util.isInteger(thing)
          result.must.be.false()
        })
      })
    // noinspection MagicNumberJS
    const cases1 = [Number.MIN_SAFE_INTEGER, -4, -2.0, -1, 0, 1, 2.0, 6, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE]
    cases1.forEach(int => {
      it('should return true for ' + int, function () {
        const result = util.isInteger(int)
        result.must.be.true()
      })
    })
    // It is surprising that this give true for Number.MAX_VALUE, and not for Number.MIN_VALUE!
    // noinspection MagicNumberJS
    const cases2 = [
      Number.NEGATIVE_INFINITY,
      Number.MIN_VALUE,
      -4.2,
      -1.000000000000001,
      0.00000000000000000009,
      Number.EPSILON,
      Math.E,
      Math.PI,
      Number.POSITIVE_INFINITY,
      Number.NaN
    ]
    cases2.forEach(nr => {
      it('should return false for ' + nr, function () {
        const result = util.isInteger(nr)
        result.must.be.false()
      })
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

  describe('#isFrozenOwnProperty()', function () {
    const propName = 'test prop name'
    const propValue = 'dummy value'
    const truths = [true, false]
    testUtil.x(truths, truths, truths).forEach(values => {
      const subject = {}
      Object.defineProperty(
        subject,
        propName,
        {
          configurable: values[0],
          enumerable: values[1],
          writable: values[2],
          value: propValue
        }
      )
      const result = util.isFrozenOwnProperty(subject, propName)
      if (!values[0] && values[1] && !values[2] && subject.hasOwnProperty(propName)) {
        it('reports true if the property is an own property, ' +
            'and it is enumerable, not configurable and not writable', function () {
          result.must.be.truthy()
        })
      } else {
        it('reports false if the property is an own property, and' +
           ' enumerable === ' + values[1] +
           ' configurable === ' + values[0] +
           ' writable === ' + values[2], function () {
          must(result).be.falsy()
        })
      }
      it('reports false if the property does not exist', function () {
        const result = util.isFrozenOwnProperty(subject, 'some other, non-existing property name')
        must(result).be.falsy()
      })
      const specialized = {}
      Object.setPrototypeOf(specialized, subject)
      specialized[propName].must.equal(propValue) // check inheritance - test code validity
      const specializedResult = util.isFrozenOwnProperty(specialized, propName)
      it('reports false if the property is not an own property, and' +
         ' enumerable === ' + values[1] +
         ' configurable === ' + values[0] +
         ' writable === ' + values[2], function () {
        must(specializedResult).be.falsy()
      })
    })
    const notObjects = [0, false, '', 'lala']
    notObjects.forEach(notAnObject => {
      // cannot set a property on primitives
      it('reports false if the first parameter is a primitive (' + typeof notAnObject + ')', function () {
        const result = util.isFrozenOwnProperty(notAnObject, propName)
        must(result).be.falsy()
      })
    })
    const fCandidates = [undefined, function () {}]
    testUtil.x(truths, truths, fCandidates, fCandidates).forEach(values => {
      const subject = {}
      Object.defineProperty(
        subject,
        propName,
        {
          configurable: values[0],
          enumerable: values[1],
          get: values[2],
          set: values[3]
        }
      )
      const result = util.isFrozenOwnProperty(subject, propName)
      if (!values[0] &&
          values[1] &&
          typeof values[2] === 'function' &&
          values[3] === undefined &&
          subject.hasOwnProperty(propName)) {
        it('reports true if the property is an own property, ' +
           'and it is enumerable, and not configurable, has a getter, but not a setter', function () {
          result.must.be.truthy()
        })
      } else {
        it('reports false if the property is an own property,' +
           ' enumerable === ' + values[1] +
           ' configurable === ' + values[0] +
           ' get === ' + values[2] +
           ' set === ' + values[3], function () {
          must(result).be.falsy()
        })
      }
    })
  })

  describe('#isAStackLocation', function () {
    stuff.map(s => s.subject).filter(s => typeof s !== 'string').forEach(s => {
      it(`says no to ${s}`, function () {
        const result = util.isAStackLocation(s)
        result.must.be.false()
      })
    })
    it(`says no to ''`, function () {
      const result = util.isAStackLocation('')
      result.must.be.false()
    })
    it(`says yes to 'abc'`, function () {
      const result = util.isAStackLocation('abc')
      result.must.be.true()
    })
    it(`says no to a multi-line string`, function () {
      const result = util.isAStackLocation(`this is a 
multi-line
string`
      )
      result.must.be.false()
    })
    it(`says yes to all lines of a stack trace`, function () {
      // sadly, also to the message
      const error = new Error('This is an error to get a platform dependent stack')
      const lines = error.stack.split(os.EOL)
      lines
        .filter((line, index) => index !== lines.length - 1 || line.length > 0) // FF adds an empty line
        .forEach(line => {
          const result = util.isAStackLocation(line)
          testUtil.log(`${result}: ${line}`)
          result.must.be.true()
        })
    })
  })

  describe('#isAStack', function () {
    stuff.map(s => s.subject).filter(s => typeof s !== 'string').forEach(s => {
      it(`says no to ${s}`, function () {
        const result = util.isAStack(s)
        result.must.be.false()
      })
    })
    it(`says no to ''`, function () {
      const result = util.isAStack('')
      result.must.be.false()
    })
    it(`says yes to 'abc'`, function () {
      const result = util.isAStack('abc')
      result.must.be.true()
    })
    it(`says yes to a multi-line string`, function () {
      const candidate = `this is a 
multi-line
string`
      const result = util.isAStack(candidate)
      result.must.be.true()
    })
    it(`says no to a multi-line string with a blank line`, function () {
      const result = util.isAStack(`this is a 
multi-line
string, with a

blank line`
      )
      result.must.be.false()
    })
    it(`says yes to a stack trace`, function () {
      const message = 'This is an error to get a platform dependent stack'
      // sadly, also to the message, on some platforms
      const error = new Error(message)
      const stackLines = error.stack.split(os.EOL)
      const stack = stackLines
        // remove message line
        .filter(sl => sl.indexOf(message) < 0)
        .join(os.EOL)
      const result = util.isAStack(stack)
      result.must.be.true()
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
    const namedStuff = generateMutableStuff()
    namedStuff
      .filter(ms => testUtil.propertyIsWritable(ms.subject, 'name'))
      .forEach(ms => { ms.subject.name = alternativeName })
    const displayNamedStuff = generateMutableStuff()
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
    stuff.concat(generateMutableStuff()).map(s => s.subject).forEach(s => {
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
    stuff.concat(generateMutableStuff()).map(s => s.subject).forEach(s => {
      it(`returns a string that is expected for ${s}`, function () {
        const result = util.inspect(s)
        testUtil.log(result)
        result.must.be.a.string()
        result.must.not.equal('')
        // noinspection IfStatementWithTooManyBranchesJS
        if (typeof s === 'string' || s instanceof String) {
          result.must.equal(`'${s}'`)
        } else if (util.isPrimitive(s) ||
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
