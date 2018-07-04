/*
 Copyright 2016 - 2017 by Jan Dockx

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

const util = require('../_private/util')
const ConditionError = require('./ConditionError')
const AbstractContract = require('./AbstractContract')
const PreconditionViolation = require('./PreconditionViolation')
const PostconditionViolation = require('./PostconditionViolation')
const ExceptionConditionViolation = require('./ExceptionConditionViolation')

/**
 * The separation between AbstractContract and Contract is necessary to break a dependency
 * cycle with ConditionError.
 *
 * @constructor
 */
function Contract (kwargs) {
  util.pre(function () { return !!kwargs })
  util.pre(function () { return !kwargs.pre || util.typeOf(kwargs.pre) === 'array' })
  util.pre(function () { return !kwargs.post || util.typeOf(kwargs.post) === 'array' })
  util.pre(function () { return !kwargs.exception || util.typeOf(kwargs.exception) === 'array' })

  AbstractContract.apply(this, arguments)
}

Contract.prototype = new AbstractContract(
  {pre: [AbstractContract.falseCondition]},
  AbstractContract.internalLocation
)
Contract.prototype.constructor = Contract
Contract.prototype.implementation = function (implFunction) {
  util.pre(this, function () { return implFunction && util.typeOf(implFunction) === 'function' })

  const contract = this
  const location = util.firstLocationOutsideLibrary()

  function contractFunction () {
    // cfThis: the this of the contract function call
    const cfThis = this // jshint ignore:line
    const extendedArgs = Array.prototype.slice.call(arguments)
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
      ExceptionConditionViolation.prototype.verifyAll(contractFunction, contract.exception, cfThis, extendedArgs)
      throw exception
    }
    PostconditionViolation.prototype.verifyAll(contractFunction, contract.post, cfThis, extendedArgs)
    return result
  }

  AbstractContract.bless(contractFunction, contract, implFunction, location)

  return contractFunction
}

Contract.root = AbstractContract.root
Contract.isAContractFunction = AbstractContract.isAContractFunction

module.exports = Contract
