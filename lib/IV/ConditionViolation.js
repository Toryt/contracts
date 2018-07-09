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

const is = require('../_private/is')
const property = require('../_private/property')
const stack = require('../_private/stack')
const ConditionError = require('./ConditionError')
const AbstractContract = require('./AbstractContract')
const ConditionMetaError = require('./ConditionMetaError')
const assert = require('assert')

/**
 * Super type for objects that are thrown to signal a condition violation.
 * This is intended to be abstract.
 *
 * @constructor
 * @param {Function} contractFunction - The contract function that reports this violation
 * @param {Function} condition        - The condition that was violated
 * @param            self             - The <code>this</code> that <code>contractFunction</code> was called on
 * @param {Array} args
 *                The arguments with which the contract function that failed, was called.
 */
function ConditionViolation (contractFunction, condition, self, args) {
  assert(AbstractContract.isAGeneralContractFunction(contractFunction), 'this is a general contract function')
  assert.equal(typeof condition, 'function')
  assert(is.functionArguments(args) || Array.isArray(args), 'args is arguments or array')

  ConditionError.call(this, contractFunction, condition, self, args, stack.raw(stack.skipsForEach ? 6 : 7))
}

// noinspection JSUnresolvedVariable
ConditionViolation.prototype = new ConditionError(
  AbstractContract.root.abstract,
  function () { return 'This is a dummy condition in the ConditionViolation prototype.' },
  undefined,
  [],
  stack.raw()
)
ConditionViolation.prototype.constructor = ConditionViolation
property.setAndFreeze(ConditionViolation.prototype, 'name', ConditionViolation.name)

/**
 * Dynamic conditional constructor and thrower of instances of this type. The intended usage is:
 *
 * <pre>
 *   <var>SpecificConditionViolationConstructor</var>.prototype.verifyAll(<var>...</var>, <var>conditions</var>, <var>self</var>, <var>args</var>)
 * </pre>
 *
 * Such a call will throw a ConditionViolation of type <var>SpecificConditionViolationConstructor</var>, with its
 * properties filled out appropriately if any of the supplied <var>conditions</var> returns <code>false</code> when
 * applied to <var>self</var> and <var>args</var>.
 *
 * When any of the supplied <var>conditions</var> fails to execute, a ConditionMetaError is thrown, with its
 * properties filled out appropriately.
 */
property.setAndFreeze(
  ConditionViolation.prototype,
  'verifyAll',
  function (contractFunction, conditions, self, args) {
    assert(AbstractContract.isAGeneralContractFunction(contractFunction), 'this is a contract function')
    assert.ok(conditions)
    assert(Array.isArray(conditions), 'conditions is an array')
    assert(conditions.every(c => typeof c === 'function'), 'all conditions are functions')
    assert.ok(args)
    assert(is.functionArguments(args) || Array.isArray(args), 'args is arguments or array')

    conditions.forEach(function (condition) { this.verify(contractFunction, condition, self, args) }, this)
  }
)

/**
 * Dynamic conditional constructor and thrower of instances of this type. The intended usage is:
 *
 * <pre>
 *   <var>SpecificConditionViolationConstructor</var>.prototype.verify(<var>...</var>, <var>condition</var>, <var>self</var>, <var>args</var>)
 * </pre>
 *
 * Such a call will throw a ConditionViolation of type <var>SpecificConditionViolationConstructor</var>, with its
 * properties filled out appropriately, if the supplied <var>condition</var> returns <code>false</code> when applied
 * to <var>self</var> and <var>args</var>.
 *
 * When the supplied <var>condition</var> fails to execute, a ConditionMetaError is thrown, with its
 * properties filled out appropriately.
 *
 * Mostly, this method is not used directly, but called via <code>verifyAll</code>.
 */
property.setAndFreeze(
  ConditionViolation.prototype,
  'verify',
  function (contractFunction, condition, self, args) {
    assert(AbstractContract.isAGeneralContractFunction(contractFunction), 'this is a contract function')
    assert.equal(typeof condition, 'function')
    assert(is.functionArguments(args) || Array.isArray(args), 'args is arguments or array')

    let conditionResult
    try {
      conditionResult = condition.apply(self, args)
    } catch (err) {
      const cme = new ConditionMetaError(contractFunction, condition, self, args, err, stack.raw(stack.skipsForEach ? 4 : 5))
      Object.freeze(cme)
      throw cme
    }
    if (!conditionResult) {
      const cv = new this.constructor(contractFunction, condition, self, args)
      Object.freeze(cv)
      throw cv
    }
  }
)

module.exports = ConditionViolation
