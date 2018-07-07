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

/* MUDO This depends on AMD modules still; it does not make sense now, but the node approach will probably not
  transpile either. Further, this is for getting nice stack traces that hide the inners of this lib. In node,
  that is simple with constructorOpt. So, we can get rid of all this code, and maybe try to hack that more
  isolated for browsers. */
const fileName = __filename || module.uri || window.location.origin

const contractLibTestPath = util.pathUp(util.pathUp(fileName))
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
  describe('#isNode', function () {
    it('is a Boolean', function () {
      // there seems no way to check the correctness of this, without using the same code, creating a tautology
      util.isNode.must.be.a.boolean()
      util.isNode.must.equal(testUtil.environment === 'node')
    })
  })

  describe('#eol', function () {
    it('is a string', function () {
      util.eol.must.be.a.string()
      testUtil.log('eol: start>' + util.eol + '<end')
    })
  })

  describe('#callerLocation', function () {
    it('returns the expected line without arguments', function () {
      function aFirstFunction () {
        function aSecondFunction () {
          return util.callerLocation()
        }

        return aSecondFunction()
      }

      const result = aFirstFunction()
      console.log(result)
      result.must.be.a.string()
      result.split(util.eol).length.must.equal(1)
      if (testUtil.environment !== 'safari') {
        result.must.contain('aSecondFunction')
      }
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
      console.log(result)
      result.must.be.a.string()
      result.split(util.eol).length.must.equal(1)
      if (testUtil.environment !== 'safari') {
        result.must.contain('aSecondFunction')
      }
    })
  })

  describe('#contractLibPath', function () {
    it('is a string', function () {
      util.contractLibPath.must.be.a.string()
      // there seems to be no sensible way to test what the result actually is
      testUtil.log('contractLibPath: ' + util.contractLibPath)
    })
  })

  describe('#typeof()', function () {
    stuff.forEach(record => {
      it('should return "' + record.expected + '" for ' + record.subject, function () {
        const result = util.typeOf(record.subject)
        result.must.be.a.string()
        result.must.equal(record.expected)
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
      .filter(thing => util.typeOf(thing) !== 'number')
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
      it('reports false if the first parameter is a primitive (' + util.typeOf(notAnObject) + ')', function () {
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
          util.typeOf(values[2]) === 'function' &&
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

  describe('#nrOfLines', function () {
    const regExp = new RegExp(util.eol, 'gi')

    stuff
      .map(s => s.subject)
      .concat([
        'This is a' + util.eol + 'multi-line-string' + util.eol + 'of 3 lines',
        new Error().stack,
        JSON.stringify(
          {
            a: 'a',
            b: 'b'
          }
        )
      ])
      .forEach(str => {
        const nrOfEols = (('' + str).match(regExp) || []).length + 1
        it('the number of lines in the string representation of ' + str + ' should be ' + nrOfEols, function () {
          util.nrOfLines(str).must.equal(nrOfEols)
        })
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
          console.log(`${result}: ${line}`)
          result.must.be.true()
        })
    })
  })

  describe('#stackOutsideThisLibrary', function () {
    function defineErrorRecursively (togo) {
      /* It would be better here to be able to go in and out the library code, to see these calls are filtered.
         I see no sensible way to do this now, however. */
      if (!togo) {
        return new Error('This is a test case Error')
      } else {
        return defineErrorRecursively2(togo - 1)
      }
    }

    // noinspection FunctionNamingConventionJS
    function defineErrorRecursively2 (togo) {
      return defineErrorRecursively3(togo)
    }

    // noinspection FunctionNamingConventionJS
    function defineErrorRecursively3 (togo) {
      return defineErrorRecursively(togo)
    }

    // noinspection MagicNumberJS
    [
      {error: defineErrorRecursively(), description: 'local error'},
      {error: defineErrorRecursively(18), description: 'recursive generated error'}
    ].forEach(testCase => {
      it('only has stack lines outside the library, and the first line refers to this code, ' +
         'for a ' + testCase.description, function () {
        const result = util.stackOutsideThisLibrary(testCase.error)
        result.must.be.a.string()
        testUtil.log('result:\n%s', result)
        const stackLines = result.split(util.eol)
        stackLines.length.must.be.least(1)
        stackLines[0].indexOf(fileName).must.be.at.least(0)
        stackLines.forEach(line => {
          line.must.be.a.string()
          line.must.match(util.stackLocation)
          /* .../src/... contains the library code. This should never be mentioned in the stack trace.
           It is inner workings, and confuses the target audience, which is only interested in the code that
           uses the library. */
          line.must.not.contain(util.contractLibPath)
          /* In our tests, the code that uses the library is our test code in .../test/_private/util, or the
             test framework library, in .../mocha/..., except for the last few lines. These lines will be
             node-internal, and have no slash, or be internal/module.js, or, in the browser, be requirejs.
             The first line should be our own code. */
          const lineOk = line.indexOf(contractLibTestPath) >= 0 ||
                 line.indexOf(util.dirSeparator + 'mocha' + util.dirSeparator) >= 0 ||
                 line.indexOf(util.dirSeparator + 'nyc' + util.dirSeparator) >= 0 ||
                 line.indexOf(util.dirSeparator + '.node-spawn-wrap-') >= 0 ||
                 line.indexOf(util.dirSeparator) < 0 ||
                 line.indexOf('require (internal' + util.dirSeparator + 'module.js') >= 0 ||
                 line.indexOf(util.dirSeparator + 'requirejs' + util.dirSeparator + 'require.js') >= 0
          lineOk.must.be.true()
        })
        // all the lines, after the message, that are outside the library, are in the result,
        // and the order has not changed
        let nrOfMessageLines = 0
        const messageLines = testCase.error.stack.toString()
        if (testCase.error.stack.indexOf(messageLines) === 0) {
          nrOfMessageLines = util.nrOfLines(messageLines) // skip these
        }
        testCase.error.stack
          .split(util.eol)
          .splice(nrOfMessageLines)
          .filter(line => line.indexOf(util.contractLibPath) < 0)
          .forEach((line, sourceIndex) => {
            stackLines.some((stackLine, resultIndex) => stackLine === line && resultIndex <= sourceIndex).must.be.truthy()
          })
      })
    })
  })

  describe('#conciseConditionRepresentation', function () {
    function isAConciseVersion (original, concise) {
      const split = ('' + concise).split(util.conciseSeparator)
      const cleanOriginal = original.replace(/\s\s+/g, ' ')
      if (split.length < 2) {
        return original === concise
      } else {
        // > 2 is not supported right now, and will fail
        return cleanOriginal.indexOf(split[0]) === 0 &&
               cleanOriginal.indexOf(split[1]) === cleanOriginal.length - split[1].length
      }
    }

    function expectGeneralPostconditions (result, expected) {
      testUtil.log('result: %s', result)
      result.must.not.contain(util.eol)
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
        stack: toStringString + util.eol + stackString,
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
        result.indexOf('' + thrown).must.equal(0)
        let stack = thrown && thrown.stack
        if (stack) {
          stack = util.eol + stack
          const expectedStart = result.length - stack.length
          result.lastIndexOf(stack).must.equal(expectedStart)
        }
        testUtil.log(result)
      })
    })
  })

  describe('#pathUp', function () {
    it('returns the directory of a file path in a browser', function () {
      const dirPath = 'http://localhost:63342/contracts/test/_private'
      const fileName = '01.utilTest.js'
      const testCase = dirPath + util.dirSeparator + fileName
      const result = util.pathUp(testCase)
      result.must.be.a.string()
      result.must.equal(dirPath)
    })
    it('throws when the argument is not a string', function () {
      util.pathUp.bind(null, {}).must.throw(TypeError)
    })
  })
})
