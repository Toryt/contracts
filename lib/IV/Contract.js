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
const ConditionError = require('./ConditionError')
const AbstractContract = require('./AbstractContract')
const PreconditionViolation = require('./PreconditionViolation')
const PostconditionViolation = require('./PostconditionViolation')
const ExceptionConditionViolation = require('./ExceptionConditionViolation')
const assert = require('assert')

/**
 * The separation between AbstractContract and Contract is necessary to break a dependency
 * cycle with ConditionError.
 *
 * @constructor
 */
function Contract (kwargs) {
  assert.ok(kwargs)
  assert(!kwargs.pre || Array.isArray(kwargs.pre), 'optional kwargs.pre is an array')
  assert(!kwargs.post || Array.isArray(kwargs.post), 'optional kwargs.post is an array')
  assert(!kwargs.exception || Array.isArray(kwargs.exception), 'optional kwargs.exception is an array')

  AbstractContract.call(this, kwargs, stack.location(1))
}

Contract.prototype = new AbstractContract(
  {pre: [AbstractContract.falseCondition]},
  AbstractContract.internalLocation
)
Contract.prototype.constructor = Contract
Contract.prototype.implementation = function (implFunction) {
  assert.equal(typeof implFunction, 'function')

  const contract = this
  const location = stack.location(1)

  function contractFunction () {
    // cfThis: the this of the contract function call
    const cfThis = this // jshint ignore:line
    const extendedArgs = Array.prototype.slice.call(arguments)
    // noinspection JSUnresolvedFunction
    PreconditionViolation.prototype.verifyAll(contractFunction, contract.pre, cfThis, arguments)
    let result
    let exception
    try {
      result = implFunction.apply(cfThis, arguments)
    } catch (exc) {
      if (exc instanceof ConditionError) { // necessary to report only the deepest failure clearly
        throw exc
      }
      exception = exc
    }
    extendedArgs.push(exception || result)
    extendedArgs.push(contractFunction.bind(cfThis))
    if (exception) {
      // noinspection JSUnresolvedFunction
      ExceptionConditionViolation.prototype.verifyAll(contractFunction, contract.exception, cfThis, extendedArgs)
      throw exception
    }
    // noinspection JSUnresolvedFunction
    PostconditionViolation.prototype.verifyAll(contractFunction, contract.post, cfThis, extendedArgs)
    return result
  }

  AbstractContract.bless(contractFunction, contract, implFunction, location)

  return contractFunction
}

Contract.root = AbstractContract.root
Contract.isAContractFunction = AbstractContract.isAContractFunction

module.exports = Contract
