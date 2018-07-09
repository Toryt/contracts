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

const ContractError = require('./ContractError')
const util = require('../_private/util')
const is = require('../_private/is')

const displayNamePrefix = 'contract function '

// noinspection ParameterNamingConventionJS
/**
 * Abstract definition of a function contract.
 *
 * An AbstractContract consists of an array of preconditions, an array of nominal postconditions,
 * and an array of exceptional postconditions.
 *
 * The conditions are functions whose result is interpreted as a booleany value.
 * The conditions are called with the same `this` and arguments as the functional call in which they are
 * verified. When verifying nominal postconditions, the result of the function call is added as extra argument.
 * When verifying exceptional postconditions, the exception thrown by the function call is added as extra argument.
 * Finally, a version of the contract function bound to `this` is supplied as final parameter when verifying
 * nominal and exceptional postconditions. This function reference can be used in contracts that use recursion.
 *
 * Furthermore, an instance contains a `location` property, which is a line of text
 * that refers to the source code where the contract was created. For internal contracts, this is
 * `AbstractContract.internalLocation.
 *
 * The `_location` argument is for internal use, and might be removed.
 *
 * @constructor
 */
function AbstractContract (kwargs, /* Object? */ _location) {
  util.pre(() => !!kwargs)
  util.pre(() => !kwargs.pre || Array.isArray(kwargs.pre))
  util.pre(() => !kwargs.post || Array.isArray(kwargs.post))
  util.pre(() => !kwargs.exception || Array.isArray(kwargs.exception))
  util.pre(() =>
    !_location ||
    _location === AbstractContract.internalLocation ||
    typeof _location === 'string'
  )

  const self = this

  /* This cannot be defined in the prototype. The `self` is the contract, not the `this`. When this function is called
     as a method of a random object, that random object is the `this`, not this contract. */
  function abstract () { throw new AbstractContract.AbstractError(self, util.callerStack()) }

  const location = _location || util.callerLocation(1)
  AbstractContract.bless(abstract, self, abstract, location)
  util.setAndFreezeProperty(self, '_pre', Object.freeze(kwargs.pre ? kwargs.pre.slice() : []))
  util.setAndFreezeProperty(self, '_post', Object.freeze(kwargs.post ? kwargs.post.slice() : []))
  util.setAndFreezeProperty(self, '_exception', Object.freeze(kwargs.exception ? kwargs.exception.slice() : []))
  util.setAndFreezeProperty(self, 'location', Object.freeze(location))
  util.setAndFreezeProperty(self, 'abstract', abstract)
}

/**
 * Object to be used as location for contracts and implementations that are generated inside this library.
 */
AbstractContract.internalLocation = Object.freeze({
  toString: function () { return 'INTERNAL' }
})

AbstractContract.prototype = {
  constructor: AbstractContract,
  _pre: null,
  _post: null,
  _exception: null,
  isImplementedBy: function (f) {
    return AbstractContract.isAGeneralContractFunction(f) && f.contract === this
  }
}
util.defineFrozenReadOnlyArrayProperty(AbstractContract.prototype, 'pre', '_pre')
util.defineFrozenReadOnlyArrayProperty(AbstractContract.prototype, 'post', '_post')
util.defineFrozenReadOnlyArrayProperty(AbstractContract.prototype, 'exception', '_exception')
util.setAndFreezeProperty(AbstractContract.prototype, 'location', AbstractContract.internalLocation)
util.setAndFreezeProperty(AbstractContract.prototype, 'abstract', null)

AbstractContract.displayNamePrefix = displayNamePrefix

/**
 * Return a string that is a sensible display name for the given function as a contract function.
 */
AbstractContract.contractFunctionDisplayName = function (f) {
  util.pre(() => typeof f === 'function')

  return displayNamePrefix +
         (f.name ||
            (f.implementation && (f.implementation.displayName || f.implementation.name)) ||
            '<<anonymous>>')
}

/**
 * This function is intended to be used as the bind function of contract functions. It makes sure
 * that, when applied to a contract function, the result
 * [is also a contract function]{@linkplain AbstractContract#isAContractFunction}.
 * The bind aspect of the functionality is the same as {@link Function#prototype#bind}.
 * The implementation of the resulting contract function is also bound in the same
 * way as the resulting contract function itself.
 */
AbstractContract.bindContractFunction = function bind () {
  util.pre(() => AbstractContract.isAGeneralContractFunction(this))

  const bound = Function.prototype.bind.apply(this, arguments)
  const boundImplementation = Function.prototype.bind.apply(this.implementation, arguments)
  AbstractContract.bless(bound, this.contract, boundImplementation, this.location)
  return bound
}

/**
 * A General Contract Function is an implementation of an AbstractContract. This function verifies whether a function
 * given as a parameter is a General Contract Function.
 *
 * To be a General Contract Function, the subject must
 * <ul>
 *   <li>be a function,</li>
 *   <li>have a frozen `contract` property that refers to a AbstractContract,</li>
 *   <li>have a frozen `implementation` property that refers to a function (which realizes the contract),</li>
 *   <li>have a frozen `location` property, that has a value,</li>
 *   <li>have a frozen `bind` property, which is {@link AbstractContract.bindContractFunction}, and</li>
 *   <li>have a `displayName` that is a contract function display name, which is a string that gives
 *     information for a programmer to understand which contract function this is, and</li>
 *   <li>if the `implementation` function has a `prototype`, have a `prototype` property,
 *     <ul>
 *       <li>that is an object,</li>
 *       <li>that has a `constructor` property that is the contract function, and</li>
 *       <li>that has `f.implementation.prototype` in its prototype chain, or is equal to it.
 *     </ul>
 *   </li>
 */
