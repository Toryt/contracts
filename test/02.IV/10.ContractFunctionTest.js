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
const util = require('../../lib/_private/util')
const Contract = require('../../lib/IV/Contract')
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
describe('IV/ContractFunction', function () {
  let fibonacci

  function fibonacciImpl (n) {
    return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2)
  }

  // noinspection JSUnresolvedFunction
  fibonacci = new Contract({
    pre: [
      function (n) { return util.isInteger(n) },
      function (n) { return n >= 0 }
    ],
    post: [
      function (n, result) { return util.isInteger(result) },
      function (n, result) { return n !== 0 || result === 0 },
      function (n, result) { return n !== 1 || result === 1 },
      function (n, result, fibonacci) {
        // don't refer to a specific implementation ("fibonacci") in the Contract!
        return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2)
      }
    ],
    exception: [
      function () { return false }
    ]
  }).implementation(fibonacciImpl)

  const wrongParameter = 4
  const wrongResult = -3

  const fibonacciWrong = fibonacci.contract.implementation(function fWrong (n) {
    // noinspection IfStatementWithTooManyBranchesJS
    if (n === 0) {
      return 0
    } else if (n === 1) {
      return 1
    } else if (n === 4) {
      return -3 // wrong!
    } else {
      return fibonacciWrong(n - 1) + fibonacciWrong(n - 2)
    }
  })

  const factorialContract = new Contract({
    pre: [
      function (n) { return util.isInteger(n) },
      function (n) { return n >= 0 }
    ],
    post: [
      function (n, result) { return util.isInteger(result) },
      function (n, result) { return n !== 0 || result === 1 },
      function (n, result, f) {
        // don't refer to a specific implementation in the Contract!
        return n < 1 || result === n * f(n - 1)
      }
    ],
    exception: [
      function () { return false }
    ]
  })

  // noinspection JSUnresolvedFunction
  const factorial = factorialContract.implementation(function (n) {
    if (n <= 0) {
      return 1
    } else {
      return n * factorial(n - 1)
    }
  })

  // noinspection JSUnresolvedFunction
  const factorialIterative = factorialContract.implementation(function (n) {
    if (n === 8) {
      return -3 // wrong!
    }
    let result = 1
    let next = 1
    while (next <= n) {
      result *= next
      next++
    }
    return result
  })

  const integerMessage = 'n must be integer'
  const positiveMessage = 'n must be positive'

  // noinspection JSUnresolvedFunction
  const defensiveIntegerSum = new Contract({
    post: [
      function (n, result) { return util.isInteger(result) },
      function (n, result) { return result >= 0 },
      function (n, result) { return n !== 0 || result === 0 },
      function (n, result, sum) { return n === 0 || result === sum(n - 1) + n }
    ],
    exception: [
      function (n, exc) { return !(exc instanceof Error) || exc.message !== positiveMessage || n < 0 },
      function (n, exc) { return !(exc instanceof Error) || exc.message !== integerMessage || !util.isInteger(n) }
    ]
  }).implementation(function (n) {
    if (!util.isInteger(n)) { throw new Error(integerMessage) }
    if (n < 0) { throw new Error(positiveMessage) }
    let count = 0
    let result = 0
    while (count < n) {
      count++
      result += count
    }
    return result
  })

  const fastDefensiveIntegerSum = defensiveIntegerSum.contract.implementation(function (n) {
    if (!util.isInteger(n)) { throw new Error(integerMessage) }
    if (n < 0) { throw new Error(positiveMessage) }
    return (n * (n + 1)) / 2
  })

  const wrongException = new Error(integerMessage) // will be thrown in error

  const fastDefensiveIntegerSumWrong = defensiveIntegerSum.contract.implementation(function (n) {
    if (util.isInteger(n)) { throw wrongException } // wrong
    if (n < 0) { throw new Error(positiveMessage) }
    return (n * (n + 1)) / 2
  })

  const negativeParameter = -10
  const nonIntegerParameter = Math.PI

  const resultWhenMetaError = 'This is the result or exception when we get a meta error'

  function callAndExpectException (self, func, parameter, expectException, recursive) {
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
      exception.must.be.truthy()
      const common = exception instanceof ConditionMetaError ? conditionMetaErrorCommon
        : exception instanceof PreconditionViolation ? preconditionViolationCommon
          : exception instanceof PostconditionViolation ? postconditionViolationCommon
            : exception instanceof ExceptionConditionViolation ? exceptionConditionViolationCommon
              : null
      common.must.be.truthy()
      common.expectInvariants(exception)
      testUtil.showStack(exception)
      expectException(exception)
      const stackLines = exception.stack.split(os.EOL)
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
      if (!recursive) {
        stackLines[0].must.contain('callAndExpectException')
      } else {
        stackLines[0].must.contain(recursive)
        stackLines[2].must.contain(recursive)
        stackLines[4].must.contain('callAndExpectException')
      }
    }
    endsNominally.must.be.false()
  }

  function failsOnPreconditionViolation (self, func, parameter, violatedCondition) {
    it('fails when a precondition is violated - ' + self + ' - ' + parameter, function () {
      callAndExpectException(self, func, parameter, function (exception) {
        exception.must.be.an.instanceof(PreconditionViolation)
        // noinspection JSUnresolvedVariable
        exception.condition.must.equal(violatedCondition)
        if (!self) {
          must(exception.self).must.be.falsy()
        } else {
          exception.self.must.equal(self)
        }
        must(exception.args[0]).equal(parameter)
      })
    })
  }

  const intentionalError = new Error('This condition intentionally fails.')

  const contractWithAFailingPre = new Contract(
    {
      pre: [function () { throw intentionalError }]
    }
  )

  function failsOnMetaError (self, functionWithAMetaError, conditionWithAMetaError, extraArgs) {
    const param = 'a parameter'
    callAndExpectException(self, functionWithAMetaError, param, function (exception) {
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

  function expectExceptionProperties (self, contractFunction, exception) {
    exceptionConditionViolationCommon.expectProperties(
      exception,
      ExceptionConditionViolation,
      contractFunction,
      contractFunction.contract.exception[1], // integer was programmed wrong
      self,
      [wrongParameter],
      wrongException
    )
  }

  const argumentsOfWrongType = [undefined, null, 'bar']
  const self = {
    aProperty: 'a property value',
    fibonacci: fibonacci.contract.implementation(function (n) {
      return n <= 1 ? n : this.fibonacci(n - 1) + this.fibonacci(n - 2)
    }),
    fibonacciWrong: fibonacci.contract.implementation(function fWrong (n) {
      // noinspection IfStatementWithTooManyBranchesJS
      if (n === 0) {
        return 0
      } else if (n === 1) {
        return 1
      } else if (n === 4) {
        return -3 // wrong!
      } else {
        return this.fibonacciWrong(n - 1) + this.fibonacciWrong(n - 2)
      }
    }),
    factorial: factorial,
    defensiveIntegerSum: defensiveIntegerSum,
    fastDefensiveIntegerSum: fastDefensiveIntegerSum,
    fastDefensiveIntegerSumWrong: fastDefensiveIntegerSumWrong
  }

  it("doesn't interfere when the implementation is correct", function () {
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    const ignore = fibonacci(5)
  })
  it("doesn't interfere when the implementation is correct too", function () {
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    const ignore = factorial(5)
  })
  it("doesn't interfere when the implementation is correct three", function () {
    // noinspection MagicNumberJS
    const oneHundred = 100
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    const ignore = defensiveIntegerSum(oneHundred)
  })
  it('can deal with alternative implementations', function () {
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    const ignore = factorialIterative(5)
  })
  it('works with a method that is correct', function () {
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    const ignore = self.fibonacci(5)
  })
  it('works with a method that is correct too', function () {
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    const ignore = self.factorial(5)
  })
  it('works with a method that is correct three', function () {
    // any exception will fail the test
    // eslint-disable-next-line no-unused-vars
    const ignore = self.defensiveIntegerSum(5)
  })
  argumentsOfWrongType.forEach(function (wrongArg) {
    failsOnPreconditionViolation(undefined, fibonacci, wrongArg, fibonacci.contract.pre[0])
  })
  failsOnPreconditionViolation(undefined, fibonacci, -5, fibonacci.contract.pre[1])
  argumentsOfWrongType.forEach(function (wrongArg) {
    failsOnPreconditionViolation(self, self.fibonacci, wrongArg, fibonacci.contract.pre[0])
  })
  failsOnPreconditionViolation(self, self.fibonacci, -5, fibonacci.contract.pre[1])
  it('fails with a meta-error when a precondition is kaput', function () {
    // noinspection JSUnresolvedFunction, JSUnresolvedVariable
    failsOnMetaError(
      undefined,
      contractWithAFailingPre.implementation(function () { return resultWhenMetaError }),
      contractWithAFailingPre.pre[0]
    )
  })
  it('fails with a meta-error when a precondition is kaput when it is a method', function () {
    // noinspection JSUnresolvedFunction
    const self = {
      method: contractWithAFailingPre.implementation(function () { return resultWhenMetaError })
    }

    // noinspection JSUnresolvedVariable
    failsOnMetaError(
      self,
      self.method,
      contractWithAFailingPre.pre[0]
    )
  })
  it('fails with a meta-error when a postcondition is kaput', function () {
    const contractWithAFailingPost = new Contract({
      post: [function () { throw intentionalError }]
    })

    // noinspection JSUnresolvedFunction
    const implementation = contractWithAFailingPost.implementation(function () { return resultWhenMetaError })
    // noinspection JSUnresolvedVariable
    failsOnMetaError(
      undefined,
      implementation,
      contractWithAFailingPost.post[0],
      [resultWhenMetaError, implementation]
    )
  })
  it('fails with a meta-error when a postcondition is kaput when it is a method', function () {
    const contractWithAFailingPost = new Contract({
      post: [function () { throw intentionalError }]
    })
    // noinspection JSUnresolvedFunction
    const self = {
      method: contractWithAFailingPost.implementation(function () { return resultWhenMetaError })
    }

    // noinspection JSUnresolvedVariable
    failsOnMetaError(
      self,
      self.method,
      contractWithAFailingPost.post[0],
      [resultWhenMetaError, self.method.bind(self)]
    )
  })
  it('fails with a meta-error when an exception condition is kaput', function () {
    // noinspection LocalVariableNamingConventionJS
    const contractWithAFailingExceptionCondition = new Contract({
      exception: [function () { throw intentionalError }]
    })
    const anExceptedException = 'This exception is expected.'
    // noinspection JSUnresolvedFunction
    const implementation = contractWithAFailingExceptionCondition.implementation(function () { throw anExceptedException })
    // noinspection JSUnresolvedVariable
    failsOnMetaError(
      undefined,
      implementation,
      contractWithAFailingExceptionCondition.exception[0],
      [anExceptedException, implementation]
    )
  })
  it('fails with a meta-error when an exception condition is kaput when it is a method', function () {
    // noinspection LocalVariableNamingConventionJS
    const contractWithAFailingExceptionCondition = new Contract({
      exception: [function () { throw intentionalError }]
    })
    const anExceptedException = 'This exception is expected.'
    // noinspection JSUnresolvedFunction
    const self = {
      method: contractWithAFailingExceptionCondition.implementation(function () { throw anExceptedException })
    }

    // noinspection JSUnresolvedVariable
    failsOnMetaError(
      self,
      self.method,
      contractWithAFailingExceptionCondition.exception[0],
      [anExceptedException, self.method.bind(self)]
    )
  })

  it('fails when a simple postcondition is violated', function () {
    callAndExpectException(undefined, fibonacciWrong, wrongParameter, expectPostProperties.bind(undefined, undefined, fibonacciWrong))
  })
  it('fails when a simple postcondition is violated when it is a method', function () {
    callAndExpectException(self, self.fibonacciWrong, wrongParameter, expectPostProperties.bind(undefined, self, self.fibonacciWrong))
  })
  it('fails when a postcondition is violated in a called function with a nested Violation', function () {
    const parameter = 6
    callAndExpectException(undefined, fibonacciWrong, parameter, expectPostProperties.bind(undefined, undefined, fibonacciWrong), 'fWrong')
  })
  it('fails when a postcondition is violated in a called function with a nested Violation when it is a method', function () {
    const parameter = 6
    callAndExpectException(self, self.fibonacciWrong, parameter, expectPostProperties.bind(undefined, self, self.fibonacciWrong), 'fWrong')
  })

  it('works with a defensive function', function () {
    fastDefensiveIntegerSum.bind(undefined, negativeParameter).must.throw(Error, positiveMessage)
  })
  it('works with a defensive method', function () {
    self.defensiveIntegerSum.bind(self, nonIntegerParameter).must.throw(Error, integerMessage)
  })

  it('fails when a simple exception condition is violated', function () {
    callAndExpectException(
      undefined,
      fastDefensiveIntegerSumWrong,
      wrongParameter,
      expectExceptionProperties.bind(undefined, undefined, fastDefensiveIntegerSumWrong)
    )
  })
  it('fails when a simple exception condition is violated when it is a method', function () {
    callAndExpectException(
      self,
      self.fastDefensiveIntegerSumWrong,
      wrongParameter,
      expectExceptionProperties.bind(undefined, self, self.fastDefensiveIntegerSumWrong)
    )
  })
  // noinspection LocalVariableNamingConventionJS
  const PersonConstructorContract = new Contract({
    pre: [
      function (name) { return typeof name === 'string' },
      function (name) { return !!name }
    ],
    post: [
      function (name, ignore) { return this.name === name }
    ],
    exception: [
      function () { return false }
    ]
  })

  // noinspection ParameterNamingConventionJS
  function expectConstructorToWork (PersonImplementation, doBind) {
    // noinspection LocalVariableNamingConventionJS, JSUnresolvedFunction
    let ContractPerson = PersonConstructorContract.implementation(PersonImplementation)
    if (doBind) {
      ContractPerson = ContractPerson.bind(undefined)
    }
    const caseName = 'Jim'
    const result = new ContractPerson(caseName)
    result.must.be.truthy()
    result.must.be.instanceof(ContractPerson)
    result.must.be.instanceof(PersonImplementation)
    result.must.have.ownProperty('_name')
    result.name.must.equal(caseName)
  }

  it('works with a constructor', function () {
    // noinspection LocalVariableNamingConventionJS
    const PersonImplementation = function (name) {
      this._name = name
    }
    PersonImplementation.must.have.property('prototype')
    PersonImplementation.prototype.must.have.property('constructor')
    PersonImplementation.prototype.constructor.must.equal(PersonImplementation)
    PersonImplementation.prototype._name = null
    util.defineFrozenDerivedProperty(PersonImplementation.prototype, 'name', function () { return this._name })

    expectConstructorToWork(PersonImplementation)
  })
  it('works with a bound constructor', function () {
    // noinspection LocalVariableNamingConventionJS
    const PersonImplementation = function (name) {
      this._name = name
    }
    PersonImplementation.must.have.property('prototype')
    PersonImplementation.prototype.must.have.property('constructor')
    PersonImplementation.prototype.constructor.must.equal(PersonImplementation)
    PersonImplementation.prototype._name = null
    util.defineFrozenDerivedProperty(PersonImplementation.prototype, 'name', function () { return this._name })

    expectConstructorToWork(PersonImplementation, true)
  })
  // TODO support class construct
  // it("works with a class", function() {
  //  class PersonImplementation {
  //    constructor(name) {
  //      this._name = name;
  //    }
  //
  //    get name() {
  //      return this._name;
  //    }
  //  }
  //
  //  expectConstructorToWork(PersonImplementation);
  // });
})
