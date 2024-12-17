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

const report = require('./_private/report')
const is = require('./_private/is')
const property = require('./_private/property')
const stack = require('./_private/stack')
const ContractError = require('./ContractError')
const AbstractContract = require('./AbstractContract')
const assert = require('assert')
const stackEOL = require('./_private/eol').stack

/**
 * ConditionError is the general supertype of all errors thrown by Toryt Contracts.
 * ConditionError itself is to be considered abstract.
 *
 * A ConditionError is a communication to developers, through which Toryt Contracts tries to describe as correctly
 * as possible what went wrong. The error reports a contract violation, or an error in a contract condition.
 * We assume the Toryt Contracts code itself will not fail.
 *
 * In general, we want to report to the developer:
 * <ul>
 *   <li>which condition was violated, or has an error, in source code, which implies knowing
 *     <ul>
 *       <li>of which contract the condition is a part of</li>
 *     </ul>
 *   </li>
 *   <li>in what circumstances the error occurred, which implies knowing
 *     <ul>
 *       <li>where the contract function was called, in source code, which implies knowing
 *         <ul>
 *           <li>which function called the contract function, and<li>
 *         </ul>
 *       </li>
 *       <li>which were were the arguments of the call of the contract function, during execution of this
 *         function call instance, and</li>
 *       <li>which contract function was called, which implies knowing
 *         <ul>
 *           <li>what the contract of the called contract function is, and<li>
 *           <li>which implementation of the contract was called.<li>
 *         </ul>
 *       </li>
 *     </ul>
 *   </li>
 * </ul>
 *
 * The condition is usually a short and anonymous JavaScript function. We will report the full implementation of the
 * condition, which might be multi-line.
 *
 * The contract is an object, and there is no automatic way to assign recognizable names to objects.
 * A contract does however have a `location` property that stores a line from a stacktrace that, in most JavaScript
 * engines, contains a reference to where the contract is created in source code.
 *
 * The actual arguments can easily be listed.
 *
 * The called contract function is actually 2 functions: the supplied naked implementation, and the doctored contract
 * function, which embeds the supplied naked implementation in contract verifications.
 *
 * The latter is the function called from outside. All doctored contract functions are different instances of the
 * same function definition in source code. It is not informative to communicate about this source code to the
 * developer, yet its call is what is relevant. A contract function does have a `location` property that stores a line
 * from a stacktrace that, in most JavaScript engines, contains a reference to where the contract function is created
 * in source code. The name of the contract function is used in communication. It is based on the implementation.
 *
 * The naked implementation will often be nameless. Showing the code is less relevant, because it will often be rather
 * long, but we concise version is used for lack of a better solution when there is no name. There is no way to create
 * a location reference to the naked implementation. The reference to where the contract function is created in source
 * code in the contract function `location` property will show the developer which implementation is used. The
 * implementation is either defined there, or the developer can navigate from there to the implementation definition in
 * a good IDE.
 *
 * The calling function cannot be retrieved in modern Javascript. ConditionError instances do however create a call
 * stack through which the developer can determine the calling function.
 *
 * Instances should be frozen before they are thrown.
 *
 * <h3>Invariants</h3>
 * <ul>
 *   <li>`contractFunction` is a frozen mandatory property, and refers to a contract function</li>
 *   <li>`condition` is a frozen mandatory property, and refers to a function</li>
 *   <li>`self` is a frozen property; it can be anything, also `null` or `undefined`</li>
 *   <li>`args` is a frozen property, and refers to an Array or Arguments instance</li>
 *   <li>`name` is a mandatory property, and refers to a string</li>
 *   <li>`message` is a frozen mandatory property, and refers to a string</li>
 *   <li>`moreDetail` is a mandatory property, and refers to a function</li>
 *   <li>`stack` is a read-only property, that returns a string, that starts with the instance's
 *     <code>name</code>>, the string ": ", and <code>message</code>, followed by the {@link #getDetails()},
 *     and by stack code references, that do not contain references to the inner workings of the Toryt
 *     Contracts library.</li>
 * </ul>
 *
 * @constructor
 */
function ConditionError(contractFunction, condition, self, args, rawStack) {
  assert(
    AbstractContract.isAGeneralContractFunction(contractFunction),
    'ConditionError: first argument is a general contract function'
  )
  assert.strictEqual(typeof condition, 'function', 'ConditionError: condition is a function')
  assert(is.functionArguments(args) || Array.isArray(args), 'ConditionError: args is arguments or array')
  assert(is.stack(rawStack), 'ConditionError: rawStack is a stack')

  ContractError.call(this, rawStack)
  property.setAndFreeze(this, 'contractFunction', contractFunction)
  property.setAndFreeze(this, 'condition', condition)
  property.setAndFreeze(this, 'self', self)
  property.setAndFreeze(this, '_args', Object.freeze(Array.prototype.slice.call(args)))
}

ConditionError.prototype = new ContractError(stack.raw())
ConditionError.prototype.constructor = ConditionError
property.setAndFreeze(ConditionError.prototype, 'name', ConditionError.name)
property.setAndFreeze(ConditionError.prototype, 'contractFunction', null)
property.setAndFreeze(ConditionError.prototype, 'condition', null)
property.setAndFreeze(ConditionError.prototype, 'self', null)
property.setAndFreeze(ConditionError.prototype, '_args', null)
property.frozenReadOnlyArray(ConditionError.prototype, 'args', '_args')
property.frozenDerived(ConditionError.prototype, 'message', function () {
  // noinspection JSUnresolvedVariable
  const conditionRepresentation = report.conciseCondition('condition', this.condition)
  // noinspection JSUnresolvedVariable
  return `${conditionRepresentation} failed while ${this.contractFunction.name} was called`
})

// do not use multiline template strings: that turns out to use the EOL used in the file, and not the EOL of the
// platform noinspection JSUnresolvedVariable

property.setAndFreeze(ConditionError.prototype, 'getDetails', function () {
  const argsList = Array.prototype.map.call(
    this.args,
    (arg, index) => stackEOL + `    ${index} (${report.type(arg)}): ${report.value(arg)}`
  )
  return (
    'contract:' +
    stackEOL +
    this.contractFunction.contract.location +
    stackEOL +
    'condition:' +
    stackEOL +
    `    ${report.conciseCondition('', this.condition)}` +
    stackEOL +
    'contract function:' +
    stackEOL +
    this.contractFunction.location +
    stackEOL +
    `this (${report.type(this.self)}):` +
    stackEOL +
    `    ${report.value(this.self)}` +
    stackEOL +
    `arguments (${this.args.length}):${argsList}`
  )
})
property.frozenDerived(ConditionError.prototype, 'stack', function () {
  // noinspection JSUnresolvedVariable, JSUnresolvedFunction
  return (
    `${this.name}: ${this.message}` +
    stackEOL +
    `${this.getDetails()}` +
    stackEOL +
    'call stack:' +
    stackEOL +
    `${this._rawStack}`
  )
})

module.exports = ConditionError
