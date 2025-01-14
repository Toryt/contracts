/*
  Copyright 2016–2025 Jan Dockx

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

import { ContractError } from './ContractError.ts'
import type { UnknownFunction } from './types/UnknownFunction.ts'
import type { Postcondition } from './Postcondition.ts'
import assert, { ok, strictEqual } from 'assert'
import { location as stackLocation } from './private/stack.ts'
import { setAndFreeze } from './private/property.ts'
import { namePrefix } from './private/representation.ts'
import { stack as isStack, isFrozenOwnProperty } from './private/is.ts'

export const abstractErrorMessage = 'an abstract function cannot be executed'

/**
 * Thrown when an abstract method is called. You shouldn't.
 */
export class AbstractError<AFC extends AbstractFunctionContract<UnknownFunction>> extends ContractError {
  static {
    setAndFreeze(this.prototype, 'name', AbstractError.name)
    setAndFreeze(this.prototype, 'message', abstractErrorMessage)
    setAndFreeze(this.prototype, 'contract', null)
  }

  readonly contract!: AFC

  constructor(contract: AFC, rawStack: string) {
    ok(contract instanceof AbstractFunctionContract, 'contract is an AbstractContract')
    ok(isStack(rawStack), 'rawStack is a stack')

    super(rawStack)
    // make the name and message non-configurable and non-overwritable
    /* TODO Consider freezing the entire object. Is there something in he history why this is no good? Do we need to
            keep the possibility to add properties for instance, for tests? */
    setAndFreeze(this, 'name', AbstractError.name)
    setAndFreeze(this, 'message', abstractErrorMessage)
    setAndFreeze(this, 'contract', contract)
  }
}

export type InternalLocation = Readonly<{
  toString: () => 'INTERNAL'
}>

export type FunctionContractLocation = string | InternalLocation

export interface GeneralContractFunctionProperties<
  ContractSignature extends UnknownFunction,
  ImplementationSignature extends ContractSignature
> {
  contract: AbstractFunctionContract<ContractSignature>
  implementation: ImplementationSignature
  location: FunctionContractLocation
}

export type GeneralContractFunction<
  ContractSignature extends UnknownFunction,
  ImplementationSignature extends ContractSignature
> = ContractSignature & GeneralContractFunctionProperties<ContractSignature, ImplementationSignature>

export interface ContractFunctionProperties<
  ContractSignature extends UnknownFunction,
  ImplementationSignature extends ContractSignature
> extends GeneralContractFunctionProperties<ContractSignature, ImplementationSignature> {
  location: string
}

export type ContractFunction<
  ContractSignature extends UnknownFunction,
  ImplementationSignature extends ContractSignature
> = GeneralContractFunction<ContractSignature, ImplementationSignature> &
  ContractFunctionProperties<ContractSignature, ImplementationSignature>

