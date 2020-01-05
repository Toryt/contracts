/*
 Copyright 2018 - 2018 by Jan Dockx

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
const PromiseContract = require('../../lib/IV/PromiseContract')
const AbstractContract = require('../../lib/IV/AbstractContract')
const ConditionMetaError = require('../../lib/IV/ConditionMetaError')
const PreconditionViolation = require('../../lib/IV/PreconditionViolation')
const PostconditionViolation = require('../../lib/IV/PostconditionViolation')
const ExceptionConditionViolation = require('../../lib/IV/ExceptionConditionViolation')
const conditionMetaErrorCommon = require('./ConditionMetaErrorCommon')
const preconditionViolationCommon = require('./PreconditionViolationCommon')
const postconditionViolationCommon = require('./PostconditionViolationCommon')
const exceptionConditionViolationCommon = require('./ExceptionConditionViolationCommon')
const should = require('should')
const stackEOL = require('../../lib/_private/eol').stack
const cases = require('../_cases')

/* This test is not included in Contract.generatePrototypeMethodsDescriptions, because it is
   specific for ContractFunction: we test extensively whether the contract function works as expected here.
   This tests the behavior of the resulting contract function. The tests in
   Contract.generatePrototypeMethodsDescriptions tests the state postconditions only. */

/* These async functions are often weird, and not good async functions. The intention is to use as much async
   functions as possible, to put them through the motions. */

