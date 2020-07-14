/*
 Copyright 2016 - 2020 by Jan Dockx

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

const is = require('./_private/is')
const property = require('./_private/property')
const ConditionViolation = require('./ConditionViolation')
const AbstractContract = require('./AbstractContract')
const assert = require('assert')

/**
 * A PreconditionViolation is the means by which Toryt Contracts tells developers that it detected that a
 * precondition was violated when a contract function was called. The implementation of the contract function
 * that was called, was not executed.
 *
 * If the precondition itself is correct, this is a programming error on the part of the calling function.
 * One should assume the system is now in an undefined state.
 *
 * The developer wants to know
 * <ul>
 *   <li>where the contract function was called in source code,</li>
 *   <li>what the arguments were of the instance of the call, and</li>
 *   <li>which precondition was violated in source code (which implies knowing which contract it is a part of).</li>
 * </ul>
 *
 * @constructor
 * @param {Function} contractFunction - The contract function that reports this violation
 * @param {Function} condition        - The condition that was violated
 * @param            self             - The <code>this</code> that <code>contractFunction</code> was called on
 * @param {Array} args
 *                The arguments with which the contract function that failed, was called
 */
function PreconditionViolation (contractFunction, condition, self, args) {
  assert(AbstractContract.isAGeneralContractFunction(contractFunction), 'this is a general contract function')
  assert.strictEqual(typeof condition, 'function')
  assert(is.functionArguments(args) || Array.isArray(args), 'args is arguments or array')

  ConditionViolation.apply(this, arguments)
}

// noinspection JSUnresolvedVariable
PreconditionViolation.prototype = new ConditionViolation(
  AbstractContract.root.abstract,
  function () {
    return 'This is a dummy condition in the PreconditionViolation prototype.'
  },
  undefined,
  []
)
PreconditionViolation.prototype.constructor = PreconditionViolation
property.setAndFreeze(PreconditionViolation.prototype, 'name', PreconditionViolation.name)

module.exports = PreconditionViolation