export interface FunctionContractKwargs<Signature extends UnknownFunction> {
  post?: Postcondition<Signature>[]
}

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
 * `.outcome`, and `.callee` can be used to extract the result or exception (outcome) or bound function for recursive
 * definitions inside conditions from `arguments`.
 *
 * The default preconditions and postconditions are the empty array (anything goes). For exceptions, the default
 * condition is `AbstractContract.mustNotHappen` (any exception is a violation).
 *
 * Furthermore, an instance contains a `location` property, which is a line of text
 * that refers to the source code where the contract was created. For internal contracts, this is
 * `AbstractContract.internalLocation.
 *
 * If `verify` and `verifyPostconditions` are both truthy, contract function verification will verify preconditions,
 * postconditions and exception conditions. If `verify` is truthy, but `verifyPostconditions` is falsy, contract
 * function verification will verify preconditions, but not postconditions and exception conditions. This is the
 * default. If `verify` is falsy, contract function executions will not be verified.
 *
 * The `contract` of a contract function is a separate object that has the contract it is an implementation of as a
 * prototype. Therefore, the `verify` and `verifyPostconditions` properties can be overridden for all
 * `AbstractContracts` by changing the properties of `AbstractContracts.prototype`, for one contract by changing its
 * properties, or for a particular contract function `cf` by changing the properties of `cf.contract`. The values
 * the properties hold at the moment of the call are used (this is relevant for asynchronous functions).
 *
 * With well-tested code, the default settings should be used in production. When the code is stable, `verify` can be
 * set to `false` to gain additional speed. In tests, `verify` should be truthy and `verifyPostconditions` should be
 * `true`, at least for the function under test.
 *
 * The `_location` argument is for internal use, and might be removed.
 */
export class AbstractFunctionContract<Signature extends UnknownFunction> {
  // MUDO rename: this is not abstract (see root)
  static readonly namePrefix: typeof namePrefix = namePrefix

  /**
   * Object to be used as location for contracts and implementations that are generated inside this library.
   */
  static readonly internalLocation: InternalLocation = Object.freeze({
    toString: function (): 'INTERNAL' {
      return 'INTERNAL'
    }
  })

  /**
   * The most general {@link AbstractFunctionContract}. This has the most strict preconditions (nothing is allowed),
   * which can be weakened by specializations, and the most general nominal and exceptional postconditions (anything
   * goes), which can be strengthened by specializations.
   */
  static readonly root: AbstractFunctionContract<UnknownFunction> = new AbstractFunctionContract(
    {
      // MUDO
      // pre: AbstractContract.mustNotHappen,
      // post: [],
      // exception: []
    },
    AbstractFunctionContract.internalLocation
  )

  /**
   * Function that always returns <code>false</code>.
   */
  static falseCondition(): boolean {
    return false
  }

  /**
   * Singleton array of {@linkplain AbstractFunctionContract#falseCondition}. Can be used the clearly signal
   * that a function should never throw exceptions, or never end nominally, or should never be called,
   * because the conditions will always fail.
   */
  static readonly mustNotHappen: readonly (typeof AbstractFunctionContract.falseCondition)[] = Object.freeze([
    AbstractFunctionContract.falseCondition
  ])

  /**
   * A {@link GeneralContractFunction} is an {@link AbstractFunctionContract#implementation} of an
   * {@link AbstractFunctionContract}. This function verifies whether a function given as a parameter is a
   * General Contract Function.
   *
   * To be a {@link GeneralContractFunction}, the subject must
   *
   *   * be a function,
   *   * have a frozen {@link GeneralContractFunction#contract} property that refers to an
   *     {@link AbstractFunctionContract},
   *   * have a frozen {@link GeneralContractFunction#implementation} property that refers to a function (that realizes
   *     the contract),
   *   * have a frozen {@link GeneralContractFunction#location} property, that has a value,
   *   * have a frozen {@link GeneralContractFunction#bind} property, that is
   *     {@link AbstractContract.bindContractFunction}, and
   *   * if the {@link GeneralContractFunction#implementation} function has a `prototype`, have a `prototype` property,
   *       * that is an object,
   *       * that has a `constructor` property that is the contract function, and
   *       * that has `f.implementation.prototype` in its prototype chain, or is equal to it, and
   *
   * should have a {@link GeneralContractFunction#name}, which is a string that gives information for a programmer to
   * understand what contract function this is. The {@link GeneralContractFunction#name} however is controlled by the
   * JavaScript engine. We cannot freeze it, and it is not guaranteed to exist or have a specific value in all engines.
   */
  static isAGeneralContractFunction<
    ContractSignature extends UnknownFunction,
    ImplementationSignature extends ContractSignature
  >(f: unknown): f is GeneralContractFunction<ContractSignature, ImplementationSignature> {
    // Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot
    // freeze it, and not guaranteed in all engines.
    return (
      typeof f === 'function' &&
      isFrozenOwnProperty(f, 'contract') &&
      f.contract instanceof AbstractFunctionContract &&
      isFrozenOwnProperty(f, 'implementation') &&
      typeof f.implementation === 'function' &&
      isFrozenOwnProperty(f, 'location') &&
      !!f.location
      // &&
      // MUDO
      // (f === f.implementation || f.name === conciseRepresentation(AbstractFunctionContract.namePrefix, f.implementation))
      // &&
      // isFrozenOwnProperty(f, 'bind')
      // &&
      // f.bind === AbstractContract.bindContractFunction &&
      // (!Object.prototype.hasOwnProperty.call(f.implementation, 'prototype') ||
      //   (typeof f.prototype === 'object' &&
      //     f.prototype.constructor === f &&
      //     (f.prototype === f.implementation.prototype || f.prototype instanceof f.implementation)))
    )
  }

  /**
   * A reference to the line where the `…FunctionContract` is constructed. This representation contains the name of the
   * function inside which the constructor is called.
   *
   * When this result is used as a line on its own, it is clickable to navigate to the referred source code in most
   * consoles.
   */
  readonly location!: FunctionContractLocation // initialized with setAndFreeze

  verify: boolean = true
  verifyPostconditions: boolean = false

  constructor(kwargs: FunctionContractKwargs<Signature>, _location?: FunctionContractLocation) {
    ok(kwargs, 'kwargs is mandatory')
    strictEqual(typeof kwargs, 'object', 'kwargs must be an object')
    ok(
      kwargs.post === undefined || (Array.isArray(kwargs.post) && kwargs.post.every(p => typeof p === 'function')),
      'optional kwargs.post must be an array of functions as postconditions'
    )
    // assert(!kwargs.pre || Array.isArray(kwargs.pre), 'optional kwargs.pre is an array')
    // assert(!kwargs.exception || Array.isArray(kwargs.exception), 'optional kwargs.exception is an array')
    assert(
      !_location || _location === AbstractFunctionContract.internalLocation || typeof _location === 'string',
      'optional private _location is internal or a string'
    )

    const self = this

    // /* This cannot be defined in the prototype. The `self` is the contract, not the `this`. When this function is called
    //    as a method of a random object, that random object is the `this`, not this contract. */
    // function abstract(): never {
    //   throw new AbstractContract.AbstractError(self, rawStack())
    // }

    const location: FunctionContractLocation = _location || stackLocation(1)
    // AbstractContract.bless(abstract, self, abstract, location)
    // property.setAndFreeze(self, '_pre', Object.freeze(kwargs.pre ? kwargs.pre.slice() : []))
    // property.setAndFreeze(self, '_post', Object.freeze(kwargs.post ? kwargs.post.slice() : []))
    // property.setAndFreeze(
    //   self,
    //   '_exception',
    //   Object.freeze(kwargs.exception ? kwargs.exception.slice() : mustNotHappen)
    // )
    setAndFreeze(self, 'location', Object.freeze(location))
    // property.setAndFreeze(self, 'abstract', abstract)
  }
}
//
// function isOrHasAsPrototype(obj, proto) {
//   return obj === proto || (obj !== Object.prototype && isOrHasAsPrototype(Object.getPrototypeOf(obj), proto))
// }
//
// AbstractContract.prototype = {
//   constructor: AbstractContract,
//   _pre: null,
//   _post: null,
//   _exception: null,
//   isImplementedBy: function (f) {
//     return AbstractContract.isAGeneralContractFunction(f) && isOrHasAsPrototype(f.contract, this)
//   }
// }
// property.frozenReadOnlyArray(AbstractContract.prototype, 'pre', '_pre')
// property.frozenReadOnlyArray(AbstractContract.prototype, 'post', '_post')
// property.frozenReadOnlyArray(AbstractContract.prototype, 'exception', '_exception')
// property.setAndFreeze(AbstractContract.prototype, 'location', AbstractContract.internalLocation)
// property.setAndFreeze(AbstractContract.prototype, 'abstract', null)

// /**
//  * This function is intended to be used as the bind function of contract functions. It makes sure
//  * that, when applied to a contract function, the result
//  * [is also a contract function]{@linkplain AbstractContract#isAContractFunction}.
//  * The bind aspect of the functionality is the same as {@link Function#prototype#bind}.
//  * The implementation of the resulting contract function is also bound in the same
//  * way as the resulting contract function itself.
//  */
// AbstractContract.bindContractFunction = function bind() {
//   assert(AbstractContract.isAGeneralContractFunction(this), 'this is a general contract function')
//
//   const bound = Function.prototype.bind.apply(this, arguments)
//   const boundImplementation = Function.prototype.bind.apply(this.implementation, arguments)
//   property.frozenDerived(boundImplementation, 'name', () => report.conciseRepresentation('bound', this.implementation))
//   AbstractContract.bless(bound, this.contract, boundImplementation, this.location)
//   return bound
// }
//
// /**
//  * A Contract Function is an implementation of a Contract. This function verifies whether a function
//  * given as a parameter is a Contract Function.
//  *
//  * To be a Contract Function, the subject must
//  * <ul>
//  *   <li>be a [general contract function]{@linkplain #isAGeneralContractFunction()},</li>
//  *   <li>have a frozen `location` property, which is a string that represents a location in source code,
//  *     outside this library.</li>
//  * </ul>
//  */
// AbstractContract.isAContractFunction = function (f) {
//   return AbstractContract.isAGeneralContractFunction(f) && f.contract instanceof this && is.stackLocation(f.location)
// }
//
// /**
//  * Helper function that transforms any function given as <code>contractFunction</code>
//  * into a [contract function]{@linkplain AbstractContract#isAContractFunction}
//  * for the given parameters.
//  * If {@code implFunction#prototype} exists, the {@code contractFunction#prototype} is changed to
//  * an object that refers to {@code contractFunction} as {@code contractFunction.prototype.constructor},
//  * is otherwise empty, and has {@code implFunction#prototype} as prototype.
//  *
//  * @param contractFunction {Function} the regular {Function} to be transformed into a contract function
//  * @param contract {AbstractContract} the contract <code>contractFunction</code> is a realisation of
//  * @param implFunction {Function} the function that is used in <code>contractFunction</code>
//  *                     to realize the postconditions of <code>contract</code> under its preconditions
//  * @param location {String} the location outside this library that the resulting
//  *                          [contract function]{@linkplain AbstractContract#isAContractFunction} will carry,
//  *                          that says where it is defined.
//  */
// AbstractContract.bless = function bless(contractFunction, contract, implFunction, location) {
//   assert.strictEqual(typeof contractFunction, 'function')
//   // noinspection JSUnresolvedReference
//   assert.ok(!contractFunction.contract)
//   // noinspection JSUnresolvedReference
//   assert.ok(!contractFunction.implementation)
//   // noinspection JSUnresolvedReference
//   assert.ok(!contractFunction.location)
//   assert.strictEqual(contractFunction.bind, Function.prototype.bind)
//   assert(contract instanceof AbstractContract, 'contract is an AbstractContract')
//   assert.strictEqual(typeof implFunction, 'function')
//   assert(
//     location === AbstractContract.internalLocation || is.stackLocation(location),
//     'location is internal, or a stack location'
//   )
//
//   property.setAndFreeze(contractFunction, 'contract', Object.create(contract))
//   property.setAndFreeze(contractFunction, 'implementation', implFunction)
//   property.setAndFreeze(contractFunction, 'location', location)
//   property.setAndFreeze(contractFunction, 'bind', AbstractContract.bindContractFunction)
//   if (contractFunction !== implFunction) {
//     /* `abstract` refers to itself as implementation; we do not change its name (it would create a circular name
//        definition) */
//     // IDEA defend code against more complex circular structure
//     /* NOTE: This test should be implFunction.hasOwnProperty('prototype'). However, in Safari on iOS, tests show that
//              'most of the time' this prototype is not set in our tests, as it should be. It seems to depend on the
//              complexity of the function, and to be set 'late' (because it is there in isAGeneralContractFunction). If a
//              log command is added, the prototype is set early enough. To work around this, this test is replaced with
//              !!implFunction.prototype. This defaults to the prototype set in Function.prototype, which is an Object.
//              This means we now replace the contractFunction prototype more often than needed, but that is not a
//              functional problem. */
//     if (implFunction.prototype && typeof implFunction.prototype === 'object') {
//       contractFunction.prototype = Object.create(implFunction.prototype)
//       property.setAndFreeze(contractFunction.prototype, 'constructor', contractFunction)
//       // the following line is added to work around an issue in Safari on iOS. See 4ed9879c6b5544b174ae0825d7f7055fd5e147d8
//       assert(
//         Object.getPrototypeOf(contractFunction.prototype) === implFunction.prototype,
//         'contractFunction prototype is set to extend `implFunction.prototype`'
//       )
//     }
//     /* The name of the contract function will always be 'contractFunction', because we need to define it in
//       `Contract.implementation`, because we need to refer to the contract function internally. We would like the result
//       of `Contract.implementation` to get a name inferred from its syntactic position, but cannot happen: before
//       we reach the 'syntactic position' (a.k.a, we assign the contract function to a variable or property with
//       a name), it will already have the name `contractFunction` we need internally. Therefore, we will explicitly set
//       the name, based on the name of implementation function.
//       The Firefox feature `displayName` will not be used.
//       This is a real property, and not a derived property. Earlier, it was, but this was changed in response to
//       https://github.com/sinonjs/sinon/issues/2203 */
//     // IDEA we might also add a name property to a Contract, and combine it with that
//     const implNamePropertyDescriptor = Object.getOwnPropertyDescriptor(implFunction, 'name')
//     Object.defineProperty(contractFunction, 'name', {
//       configurable: implNamePropertyDescriptor.configurable,
//       enumerable: implNamePropertyDescriptor.enumerable,
//       writable: implNamePropertyDescriptor.writable,
//       value: report.conciseRepresentation(report.namePrefix, implFunction)
//     })
//   }
// }
//
// /**
//  * Returns the second-to-last element of an Array-like argument. In post- and exception conditions,
//  * this is the function call result, respectively, the thrown exception.
//  */
// function outcome(args) {
//   assert.ok(args)
//   assert(Array.isArray(args) || typeof args.length === 'number', 'args is Array or arguments')
//   // NOTE: it is not possible to fully test for an arguments object in strict mode
//   assert(args.length >= 2, 'args has at least 2 elements')
//
//   return args[args.length - 2]
// }
//
// /**
//  * Returns the last element of an Array-like argument. In post- and exception conditions,
//  * this is the called contract function, bound to this. This can be used in recursive definitions.
//  */
// function callee(args) {
//   assert.ok(args)
//   assert(Array.isArray(args) || typeof args.length === 'number', 'args is Array or arguments')
//   // NOTE: it is not possible to fully test for an arguments object in strict mode
//   assert(args.length >= 2, 'args has at least 2 elements') // stronger than absolutely necessary
//
//   return args[args.length - 1]
// }
//
// AbstractContract.outcome = outcome
// // noinspection JSAnnotator
// AbstractContract.callee = callee
