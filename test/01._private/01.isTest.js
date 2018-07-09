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

const is = require('../../lib/_private/is')
const testUtil = require('../_util/testUtil')
const must = require('must')
const os = require('os')
const stuff = require('./_stuff')

describe('_private/is', function () {
  describe('#isArguments', function () {
    stuff.forEach(s => {
      it(`returns ${s.expected === 'arguments' ? 'true' : 'false'} for ${s.subject}`, function () {
        const result = is.isArguments(s.subject)
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
        const result = is.isPrimitive(record.subject)
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
          const result = is.isInteger(thing)
          result.must.be.false()
        })
      })
    // noinspection MagicNumberJS
    const cases1 = [Number.MIN_SAFE_INTEGER, -4, -2.0, -1, 0, 1, 2.0, 6, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE]
    cases1.forEach(int => {
      it('should return true for ' + int, function () {
        const result = is.isInteger(int)
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
        const result = is.isInteger(nr)
        result.must.be.false()
      })
    })
  })

  describe('#isAStackLocation', function () {
    stuff.map(s => s.subject).filter(s => typeof s !== 'string').forEach(s => {
      it(`says no to ${s}`, function () {
        const result = is.isAStackLocation(s)
        result.must.be.false()
      })
    })
    it(`says no to ''`, function () {
      const result = is.isAStackLocation('')
      result.must.be.false()
    })
    it(`says yes to 'abc'`, function () {
      const result = is.isAStackLocation('abc')
      result.must.be.true()
    })
    it(`says no to a multi-line string`, function () {
      const result = is.isAStackLocation(`this is a 
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
          const result = is.isAStackLocation(line)
          testUtil.log(`${result}: ${line}`)
          result.must.be.true()
        })
    })
  })

  describe('#isAStack', function () {
    stuff.map(s => s.subject).filter(s => typeof s !== 'string').forEach(s => {
      it(`says no to ${s}`, function () {
        const result = is.isAStack(s)
        result.must.be.false()
      })
    })
    it(`says no to ''`, function () {
      const result = is.isAStack('')
      result.must.be.false()
    })
    it(`says yes to 'abc'`, function () {
      const result = is.isAStack('abc')
      result.must.be.true()
    })
    it(`says yes to a multi-line string`, function () {
      const candidate = `this is a 
multi-line
string`
      const result = is.isAStack(candidate)
      result.must.be.true()
    })
    it(`says no to a multi-line string with a blank line`, function () {
      const result = is.isAStack(`this is a 
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
      const result = is.isAStack(stack)
      result.must.be.true()
    })
  })
})
