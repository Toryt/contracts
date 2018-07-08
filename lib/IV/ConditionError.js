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
const ContractError = require('./ContractError')
const AbstractContract = require('./AbstractContract')
const os = require('os')

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
 * developer. In ES2015 however, this function will have the relevant name. A contract function does have a
 * `location` property that stores a line from a stacktrace that, in most JavaScript engines, contains a reference to
 * where the contract function is created in source code.
 * The name of the contract function, or, if does not have a name, the name of the naked implementation, if that has
 * one, is used in communication, via the contract function display name.
 *
 * The naked implementation will often be nameless. Showing the code is not relevant, because it will often be rather
 * long. There is no way to create a reference to the naked implementation. The reference to where the contract
 * function is created in source code in the contract function `location` property will show the developer which
 * implementation is used. The implementation is either defined there, or the developer can navigate from there to
 * the implementation definition in a good IDEA.
 * The implementation function display name is used in communication.
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
function ConditionError (contractFunction, condition, self, args) {
  util.pre(this, function () { return AbstractContract.isAGeneralContractFunction(contractFunction) })
  util.pre(this, function () { return util.typeOf(condition) === 'function' })
  util.pre(this, function () { return util.typeOf(args) === 'arguments' || util.typeOf(args) === 'array' })

  ContractError.call(this)
  util.setAndFreezeProperty(this, 'contractFunction', contractFunction)
  util.setAndFreezeProperty(this, 'condition', condition)
  util.setAndFreezeProperty(this, 'self', self)
  util.setAndFreezeProperty(this, '_args', Object.freeze(Array.prototype.slice.call(args)))
}

ConditionError.prototype = new ContractError()
ConditionError.prototype.constructor = ConditionError
util.setAndFreezeProperty(ConditionError.prototype, 'name', ConditionError.name)
util.setAndFreezeProperty(ConditionError.prototype, 'contractFunction', null)
util.setAndFreezeProperty(ConditionError.prototype, 'condition', null)
util.setAndFreezeProperty(ConditionError.prototype, 'self', null)
util.setAndFreezeProperty(ConditionError.prototype, '_args', null)
util.defineFrozenReadOnlyArrayProperty(ConditionError.prototype, 'args', '_args')
util.defineFrozenDerivedProperty(
  ConditionError.prototype,
  'message',
  function () {
    // noinspection JSUnresolvedVariable
    return util.conciseConditionRepresentation('condition', this.condition) +
           ' failed while ' + this.contractFunction.displayName + ' was called'
  }
)
const start = os.EOL + '    '
util.setAndFreezeProperty(
  ConditionError.prototype,
  'getDetails',
  function () {
    // noinspection JSUnresolvedVariable
    return 'contract:' + os.EOL + this.contractFunction.contract.location +
           os.EOL + 'condition: ' + start + this.condition +
           os.EOL + 'contract function:' + os.EOL + this.contractFunction.location +
           os.EOL + 'this (' + util.typeOf(this.self) + '):' + start + this.self +
           os.EOL + 'arguments (' + this.args.length + '):' +
           Array.prototype.map.call(this.args, function (arg, index) {
             return start + index + ' (' + util.typeOf(arg) + '): ' + arg
           })
  }
)
util.defineFrozenDerivedProperty(
  ConditionError.prototype,
  'stack',
  function () {
    // noinspection JSUnresolvedFunction, JSUnresolvedVariable
    return this.name + ': ' + this.message +
            os.EOL + this.getDetails() +
            os.EOL + 'call stack:' + os.EOL + util.stackOutsideThisLibrary(this._stackSource)
  }
)

module.exports = ConditionError
