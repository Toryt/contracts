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
const should = require('should')

const message = 'A message'
const env = testUtil.environment
const isFF = env === 'firefox'
const isFFOrSafari = isFF || env === 'safari'

describe('javascript/Error', function () {
  describe('#message', function () {
    it('has the expected message', function () {
      const subject = new Error(message)
      testUtil.log('message: %s', subject.message)
      subject.message.should.equal(message)
    })
  })
  describe('#name', function () {
    it('has the expected name', function () {
      const subject = new Error(message)
      testUtil.log('name: %s', subject.name)
      subject.name.should.equal('Error')
    })
  })
  describe('#toString()', function () {
    it('return the name and the message, separated by a colon', function () {
      const subject = new Error(message)
      const result = subject.toString()
      testUtil.log('toString(): %s', result)
      result.should.be.a.String()
      result.should.equal('Error: ' + message)
    })
  })

  function okForFF (s) {
    if (isFF) {
      should(s).be.ok()
    } else {
      should(s).not.be.ok()
    }
  }

  describe('#fileName', function () {
    it('has ' + (isFF ? 'a' : 'no') + ' file name in ' + env, function () {
      const subject = new Error(message)
      testUtil.log('fileName: %s', subject.fileName)
      okForFF(subject.fileName) // not supported in node
    })
  })
  describe('#lineNumber', function () {
    it('has ' + (isFF ? 'a' : 'no') + ' line number in ' + env, function () {
      const subject = new Error(message)
      testUtil.log('lineNumber: %s', subject.lineNumber)
      okForFF(subject.lineNumber) // not supported in node
    })
  })
  describe('#columnNumber', function () {
    it('has ' + (isFF ? 'a' : 'no') + ' column number in ' + env, function () {
      const subject = new Error(message)
      // noinspection JSUnresolvedVariable
      testUtil.log('columnNumber: %s', subject.columnNumber)
      okForFF(subject.columnNumber) // not supported in node
      // noinspection JSUnresolvedVariable
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
        stack.should.be.ok() // not supported in old IE
        stack.should.be.a.String()
        if (isFFOrSafari) {
          stack.should.not.containEql(subject.toString())
        } else {
          stack.indexOf(subject.toString()).should.equal(0)
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
        stack.should.be.ok()
        stack.should.be.a.String()
        testUtil.log('err.stack: %s', stack)
        stack.should.containEql('throwAnError')
        if (testUtil.environment !== 'edge') {
          // Edge restarts stack trace on throw
          stack.should.containEql('createAnError')
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
            l.should[i === 0 ? 'it' : 'not'].containEql('throwAnError')
          } else {
            l.should[i === 0 ? 'it' : 'not'].containEql('createAnErrorOne')
            if (testUtil.environment === 'safari') {
              // Safari EATS stack frames
              l.should[i === 1 ? 'it' : 'not'].containEql('throwAnError')
            } else {
              l.should[i === 1 ? 'it' : 'not'].containEql('createAnErrorTwo')
              l.should[i === 2 ? 'it' : 'not'].containEql('throwAnError')
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
        err.stack.should.be.ok()
        err.stack.should.containEql('createAnError')
        // and be on the first line
        const lines = err.stack.split('\n')
        if (lines[0] === err.toString()) {
          // some environments add the toString of the error on the first line
          lines.shift()
        }
        lines.forEach((l, i) => {
          l.should[i === 0 ? 'it' : 'not'].containEql('createAnErrorOne')
          l.should[i === 1 ? 'it' : 'not'].containEql('createAnErrorTwo')
          l.should[i === 2 ? 'it' : 'not'].containEql('throwAnError')
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
        err2.stack.should.be.ok()
        err2.stack.should.not.containEql('createAnError')
        err2.stack.should.not.containEql('throwAnError')
        err2.stack.should.containEql('captureTheStackTrace1')
        err2.stack.should.containEql('captureTheStackTrace2')
        err2.stack.should.containEql('captureTheStackTrace3')
        // and be on the first line
        const lines = err2.stack.split('\n')
        if (lines[0] === err2.toString()) {
          // some environments add the toString of the error on the first line
          lines.shift()
        }
        lines.forEach((l, i) => {
          l.should[i >= 0 && i <= 2 ? 'it' : 'not'].containEql('captureTheStackTrace')
        })
      }
    })
  })
})
