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

import ContractError from './ContractError'
import {
  functionArguments,
  frozenOwnProperty,
  stackLocation as isStackLocation
} from '../_private/is'
import { raw as rawStack, location as stackLocation } from '../_private/stack'
import { setAndFreeze, frozenDerived } from '../_private/property'
import { conciseCondition } from '../_private/report'
import * as assert from 'assert'

export type Condition = () => boolean
export type ConditionSet = ReadonlyArray<Condition>

export interface AbstractContractKwargs {
  pre: ConditionSet | null | undefined
  post: ConditionSet | null | undefined
  exception: ConditionSet | null | undefined
}

class InternalLocation {
  // private
  toString(): string {
    return 'INTERNAL'
  }
}

export type Location = string | InternalLocation

export interface GeneralContractFunction extends Function {
  contract: AbstractContract
  location: Location
  implementation: Function
}

export interface ContractFunction extends GeneralContractFunction {
  location: string
}

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
 * prototype. Therefor, the `verify` and `verifyPostconditions` properties can be overridden for all
 * `AbstractContracts` by changing the properties of `AbstractContracts.prototype`, for one contract by changing its
 * properties, or for a particular contract function `cf` by changing the properties of `cf.contract`. The values
 * the properties hold at the moment of the call are used (this is relevant for asynchronous functions).
 *
 * With well-tested code, the default settings should be used in production. When the code is extremely stable,
 * `verify` can be set to `false` to gain additional speed. In tests, `verify` should be truthy and
 * `verifyPostconditions` should be `true`, at least for the function under test.
 *
 * The `_location` argument is for internal use, and might be removed.
 */
export default class AbstractContract {
  // noinspection ParameterNamingConventionJS
  constructor(kwargs: AbstractContractKwargs, _location?: Location) {
    const self: AbstractContract = this

    /* This cannot be defined in the prototype. The `self` is the contract, not the `this`. When this function is called
       as a method of a random object, that random object is the `this`, not this contract. */
    function abstract(): never {
      throw new AbstractError(self, rawStack())
    }

    const location: string | InternalLocation = _location || stackLocation(1)
    AbstractContract.bless(abstract, this, abstract, location)
    this._pre = Object.freeze(kwargs.pre ? kwargs.pre.slice() : [])
    this._post = Object.freeze(kwargs.post ? kwargs.post.slice() : [])
    this._exception = Object.freeze(
      kwargs.exception ? kwargs.exception.slice() : []
    )
    this.location = location
    this.abstract = abstract
  }

  /**
   * Object to be used as location for contracts and implementations that are generated inside this library.
   */
  static readonly internalLocation: InternalLocation = Object.freeze(
    new InternalLocation()
  )

  static readonly namePrefix: string = '𝕋⚖️'

  /**
   * Function that always returns <code>false</code>.
   */
  static falseCondition: Condition = function alwaysFalse(): boolean {
    return false
  }

