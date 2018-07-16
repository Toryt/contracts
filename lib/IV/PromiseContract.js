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

'use strict'

const stack = require('../_private/stack')
const property = require('../_private/property')
const ConditionError = require('./ConditionError')
const AbstractContract = require('./AbstractContract')
const PreconditionViolation = require('./PreconditionViolation')
const PostconditionViolation = require('./PostconditionViolation')
const ExceptionConditionViolation = require('./ExceptionConditionViolation')
const assert = require('assert')

function resultIsAPromiseCondition () {
  return arguments[arguments.length - 2] instanceof Promise
}

const resultIsAPromise = [resultIsAPromiseCondition]

/**
 * Contract for functions that return a `Promise`. Postconditions are applied to the successful `Promise` resolution.
 * Exception conditions are applied to the rejection of the returned `Promise`. `fastException` conditions are applied
 * to exceptions that the function throws while creating the `Promise`. Note that in `async` functions, the distinction
 * between `exception` and `fastException` conditions is lost. The fast postcondition of a `Promise` function is always
 * that the function must return a `Promise` instance. A `Promise` function that returns something else, or `null` or
 * `undefined` occasionally, is not supported.
 *
 * @constructor
 */
function PromiseContract (kwargs) {
  assert.ok(kwargs)
  assert(!kwargs.pre || Array.isArray(kwargs.pre), 'optional kwargs.pre is an array')
  assert(!kwargs.post || Array.isArray(kwargs.post), 'optional kwargs.post is an array')
  assert(!kwargs.exception || Array.isArray(kwargs.exception), 'optional kwargs.exception is an array')
  // noinspection JSUnresolvedVariable
  assert(!kwargs.fastException || Array.isArray(kwargs.fastException), 'optional kwargs.fastException is an array')

  AbstractContract.call(this, kwargs, stack.location(1))
  // noinspection JSUnresolvedVariable
  property.setAndFreeze(
    this,
    '_fastException',
    Object.freeze(kwargs.fastException ? kwargs.fastException.slice() : AbstractContract.mustNotHappen)
  )
}

PromiseContract.prototype = new AbstractContract(
  {pre: AbstractContract.mustNotHappen},
  AbstractContract.internalLocation
)
PromiseContract.prototype.constructor = PromiseContract
property.frozenReadOnlyArray(PromiseContract.prototype, 'fastException', '_fastException')

PromiseContract.prototype.implementation = function (implFunction) {
  assert.equal(typeof implFunction, 'function')

  const contract = this
  const location = stack.location(1)

  function contractFunction () {
    // cfThis: the this of the contract function call
    const cfThis = this
    if (!contractFunction.contract.verify) {
      /* Shortcut if there is no verification.
         This is not contract.verify: contractFunction.contract is a separate object, that has contract as a
         prototype. */
      return implFunction.apply(cfThis, arguments)
    }

    const extendedArgs = Array.prototype.slice.call(arguments)
    // noinspection JSUnresolvedFunction
    PreconditionViolation.prototype.verifyAll(contractFunction, contract.pre, cfThis, arguments)
    if (!contractFunction.contract.verifyPostconditions) {
      /* Shortcut if there is no verification.
         This is not contract.verifyPostconditions: contractFunction.contract is a separate object, that has contract as
         a prototype. */
      return implFunction.apply(cfThis, arguments)
    }

    try {
      const promise = implFunction.apply(cfThis, arguments)
      /* Although we can test for the promise being a Promise here directly, the current implementation chooses
         to go through verifyAll. This is to keep the stack determination in 1 place. If we would throw the
         PostconditionViolation here, we need to define the stack trace here for all violations, and pass it through
         verifyAll and verify. For this to work, we need to create an applicable extendedArgs (without tainting the
         original for uses below). This is at the cost of going through verifyAll and verify, and the
         resultIsAPromiseCondition to do a simple test. */
      const promiseArgs = extendedArgs.concat([promise, null]) //
      //  noinspection JSUnresolvedFunction
      PostconditionViolation.prototype.verifyAll(contractFunction, resultIsAPromise, cfThis, promiseArgs)

      return promise
        .catch(rejection => {
          if (rejection instanceof ConditionError) { // necessary to report only the deepest failure clearly
            throw rejection
          }
          extendedArgs.push(rejection)
          extendedArgs.push(contractFunction.bind(cfThis))
          // noinspection JSUnresolvedFunction
          return ExceptionConditionViolation.prototype
            .verifyAllPromise(contractFunction, contract.exception, cfThis, extendedArgs)
            .then(() => { throw rejection })
        })
        .then(resolution => {
          extendedArgs.push(resolution)
          extendedArgs.push(contractFunction.bind(cfThis))
          // noinspection JSUnresolvedFunction
          return PostconditionViolation.prototype
            .verifyAllPromise(contractFunction, contract.post, cfThis, extendedArgs)
            .then(() => resolution)
        })
    } catch (fastException) {
      if (fastException instanceof ConditionError) { // necessary to report pcv and only the deepest failure clearly
        throw fastException
      }
      extendedArgs.push(fastException)
      extendedArgs.push(contractFunction.bind(cfThis))
      // noinspection JSUnresolvedFunction, JSUnresolvedVariable
      ExceptionConditionViolation.prototype.verifyAll(contractFunction, contract.fastException, cfThis, extendedArgs)
      throw fastException
    }
  }

  AbstractContract.bless(contractFunction, contract, implFunction, location)

  return contractFunction
}

PromiseContract.resultIsAPromiseCondition = resultIsAPromiseCondition
PromiseContract.falseCondition = AbstractContract.falseCondition
PromiseContract.mustNotHappen = AbstractContract.mustNotHappen
PromiseContract.root = AbstractContract.root
PromiseContract.isAContractFunction = AbstractContract.isAContractFunction

module.exports = PromiseContract
