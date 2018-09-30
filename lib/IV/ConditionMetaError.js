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

const report = require('../_private/report')
const is = require('../_private/is')
const property = require('../_private/property')
const stack = require('../_private/stack')
const ConditionError = require('./ConditionError')
const AbstractContract = require('./AbstractContract')
const assert = require('assert')

/**
 * The condition could not be evaluated. There is probably a programming error in the condition itself.
 *
 * error must be optional
 * - to make it possible to use this as the prototype for more special types
 * - because in JavaScript, also undefined and null can be thrown
 * Therefor, a ConditionMetaError is also civilized if the error is falsy.
 *
 * @constructor
 */
function ConditionMetaError (contractFunction, condition, self, args, error, rawStack) {
  assert(AbstractContract.isAGeneralContractFunction(contractFunction), 'this is a general contract function')
  assert.strictEqual(typeof condition, 'function')
  assert(is.functionArguments(args) || Array.isArray(args), 'args is arguments or array')
  assert(is.stack(rawStack), 'rawStack is a stack')

  ConditionError.call(this, contractFunction, condition, self, args, rawStack)
  if (error) {
    Object.freeze(error)
  }
  property.setAndFreeze(this, 'error', error)
}

// noinspection JSUnresolvedVariable
ConditionMetaError.prototype = new ConditionError(
  AbstractContract.root.abstract,
  function () {
    return 'This is a dummy condition in the ConditionMetaError prototype.'
  },
  undefined,
  [],
  stack.raw()
)
ConditionMetaError.prototype.constructor = ConditionMetaError
property.setAndFreeze(ConditionMetaError.prototype, 'name', ConditionMetaError.name)
property.setAndFreeze(ConditionMetaError.prototype, 'error', null)
property.frozenDerived(ConditionMetaError.prototype, 'message', function () {
  // noinspection JSUnresolvedVariable
  return (
    `error occurred while evaluating ${report.conciseCondition('condition', this.condition)} ` +
    `while contract function ${this.contractFunction.name} was called (${this.error})`
  )
})
property.setAndFreeze(ConditionMetaError.prototype, 'getDetails', function () {
  // noinspection JSUnresolvedVariable
  return `${ConditionError.prototype.getDetails.call(this)}
caused by:
    ${report.extensiveThrown(this.error)}`
})

module.exports = ConditionMetaError
