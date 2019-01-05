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

const testUtil = require('../_util/testUtil')
const must = require('must')

const message = 'A message'
const env = testUtil.environment
const isFF = env === 'firefox'
const isFFOrSafari = isFF || env === 'safari'

describe('javascript/Error', function () {
  describe('#message', function () {
    it('has the expected message', function () {
      const subject = new Error(message)
      testUtil.log('message: %s', subject.message)
      subject.message.must.equal(message)
    })
  })
  describe('#name', function () {
    it('has the expected name', function () {
      const subject = new Error(message)
      testUtil.log('name: %s', subject.name)
      subject.name.must.equal('Error')
    })
  })
  describe('#toString()', function () {
    it('return the name and the message, separated by a colon', function () {
      const subject = new Error(message)
      const result = subject.toString()
      testUtil.log('toString(): %s', result)
      result.must.be.a.string()
      result.must.equal('Error: ' + message)
    })
  })
  describe('#fileName', function () {
    it('has ' + (isFF ? 'a' : 'no') + ' file name in ' + env, function () {
      const subject = new Error(message)
      testUtil.log('fileName: %s', subject.fileName)
      must(subject.fileName).be[isFF ? 'truthy' : 'falsy']() // not supported in node
    })
  })
  describe('#lineNumber', function () {
    it('has ' + (isFF ? 'a' : 'no') + ' line number in ' + env, function () {
      const subject = new Error(message)
      testUtil.log('lineNumber: %s', subject.lineNumber)
      must(subject.lineNumber).be[isFF ? 'truthy' : 'falsy']() // not supported in node
    })
  })
  describe('#columnNumber', function () {
    it('has ' + (isFF ? 'a' : 'no') + ' column number in ' + env, function () {
      const subject = new Error(message)
      // noinspection JSUnresolvedVariable
      testUtil.log('columnNumber: %s', subject.columnNumber)
      // noinspection JSUnresolvedVariable
      must(subject.columnNumber).be[isFF ? 'truthy' : 'falsy']() // not supported in node
    })
  })
  describe('#stack', function () {
    it(
      'has a stack, that is a string, that ' +
        (isFFOrSafari ? 'does not start' : 'starts') +
        ' with the toString() on ' +
        env,
      function () {
        const subject = new Error(message)
        const stack = subject.stack
        testUtil.log('stack: %s', subject.stack)
        // noinspection BadExpressionStatementJS,JSHint
        stack.must.be.truthy() // not supported in old IE
        stack.must.be.a.string()
        if (isFFOrSafari) {
          stack.must.not.contain(subject.toString())
        } else {
          stack.indexOf(subject.toString()).must.equal(0)
        }
      }
    )
    it('has a stack, that reports where the error is created, and the entire stack, except for Safari', function () {
      function createAnErrorOne () {
        return new Error(message)
      }

      function createAnErrorTwo () {
        return createAnErrorOne()
      }

      function throwAnError () {
        throw createAnErrorTwo()
      }

      try {
        throwAnError()
      } catch (err) {
        const stack = err.stack
        stack.must.be.truthy()
        stack.must.be.a.string()
        testUtil.log('err.stack: %s', stack)
        stack.must.contain('throwAnError')
        if (testUtil.environment !== 'edge') {
          // Edge restarts stack trace on throw
          stack.must.contain('createAnError')
        }
        // and be on the first line
        const lines = err.stack.split('\n')
        if (lines[0] === err.toString()) {
          // some environments add the toString of the error on the first line
          lines.shift()
        }
        lines.forEach((l, i) => {
          if (testUtil.environment === 'edge') {
            // Edge restarts stack trace on throw
            l.must[i === 0 ? 'to' : 'not'].contain('throwAnError')
          } else {
            l.must[i === 0 ? 'to' : 'not'].contain('createAnErrorOne')
            if (testUtil.environment === 'safari') {
              // Safari EATS stack frames
              l.must[i === 1 ? 'to' : 'not'].contain('throwAnError')
            } else {
              l.must[i === 1 ? 'to' : 'not'].contain('createAnErrorTwo')
              l.must[i === 2 ? 'to' : 'not'].contain('throwAnError')
            }
          }
        })
      }
    })
    it('has a stack, that reports where the error is created, and the entire stack, when immediately thrown', function () {
      function createAnErrorOne () {
        try {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(message)
        } catch (result) {
          return result
        }
      }

      function createAnErrorTwo () {
        throw createAnErrorOne()
      }

      function throwAnError () {
        createAnErrorTwo()
      }

      try {
        throwAnError()
      } catch (err) {
        testUtil.log('err.stack: %s', err.stack)
        err.stack.must.be.truthy()
        err.stack.must.contain('createAnError')
        // and be on the first line
        const lines = err.stack.split('\n')
        if (lines[0] === err.toString()) {
          // some environments add the toString of the error on the first line
          lines.shift()
        }
        lines.forEach((l, i) => {
          l.must[i === 0 ? 'to' : 'not'].contain('createAnErrorOne')
          l.must[i === 1 ? 'to' : 'not'].contain('createAnErrorTwo')
          l.must[i === 2 ? 'to' : 'not'].contain('throwAnError')
        })
      }
    })
    it('has a stack, that reports where Error.captureStackTrace is called last', function () {
      // https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
      function createAnError () {
        return new Error(message)
      }

      // noinspection FunctionNamingConventionJS
      function captureTheStackTrace1 (err) {
        Error.captureStackTrace(err)
      }

      function throwAnError () {
        const anError = createAnError()
        captureTheStackTrace1(anError) // this will be overwritten
        throw anError
      }

      // noinspection FunctionNamingConventionJS
      function captureTheStackTrace2 (err) {
        captureTheStackTrace1(err)
      }

      // noinspection FunctionNamingConventionJS
      function captureTheStackTrace3 (err) {
        captureTheStackTrace2(err)
      }

      try {
        try {
          throwAnError()
        } catch (err1) {
          captureTheStackTrace3(err1)
          // noinspection ExceptionCaughtLocallyJS
          throw err1
        }
      } catch (err2) {
        testUtil.log('err.stack: %s', err2.stack)
        err2.stack.must.be.truthy()
        err2.stack.must.not.contain('createAnError')
        err2.stack.must.not.contain('throwAnError')
        err2.stack.must.contain('captureTheStackTrace1')
        err2.stack.must.contain('captureTheStackTrace2')
        err2.stack.must.contain('captureTheStackTrace3')
        // and be on the first line
        const lines = err2.stack.split('\n')
        if (lines[0] === err2.toString()) {
          // some environments add the toString of the error on the first line
          lines.shift()
        }
        lines.forEach((l, i) => {
          l.must[i >= 0 && i <= 2 ? 'to' : 'not'].contain('captureTheStackTrace')
        })
      }
    })
  })
})
