/*
  Copyright 2016–2025 Jan Dockx

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

'use strict'

const testUtil = require('./_util/testUtil')
const PromiseContract = require('../lib/PromiseContract')
const AbstractContract = require('../lib/AbstractContract')
const ConditionMetaError = require('../lib/ConditionMetaError')
const PreconditionViolation = require('../lib/PreconditionViolation')
const PostconditionViolation = require('../lib/PostconditionViolation')
const ExceptionConditionViolation = require('../lib/ExceptionConditionViolation')
const conditionMetaErrorCommon = require('./ConditionMetaErrorCommon')
const preconditionViolationCommon = require('./PreconditionViolationCommon')
const postconditionViolationCommon = require('./PostconditionViolationCommon')
const exceptionConditionViolationCommon = require('./ExceptionConditionViolationCommon')
const should = require('should')
const { stackEOL } = require('../lib/_private/eol')
const cases = require('./_cases')

/* This test is not included in `Contract.generatePrototypeMethodsDescriptions`, because it is
   specific for `ContractFunction`: we test extensively whether the contract function works as expected here.
   This tests the behavior of the resulting contract function. The tests in
   `Contract.generatePrototypeMethodsDescriptions` tests the state postconditions only. */

// noinspection FunctionTooLongJS
describe('PromiseContractFunction', function () {
  function fibonacciImpl(n) {
    return n <= 1
      ? Promise.resolve(n)
      : /* prettier-ignore */ Promise.all([fibonacci(n - 1), fibonacci(n - 2)]).then(function (result) {
        return result[0] + result[1]
      })
  }

  const fibonacci = new PromiseContract({
    pre: [Number.isInteger, n => n >= 0],
    post: [
      (n, result) => Number.isInteger(result),
      (n, result) => n !== 0 || result === 0,
      (n, result) => n !== 1 || result === 1,
      // don't refer to a specific implementation (`fibonacci`) in the Contract!
      (n, result, fibonacci) =>
        n < 2 || Promise.all([fibonacci(n - 1), fibonacci(n - 2)]).then(results => result === results[0] + results[1])
    ]
  }).implementation(fibonacciImpl)

  const wrongParameter = 4
  const wrongResult = -3

  const fibonacciWrong = fibonacci.contract.implementation(function fWrong(n) {
    return new Promise(resolve => {
      setTimeout(() => {
        // noinspection IfStatementWithTooManyBranchesJS
        if (n === 0) {
          resolve(0)
        } else if (n === 1) {
          resolve(1)
        } else if (n === 4) {
          resolve(-3) // wrong!
        } else {
          resolve(Promise.all([fibonacciWrong(n - 1), fibonacciWrong(n - 2)]).then(results => results[0] + results[1]))
        }
      }, 0)
    })
  })

  const integerMessage = 'n must be integer'
  const positiveMessage = 'n must be positive'
  const overflowMessage = 'no overflow'

  const defensiveIntegerSum = new PromiseContract({
    post: [
      (n, result) => Number.isInteger(result),
      (n, result) => result >= 0,
      (n, result) => n !== 0 || result === 0,
      (n, result, sum) => n === 0 || sum(n - 1).then(nMinusOneSum => result === nMinusOneSum + n)
    ],
    fastException: [(n, exc) => exc instanceof Error && exc.message === integerMessage && !Number.isInteger(n)],
    exception: [
      (n, exc) => exc instanceof Error,
      (n, exc) => exc.message === positiveMessage || exc.message === overflowMessage,
      (n, exc) => exc.message !== positiveMessage || n < 0,
      (n, exc, sum) => exc.message !== overflowMessage || sum(n - 1).then(nMinusOneSum => 20 - n <= nMinusOneSum)
      // 20, because MAX_SAFE_INTEGER takes too long
    ]
  }).implementation(n => {
    if (!Number.isInteger(n)) {
      throw new Error(integerMessage)
    }
    if (n < 0) {
      return Promise.reject(new Error(positiveMessage))
    }
    // we are not obliged to throw an overflow message (but then the postcondition will fail)
    let count = 0
    let result = 0
    while (count < n) {
      count++
      result += count
    }
    return Promise.resolve(result)
  })

  const wrongException = new Error('this message is wrong') // will be thrown in error

  const fastDefensiveIntegerSumWrong = defensiveIntegerSum.contract.implementation(n => {
    if (Number.isInteger(n)) {
      throw wrongException
    } // wrong
    if (n >= 0) {
      return Promise.reject(wrongException)
    } // wrong
    return Promise.resolve((n * (n + 1)) / 2)
  })

  const defensiveIntegerSumWrong = defensiveIntegerSum.contract.implementation(() => {
    return Promise.reject(wrongException) // wrong
  })

  const defensiveSumFastExcParameter = Math.PI
  const defensiveSumRejectParameter = -5
  const fastExceptionParameter = -10
  const exceptionParameter = 5

  const resultWhenMetaError = 'This is the result or exception when we get a meta error'

  function callAndExpectFastException(self, func, parameter, expectException, recursive) {
    let endsNominally = false
    try {
      // result is not used
      if (!self) {
        func(parameter)
      } else {
        func.call(self, parameter)
      }
      endsNominally = true
    } catch (exception) {
      testUtil.log('' + exception)
      exception.should.be.ok()
      const common =
        exception instanceof ConditionMetaError
          ? conditionMetaErrorCommon
          : /* prettier-ignore */ exception instanceof PreconditionViolation
            // resolves infighting between prettier and standard
            ? preconditionViolationCommon
            : exception instanceof PostconditionViolation
              ? postconditionViolationCommon
              : exception instanceof ExceptionConditionViolation
                ? exceptionConditionViolationCommon
                : null
      common.should.be.ok()
      common.expectInvariants(exception)
      exception.message.should.containEql(func.name)
      const stack = exception.stack
      stack.should.containEql(func.name)
      testUtil.showStack(exception)
      expectException(exception)
      const stackLines = stack.split(stackEOL)
      const callStackLine = stackLines.indexOf('call stack:')
      callStackLine.should.be.greaterThanOrEqual(0)
      stackLines.splice(0, callStackLine + 1)
      stackLines.length.should.be.greaterThanOrEqual(1)
      // For post- and exception conditions, we expect the top of the stack trace to be the contract function (it is at
      // fault).  For preconditions, we expect the top of the stack trace to be where we called the contract function,
      // but then we have no report of the implementation that was called in the report. The top will point to the line
      // where the contract function was called, so we know it indirectly. For post- and exception condition, the line
      // to refer to would be inside the implementation. It would be the return statement, or the throw. This would be
      // important, because an implementation might have multiple exit points, and this would report what exit point
      // failed the contract. But we cannot create a stacktrace to that. We only can use our 'contractFunction' wrapper
      // for the stack trace, and it makes no sense to point inside, or to that internal function. So the best we can
      // do is to point to where the contract function is called. The same applies to Meta errors (in conditions),
      // since we cannot create a stack trace that points in the condition. The caused by probably will for meta errors,
      // but there is no such thing for pre-, post- or exception conditions.
      if (testUtil.environment !== 'safari') {
        if (!recursive) {
          stackLines[0].should.containEql('callAndExpectFastException')
        } else {
          stackLines[0].should.containEql(recursive)
          stackLines[2].should.containEql(recursive)
          stackLines[4].should.containEql('callAndExpectFastException')
        }
      }
    }
    endsNominally.should.be.false()
  }

  function callAndExpectRejection(self, func, parameter, expectException, recursive) {
    let promise
    if (!self) {
      promise = func(parameter)
    } else {
      promise = func.call(self, parameter)
    }
    return promise
      .then(() => {
        true.should.be.false()
      })
      .catch(rejection => {
        testUtil.log('' + rejection)
        rejection.should.be.ok()
        const common =
          rejection instanceof ConditionMetaError
            ? conditionMetaErrorCommon
            : /* prettier-ignore */ rejection instanceof PostconditionViolation
              // resolves infighting between prettier and standard
              ? postconditionViolationCommon
              : rejection instanceof ExceptionConditionViolation
                ? exceptionConditionViolationCommon
                : null
        common.should.be.ok()
        common.expectInvariants(rejection)
        rejection.message.should.containEql(func.name)
        const stack = rejection.stack
        stack.should.containEql(func.name)
        testUtil.showStack(rejection)
        expectException(rejection)
        const stackLines = stack.split(stackEOL)
        const callStackLine = stackLines.indexOf('call stack:')
        callStackLine.should.be.greaterThanOrEqual(0)
        stackLines.splice(0, callStackLine + 1)
        stackLines.length.should.be.greaterThanOrEqual(1)
        // For post- and exception conditions, we expect the top of the stack trace to be the contract function (it is at
        // fault).  For preconditions, we expect the top of the stack trace to be where we called the contract function,
        // but then we have no report of the implementation that was called in the report. The top will point to the line
        // where the contract function was called, so we know it indirectly. For post- and exception condition, the line
        // to refer to would be inside the implementation. It would be the return statement, or the throw. This would be
        // important, because an implementation might have multiple exit points, and this would report what exit point
        // failed the contract. But we cannot create a stacktrace to that. We only can use our 'contractFunction' wrapper
        // for the stack trace, and it makes no sense to point inside, or to that internal function. So the best we can
        // do is to point to where the contract function is called. The same applies to Meta errors (in conditions),
        // since we cannot create a stack trace that points in the condition. The caused by probably will for meta errors,
        // but there is no such thing for pre-, post- or exception conditions.
        if (testUtil.environment !== 'safari') {
          /* Because it is in the event loop; this is not our code; we have to show something, but for Promises, it is
             largely irrelevant.
             In order:

             * chrome since v73 for Promise resolutions
             * node 8
             * headless chrome, chrome (x 3)
             * Firefox
             * Edge
             * node 6
           */
          const expectReference =
            /\[\[internal]]|anonymous|conditionResult\.catch\.err|promise.catch.then|promise.catch.rejection|about:blank|Anonymous|runMicrotasksCallback/
          if (!recursive) {
            stackLines[0].should.match(expectReference) // because it is in the event loop; this is not our code
          } else {
            stackLines[0].should.containEql(recursive)
            stackLines[2].should.containEql(recursive)
            stackLines[4].should.containEql('anonymous') // because it is in the event loop; this is not our code
          }
        }
      })
  }

  function failsOnPreconditionViolation(self, func, parameter, violatedCondition) {
    it('fails when a precondition is violated - ' + self + ' - ' + parameter, function () {
      callAndExpectFastException(self, func, parameter, exception => {
        exception.should.be.an.instanceof(PreconditionViolation)
        exception.condition.should.equal(violatedCondition)
        if (!self) {
          should(exception.self).not.be.ok()
        } else {
          exception.self.should.equal(self)
        }
        should(exception.args[0]).equal(parameter)
      })
    })
  }

  const contractWithAFailingPre = new PromiseContract({
    pre: [cases.intentionallyFailingFunction]
  })

  function failsOnMetaErrorFast(self, functionWithAMetaError, conditionWithAMetaError, extraArgs) {
    const param = 'a parameter'
    callAndExpectFastException(self, functionWithAMetaError, param, exception => {
      exception.should.be.an.instanceof(ConditionMetaError)
      exception.condition.should.equal(conditionWithAMetaError)
      if (!self) {
        should(exception.self).not.be.ok()
      } else {
        exception.self.should.equal(self)
      }
      exception.args.length.should.equal(extraArgs ? extraArgs.length + 1 : 1)
      exception.args[0].should.equal(param)
      if (extraArgs) {
        exception.args[1].should.equal(extraArgs[0])
        AbstractContract.isAContractFunction(exception.args[2]).should.be.true()
      }
      exception.error.should.equal(cases.intentionalError)
    })
  }

  function failsOnMetaError(self, functionWithAMetaError, conditionWithAMetaError, extraArgs) {
    const param = 'a parameter'
    return callAndExpectRejection(self, functionWithAMetaError, param, exception => {
      exception.should.be.an.instanceof(ConditionMetaError)
      exception.condition.should.equal(conditionWithAMetaError)
      if (!self) {
        should(exception.self).not.be.ok()
      } else {
        exception.self.should.equal(self)
      }
      exception.args.length.should.equal(extraArgs ? extraArgs.length + 1 : 1)
      exception.args[0].should.equal(param)
      if (extraArgs) {
        exception.args[1].should.equal(extraArgs[0])
        AbstractContract.isAContractFunction(exception.args[2]).should.be.true()
      }
      exception.error.should.equal(cases.intentionalError)
    })
  }

  function expectNotAPromisePostProperties(self, contractFunction, exception) {
    postconditionViolationCommon.expectProperties(
      exception,
      PostconditionViolation,
      contractFunction,
      PromiseContract.resultIsAPromiseCondition,
      self,
      [4],
      'some result'
    )
  }

  function expectPostProperties(self, contractFunction, exception) {
    postconditionViolationCommon.expectProperties(
      exception,
      PostconditionViolation,
      contractFunction,
      contractFunction.contract.post[3],
      self,
      [wrongParameter],
      wrongResult
    )
  }

  function expectFastExceptionProperties(self, contractFunction, exception) {
    exceptionConditionViolationCommon.expectProperties(
      exception,
      ExceptionConditionViolation,
      contractFunction,
      contractFunction.contract.fastException[0], // integer was programmed wrong
      self,
      [fastExceptionParameter],
      wrongException
    )
  }

  function expectExceptionProperties(self, contractFunction, exception) {
    exceptionConditionViolationCommon.expectProperties(
      exception,
      ExceptionConditionViolation,
      contractFunction,
      contractFunction.contract.exception[0], // integer was programmed wrong
      self,
      [exceptionParameter],
      wrongException
    )
  }

  const argumentsOfWrongType = [undefined, null, 'bar']
  const self = {
    aProperty: 'a property value',
    fibonacci: fibonacci.contract.implementation(function (n) {
      const self = this
      return n <= 1
        ? Promise.resolve(n)
        : /* prettier-ignore */ Promise
          .all([self.fibonacci(n - 1), self.fibonacci(n - 2)])
          .then(function (result) { return result[0] + result[1] })
    }),
    fibonacciWrong: fibonacci.contract.implementation(function fWrong(n) {
      return new Promise(resolve => {
        setTimeout(() => {
          // noinspection IfStatementWithTooManyBranchesJS
          if (n === 0) {
            resolve(0)
          } else if (n === 1) {
            resolve(1)
          } else if (n === 4) {
            resolve(-3) // wrong!
          } else {
            resolve(
              Promise.all([self.fibonacciWrong(n - 1), self.fibonacciWrong(n - 2)]).then(
                results => results[0] + results[1]
              )
            )
          }
        }, 0)
      })
    }),
    defensiveIntegerSum,
    fastDefensiveIntegerSumWrong,
    defensiveIntegerSumWrong
  }

  describe('#name', function () {
    it('fibonacci has the right name', function () {
      fibonacciImpl.name.should.equal('fibonacciImpl')
      testUtil.log('fibonacci.name: %s', fibonacci.name)
      fibonacci.name.should.equal(`${AbstractContract.namePrefix} ${fibonacciImpl.name}`)
    })
    it('self.fibonacci has the right name', function () {
      testUtil.log(`self.fibonacci.name: ${self.fibonacci.name}`)
      self.fibonacci.name.should.containEql(`${AbstractContract.namePrefix} function (n) {`)
    })
    it('fibonacciWrong has the right name', function () {
      testUtil.log('fibonacciWrong.name: %s', fibonacciWrong.name)
      fibonacciWrong.name.should.equal(`${AbstractContract.namePrefix} fWrong`)
    })
    it('self.fibonacciWrong has the right name', function () {
      testUtil.log('self.fibonacciWrong.name: %s', self.fibonacciWrong.name)
      self.fibonacciWrong.name.should.equal(`${AbstractContract.namePrefix} fWrong`)
    })
    const anonymousContractFunctions = [
      { name: 'defensiveIntegerSum', f: defensiveIntegerSum },
      { name: 'fastDefensiveIntegerSumWrong', f: fastDefensiveIntegerSumWrong },
      { name: 'self.defensiveIntegerSum', f: self.defensiveIntegerSum },
      {
        name: 'self.fastDefensiveIntegerSumWrong',
        f: self.fastDefensiveIntegerSumWrong
      }
    ]
    anonymousContractFunctions.forEach(a => {
      it(`${a.name} has the right name`, function () {
        testUtil.log(`${a.name}.name: ${a.f.name}`)
        a.f.name.should.containEql(`${AbstractContract.namePrefix} n => {`)
      })
    })
  })

  describe('correct', function () {
    it("doesn't interfere when the implementation is correct", function () {
      // any exception will fail the test

      return fibonacci(5)
    })
    it("doesn't interfere when the implementation is correct, testing conditions", function () {
      fibonacci.contract.verifyPostconditions = true
      // any exception will fail the test

      return fibonacci(5).then(() => {
        fibonacci.contract.verifyPostconditions = false
      })
    })
    it("doesn't interfere when the implementation is correct too", function () {
      const oneHundred = 100
      // any exception will fail the test

      return defensiveIntegerSum(oneHundred)
    })
    it("doesn't interfere when the implementation is correct too, testing conditions", function () {
      const oneHundred = 100
      defensiveIntegerSum.contract.verifyPostconditions = true
      // any exception will fail the test

      return defensiveIntegerSum(oneHundred).then(() => {
        defensiveIntegerSum.contract.verifyPostconditions = false
      })
    })
    it('works with a method that is correct', function () {
      // any exception will fail the test

      return self.fibonacci(5)
    })
    it('works with a method that is correct, testing conditions', function () {
      self.fibonacci.contract.verifyPostconditions = true
      // any exception will fail the test

      return self.fibonacci(5).then(() => {
        self.fibonacci.contract.verifyPostconditions = false
      })
    })
    it('works with a method that is correct too', function () {
      // any exception will fail the test

      return self.defensiveIntegerSum(5)
    })
    it('works with a method that is correct too, testing conditions', function () {
      self.defensiveIntegerSum.contract.verifyPostconditions = true
      // any exception will fail the test

      return self.defensiveIntegerSum(5).then(() => {
        self.defensiveIntegerSum.contract.verifyPostconditions = false
      })
    })
    it('works with a defensive function, fast exception', function () {
      defensiveIntegerSum.bind(undefined, defensiveSumFastExcParameter).should.throw(Error, { message: integerMessage })
    })
    it('works with a defensive function, fast exception, testing conditions', function () {
      defensiveIntegerSum.contract.verifyPostconditions = true
      defensiveIntegerSum.bind(undefined, defensiveSumFastExcParameter).should.throw(Error, { message: integerMessage })
      defensiveIntegerSum.contract.verifyPostconditions = false
    })
    it('works with a defensive method, fast exception', function () {
      self.defensiveIntegerSum.bind(self, defensiveSumFastExcParameter).should.throw(Error, { message: integerMessage })
    })
    it('works with a defensive method, fast exception, testing conditions', function () {
      self.defensiveIntegerSum.contract.verifyPostconditions = true
      self.defensiveIntegerSum.bind(self, defensiveSumFastExcParameter).should.throw(Error, { message: integerMessage })
      self.defensiveIntegerSum.contract.verifyPostconditions = false
    })
    it('works with a defensive function, rejecting', function () {
      return defensiveIntegerSum(defensiveSumRejectParameter).then(
        () => {
          true.should.be.false()
        },
        err => {
          err.should.be.an.Error()
          err.message.should.equal(positiveMessage)
        }
      )
    })
    it('works with a defensive function, rejecting, testing conditions', function () {
      defensiveIntegerSum.contract.verifyPostconditions = true
      return defensiveIntegerSum(defensiveSumRejectParameter).then(
        () => {
          defensiveIntegerSum.contract.verifyPostconditions = false
          true.should.be.false()
        },
        err => {
          defensiveIntegerSum.contract.verifyPostconditions = false
          testUtil.log(err)
          err.should.be.an.Error()
          err.message.should.equal(positiveMessage)
        }
      )
    })
    it('works with a defensive method, rejecting', function () {
      return self.defensiveIntegerSum(defensiveSumRejectParameter).then(
        () => {
          true.should.be.false()
        },
        err => {
          err.should.be.an.Error()
          err.message.should.equal(positiveMessage)
        }
      )
    })
    it('works with a defensive method, rejecting, testing conditions', function () {
      self.defensiveIntegerSum.contract.verifyPostconditions = true
      return self.defensiveIntegerSum(defensiveSumRejectParameter).then(
        () => {
          defensiveIntegerSum.contract.verifyPostconditions = false
          true.should.be.false()
        },
        err => {
          defensiveIntegerSum.contract.verifyPostconditions = false
          testUtil.log(err)
          err.should.be.an.Error()
          err.message.should.equal(positiveMessage)
        }
      )
    })
  })
  describe('precondition', function () {
    describe('violation', function () {
      argumentsOfWrongType.forEach(wrongArg => {
        failsOnPreconditionViolation(undefined, fibonacci, wrongArg, fibonacci.contract.pre[0])
      })
      failsOnPreconditionViolation(undefined, fibonacci, -5, fibonacci.contract.pre[1])
      argumentsOfWrongType.forEach(wrongArg => {
        failsOnPreconditionViolation(self, self.fibonacci, wrongArg, fibonacci.contract.pre[0])
      })
      failsOnPreconditionViolation(self, self.fibonacci, -5, fibonacci.contract.pre[1])
      it('does not fail on a precondition violation when verify is false', function () {
        fibonacci.contract.verify = false

        return fibonacci(-5).then(() => {
          fibonacci.contract.verify = true
        })
      })
    })
    describe('meta-error', function () {
      it('fails with a meta-error when a precondition is kaput', function () {
        // noinspection JSUnresolvedReference
        failsOnMetaErrorFast(
          undefined,
          contractWithAFailingPre.implementation(() => resultWhenMetaError),
          contractWithAFailingPre.pre[0]
        )
      })
      it('fails with a meta-error when a precondition is kaput when it is a method', function () {
        const self = {
          method: contractWithAFailingPre.implementation(() => resultWhenMetaError)
        }
        // noinspection JSUnresolvedReference
        failsOnMetaErrorFast(self, self.method, contractWithAFailingPre.pre[0])
      })
      it('does not fail when a precondition is kaput when verify is false', function () {
        const expectedResult = 'expected result'
        contractWithAFailingPre.verify = false
        return contractWithAFailingPre
          .implementation(() => Promise.resolve(expectedResult))()
          .then(function (result) {
            contractWithAFailingPre.verify = true
            result.should.equal(expectedResult)
          })
      })
    })
  })

  describe('promise condition', function () {
    describe('violation', function () {
      it('fails when it does not return a Promise', function () {
        const doesNotReturnAPromise = fibonacci.contract.implementation(() => 'some result')
        doesNotReturnAPromise.contract.verifyPostconditions = true
        callAndExpectFastException(
          undefined,
          doesNotReturnAPromise,
          4,
          expectNotAPromisePostProperties.bind(null, undefined, doesNotReturnAPromise)
        )
      })
    })
  })

  describe('postcondition', function () {
    describe('violation', function () {
      it('fails when a simple postcondition is violated', function () {
        fibonacciWrong.contract.verifyPostconditions = true
        return callAndExpectRejection(
          undefined,
          fibonacciWrong,
          wrongParameter,
          expectPostProperties.bind(undefined, undefined, fibonacciWrong)
        )
          .catch(() => {
            fibonacciWrong.contract.verifyPostconditions = false
          })
          .then(() => {
            fibonacciWrong.contract.verifyPostconditions = false
          })
      })
      it('fails when a simple postcondition is violated when it is a method', function () {
        self.fibonacciWrong.contract.verifyPostconditions = true
        return callAndExpectRejection(
          self,
          self.fibonacciWrong,
          wrongParameter,
          expectPostProperties.bind(undefined, self, self.fibonacciWrong)
        )
          .catch(() => {
            fibonacciWrong.contract.verifyPostconditions = false
          })
          .then(() => {
            fibonacciWrong.contract.verifyPostconditions = false
          })
      })
      it('fails when a postcondition is violated in a called function with a nested Violation', function () {
        const parameter = 6
        fibonacciWrong.contract.verifyPostconditions = true
        return callAndExpectRejection(
          undefined,
          fibonacciWrong,
          parameter,
          expectPostProperties.bind(undefined, undefined, fibonacciWrong),
          'fWrong'
        )
          .catch(() => {
            fibonacciWrong.contract.verifyPostconditions = false
          })
          .then(() => {
            fibonacciWrong.contract.verifyPostconditions = false
          })
      })
      it('fails when a postcondition is violated in a called function with a nested Violation when it is a method', function () {
        const parameter = 6
        self.fibonacciWrong.contract.verifyPostconditions = true
        return callAndExpectRejection(
          self,
          self.fibonacciWrong,
          parameter,
          expectPostProperties.bind(undefined, self, self.fibonacciWrong),
          'fWrong'
        )
          .catch(() => {
            fibonacciWrong.contract.verifyPostconditions = false
          })
          .then(() => {
            fibonacciWrong.contract.verifyPostconditions = false
          })
      })
      it('does not fail when a simple postcondition is violated when verify is false', function () {
        fibonacciWrong.contract.verify = false
        fibonacciWrong.contract.verifyPostconditions = true

        return fibonacciWrong(wrongParameter).then(result => {
          fibonacciWrong.contract.verifyPostconditions = false
          fibonacciWrong.contract.verify = true
          result.should.equal(wrongResult)
        })
      })
      it('does not fail when a simple postcondition is violated when verifyPostcondition is false', function () {
        return fibonacciWrong(wrongParameter).then(result => {
          result.should.equal(wrongResult)
        })
      })
    })
    describe('meta-error', function () {
      describe('fast', function () {
        const contractWithAFailingPost = new PromiseContract({
          post: [cases.intentionallyFailingArrow]
        })

        it('fails with a meta-error when a postcondition is kaput', function () {
          const implementation = contractWithAFailingPost.implementation(() => Promise.resolve(resultWhenMetaError))
          implementation.contract.verifyPostconditions = true
          // noinspection JSUnresolvedReference
          return failsOnMetaError(undefined, implementation, contractWithAFailingPost.post[0], [
            resultWhenMetaError,
            implementation
          ])
        })
        it('fails with a meta-error when a postcondition is kaput when it is a method', function () {
          const self = {
            method: contractWithAFailingPost.implementation(() => Promise.resolve(resultWhenMetaError))
          }
          self.method.contract.verifyPostconditions = true

          // noinspection JSUnresolvedReference
          return failsOnMetaError(self, self.method, contractWithAFailingPost.post[0], [
            resultWhenMetaError,
            self.method.bind(self)
          ])
        })
        it('does not fail when a postcondition is kaput when verify is false', function () {
          const expectedResult = 'expected result'
          contractWithAFailingPre.verify = false
          contractWithAFailingPre.verifyPostconditions = true
          return contractWithAFailingPost
            .implementation(() => Promise.resolve(expectedResult))()
            .then(result => {
              contractWithAFailingPre.verifyPostconditions = false
              contractWithAFailingPre.verify = true
              result.should.equal(expectedResult)
            })
        })
        it('does not fail when a postcondition is kaput when verifyPostcondition is false', function () {
          const expectedResult = 'expected result'
          return contractWithAFailingPost
            .implementation(() => Promise.resolve(expectedResult))()
            .then(result => {
              result.should.equal(expectedResult)
            })
        })
      })

      describe('reject', function () {
        const contractWithARejectingPost = new PromiseContract({
          post: [cases.intentionallyRejectingArrow]
        })

        it('fails with a meta-error when a postcondition is kaput', function () {
          const implementation = contractWithARejectingPost.implementation(() => Promise.resolve(resultWhenMetaError))
          implementation.contract.verifyPostconditions = true
          // noinspection JSUnresolvedReference
          return failsOnMetaError(undefined, implementation, contractWithARejectingPost.post[0], [
            resultWhenMetaError,
            implementation
          ])
        })
        it('fails with a meta-error when a postcondition is kaput when it is a method', function () {
          const self = {
            method: contractWithARejectingPost.implementation(() => Promise.resolve(resultWhenMetaError))
          }
          self.method.contract.verifyPostconditions = true

          // noinspection JSUnresolvedReference
          return failsOnMetaError(self, self.method, contractWithARejectingPost.post[0], [
            resultWhenMetaError,
            self.method.bind(self)
          ])
        })
        it('does not fail when a postcondition is kaput when verify is false', function () {
          const expectedResult = 'expected result'
          contractWithAFailingPre.verify = false
          contractWithAFailingPre.verifyPostconditions = true
          return contractWithARejectingPost
            .implementation(() => Promise.resolve(expectedResult))()
            .then(result => {
              contractWithAFailingPre.verifyPostconditions = false
              contractWithAFailingPre.verify = true
              result.should.equal(expectedResult)
            })
        })
        it('does not fail when a postcondition is kaput when verifyPostcondition is false', function () {
          const expectedResult = 'expected result'
          return contractWithARejectingPost
            .implementation(() => Promise.resolve(expectedResult))()
            .then(result => {
              result.should.equal(expectedResult)
            })
        })
      })
    })
  })

  const anExceptedException = 'This exception is expected.'

  describe('fast exception condition', function () {
    describe('violation', function () {
      it('fails when a simple fast exception condition is violated', function () {
        fastDefensiveIntegerSumWrong.contract.verifyPostconditions = true
        callAndExpectFastException(
          undefined,
          fastDefensiveIntegerSumWrong,
          fastExceptionParameter,
          expectFastExceptionProperties.bind(undefined, undefined, fastDefensiveIntegerSumWrong)
        )
        fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
      })
      it('fails when a simple fast exception condition is violated when it is a method', function () {
        self.fastDefensiveIntegerSumWrong.contract.verifyPostconditions = true
        callAndExpectFastException(
          self,
          self.fastDefensiveIntegerSumWrong,
          fastExceptionParameter,
          expectFastExceptionProperties.bind(undefined, self, self.fastDefensiveIntegerSumWrong)
        )
        self.fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
      })
      it('does not fail when a fast exception condition is violated when verify is false', function () {
        fastDefensiveIntegerSumWrong.contract.verify = false
        fastDefensiveIntegerSumWrong.contract.verifyPostconditions = true
        try {
          return fastDefensiveIntegerSumWrong(fastExceptionParameter)
            .catch(() => {
              fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
              fastDefensiveIntegerSumWrong.contract.verify = true
              true.should.be.false()
            })
            .then(() => {
              fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
              fastDefensiveIntegerSumWrong.contract.verify = true
              true.should.be.false()
            })
        } catch (err) {
          fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
          fastDefensiveIntegerSumWrong.contract.verify = true
          err.should.equal(wrongException)
        }
      })
      it('does not fail when a simple fast exception condition is violated when verifyPostcondition is false', function () {
        try {
          return fastDefensiveIntegerSumWrong(fastExceptionParameter)
            .catch(() => {
              true.should.be.false()
            })
            .then(() => {
              true.should.be.false()
            })
        } catch (err) {
          err.should.equal(wrongException)
        }
      })
    })
    describe('meta-error', function () {
      // noinspection LocalVariableNamingConventionJS
      const contractWithAFailingFastExceptionCondition = new PromiseContract({
        fastException: [cases.intentionallyFailingArrow]
      })

      it('fails with a meta-error when a fast exception condition is kaput', function () {
        const anExceptedException = 'This exception is expected.' // noinspection JSUnresolvedFunction
        const implementation = contractWithAFailingFastExceptionCondition.implementation(() => {
          throw anExceptedException
        })
        implementation.contract.verifyPostconditions = true
        // noinspection JSUnresolvedReference
        failsOnMetaErrorFast(undefined, implementation, contractWithAFailingFastExceptionCondition.fastException[0], [
          anExceptedException,
          implementation
        ])
      })
      it('fails with a meta-error when a fast exception condition is kaput when it is a method', function () {
        const anExceptedException = 'This exception is expected.'
        const self = {
          method: contractWithAFailingFastExceptionCondition.implementation(() => {
            throw anExceptedException
          })
        }
        self.method.contract.verifyPostconditions = true

        // noinspection JSUnresolvedReference
        failsOnMetaErrorFast(self, self.method, contractWithAFailingFastExceptionCondition.fastException[0], [
          anExceptedException,
          self.method.bind(self)
        ])
      })
      it('does not fail when a fast exception condition is kaput when verify is false', function () {
        contractWithAFailingFastExceptionCondition.verify = false
        contractWithAFailingFastExceptionCondition.verifyPostconditions = true
        try {
          // eslint-disable-next-line no-unused-vars
          const ignore = contractWithAFailingFastExceptionCondition.implementation(() => {
            throw anExceptedException
          })()
          contractWithAFailingFastExceptionCondition.verifyPostconditions = false
          contractWithAFailingFastExceptionCondition.verify = true
          true.should.be.false()
        } catch (err) {
          contractWithAFailingFastExceptionCondition.verifyPostconditions = false
          contractWithAFailingFastExceptionCondition.verify = true
          err.should.equal(anExceptedException)
        }
      })
      it('does not fail when a fast exception condition is kaput when verifyPostcondition is false', function () {
        try {
          // eslint-disable-next-line no-unused-vars
          const ignore = contractWithAFailingFastExceptionCondition.implementation(() => {
            throw anExceptedException
          })()
          true.should.be.false()
        } catch (err) {
          err.should.equal(anExceptedException)
        }
      })
    })
  })

  describe('exception condition', function () {
    describe('violation', function () {
      it('fails when a simple exception condition is violated', function () {
        defensiveIntegerSumWrong.contract.verifyPostconditions = true
        return callAndExpectRejection(
          undefined,
          defensiveIntegerSumWrong,
          exceptionParameter,
          expectExceptionProperties.bind(undefined, undefined, defensiveIntegerSumWrong)
        )
          .then(() => {
            defensiveIntegerSumWrong.contract.verifyPostconditions = false
          })
          .catch(() => {
            defensiveIntegerSumWrong.contract.verifyPostconditions = false
          })
      })
      it('fails when a simple exception condition is violated when it is a method', function () {
        self.defensiveIntegerSumWrong.contract.verifyPostconditions = true
        return callAndExpectRejection(
          self,
          self.defensiveIntegerSumWrong,
          exceptionParameter,
          expectExceptionProperties.bind(undefined, self, self.defensiveIntegerSumWrong)
        )
          .then(() => {
            defensiveIntegerSumWrong.contract.verifyPostconditions = false
          })
          .catch(() => {
            defensiveIntegerSumWrong.contract.verifyPostconditions = false
          })
      })
      it('does not fail when an exception condition is violated when verify is false', function () {
        defensiveIntegerSumWrong.contract.verify = false
        defensiveIntegerSumWrong.contract.verifyPostconditions = true
        return defensiveIntegerSumWrong(exceptionParameter).then(
          () => {
            defensiveIntegerSumWrong.contract.verifyPostconditions = false
            defensiveIntegerSumWrong.contract.verify = true
            true.should.be.false()
          },
          err => {
            defensiveIntegerSumWrong.contract.verifyPostconditions = false
            defensiveIntegerSumWrong.contract.verify = true
            err.should.equal(wrongException)
          }
        )
      })
      it('does not fail when a simple exception condition is violated when verifyPostcondition is false', function () {
        return defensiveIntegerSumWrong(exceptionParameter).then(
          () => {
            true.should.be.false()
          },
          err => {
            err.should.equal(wrongException)
          }
        )
      })
    })
    describe('meta-error', function () {
      // noinspection LocalVariableNamingConventionJS
      const contractWithAFailingExceptionCondition = new PromiseContract({
        exception: [cases.intentionallyFailingArrow]
      })

      it('fails with a meta-error when an exception condition is kaput', function () {
        const implementation = contractWithAFailingExceptionCondition.implementation(function reject() {
          return Promise.reject(anExceptedException)
        })
        implementation.contract.verifyPostconditions = true
        // noinspection JSUnresolvedReference
        return failsOnMetaError(undefined, implementation, contractWithAFailingExceptionCondition.exception[0], [
          anExceptedException,
          implementation
        ])
      })
      it('fails with a meta-error when an exception condition is kaput when it is a method', function () {
        const self = {
          method: contractWithAFailingExceptionCondition.implementation(() => Promise.reject(anExceptedException))
        }
        self.method.contract.verifyPostconditions = true

        // noinspection JSUnresolvedReference
        return failsOnMetaError(self, self.method, contractWithAFailingExceptionCondition.exception[0], [
          anExceptedException,
          self.method.bind(self)
        ])
      })
      it('does not fail when an exception condition is kaput when verify is false', function () {
        contractWithAFailingExceptionCondition.verify = false
        contractWithAFailingExceptionCondition.verifyPostconditions = true
        return contractWithAFailingExceptionCondition
          .implementation(() => Promise.reject(anExceptedException))()
          .then(() => {
            true.should.be.false()
          })
          .catch(err => {
            contractWithAFailingExceptionCondition.verifyPostconditions = false
            contractWithAFailingExceptionCondition.verify = true
            err.should.equal(anExceptedException)
          })
      })
      it('does not fail when an exception condition is kaput when verifyPostcondition is false', function () {
        return contractWithAFailingExceptionCondition
          .implementation(() => Promise.reject(anExceptedException))()
          .then(() => {
            true.should.be.false()
          })
          .catch(err => {
            contractWithAFailingExceptionCondition.verifyPostconditions = false
            contractWithAFailingExceptionCondition.verify = true
            err.should.equal(anExceptedException)
          })
      })
    })
  })
})
