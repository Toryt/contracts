/*
 Copyright 2016 - 2018 by Jan Dockx

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
const must = require('must')
const os = require('os')

/* This test is not included in Contract.generatePrototypeMethodsDescriptions, because it is
     specific for ContractFunction: we test extensively whether the contract function works as expected here.
     This tests the behavior of the resulting contract function. The tests in
     Contract.generatePrototypeMethodsDescriptions tests the state postconditions only. */

// noinspection FunctionTooLongJS
describe('IV/PromiseContractFunction', function () {
  let fibonacci

  function fibonacciImpl (n) {
    return n <= 1
      ? Promise.resolve(n)
      : Promise.all([fibonacci(n - 1), fibonacci(n - 2)]).then(function (result) { return result[0] + result[1] })
  }

  // noinspection JSUnresolvedFunction
  fibonacci = new PromiseContract({
    pre: [
      Number.isInteger,
      n => n >= 0
    ],
    post: [
      (n, result) => Number.isInteger(result),
      (n, result) => n !== 0 || result === 0,
      (n, result) => n !== 1 || result === 1,
      // don't refer to a specific implementation ("fibonacci") in the Contract!
      (n, result, fibonacci) => n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2)
    ]
  }).implementation(fibonacciImpl)

  const wrongParameter = 4
  const wrongResult = -3

  const fibonacciWrong = fibonacci.contract.implementation(function fWrong (n) {
    return new Promise((resolve) => {
      setTimeout(
        () => {
          // noinspection IfStatementWithTooManyBranchesJS
          if (n === 0) {
            resolve(0)
          } else if (n === 1) {
            resolve(1)
          } else if (n === 4) {
            resolve(-3) // wrong!
          } else {
            resolve(Promise.all([
              fibonacciWrong(n - 1),
              fibonacciWrong(n - 2)
            ]).then(results => results[0] + results[1]))
          }
        },
        0
      )
    })
  })

  const integerMessage = 'n must be integer'
  const positiveMessage = 'n must be positive'

  // noinspection JSUnresolvedFunction
  const defensiveIntegerSum = new PromiseContract({
    post: [
      (n, result) => Number.isInteger(result),
      (n, result) => result >= 0,
      (n, result) => n !== 0 || result === 0,
      (n, result, sum) => n === 0 || result === sum(n - 1) + n
    ],
    fastException: [
      (n, exc) => exc instanceof Error && exc.message === integerMessage && !Number.isInteger(n)
    ],
    exception: [
      (n, exc) => exc instanceof Error && exc.message === positiveMessage && n < 0
    ]
  }).implementation(n => {
    if (!Number.isInteger(n)) { throw new Error(integerMessage) }
    if (n < 0) { return Promise.reject(new Error(positiveMessage)) }
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
    if (Number.isInteger(n)) { throw wrongException } // wrong
    if (n >= 0) { return Promise.reject(wrongException) } // wrong
    return Promise.resolve((n * (n + 1)) / 2)
  })

  const fastExceptionParameter = -10
  const rejectionParameter = Math.PI

  const resultWhenMetaError = 'This is the result or exception when we get a meta error'

  function callAndExpectFastException (self, func, parameter, expectException, recursive) {
    // eslint-disable-next-line no-unused-vars
    let result
    let endsNominally = false
    try {
      if (!self) {
        // noinspection JSUnusedAssignment
        result = func(parameter)
      } else {
        // noinspection JSUnusedAssignment
        result = func.call(self, parameter)
      }
      endsNominally = true
    } catch (exception) {
      testUtil.log('' + exception)
      exception.must.be.truthy()
      const common = exception instanceof ConditionMetaError ? conditionMetaErrorCommon
        : exception instanceof PreconditionViolation ? preconditionViolationCommon
          : exception instanceof PostconditionViolation ? postconditionViolationCommon
            : exception instanceof ExceptionConditionViolation ? exceptionConditionViolationCommon
              : null
      common.must.be.truthy()
      common.expectInvariants(exception)
      exception.message.must.contain(func.name)
      const stack = exception.stack
      stack.must.contain(func.name)
      testUtil.showStack(exception)
      expectException(exception)
      const stackLines = stack.split(os.EOL)
      const callStackLine = stackLines.indexOf('call stack:')
      callStackLine.must.be.at.least(0)
      stackLines.splice(0, callStackLine + 1)
      stackLines.length.must.be.at.least(1)
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
        if (!recursive) {
          stackLines[0].must.contain('callAndExpectFastException')
        } else {
          stackLines[0].must.contain(recursive)
          stackLines[2].must.contain(recursive)
          stackLines[4].must.contain('callAndExpectFastException')
        }
      }
    }
    endsNominally.must.be.false()
  }

  function callAndExpectRejection (self, func, parameter, expectException, recursive) {
    // eslint-disable-next-line no-unused-vars
    let promise
    if (!self) {
      // noinspection JSUnusedAssignment
      promise = func(parameter)
    } else {
      // noinspection JSUnusedAssignment
      promise = func.call(self, parameter)
    }
    return promise
      .catch(rejection => {
        testUtil.log('' + rejection)
        rejection.must.be.truthy()
        const common = rejection instanceof ConditionMetaError
          ? conditionMetaErrorCommon
          : rejection instanceof PostconditionViolation
            ? postconditionViolationCommon
            : rejection instanceof ExceptionConditionViolation
              ? exceptionConditionViolationCommon
              : null
        common.must.be.truthy()
        common.expectInvariants(rejection)
        rejection.message.must.contain(func.name)
        const stack = rejection.stack
        stack.must.contain(func.name)
        testUtil.showStack(rejection)
        expectException(rejection)
        const stackLines = stack.split(os.EOL)
        const callStackLine = stackLines.indexOf('call stack:')
        callStackLine.must.be.at.least(0)
        stackLines.splice(0, callStackLine + 1)
        stackLines.length.must.be.at.least(1)
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
          if (!recursive) {
            stackLines[0].must.contain('callAndExpectRejection')
          } else {
            stackLines[0].must.contain(recursive)
            stackLines[2].must.contain(recursive)
            stackLines[4].must.contain('callAndExpectRejection')
          }
        }
      })
      .then(() => {
        true.must.be.false()
      })
  }

  function failsOnPreconditionViolation (self, func, parameter, violatedCondition) {
    it('fails when a precondition is violated - ' + self + ' - ' + parameter, function () {
      callAndExpectFastException(self, func, parameter, exception => {
        exception.must.be.an.instanceof(PreconditionViolation)
        // noinspection JSUnresolvedVariable
        exception.condition.must.equal(violatedCondition)
        if (!self) {
          must(exception.self).be.falsy()
        } else {
          exception.self.must.equal(self)
        }
        must(exception.args[0]).equal(parameter)
      })
    })
  }

  const intentionalError = new Error('This condition intentionally fails.')

  const contractWithAFailingPre = new PromiseContract(
    {
      pre: [function () { throw intentionalError }]
    }
  )

  function failsOnMetaErrorFast (self, functionWithAMetaError, conditionWithAMetaError, extraArgs) {
    const param = 'a parameter'
    callAndExpectFastException(self, functionWithAMetaError, param, exception => {
      exception.must.be.an.instanceof(ConditionMetaError)
      // noinspection JSUnresolvedVariable
      exception.condition.must.equal(conditionWithAMetaError)
      if (!self) {
        must(exception.self).be.falsy()
      } else {
        exception.self.must.equal(self)
      }
      exception.args.length.must.equal(extraArgs ? extraArgs.length + 1 : 1)
      exception.args[0].must.equal(param)
      if (extraArgs) {
        exception.args[1].must.equal(extraArgs[0])
        AbstractContract.isAContractFunction(exception.args[2]).must.be.true()
      }
      exception.error.must.equal(intentionalError)
    })
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

  function expectFastExceptionProperties (self, contractFunction, exception) {
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

  const argumentsOfWrongType = [undefined, null, 'bar']
  const self = {
    aProperty: 'a property value',
    fibonacci: fibonacci.contract.implementation(function (n) {
      const self = this
      return n <= 1
        ? Promise.resolve(n)
        : Promise.all([self.fibonacci(n - 1), self.fibonacci(n - 2)])
          .then(function (result) { return result[0] + result[1] })
    }),
    fibonacciWrong: fibonacci.contract.implementation(function fWrong (n) {
      return new Promise((resolve) => {
        setTimeout(
          () => {
            // noinspection IfStatementWithTooManyBranchesJS
            if (n === 0) {
              resolve(0)
            } else if (n === 1) {
              resolve(1)
            } else if (n === 4) {
              resolve(-3) // wrong!
            } else {
              resolve(Promise.all([
                self.fibonacciWrong(n - 1),
                self.fibonacciWrong(n - 2)
              ]).then(results => results[0] + results[1]))
            }
          },
          0
        )
      })
    }),
    defensiveIntegerSum: defensiveIntegerSum,
    fastDefensiveIntegerSumWrong: fastDefensiveIntegerSumWrong
  }

  describe('#name', function () {
    it('fibonacci has the right name', function () {
      fibonacciImpl.name.must.equal('fibonacciImpl')
      testUtil.log(`fibonacci.name: %s`, fibonacci.name)
      fibonacci.name.must.equal(`${AbstractContract.namePrefix} ${fibonacciImpl.name}`)
    })
    it(`self.fibonacci has the right name`, function () {
      testUtil.log(`self.fibonacci.name: ${self.fibonacci.name}`)
      self.fibonacci.name.must.contain(`${AbstractContract.namePrefix} function (n) {`)
    })
    it('fibonacciWrong has the right name', function () {
      testUtil.log(`fibonacciWrong.name: %s`, fibonacciWrong.name)
      fibonacciWrong.name.must.equal(`${AbstractContract.namePrefix} fWrong`)
    })
    it('self.fibonacciWrong has the right name', function () {
      testUtil.log(`self.fibonacciWrong.name: %s`, self.fibonacciWrong.name)
      self.fibonacciWrong.name.must.equal(`${AbstractContract.namePrefix} fWrong`)
    })
    const anonymousContractFunctions = [
      {name: 'defensiveIntegerSum', f: defensiveIntegerSum},
      {name: 'fastDefensiveIntegerSumWrong', f: fastDefensiveIntegerSumWrong},
      {name: 'self.defensiveIntegerSum', f: self.defensiveIntegerSum},
      {name: 'self.fastDefensiveIntegerSumWrong', f: self.fastDefensiveIntegerSumWrong}
    ]
    anonymousContractFunctions.forEach(a => {
      it(`${a.name} has the right name`, function () {
        testUtil.log(`${a.name}.name: ${a.f.name}`)
        a.f.name.must.contain(`${AbstractContract.namePrefix} n => {`)
      })
    })
  })
  it("doesn't interfere when the implementation is correct", function () {
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    return fibonacci(5)
  })
  it("doesn't interfere when the implementation is correct too", function () {
    // noinspection MagicNumberJS
    const oneHundred = 100
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    return defensiveIntegerSum(oneHundred)
  })
  it('works with a method that is correct', function () {
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    return self.fibonacci(5)
  })
  it('works with a method that is correct too', function () {
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    return self.defensiveIntegerSum(5)
  })
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
    // eslint-disable-next-line
    return fibonacci(-5).then(() => {
      fibonacci.contract.verify = true
    })
  })
  it('fails with a meta-error when a precondition is kaput', function () {
    // noinspection JSUnresolvedFunction, JSUnresolvedVariable
    failsOnMetaErrorFast(
      undefined,
      contractWithAFailingPre.implementation(() => resultWhenMetaError),
      contractWithAFailingPre.pre[0]
    )
  })
  it('fails with a meta-error when a precondition is kaput when it is a method', function () {
    // noinspection JSUnresolvedFunction
    const self = {
      method: contractWithAFailingPre.implementation(() => resultWhenMetaError)
    }

    // noinspection JSUnresolvedVariable
    failsOnMetaErrorFast(
      self,
      self.method,
      contractWithAFailingPre.pre[0]
    )
  })
  it('does not fail when a precondition is kaput when verify is false', function () {
    const expectedResult = 'expected result'
    contractWithAFailingPre.verify = false
    return contractWithAFailingPre
      .implementation(() => Promise.resolve(expectedResult))()
      .then(function (result) {
        contractWithAFailingPre.verify = true
        result.must.equal(expectedResult)
      })
  })
  const contractWithAFailingPost = new PromiseContract({
    post: [() => { throw intentionalError }]
  })
  it.skip('fails with a meta-error when a postcondition is kaput', function () {
    // noinspection JSUnresolvedFunction
    const implementation = contractWithAFailingPost.implementation(function () { return resultWhenMetaError })
    implementation.contract.verifyPostconditions = true
    // noinspection JSUnresolvedVariable
    failsOnMetaErrorFast(
      undefined,
      implementation,
      contractWithAFailingPost.post[0],
      [resultWhenMetaError, implementation]
    )
  })
  it.skip('fails with a meta-error when a postcondition is kaput when it is a method', function () {
    // noinspection JSUnresolvedFunction
    const self = {
      method: contractWithAFailingPost.implementation(() => resultWhenMetaError)
    }
    self.method.contract.verifyPostconditions = true

    // noinspection JSUnresolvedVariable
    failsOnMetaErrorFast(
      self,
      self.method,
      contractWithAFailingPost.post[0],
      [resultWhenMetaError, self.method.bind(self)]
    )
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
        result.must.equal(expectedResult)
      })
  })
  it('does not fail when a postcondition is kaput when verifyPostcondition is false', function () {
    const expectedResult = 'expected result'
    return contractWithAFailingPost
      .implementation(() => Promise.resolve(expectedResult))()
      .then(result => {
        result.must.equal(expectedResult)
      })
  })
  // noinspection LocalVariableNamingConventionJS
  const contractWithAFailingFastExceptionCondition = new PromiseContract({
    fastException: [() => { throw intentionalError }]
  })
  it('fails with a meta-error when a fast exception condition is kaput', function () {
    const anExceptedException = 'This exception is expected.'
    // noinspection JSUnresolvedFunction
    const implementation = contractWithAFailingFastExceptionCondition.implementation(() => { throw anExceptedException })
    implementation.contract.verifyPostconditions = true
    // noinspection JSUnresolvedVariable
    failsOnMetaErrorFast(
      undefined,
      implementation,
      contractWithAFailingFastExceptionCondition.fastException[0],
      [anExceptedException, implementation]
    )
  })
  it('fails with a meta-error when a fast exception condition is kaput when it is a method', function () {
    const anExceptedException = 'This exception is expected.'
    // noinspection JSUnresolvedFunction
    const self = {
      method: contractWithAFailingFastExceptionCondition.implementation(() => { throw anExceptedException })
    }
    self.method.contract.verifyPostconditions = true

    // noinspection JSUnresolvedVariable
    failsOnMetaErrorFast(
      self,
      self.method,
      contractWithAFailingFastExceptionCondition.fastException[0],
      [anExceptedException, self.method.bind(self)]
    )
  })
  it('does not fail when a fast exception condition is kaput when verify is false', function () {
    const expectedResult = 'expected result'
    contractWithAFailingFastExceptionCondition.verify = false
    contractWithAFailingFastExceptionCondition.verifyPostconditions = true
    const result = contractWithAFailingFastExceptionCondition.implementation(() => expectedResult)()
    contractWithAFailingFastExceptionCondition.verifyPostconditions = false
    contractWithAFailingFastExceptionCondition.verify = true
    result.must.equal(expectedResult)
  })
  it('does not fail when a fast exception condition is kaput when verifyPostcondition is false', function () {
    const expectedResult = 'expected result'
    const result = contractWithAFailingFastExceptionCondition.implementation(() => expectedResult)()
    result.must.equal(expectedResult)
  })
  // MUDO repeat for exceptions

  it('fails when a simple postcondition is violated', function () {
    fibonacciWrong.contract.verifyPostconditions = true
    return callAndExpectRejection(undefined, fibonacciWrong, wrongParameter, expectPostProperties.bind(undefined, undefined, fibonacciWrong))
      .catch(() => { fibonacciWrong.contract.verifyPostconditions = false })
      .then(() => { fibonacciWrong.contract.verifyPostconditions = false })
  })
  it('fails when a simple postcondition is violated when it is a method', function () {
    self.fibonacciWrong.contract.verifyPostconditions = true
    return callAndExpectRejection(self, self.fibonacciWrong, wrongParameter, expectPostProperties.bind(undefined, self, self.fibonacciWrong))
      .catch(() => { fibonacciWrong.contract.verifyPostconditions = false })
      .then(() => { fibonacciWrong.contract.verifyPostconditions = false })
  })
  it('fails when a postcondition is violated in a called function with a nested Violation', function () {
    const parameter = 6
    fibonacciWrong.contract.verifyPostconditions = true
    return callAndExpectRejection(undefined, fibonacciWrong, parameter, expectPostProperties.bind(undefined, undefined, fibonacciWrong), 'fWrong')
      .catch(() => { fibonacciWrong.contract.verifyPostconditions = false })
      .then(() => { fibonacciWrong.contract.verifyPostconditions = false })
  })
  it('fails when a postcondition is violated in a called function with a nested Violation when it is a method', function () {
    const parameter = 6
    self.fibonacciWrong.contract.verifyPostconditions = true
    return callAndExpectRejection(self, self.fibonacciWrong, parameter, expectPostProperties.bind(undefined, self, self.fibonacciWrong), 'fWrong')
      .catch(() => { fibonacciWrong.contract.verifyPostconditions = false })
      .then(() => { fibonacciWrong.contract.verifyPostconditions = false })
  })
  it('does not fail when a simple postcondition is violated when verify is false', function () {
    fibonacciWrong.contract.verify = false
    fibonacciWrong.contract.verifyPostconditions = true
    // eslint-disable-next-line
    return fibonacciWrong(wrongParameter)
      .then(result => {
        fibonacciWrong.contract.verifyPostconditions = false
        fibonacciWrong.contract.verify = true
        result.must.equal(wrongResult)
      })
  })
  it('does not fail when a simple postcondition is violated when verifyPostcondition is false', function () {
    // eslint-disable-next-line
    return fibonacciWrong(wrongParameter)
      .then(result => {
        result.must.equal(wrongResult)
      })
  })

  it('works with a defensive function', function () {
    defensiveIntegerSum.contract.verifyPostconditions = true
    defensiveIntegerSum.bind(undefined, rejectionParameter).must.throw(Error, integerMessage)
    defensiveIntegerSum.contract.verifyPostconditions = false
  })
  it('works with a defensive method', function () {
    self.defensiveIntegerSum.contract.verifyPostconditions = true
    self.defensiveIntegerSum.bind(self, rejectionParameter).must.throw(Error, integerMessage)
    self.defensiveIntegerSum.contract.verifyPostconditions = false
  })

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
      return fastDefensiveIntegerSumWrong(fastExceptionParameter).catch(() => {
        fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
        fastDefensiveIntegerSumWrong.contract.verify = true
        true.must.be.false()
      }).then(() => {
        fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
        fastDefensiveIntegerSumWrong.contract.verify = true
        true.must.be.false()
      })
    } catch (err) {
      fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
      fastDefensiveIntegerSumWrong.contract.verify = true
      err.must.equal(wrongException)
    }
  })
  it('does not fail when a simple fast exception condition is violated when verifyPostcondition is false', function () {
    try {
      return fastDefensiveIntegerSumWrong(fastExceptionParameter)
        .catch(() => {
          true.must.be.false()
        })
        .then(() => {
          true.must.be.false()
        })
    } catch (err) {
      err.must.equal(wrongException)
    }
  })
  // MUDO repeat with exception
})