  /**
   * Singleton array of {@linkplain AbstractContract#falseCondition}. Can be used the clearly signal
   * that a function should never throw exceptions, or never end nominally, or should never be called,
   * because the conditions will always fail.
   */
  static mustNotHappen: ConditionSet = Object.freeze([
    AbstractContract.falseCondition
  ])

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
   *   <li>have a `name`, which is a string that gives information for a programmer to understand which contract
   *     function this is, and</li>
   *   <li>if the `implementation` function has a `prototype`, have a `prototype` property,
   *     <ul>
   *       <li>that is an object,</li>
   *       <li>that has a `constructor` property that is the contract function, and</li>
   *       <li>that has `f.implementation.prototype` in its prototype chain, or is equal to it.
   *     </ul>
   *   </li>
   */
  static isAGeneralContractFunction(f: any): boolean {
    // Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot
    // freeze it, and not guaranteed in all engines.
    // noinspection SuspiciousInstanceOfGuard
    return (
      typeof f === 'function' &&
      frozenOwnProperty(f, 'contract') &&
      f.contract instanceof AbstractContract &&
      frozenOwnProperty(f, 'implementation') &&
      typeof f.implementation === 'function' &&
      frozenOwnProperty(f, 'location') &&
      f.location &&
      (f === f.implementation ||
        f.name ===
          conciseCondition(AbstractContract.namePrefix, f.implementation)) &&
      frozenOwnProperty(f, 'bind') &&
      f.bind === AbstractContract.bindContractFunction &&
      (!f.implementation.hasOwnProperty('prototype') ||
        (typeof f.prototype === 'object' &&
          f.prototype.constructor === f &&
          (f.prototype === f.implementation.prototype ||
            f.prototype instanceof f.implementation)))
    )
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
  static isAContractFunction(f: any): boolean {
    return (
      this.isAGeneralContractFunction(f) &&
      f.contract instanceof this &&
      isStackLocation(f.location)
    )
  }

  /**
   * This function is intended to be used as the bind function of contract functions. It makes sure
   * that, when applied to a contract function, the result
   * [is also a contract function]{@linkplain AbstractContract#isAContractFunction}.
   * The bind aspect of the functionality is the same as {@link Function#prototype#bind}.
   * The implementation of the resulting contract function is also bound in the same
   * way as the resulting contract function itself.
   */
  static readonly bindContractFunction: (
    this: GeneralContractFunction
  ) => GeneralContractFunction = function bind(
    this: GeneralContractFunction
  ): GeneralContractFunction {
    // this construct, assigning a function to a property, allows us to set the name of the function to `bind`
    assert(
      AbstractContract.isAGeneralContractFunction(this),
      'this is a general contract function'
    )

    const bound: Function = Function.prototype.bind.apply(this, arguments)
    const boundImplementation: Function = Function.prototype.bind.apply(
      this.implementation,
      arguments
    )
    frozenDerived(boundImplementation, 'name', () =>
      conciseCondition('bound', this.implementation)
    )
    // noinspection JSPotentiallyInvalidUsageOfClassThis -- this is weird
    return AbstractContract.bless(
      bound,
      this.contract,
      boundImplementation,
      this.location
    )
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
  static bless(
    contractFunction: Function,
    contract: AbstractContract,
    implFunction: Function,
    location: Location
  ): GeneralContractFunction {
    const blessed = contractFunction as GeneralContractFunction // not yet, but will be
    assert.equal(typeof blessed, 'function')
    // noinspection JSUnresolvedVariable
    assert.ok(!blessed.contract)
    // noinspection JSUnresolvedVariable
    assert.ok(!blessed.implementation)
    // noinspection JSUnresolvedVariable
    assert.ok(!blessed.location)
    assert.strictEqual(blessed.bind, Function.prototype.bind)
    assert.equal(typeof implFunction, 'function')
    assert(
      location === AbstractContract.internalLocation ||
        isStackLocation(location),
      'location is internal, or a stack location'
    )

    setAndFreeze(blessed, 'contract', Object.create(contract))
    setAndFreeze(blessed, 'implementation', implFunction)
    setAndFreeze(blessed, 'location', location)
    setAndFreeze(blessed, 'bind', AbstractContract.bindContractFunction)
    if (blessed !== implFunction) {
      /* `abstract` refers to itself as implementation; we do not change its name (it would create a circular name
         definition) */
      // IDEA defend code against more complex circular structure
      /* NOTE: This test should be implFunction.hasOwnProperty('prototype'). However, in Safari on iOS, tests show that
               'most of the time' this prototype is not set in our tests, as it should be. It seems to depend on the
               complexity of the function, and to be set 'late' (because it is there in isAGeneralContractFunction). If a
               log command is added, the prototype is set early enough. To work around this, this test is replaced with
               !!implFunction.prototype. This defaults to the prototype set in Function.prototype, which is an Object.
               This means we now replace the contractFunction prototype more often than needed, but that is not a
               functional problem. */
      if (
        implFunction.prototype &&
        typeof implFunction.prototype === 'object'
      ) {
        blessed.prototype = Object.create(implFunction.prototype)
        setAndFreeze(blessed.prototype, 'constructor', blessed)
        // the following line is added to work around an issue in Safari on iOS. See 4ed9879c6b5544b174ae0825d7f7055fd5e147d8
        assert(
          Object.getPrototypeOf(blessed.prototype) === implFunction.prototype,
          'contractFunction prototype is set to extend implFunction.prototype'
        )
      }
      /* The name of the contract function will always be 'contractFunction', because we need to define it in
        `Contract.implementation`, because we need to refer to the contract function internally. We would like the result
        of `Contract.implementation` to get a name inferred from its syntactic position, but cannot happen: before
        we reach the 'syntactic position' (a.k.a, we assign the contract function to a variable or property with
        a name), it will already have the name `contractFunction` we need internally. Therefor, we will explicitly set
        the name, based on the name of implementation function.
        The Firefox feature `displayName` will not be used.  */
      // IDEA we might also add a name property to a Contract, and combine it with that
      frozenDerived(
        blessed,
        'name',
        conciseCondition.bind(null, AbstractContract.namePrefix, implFunction)
      )
    }
    return blessed
  }

  /**
   * Returns the second-to-last element of an Array-like argument. In post- and exception conditions,
   * this is the function call result, respectively, the thrown exception.
   */
  static outcome(args: any[]): any {
    assert.ok(args)
    assert(
      Array.isArray(args) || functionArguments(args),
      'args is Array or arguments'
    )
    assert(args.length >= 2, 'args has at least 2 elements')

    return args[args.length - 2]
  }

  /**
   * Returns the last element of an Array-like argument. In post- and exception conditions,
   * this is the called contract function, bound to this. This can be used in recursive definitions.
   */
  static callee(args: any[]): GeneralContractFunction {
    assert.ok(args)
    assert(
      Array.isArray(args) || functionArguments(args),
      'args is Array or arguments'
    )
    assert(args.length >= 2, 'args has at least 2 elements') // stronger than absolutely necessary

    return args[args.length - 1]
  }

  /**
   * The most general function AbstractContract. This has the most strict preconditions (nothing is allowed), which can
   * be weakened by specializations, and the most general nominal and exceptional postconditions (anything goes),
   * which can be strengthened by specializations.
   */
  static readonly root: AbstractContract = new AbstractContract(
    {
      pre: AbstractContract.mustNotHappen,
      post: [],
      exception: []
    },
    AbstractContract.internalLocation
  )

  // noinspection LocalVariableNamingConventionJS
  private readonly _pre: ConditionSet
  // noinspection LocalVariableNamingConventionJS
  private readonly _post: ConditionSet
  // noinspection LocalVariableNamingConventionJS
  private readonly _exception: ConditionSet

  // noinspection FunctionNamingConventionJS
  get pre(): ConditionSet {
    return this._pre.slice()
  }

  get post(): ConditionSet {
    return this._post.slice()
  }

  get exception(): ConditionSet {
    return this._exception.slice()
  }

  readonly location: string | InternalLocation
  readonly abstract: () => never

  verify: boolean = true
  verifyPostconditions: boolean = false

  isImplementedBy(f: GeneralContractFunction): boolean {
    return (
      AbstractContract.isAGeneralContractFunction(f) &&
      Object.getPrototypeOf(f.contract) === this
    )
  }
}

setAndFreeze(AbstractContract.prototype, '_pre', null)
setAndFreeze(AbstractContract.prototype, '_post', null)
setAndFreeze(AbstractContract.prototype, '_exception', null)
setAndFreeze(
  AbstractContract.prototype,
  'location',
  AbstractContract.internalLocation
)
setAndFreeze(AbstractContract.prototype, 'abstract', null)

/**
 * Thrown when an abstract method is called. You shouldn't.
 */
export class AbstractError extends ContractError {
  constructor(contract: AbstractContract, rawStack: string) {
    super(rawStack)

    this.contract = contract
  }

  readonly contract: AbstractContract
  readonly name: string = AbstractError.name
  readonly message: string = 'an abstract function cannot be executed'
}

setAndFreeze(AbstractError.prototype, 'name', AbstractError.name)
setAndFreeze(AbstractError.prototype, 'contract', null)

module.exports = AbstractContract