// noinspection FunctionTooLongJS
describe('IV/PromiseContractFunction - AsyncFunctions', function () {
  async function fibonacciImpl (n) {
    if (n <= 1) {
      return n
    }
    const result = await Promise.all([fibonacci(n - 1), fibonacci(n - 2)])
    return result[0] + result[1]
  }

  const fibonacci = new PromiseContract({
    pre: [Number.isInteger, n => n >= 0],
    post: [
      function () {
        return Number.isInteger(PromiseContract.outcome(arguments))
      },
      function (n) {
        return n !== 0 || PromiseContract.outcome(arguments) === 0
      },
      function (n) {
        return n !== 1 || PromiseContract.outcome(arguments) === 1
      },
      // don't refer to a specific implementation ("fibonacci") in the Contract!
      async function (n) {
        if (n < 2) {
          return true
        }
        const results = await Promise.all([
          PromiseContract.callee(arguments)(n - 1),
          PromiseContract.callee(arguments)(n - 2)
        ])
        return PromiseContract.outcome(arguments) === results[0] + results[1]
      }
    ]
  }).implementation(fibonacciImpl)

  const wrongParameter = 4
  const wrongResult = -3

  const fibonacciWrong = fibonacci.contract.implementation(async function fWrong (n) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // noinspection IfStatementWithTooManyBranchesJS
        if (n === 0) {
          resolve(0)
        } else if (n === 1) {
          resolve(1)
        } else if (n === 4) {
          resolve(-3) // wrong!
        } else {
          try {
            const results = await Promise.all([fibonacciWrong(n - 1), fibonacciWrong(n - 2)])
            resolve(results[0] + results[1])
          } catch (err) {
            reject(err)
          }
        }
      }, 0)
    })
  })

  const integerMessage = 'n must be integer'
  const positiveMessage = 'n must be positive'
  const overflowMessage = 'no overflow'

  // noinspection JSUnresolvedFunction, MagicNumberJS
  const defensiveIntegerSum = new PromiseContract({
    post: [
      (n, result) => Number.isInteger(result),
      (n, result) => result >= 0,
      (n, result) => n !== 0 || result === 0,
      async (n, result, sum) => {
        if (n === 0) {
          return true
        }
        const nMinusOneSum = await sum(n - 1)
        return result === nMinusOneSum + n
      }
    ],
    // no fast exceptions with async functions
    exception: [
      function () {
        return PromiseContract.outcome(arguments) instanceof Error
      },
      function () {
        return [integerMessage, positiveMessage, overflowMessage].includes(PromiseContract.outcome(arguments).message)
      },
      (n, exc) => exc.message !== integerMessage || !Number.isInteger(n),
      (n, exc) => exc.message !== positiveMessage || n < 0,
      (n, exc, sum) => exc.message !== overflowMessage || sum(n - 1).then(nMinusOneSum => 20 - n <= nMinusOneSum)
      // 20, because MAX_SAFE_INTEGER takes too long
    ]
  }).implementation(async n => {
    if (!Number.isInteger(n)) {
      throw new Error(integerMessage)
    }
    if (n < 0) {
      throw new Error(positiveMessage)
    }
    // we are not obliged to throw an overflow message (but then the postcondition will fail)
    let count = 0
    let result = 0
    while (count < n) {
      count++
      result += count
    }
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(result)
      }, 0)
    })
  })

  const wrongException = new Error('this message is wrong') // will be thrown in error

  const fastDefensiveIntegerSumWrong = defensiveIntegerSum.contract.implementation(async n => {
    if (Number.isInteger(n)) {
      throw wrongException
    } // wrong
    if (n >= 0) {
      throw wrongException
    } // wrong
    return (n * (n + 1)) / 2
  })

  const defensiveIntegerSumWrong = defensiveIntegerSum.contract.implementation(async () => {
    throw wrongException // wrong
  })

  const defensiveSumFastExcParameter = Math.PI
  const defensiveSumRejectParameter = -5
  const exceptionParameter = 5

  const resultWhenMetaError = 'This is the result or exception when we get a meta error'

  async function callAndExpectRejection (self, func, parameter, expectException) {
    try {
      if (!self) {
        // noinspection JSUnusedAssignment
        await func(parameter)
      } else {
        // noinspection JSUnusedAssignment
        await func.call(self, parameter)
      }
      true.should.be.false()
    } catch (rejection) {
      testUtil.log('' + rejection)
      rejection.should.be.ok()
      const common =
        rejection instanceof ConditionMetaError
          ? conditionMetaErrorCommon
          : /* prettier-ignore */ rejection instanceof PreconditionViolation
            // resolves infighting between prettier and standard
            ? preconditionViolationCommon
            : rejection instanceof PostconditionViolation
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
      // important, because an implementation might have multiple exit points, and this would report which exit point
      // failed the contract. But we cannot create a stacktrace to that. We only can use our 'contractFunction' wrapper
      // for the stack trace, and it makes no sense to point inside, or to that internal function. So the best we can
      // do is to point to where the contract function is called. The same applies to Meta errors (in conditions),
      // since we cannot create a stack trace that points in the condition. The caused by probably will for meta errors,
      // but there is no such thing for pre-, post- or exception conditions.
      if (testUtil.environment !== 'safari') {
        /* Because it is in the event loop sometimes; this is not our code; we have to show something, but for Promises,
           it is largely irrelevant.
         In order:
         - chrome since v73 for Promise resolutions
         - sync
         - node 8
         - headless chrome, chrome (x 4)
         - Firefox
         - Edge
         - node 6
       */
        const expectReference = /\[\[internal]]|callAndExpectRejection|anonymous|conditionResult\.catch\.then|conditionResult\.catch\.err|promise.catch.then|promise.catch.rejection|about:blank|Anonymous|runMicrotasksCallback/
        stackLines[0].should.match(expectReference)
      }
    }
  }

  function failsOnPreconditionViolation (self, func, parameter, violatedCondition) {
    it('fails when a precondition is violated - ' + self + ' - ' + parameter, async function () {
      await callAndExpectRejection(self, func, parameter, exception => {
        exception.should.be.an.instanceof(PreconditionViolation)
        // noinspection JSUnresolvedVariable
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

  async function failsOnMetaError (self, functionWithAMetaError, conditionWithAMetaError, extraArgs) {
    const param = 'a parameter'
    await callAndExpectRejection(self, functionWithAMetaError, param, exception => {
      exception.should.be.an.instanceof(ConditionMetaError)
      // noinspection JSUnresolvedVariable
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

  function expectNotAPromisePostProperties (self, contractFunction, exception) {
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

  function expectPostProperties (self, contractFunction, exception) {
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

  function expectExceptionProperties (self, contractFunction, exception) {
    exceptionConditionViolationCommon.expectProperties(
      exception,
      ExceptionConditionViolation,
      contractFunction,
      contractFunction.contract.exception[1], // message is unexpected
      self,
      [exceptionParameter],
      wrongException
    )
  }

  const argumentsOfWrongType = [undefined, null, 'bar']
  const self = {
    aProperty: 'a property value',
    fibonacci: fibonacci.contract.implementation(async function (n) {
      if (n <= 1) {
        return n
      }
      const results = await Promise.all([this.fibonacci(n - 1), this.fibonacci(n - 2)])
      return results[0] + results[1]
    }),
    fibonacciWrong: fibonacci.contract.implementation(async function fWrong (n) {
      const thisSelf = this
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          // noinspection IfStatementWithTooManyBranchesJS
          if (n === 0) {
            resolve(0)
          } else if (n === 1) {
            resolve(1)
          } else if (n === 4) {
            resolve(-3) // wrong!
          } else {
            try {
              const results = await Promise.all([thisSelf.fibonacciWrong(n - 1), thisSelf.fibonacciWrong(n - 2)])
              resolve(results[0] + results[1])
            } catch (err) {
              reject(err)
            }
          }
        }, 0)
      })
    }),
    defensiveIntegerSum: defensiveIntegerSum,
    fastDefensiveIntegerSumWrong: fastDefensiveIntegerSumWrong,
    defensiveIntegerSumWrong: defensiveIntegerSumWrong
  }

  describe('#name', function () {
    it('fibonacci has the right name', function () {
      fibonacciImpl.name.should.equal('fibonacciImpl')
      testUtil.log('fibonacci.name: %s', fibonacci.name)
      fibonacci.name.should.equal(`${AbstractContract.namePrefix} ${fibonacciImpl.name}`)
    })
    it('self.fibonacci has the right name', function () {
      testUtil.log(`self.fibonacci.name: ${self.fibonacci.name}`)
      self.fibonacci.name.should.containEql(`${AbstractContract.namePrefix} async function (n) {`)
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
        if (testUtil.environment !== 'safari') {
          a.f.name.should.containEql(`${AbstractContract.namePrefix} async n => {`)
        } else {
          a.f.name.should.containEql(`${AbstractContract.namePrefix} async function n => {`)
        }
      })
    })
  })

  describe('correct', function () {
    it("doesn't interfere when the implementation is correct", async function () {
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      await fibonacci(5)
    })
    it("doesn't interfere when the implementation is correct, testing conditions", async function () {
      fibonacci.contract.verifyPostconditions = true
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      await fibonacci(5)
      fibonacci.contract.verifyPostconditions = false
    })
    it("doesn't interfere when the implementation is correct too", async function () {
      // noinspection MagicNumberJS
      const oneHundred = 100
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      await defensiveIntegerSum(oneHundred)
    })
    it("doesn't interfere when the implementation is correct too, testing conditions", async function () {
      // noinspection MagicNumberJS
      this.timeout(5000)
      // noinspection MagicNumberJS
      const oneHundred = 100
      defensiveIntegerSum.contract.verifyPostconditions = true
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      await defensiveIntegerSum(oneHundred)
      defensiveIntegerSum.contract.verifyPostconditions = false
    })
    it('works with a method that is correct', async function () {
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      await self.fibonacci(5)
    })
    it('works with a method that is correct, testing conditions', async function () {
      self.fibonacci.contract.verifyPostconditions = true
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      await self.fibonacci(5)
      self.fibonacci.contract.verifyPostconditions = false
    })
    it('works with a method that is correct too', async function () {
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      await self.defensiveIntegerSum(5)
    })
    it('works with a method that is correct too, testing conditions', async function () {
      self.defensiveIntegerSum.contract.verifyPostconditions = true
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      await self.defensiveIntegerSum(5)
      self.defensiveIntegerSum.contract.verifyPostconditions = false
    })
    it('works with a defensive function, rejection', async function () {
      await defensiveIntegerSum(defensiveSumFastExcParameter).should.be.rejectedWith(Error, { message: integerMessage })
    })
    it('works with a defensive function, rejection, testing conditions', async function () {
      defensiveIntegerSum.contract.verifyPostconditions = true
      try {
        await defensiveIntegerSum(defensiveSumFastExcParameter)
        false.should.be.true()
      } catch (err) {
        err.should.be.an.Error()
        err.message.should.containEql(integerMessage)
      } finally {
        defensiveIntegerSum.contract.verifyPostconditions = false
      }
    })
    it('works with a defensive method, rejection', async function () {
      await self
        .defensiveIntegerSum(defensiveSumFastExcParameter)
        .should.be.rejectedWith(Error, { message: integerMessage })
    })
    it('works with a defensive method, rejection, testing conditions', async function () {
      self.defensiveIntegerSum.contract.verifyPostconditions = true
      await self
        .defensiveIntegerSum(defensiveSumFastExcParameter)
        .should.be.rejectedWith(Error, { message: integerMessage })
      self.defensiveIntegerSum.contract.verifyPostconditions = false
    })
    it('works with a defensive function, rejecting', async function () {
      try {
        await defensiveIntegerSum(defensiveSumRejectParameter)
        true.should.be.false()
      } catch (err) {
        err.should.be.an.Error()
        err.message.should.equal(positiveMessage)
      }
    })
    it('works with a defensive function, rejecting, testing conditions', async function () {
      defensiveIntegerSum.contract.verifyPostconditions = true
      try {
        await defensiveIntegerSum(defensiveSumRejectParameter)
        true.should.be.false()
      } catch (err) {
        testUtil.log(err)
        err.should.be.an.Error()
        err.message.should.equal(positiveMessage)
      } finally {
        defensiveIntegerSum.contract.verifyPostconditions = false
      }
    })
    it('works with a defensive method, rejecting', async function () {
      try {
        await self.defensiveIntegerSum(defensiveSumRejectParameter)
        true.should.be.false()
      } catch (err) {
        err.should.be.an.Error()
        err.message.should.equal(positiveMessage)
      }
    })
    it('works with a defensive method, rejecting, testing conditions', async function () {
      self.defensiveIntegerSum.contract.verifyPostconditions = true
      try {
        await self.defensiveIntegerSum(defensiveSumRejectParameter)
        true.should.be.false()
      } catch (err) {
        testUtil.log(err)
        err.should.be.an.Error()
        err.message.should.equal(positiveMessage)
      } finally {
        defensiveIntegerSum.contract.verifyPostconditions = false
      }
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
      it('does not fail on a precondition violation when verify is false', async function () {
        fibonacci.contract.verify = false
        // eslint-disable-next-line
        await fibonacci(-5)
        fibonacci.contract.verify = true
      })
    })
    describe('meta-error', function () {
      it('fails with a meta-error when a precondition is kaput', async function () {
        // noinspection JSUnresolvedFunction, JSUnresolvedVariable
        await failsOnMetaError(
          undefined,
          contractWithAFailingPre.implementation(() => resultWhenMetaError),
          contractWithAFailingPre.pre[0]
        )
      })
      it('fails with a meta-error when a precondition is kaput when it is a method', async function () {
        // noinspection JSUnresolvedFunction
        const self = {
          method: contractWithAFailingPre.implementation(() => resultWhenMetaError)
        }
        // noinspection JSUnresolvedVariable
        await failsOnMetaError(self, self.method, contractWithAFailingPre.pre[0])
      })
      it('does not fail when a precondition is kaput when verify is false', async function () {
        const expectedResult = 'expected result'
        contractWithAFailingPre.verify = false
        const result = await contractWithAFailingPre.implementation(() => Promise.resolve(expectedResult))()
        contractWithAFailingPre.verify = true
        result.should.equal(expectedResult)
      })
    })
  })

  describe('promise condition', function () {
    describe('violation', function () {
      it('fails when it does not return a Promise', async function () {
        const doesNotReturnAPromise = fibonacci.contract.implementation(() => 'some result')
        doesNotReturnAPromise.contract.verifyPostconditions = true
        await callAndExpectRejection(
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
      it('fails when a simple postcondition is violated', async function () {
        fibonacciWrong.contract.verifyPostconditions = true
        try {
          await callAndExpectRejection(
            undefined,
            fibonacciWrong,
            wrongParameter,
            expectPostProperties.bind(undefined, undefined, fibonacciWrong)
          )
        } finally {
          fibonacciWrong.contract.verifyPostconditions = false
        }
      })
      it('fails when a simple postcondition is violated when it is a method', async function () {
        self.fibonacciWrong.contract.verifyPostconditions = true
        try {
          await callAndExpectRejection(
            self,
            self.fibonacciWrong,
            wrongParameter,
            expectPostProperties.bind(undefined, self, self.fibonacciWrong)
          )
        } finally {
          fibonacciWrong.contract.verifyPostconditions = false
        }
      })
      it('fails when a postcondition is violated in a called function with a nested Violation', async function () {
        const parameter = 6
        fibonacciWrong.contract.verifyPostconditions = true
        try {
          await callAndExpectRejection(
            undefined,
            fibonacciWrong,
            parameter,
            expectPostProperties.bind(undefined, undefined, fibonacciWrong)
          )
        } finally {
          fibonacciWrong.contract.verifyPostconditions = false
        }
      })
      it('fails when a postcondition is violated in a called function with a nested Violation when it is a method', async function () {
        const parameter = 6
        self.fibonacciWrong.contract.verifyPostconditions = true
        try {
          await callAndExpectRejection(
            self,
            self.fibonacciWrong,
            parameter,
            expectPostProperties.bind(undefined, self, self.fibonacciWrong)
          )
        } finally {
          fibonacciWrong.contract.verifyPostconditions = false
        }
      })
      it('does not fail when a simple postcondition is violated when verify is false', async function () {
        fibonacciWrong.contract.verify = false
        fibonacciWrong.contract.verifyPostconditions = true
        const result = await fibonacciWrong(wrongParameter)
        fibonacciWrong.contract.verifyPostconditions = false
        fibonacciWrong.contract.verify = true
        result.should.equal(wrongResult)
      })
      it('does not fail when a simple postcondition is violated when verifyPostcondition is false', async function () {
        const result = await fibonacciWrong(wrongParameter)
        result.should.equal(wrongResult)
      })
    })
    describe('meta-error', function () {
      describe('fast', function () {
        const contractWithAFailingPost = new PromiseContract({
          post: [cases.intentionallyFailingArrow]
        })

        it('fails with a meta-error when a postcondition is kaput', async function () {
          // noinspection JSUnresolvedFunction
          const implementation = contractWithAFailingPost.implementation(async () => resultWhenMetaError)
          implementation.contract.verifyPostconditions = true
          // noinspection JSUnresolvedVariable
          await failsOnMetaError(undefined, implementation, contractWithAFailingPost.post[0], [
            resultWhenMetaError,
            implementation
          ])
        })
        it('fails with a meta-error when a postcondition is kaput when it is a method', async function () {
          // noinspection JSUnresolvedFunction
          const self = {
            method: contractWithAFailingPost.implementation(async () => resultWhenMetaError)
          }
          self.method.contract.verifyPostconditions = true

          // noinspection JSUnresolvedVariable
          await failsOnMetaError(self, self.method, contractWithAFailingPost.post[0], [
            resultWhenMetaError,
            self.method.bind(self)
          ])
        })
        it('does not fail when a postcondition is kaput when verify is false', async function () {
          const expectedResult = 'expected result'
          contractWithAFailingPre.verify = false
          contractWithAFailingPre.verifyPostconditions = true
          const result = await contractWithAFailingPost.implementation(async () => expectedResult)()
          contractWithAFailingPre.verifyPostconditions = false
          contractWithAFailingPre.verify = true
          result.should.equal(expectedResult)
        })
        it('does not fail when a postcondition is kaput when verifyPostcondition is false', async function () {
          const expectedResult = 'expected result'
          const result = await contractWithAFailingPost.implementation(async () => expectedResult)()
          result.should.equal(expectedResult)
        })
      })

      describe('reject', function () {
        const contractWithARejectingPost = new PromiseContract({
          post: [cases.intentionallyFailingAsyncArrow]
        })

        it('fails with a meta-error when a postcondition is kaput', async function () {
          // noinspection JSUnresolvedFunction
          const implementation = contractWithARejectingPost.implementation(async () => resultWhenMetaError)
          implementation.contract.verifyPostconditions = true
          // noinspection JSUnresolvedVariable
          await failsOnMetaError(undefined, implementation, contractWithARejectingPost.post[0], [
            resultWhenMetaError,
            implementation
          ])
        })
        it('fails with a meta-error when a postcondition is kaput when it is a method', async function () {
          // noinspection JSUnresolvedFunction
          const self = {
            method: contractWithARejectingPost.implementation(async () => resultWhenMetaError)
          }
          self.method.contract.verifyPostconditions = true

          // noinspection JSUnresolvedVariable
          await failsOnMetaError(self, self.method, contractWithARejectingPost.post[0], [
            resultWhenMetaError,
            self.method.bind(self)
          ])
        })
        it('does not fail when a postcondition is kaput when verify is false', async function () {
          const expectedResult = 'expected result'
          contractWithAFailingPre.verify = false
          contractWithAFailingPre.verifyPostconditions = true
          const result = await contractWithARejectingPost.implementation(async () => expectedResult)()
          contractWithAFailingPre.verifyPostconditions = false
          contractWithAFailingPre.verify = true
          result.should.equal(expectedResult)
        })
        it('does not fail when a postcondition is kaput when verifyPostcondition is false', async function () {
          const expectedResult = 'expected result'
          const result = await contractWithARejectingPost.implementation(async () => expectedResult)()
          result.should.equal(expectedResult)
        })
      })
    })
  })

  const anExceptedException = 'This exception is expected.'

  // no fast exceptions possible

  describe('exception condition', function () {
    describe('violation', function () {
      it('fails when a simple exception condition is violated', async function () {
        defensiveIntegerSumWrong.contract.verifyPostconditions = true
        try {
          await callAndExpectRejection(
            undefined,
            defensiveIntegerSumWrong,
            exceptionParameter,
            expectExceptionProperties.bind(undefined, undefined, defensiveIntegerSumWrong)
          )
        } finally {
          defensiveIntegerSumWrong.contract.verifyPostconditions = false
        }
      })
      it('fails when a simple exception condition is violated when it is a method', async function () {
        self.defensiveIntegerSumWrong.contract.verifyPostconditions = true
        try {
          await callAndExpectRejection(
            self,
            self.defensiveIntegerSumWrong,
            exceptionParameter,
            expectExceptionProperties.bind(undefined, self, self.defensiveIntegerSumWrong)
          )
        } finally {
          defensiveIntegerSumWrong.contract.verifyPostconditions = false
        }
      })
      it('does not fail when a exception condition is violated when verify is false', async function () {
        defensiveIntegerSumWrong.contract.verify = false
        defensiveIntegerSumWrong.contract.verifyPostconditions = true
        try {
          await defensiveIntegerSumWrong(exceptionParameter)
          true.should.be.false()
        } catch (err) {
          err.should.equal(wrongException)
        } finally {
          defensiveIntegerSumWrong.contract.verifyPostconditions = false
          defensiveIntegerSumWrong.contract.verify = true
        }
      })
      it('does not fail when a simple exception condition is violated when verifyPostcondition is false', async function () {
        try {
          await defensiveIntegerSumWrong(exceptionParameter)
          true.should.be.false()
        } catch (err) {
          err.should.equal(wrongException)
        }
      })
    })
    describe('meta-error', function () {
      // noinspection LocalVariableNamingConventionJS
      const contractWithAFailingExceptionCondition = new PromiseContract({
        exception: [cases.intentionallyFailingArrow]
      })

      it('fails with a meta-error when an exception condition is kaput', async function () {
        // noinspection JSUnresolvedFunction
        const implementation = contractWithAFailingExceptionCondition.implementation(async function reject () {
          throw anExceptedException
        })
        implementation.contract.verifyPostconditions = true
        // noinspection JSUnresolvedVariable
        await failsOnMetaError(undefined, implementation, contractWithAFailingExceptionCondition.exception[0], [
          anExceptedException,
          implementation
        ])
      })
      it('fails with a meta-error when an exception condition is kaput when it is a method', async function () {
        // noinspection JSUnresolvedFunction
        const self = {
          method: contractWithAFailingExceptionCondition.implementation(async () => {
            throw anExceptedException
          })
        }
        self.method.contract.verifyPostconditions = true

        // noinspection JSUnresolvedVariable
        await failsOnMetaError(self, self.method, contractWithAFailingExceptionCondition.exception[0], [
          anExceptedException,
          self.method.bind(self)
        ])
      })
      it('does not fail when an exception condition is kaput when verify is false', async function () {
        contractWithAFailingExceptionCondition.verify = false
        contractWithAFailingExceptionCondition.verifyPostconditions = true
        try {
          await contractWithAFailingExceptionCondition.implementation(async () => {
            throw anExceptedException
          })()
          true.should.be.false()
        } catch (err) {
          contractWithAFailingExceptionCondition.verifyPostconditions = false
          contractWithAFailingExceptionCondition.verify = true
          err.should.equal(anExceptedException)
        }
      })
      it('does not fail when an exception condition is kaput when verifyPostcondition is false', async function () {
        try {
          await contractWithAFailingExceptionCondition.implementation(async () => {
            throw anExceptedException
          })()
          true.should.be.false()
        } catch (err) {
          contractWithAFailingExceptionCondition.verifyPostconditions = false
          contractWithAFailingExceptionCondition.verify = true
          err.should.equal(anExceptedException)
        }
      })
    })
  })
})
