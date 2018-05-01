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

const util = require('../../src/_private/util')
const stacks = require('./stacks')
const expect = require('chai').expect
const testUtil = require('../_util/testUtil')

/* MUDO This depends on AMD modules still; it does not make sense now, but the node approach will probably not
  transpile either. Further, this is for getting nice stack traces that hide the inners of this lib. In node,
  that is simple with constructorOpt. So, we can get rid of all this code, and maybe try to hack that more
  isolated for browsers. */
const fileName = (testUtil.environment === 'node') ? (typeof module !== 'undefined' && module.filename) || module.uri // in node, commonjs or AMD
  : util.browserModuleLocation(module) // in browser, AMD, prefixed with location

const contractLibTestPath = util.pathUp(util.pathUp(fileName))
// eslint-disable-next-line
const getGlobal = new Function('return this;')

function generateMutableStuff () {
  // noinspection JSPrimitiveTypeWrapperUsage
  const result = [
    {subject: {a: 4}, expected: 'object'},
    {subject: [1, 2, 3], expected: 'array'},
    {subject: function () {}, expected: 'function'},
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
  result.forEach(function (r) { r.isPrimitive = false })
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

function describeLocationTest (propertyName, environments) {
  describe('#' + propertyName, function () {
    it('is a RegExp', function () {
      expect(util).to.have.property(propertyName).that.is.instanceof(RegExp)
    })
    Object.keys(stacks).forEach(function (env) {
      stacks[env]
        .split(util.eol)
        .filter(function (l) { return l }) // some environments add an empty line at the end of the stack
        .forEach(function (l) {
          if (environments.indexOf(env) >= 0) {
            it('matches the ' + env + ' stack line "' + l + '"', function () {
              // noinspection JSUnresolvedVariable
              expect(expect(l).to.match(util[propertyName]))
            })
          } else {
            it('does not match the ' + env + ' stack line "' + l + '"', function () {
              // noinspection JSUnresolvedVariable
              expect(expect(l).to.not.match(util[propertyName]))
            })
          }
        })
    })
  })
}

const atLocationEnvironments = ['node', 'chrome']

const ATLocationEnvironments = ['firefox', 'safari'];
(atLocationEnvironments.indexOf(testUtil.environment) >= 0 ? atLocationEnvironments : ATLocationEnvironments)
  .push('current environment')

describe('_private/util', function () {
  describe('#isNode', function () {
    it('is a Boolean', function () {
      // there seems no way to check the correctness of this, without using the same code, creating a tautology
      expect(util).to.have.property('isNode').that.is.a('boolean')
      expect(util).to.have.property('isNode').that.equals(testUtil.environment === 'node')
    })
  })

  describe('#eol', function () {
    it('is a string', function () {
      expect(util.eol).to.be.a('string')
      testUtil.log('eol: start>' + util.eol + '<end')
    })
  })

  describeLocationTest('atStackLocation', atLocationEnvironments)
  describeLocationTest('@StackLocation', ATLocationEnvironments)

  describe('#stackLocation', function () {
    it('is a RegExp', function () {
      expect(util).to.have.property('stackLocation').that.is.instanceof(RegExp)
    })
    stacks['current environment']
      .split(util.eol)
      .filter(function (l) { return l }) // some environments add an empty line at the end of the stack
      .forEach(function (l) {
        it('matches the current environment stack line "' + l + '"', function () {
          expect(expect(l).to.match(util.stackLocation))
        })
      })
  })

  describe('#contractLibPath', function () {
    it('is a string', function () {
      expect(util.contractLibPath).to.be.a('string')
      // there seems to be no sensible way to test what the result actually is
      testUtil.log('contractLibPath: ' + util.contractLibPath)
    })
  })

  describe('#typeof()', function () {
    stuff.forEach(function (record) {
      it('should return "' + record.expected + '" for ' + record.subject, function () {
        const result = util.typeOf(record.subject)
        expect(result).to.be.a('string')
        expect(result).to.equal(record.expected)
      })
    })
  })

  describe('#isPrimitive()', function () {
    stuff.forEach(function (record) {
      it('correctly decides whether the argument is a primitive for ' + record.subject, function () {
        const result = util.isPrimitive(record.subject)
        expect(result).to.be.a('boolean')
        expect(result).to.be.equal(record.isPrimitive)
      })
    })
  })

  describe('#isInteger()', function () {
    stuff
      .map(function (record) { return record.subject })
      .filter(function (thing) { return util.typeOf(thing) !== 'number' })
      .forEach(function (thing) {
        it('should return false for ' + thing, function () {
          const result = util.isInteger(thing)
          // eslint-disable-next-line
          expect(result).to.be.false
        })
      });
    // noinspection MagicNumberJS
    [Number.MIN_SAFE_INTEGER, -4, -2.0, -1, 0, 1, 2.0, 6, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE]
      .forEach(function (int) {
        it('should return true for ' + int, function () {
          const result = util.isInteger(int)
          // eslint-disable-next-line
          expect(result).to.be.true
        })
      });
    // It is surprising that this give true for Number.MAX_VALUE, and not for Number.MIN_VALUE!
    // noinspection MagicNumberJS
    [
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
    ].forEach(function (nr) {
      it('should return false for ' + nr, function () {
        const result = util.isInteger(nr)
        // eslint-disable-next-line
        expect(result).to.be.false
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
      util.pre(truthy)
    });
    [undefined, null, {a: 4}].forEach(function (self) {
      it('ends nominally with a condition that returns true with self === ' + self, function () {
        util.pre(self, truthy)
      })
    })
    it('throws with a condition that returns false without self', function () {
      expect(function () { util.pre(falsy) })
        .to.throw(Error, new RegExp('^Precondition violation in Toryt Contracts: ' + escape('' + falsy) + '$'))
    });
    [undefined, null, {a: 4}].forEach(function (self) {
      it('throws with a condition that returns false with self === ' + self, function () {
        expect(function () { util.pre(self, falsy) })
          .to.throw(Error, new RegExp('^Precondition violation in Toryt Contracts: ' + escape('' + falsy) + '$'))
      })
    })
    it('correctly uses self when given, with a nominal end with a condition that returns true', function () {
      util.pre(truthySelf, selfCondition)
    })
    it('correctly uses self when given, throwing with a condition that returns false', function () {
      expect(function () { util.pre(falsySelf, selfCondition) })
        .to.throw(Error, new RegExp('^Precondition violation in Toryt Contracts: ' + escape('' + selfCondition) + '$'))
    })
  })

  describe('#setAndFreezeProperty()', function () {
    it('sets a property, with a value, and freezes it', function () {
      const subject = {a: 4}
      const propertyName = 'a new property'
      const propertyValue = 'a new value'
      util.setAndFreezeProperty(subject, propertyName, propertyValue)
      testUtil.expectOwnFrozenProperty(subject, propertyName)
      expect(subject[propertyName]).to.equal(propertyValue)
    })
    it('sets a property, without a value, and freezes it', function () {
      const subject = {a: 4}
      const propertyName = 'a new property'
      util.setAndFreezeProperty(subject, propertyName)
      testUtil.expectOwnFrozenProperty(subject, propertyName)
      // eslint-disable-next-line
      expect(subject[propertyName]).to.be.undefined
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
      const getter = function () { return this.expectedOfGetter }
      util.defineConfigurableDerivedProperty(Object.getPrototypeOf(subject), propertyName, getter)
      expect(Object.getPrototypeOf(subject)).to.have.ownPropertyDescriptor(propertyName)
      expect(subject).not.to.have.ownPropertyDescriptor(propertyName)
      testUtil.expectConfigurableDerivedPropertyOnAPrototype(subject, propertyName)
      expect(subject[propertyName]).to.equal(subject.expectedOfGetter)
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
      const getter = function () { return this.expectedOfGetter }
      util.defineFrozenDerivedProperty(Object.getPrototypeOf(subject), propertyName, getter)
      expect(Object.getPrototypeOf(subject)).to.have.ownPropertyDescriptor(propertyName)
      expect(subject).not.to.have.ownPropertyDescriptor(propertyName)
      testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, propertyName)
      expect(subject[propertyName]).to.equal(subject.expectedOfGetter)
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
      expect(subject[propertyName]).to.eql(array)
      expect(subject[propertyName]).to.not.equal(array)
    })
  })

  describe('#isFrozenOwnProperty()', function () {
    const propName = 'test prop name'
    const propValue = 'dummy value'
    const truths = [true, false]
    testUtil.x(truths, truths, truths).forEach(function (values) {
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
          // eslint-disable-next-line
          expect(result).to.be.true
        })
      } else {
        it('reports false if the property is an own property, and' +
           ' enumerable === ' + values[1] +
           ' configurable === ' + values[0] +
           ' writable === ' + values[2], function () {
          // eslint-disable-next-line
          expect(result).not.to.be.ok
        })
      }
      it('reports false if the property does not exist', function () {
        const result = util.isFrozenOwnProperty(subject, 'some other, non-existing property name')
        // eslint-disable-next-line
        expect(result).not.to.be.ok
      })
      const specialized = {}
      Object.setPrototypeOf(specialized, subject)
      expect(specialized[propName]).to.equal(propValue) // check inheritance - test code validity
      const specializedResult = util.isFrozenOwnProperty(specialized, propName)
      it('reports false if the property is not an own property, and' +
         ' enumerable === ' + values[1] +
         ' configurable === ' + values[0] +
         ' writable === ' + values[2], function () {
        // eslint-disable-next-line
        expect(specializedResult).not.to.be.ok
      })
    })
    const notObjects = [0, false, '', 'lala']
    notObjects.forEach(function (notAnObject) {
      // cannot set a property on primitives
      it('reports false if the first parameter is a primitive (' + util.typeOf(notAnObject) + ')', function () {
        const result = util.isFrozenOwnProperty(notAnObject, propName)
        // eslint-disable-next-line
        expect(result).not.to.be.ok
      })
    })
    const fCandidates = [undefined, function () {}]
    testUtil.x(truths, truths, fCandidates, fCandidates).forEach(function (values) {
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
          // eslint-disable-next-line
          expect(result).to.be.true
        })
      } else {
        it('reports false if the property is an own property,' +
           ' enumerable === ' + values[1] +
           ' configurable === ' + values[0] +
           ' get === ' + values[2] +
           ' set === ' + values[3], function () {
          // eslint-disable-next-line
          expect(result).not.to.be.ok
        })
      }
    })
  })

  describe('#nrOfLines', function () {
    const regExp = new RegExp(util.eol, 'gi')

    stuff
      .map(function (s) { return s.subject })
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
      .forEach(function (str) {
        const nrOfEols = (('' + str).match(regExp) || []).length + 1
        it('the number of lines in the string representation of ' + str + ' should be ' + nrOfEols, function () {
          expect(util.nrOfLines(str)).to.equal(nrOfEols)
        })
      })
  })

  describe('#isALocationOutsideLibrary', function () {
    stuff
      .map(function (s) { return s.subject })
      .filter(function (s) { return util.typeOf(s) !== 'string' })
      .forEach(function (value) {
        it('reports false on a location that is not a string: ' + value, function () {
          const result = util.isALocationOutsideLibrary(value)
          // eslint-disable-next-line
          expect(result).not.to.be.ok
        })
      })
    it('reports false on an empty string', function () {
      const result = util.isALocationOutsideLibrary('')
      // eslint-disable-next-line
      expect(result).not.to.be.ok
    })
    it('reports false on a string that is 2 lines long, where both are stack lines', function () {
      const stack = (new Error('This is an error as a test case for a stack'))
        .stack
        .split(util.eol)
        .splice(1, 2)
        .join(util.eol)
      const result = util.isALocationOutsideLibrary(stack)
      // eslint-disable-next-line
      expect(result).not.to.be.ok
      stack.split(util.eol).forEach(function (l) {
        const result = util.isALocationOutsideLibrary(l)
        // eslint-disable-next-line
        expect(result).to.be.ok
      })
    });
    (new Error('This is an error as a test case for a stack'))
      .stack
      .split(util.eol)
      .splice(1)
      .filter(function (l) { return l.indexOf(util.dirSeparator) < 0 })
      .forEach(function (l) {
        it('reports false on the string "' + l + "\" that is a stack line, but doesn't contain a slash", function () {
          // This doesn't seem to occur in browsers.
          const result = util.isALocationOutsideLibrary(l)
          // eslint-disable-next-line
          expect(result).not.to.be.ok
        })
      });
    (new Error('This is an error as a test case for a stack'))
      .stack
      .split(util.eol)
      .splice(1)
      .filter(function (l) { return l.indexOf(util.dirSeparator) >= 0 })
      .forEach(function (l) {
        it('reports true on the valid location outside the library "' + l + '"', function () {
          const result = util.isALocationOutsideLibrary(l)
          // eslint-disable-next-line
          expect(result).to.be.ok
        })
      })
  })

  describe('#firstLocationOutsideLibrary', function () {
    it('reports a location for this test', function () {
      const result = util.firstLocationOutsideLibrary()
      expect(result).to.satisfy(function (r) { return util.isALocationOutsideLibrary(r) })
      testUtil.log('firstLocationOutsideLibrary:' + result)
    })

    // cannot test the result where no reference is found
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
    ].forEach(function (testCase) {
      it('only has stack lines outside the library, and the first line refers to this code, ' +
         'for a ' + testCase.description, function () {
        const result = util.stackOutsideThisLibrary(testCase.error)
        expect(result).to.be.a('string')
        testUtil.log('result:\n%s', result)
        const stackLines = result.split(util.eol)
        expect(stackLines).to.have.length.of.at.least(1)
        expect(stackLines[0]).to.satisfy(function (l) { return l.indexOf(fileName) >= 0 })
        stackLines.forEach(function (line) {
          expect(line).to.be.a('string')
          expect(line).to.match(util.stackLocation)
          /* .../src/... contains the library code. This should never be mentioned in the stack trace.
           It is inner workings, and confuses the target audience, which is only interested in the code that
           uses the library. */
          expect(line).not.to.have.string(util.contractLibPath)
          /* In our tests, the code that uses the library is our test code in .../test/_private/util, or the
             test framework library, in .../mocha/..., except for the last few lines. These lines will be
             node-internal, and have no slash, or be internal/module.js, or, in the browser, be requirejs.
             The first line should be our own code. */
          expect(line).to.satisfy(function (l) {
            const result = l.indexOf(contractLibTestPath) >= 0 ||
                   l.indexOf(util.dirSeparator + 'mocha' + util.dirSeparator) >= 0 ||
                   l.indexOf(util.dirSeparator) < 0 ||
                   l.indexOf('require (internal' + util.dirSeparator + 'module.js') >= 0 ||
                   l.indexOf(util.dirSeparator + 'requirejs' + util.dirSeparator + 'require.js') >= 0
            console.log(`${result}: "${l}"`)
            return result
          })
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
          .filter(function (line) { return line.indexOf(util.contractLibPath) < 0 })
          .forEach(function (line, sourceIndex) {
            expect(stackLines).to.satisfy(function (lines) {
              return lines.some(function (stackLine, resultIndex) {
                return stackLine === line && resultIndex <= sourceIndex
              })
            })
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
      expect(result).not.to.contain(util.eol)
      expect(result).to.have.length.of.at.most(util.maxLengthOfConciseRepresentation)
      expect(result)
        .to.satisfy(function (r) { return isAConciseVersion(expected, r) })
    }

    const prefix = 'This is a test prefix'
    const alternativeName = 'This is an alternative name'
    const namedStuff = generateMutableStuff()
    namedStuff
      .filter(function (ms) { return testUtil.propertyIsWritable(ms.subject, 'name') })
      .forEach(function (ms) { ms.subject.name = alternativeName })
    const displayNamedStuff = generateMutableStuff()
    displayNamedStuff
      .forEach(function (ms) { ms.subject.displayName = alternativeName })

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
      .map(function (s) { return s.subject })
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

    stuffToo.forEach(function (f) {
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
    caseGenerators = caseGenerators.concat(testUtil.anyCasesGenerators('throw stack').map(function (ac) {
      return function () {
        return {
          stack: ac(),
          toString: function () { return toStringString }
        }
      }
    }))
    caseGenerators.forEach(function (thrownGenerator) {
      const thrown = thrownGenerator()
      it('returns the expected, normalized string representation for ' + thrown, function () {
        const result = util.extensiveThrownRepresentation(thrown)
        expect(result).to.be.a('string')
        expect(result).to.satisfy(function (str) { return str.indexOf('' + thrown) === 0 })
        let stack = thrown && thrown.stack
        if (stack) {
          stack = util.eol + stack
          const expectedStart = result.length - stack.length
          expect(result).to.satisfy(function (str) { return str.lastIndexOf(stack) === expectedStart })
        }
        testUtil.log(result)
      })
    })
  })

  describe('#pathUp', function () {
    it('returns the directory of a file path in a browser', function () {
      const dirPath = 'http://localhost:63342/contracts/test/_private'
      const fileName = 'utilTest.js'
      const testCase = dirPath + util.dirSeparator + fileName
      const result = util.pathUp(testCase)
      expect(result).to.be.a('string')
      expect(result).to.equal(dirPath)
    })
    it('throws when the argument is not a string', function () {
      expect(function () { return util.pathUp({}) }).to.throw(TypeError)
    })
  })

  describe('#browserModuleLocation', function () {
    // Note: for these tests to work, we must be at least 1 directory down from the server root.
    const isNode = testUtil.environment === 'node';
    [
      {uri: 'simple.js', expectedEnd: 'simple.js'},
      {uri: './peer.js', expectedEnd: 'peer.js'},
      {uri: './dir/dir/deep.js', expectedEnd: '/dir/dir/deep.js'},
      {uri: '../down/other.js', expectedEnd: 'other.js'},
      {uri: './.././down/down/../../down/down/./complex.js', expectedEnd: '/down/complex.js'},
      {uri: '/dir/dir/deep.js', expectedEnd: '/dir/dir/deep.js'}
    ].forEach(function (testCase) {
      it('returns a sensible result with AMD module URI "' + testCase.uri + '"', function () {
        const origin = typeof window === 'undefined' ? 'http://localhost:23494' : window.location.origin
        if (isNode) {
          global.window = {location: {href: origin + '/contracts/test/mocha.html', origin: origin}}
        }
        const amdModule = {uri: testCase.uri}
        const result = util.browserModuleLocation(amdModule)
        expect(result).to.be.a('string')
        expect(result).to.match(new RegExp(testCase.expectedEnd + '$'))
        expect(result).to.match(/^https?:\/{2,}\[?[\w.:-]+]?(?::[0-9]*)?\//)
        expect(result).to.match(new RegExp('^' + origin))
        expect(result).not.to.match(/\/\.{1,2}\//)
        expect(result).to.satisfy(function (r) { return r.match(/\/{2,}/g).length <= 1 })
        if (isNode) {
          delete global.window
        }
        testUtil.log('browserModuleLocation: %s', result)
      })
    })

    it('throws an error if the AMD module URI would bring us above the root of the server', function () {
      const origin = typeof window === 'undefined' ? 'http://localhost:23494' : window.location.origin
      if (isNode) {
        global.window = {location: {href: origin + '/contracts/test/mocha.html', origin: origin}}
      }
      const amdModule = {uri: '../../../../../../down/down/other.js'}
      expect(util.browserModuleLocation.bind(util, amdModule)).to.throw(Error)
      if (isNode) {
        delete global.window
      }
    })
  })
})