AbstractContract.isAGeneralContractFunction = function (f) {
  // Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot
  // freeze it, and not guaranteed in all engines.
  return typeof f === 'function' &&
         is.isFrozenOwnProperty(f, 'contract') &&
         f.contract instanceof AbstractContract &&
         is.isFrozenOwnProperty(f, 'implementation') &&
         typeof f.implementation === 'function' &&
         is.isFrozenOwnProperty(f, 'location') &&
         f.location &&
         f.displayName === AbstractContract.contractFunctionDisplayName(f) &&
         is.isFrozenOwnProperty(f, 'bind') &&
         f.bind === AbstractContract.bindContractFunction &&
         (!f.implementation.hasOwnProperty('prototype') ||
             (typeof f.prototype === 'object' &&
                 f.prototype.constructor === f &&
                 (f.prototype === f.implementation.prototype || f.prototype instanceof f.implementation)))
}

/**
 * A Contract Function is an implementation of a Contract. This function verifies whether a function
 * given as a parameter is a Contract Function.
 *
 * To be a Contract Function, the subject must
 * <ul>
 *   <li>be a [general contract function]{@linkplain #isAGeneralContractFunction()},</li>
 *   <li>have a frozen `location` property, which is a string that represents a location in source code,
 *     outside this library.</li>
 * </ul>
 */
AbstractContract.isAContractFunction = function (f) {
  return AbstractContract.isAGeneralContractFunction(f) && is.isAStackLocation(f.location)
}

/**
 * Helper function that transforms any function given as <code>contractFunction</code>
 * into a [contract function]{@linkplain AbstractContract#isAContractFunction}
 * for the given parameters.
 * If {@code implFunction.prototype} exists, the {@code contractFunction.prototype} is changed to
 * an object that refers to {@code contractFunction} as {@code contractFunction.prototype.constructor},
 * is otherwise empty, and has {@code implFunction.prototype} as prototype.
 *
 * @param contractFunction {Function} the regular {Function} to be transformed into a contract function
 * @param contract {AbstractContract} the contract <code>contractFunction</code> is a realisation of
 * @param implFunction {Function} the function that is used in <code>contractFunction</code>
 *                     to realize the postconditions of <code>contract</code> under its preconditions
 * @param location {String} the location outside this library that the resulting
 *                          [contract function]{@linkplain AbstractContract#isAContractFunction} will carry,
 *                          that says where it is defined.
 */
AbstractContract.bless = function bless (contractFunction, contract, implFunction, location) {
  util.pre(() => typeof contractFunction === 'function')
  // noinspection JSUnresolvedVariable
  util.pre(() => !contractFunction.contract)
  // noinspection JSUnresolvedVariable
  util.pre(() => !contractFunction.implementation)
  // noinspection JSUnresolvedVariable
  util.pre(() => !contractFunction.location)
  util.pre(() => contractFunction.bind === Function.prototype.bind)
  util.pre(() => contract instanceof AbstractContract)
  util.pre(() => typeof implFunction === 'function')
  util.pre(() => location === AbstractContract.internalLocation || is.isAStackLocation(location))

  util.setAndFreezeProperty(contractFunction, 'contract', contract)
  util.setAndFreezeProperty(contractFunction, 'implementation', implFunction)
  util.setAndFreezeProperty(contractFunction, 'location', location)
  util.setAndFreezeProperty(contractFunction, 'bind', AbstractContract.bindContractFunction)
  if (implFunction.hasOwnProperty('prototype')) {
    contractFunction.prototype = Object.create(implFunction.prototype)
    util.setAndFreezeProperty(contractFunction.prototype, 'constructor', contractFunction)
  }
  util.defineFrozenDerivedProperty(
    contractFunction,
    'displayName',
    function () { return AbstractContract.contractFunctionDisplayName(this) }
  )
}

/**
 * Function that always returns <code>false</code>.
 */
AbstractContract.falseCondition = function () { return false }

/**
 * Singleton array of {@linkplain AbstractContract#falseCondition}. Can be used the clearly signal
 * that a function should never throw exceptions, or never end nominally, or should never be called,
 * because the preconditions will always fail.
 */
AbstractContract.mustNotHappen = [AbstractContract.falseCondition]

/**
 * The most general function AbstractContract. This has the most strict preconditions (nothing is allowed), which can
 * be weakened by specializations, and the most general nominal and exceptional postconditions (anything goes),
 * which can be strengthened by specializations.
 */
AbstractContract.root = new AbstractContract(
  {
    pre: AbstractContract.mustNotHappen,
    post: [],
    exception: []
  },
  AbstractContract.internalLocation
)

const message = 'an abstract function cannot be executed'

/**
 * Thrown when an abstract method is called. You shouldn't.
 *
 * @constructor
 */
function AbstractError (contract, rawStack) {
  util.pre(() => contract instanceof AbstractContract)
  util.pre(() => is.isAStack(rawStack))

  ContractError.call(this, rawStack)
  util.setAndFreezeProperty(this, 'name', AbstractError.name)
  util.setAndFreezeProperty(this, 'message', message)
  util.setAndFreezeProperty(this, 'contract', contract)
}

AbstractError.prototype = new ContractError(util.callerStack())
AbstractError.prototype.constructor = AbstractError
util.setAndFreezeProperty(AbstractError.prototype, 'name', AbstractError.name)
util.setAndFreezeProperty(AbstractError.prototype, 'message', message)
util.setAndFreezeProperty(AbstractError.prototype, 'contract', null)

AbstractError.message = message

AbstractContract.AbstractError = AbstractError

module.exports = AbstractContract
