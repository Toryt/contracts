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

const util = require('../_private/util')
const is = require('../_private/is')
const ConditionError = require('./ConditionError')
const AbstractContract = require('./AbstractContract')

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
  util.pre(this, function () { return AbstractContract.isAGeneralContractFunction(contractFunction) })
  util.pre(this, function () { return typeof condition === 'function' })
  util.pre(this, function () { return is.isArguments(args) || Array.isArray(args) })
  util.pre(function () { return is.isAStack(rawStack) })

  ConditionError.call(this, contractFunction, condition, self, args, rawStack)
  if (error) {
    Object.freeze(error)
  }
  util.setAndFreezeProperty(this, 'error', error)
}

// noinspection JSUnresolvedVariable
ConditionMetaError.prototype = new ConditionError(
  AbstractContract.root.abstract,
  function () { return 'This is a dummy condition in the ConditionMetaError prototype.' },
  undefined,
  [],
  util.callerStack()
)
ConditionMetaError.prototype.constructor = ConditionMetaError
util.setAndFreezeProperty(ConditionMetaError.prototype, 'name', ConditionMetaError.name)
util.setAndFreezeProperty(ConditionMetaError.prototype, 'error', null)
util.defineFrozenDerivedProperty(
  ConditionMetaError.prototype,
  'message',
  function () {
    // noinspection JSUnresolvedVariable
    return `error occurred while evaluating ${util.conciseConditionRepresentation('condition', this.condition)} ` +
           `while contract function ${this.contractFunction.displayName} was called (${this.error})`
  }
)
util.setAndFreezeProperty(
  ConditionMetaError.prototype,
  'getDetails',
  function () {
    // noinspection JSUnresolvedVariable
    return `${ConditionError.prototype.getDetails.call(this)}
caused by:
    ${util.extensiveThrownRepresentation(this.error)}`
  }
)

module.exports = ConditionMetaError
