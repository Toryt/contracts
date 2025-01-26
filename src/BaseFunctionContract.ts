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

import assert, { ok, strictEqual } from 'assert'
import { ContractError } from './ContractError.ts'
import { type GeneralLocation, internalLocation, type InternalLocation, isLocation, location } from './location.ts'
import type { Postcondition } from './Postcondition.ts'
import { frozenDerived, hasProperty, isFrozenOwnProperty, setAndFreeze } from './private/property.ts'
import { conciseRepresentation, namePrefix } from './private/representation.ts'
import { isStack, rawStack } from './private/stack.ts'
import type { RestOfTuple } from './types/RestOfTuple.ts'
import type { UnknownFunction } from './types/UnknownFunction.ts'

export const abstractErrorMessage = 'an abstract function cannot be executed'

/**
 * Thrown when an abstract method is called. You shouldn't.
 */
export class AbstractError<BFC extends BaseFunctionContract<UnknownFunction, GeneralLocation>> extends ContractError {
  static {
    setAndFreeze(this.prototype, 'name', AbstractError.name)
    setAndFreeze(this.prototype, 'message', abstractErrorMessage)
    setAndFreeze(this.prototype, 'contract', null)
  }

  readonly contract!: BFC

  constructor(contract: BFC, rawStack: string) {
    ok(contract instanceof BaseFunctionContract, 'contract is an BaseFunctionContract')
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

export interface BaseContractFunctionProperties<BFC extends BaseFunctionContract<UnknownFunction, GeneralLocation>> {
  contract: BFC
}

/* NOTE: In principle, one generic parameter `BFC extends BaseFunctionContract<UnknownFunction, GeneralLocation` should
         suffice. From that we can infer the `ContractSignature` with
         ```
         export type ContractSignature<BFC extends BaseFunctionContract<UnknownFunction, GeneralLocation>> =
           BFC extends BaseFunctionContract<infer CS, GeneralLocation> ? CS : never
         ```
         However, when we do that, TypeScript develops some infinite loop, not yet recognized in detail, which seems to
         have to do with {@link BaseFunctionContract.abstract} being a {@link BaseContractFunction<this>}, which has
         a {@link BaseContractFunction.contract}.
         -
         It seems bonkers that this would introduce an infinite inference loop, since it is clear in any which direction
         that the type of {@link BaseContractFunction.contract} is the `this` type of
         {@link BaseFunctionContract.abstract}, and this is specified explicity.
         -
         It is highly annoying that I cannot find any reasonable in depth description of what this type-checking process
         does on the internet. What is called “advanced” is actually kindergarten material. There are reference to magic
         tricks, but nobody explains what “TS2589: Type instantiation is excessively deep and possibly infinite.”
         actually means, and what code structure get the type checker there.
         -
         With the above type, there is no direct recursion. The type has a clear end condition. The is recursion via
         `BaseFunctionContract`, but there shouldn't be. Once we find a `BaseFunctionContract`, it should be obvious
         what `CS` is. There is no need to look for it. If the typechecker insists on again validating the type
         of the `BaseContractFunction`, it will check the structure of its `contract`, which includes a property
         `abstract`, whose type is the `BaseContractFunction`. This is a circle, but should not be an infinite loop.
         I believen the typechecker does not understand this. From the type of `abstract`, which says the `contract` is
         `this`, it should recognize the circle immediately, on first or second pass, but, if this is indeed the issue,
         it doesn't, and gets confused first by the requested inference `ContractSignature` for some reason.
         -
         By having the `ContractSignature` generic parameter separate, we avoid this issue it seems. */
export type BaseContractFunction<
  ContractSignature extends UnknownFunction,
  BFC extends BaseFunctionContract<ContractSignature, GeneralLocation>
> = ContractSignature & BaseContractFunctionProperties<BFC>

/**
 * A {@link BaseContractFunction} is an {@link BaseFunctionContract#implementation} of an
 * {@link BaseFunctionContract}. This function verifies whether a function given as a parameter is a
 * General Contract Function.
 *
 * // MUDO change to ContractFunction, or distribute otherwise
 * To be a {@link BaseContractFunction}, the subject must
 *
 *   * be a function,
 *   * have a frozen {@link BaseContractFunction.contract} property that refers to an
 *     {@link BaseFunctionContract},
 *   * have a frozen {@link BaseContractFunction.implementation} property that refers to a function (that realizes
 *     the contract),
 *   * have a frozen {@link BaseContractFunction.location} property, that has a value,
 *   * have a frozen {@link BaseContractFunction.bind} property, that is
 *     {@link contractFunctionBind}, and
 *   * if the {@link BaseContractFunction.implementation} function has a `prototype`, have a `prototype` property,
 *       * that is an object,
 *       * that has a `constructor` property that is the contract function, and
 *       * that has `f.implementation.prototype` in its prototype chain, or is equal to it, and
 *
 * should have a {@link BaseContractFunction.name}, which is a string that gives information for a programmer to
 * understand what contract function this is. The {@link BaseContractFunction.name} however is controlled by the
 * JavaScript engine. We cannot freeze it, and it is not guaranteed to exist or have a specific value in all engines.
 *
 * This function cannot dynamically infer what the exact generic type of the {@link ContractFunction.contract},
 * {@link ContractFunction.implementation}, or {@link ContractFunction.bind} is. These could only be inferred at
 * compile time if they were known to start with, and then calling this function has no purpose.
 */
export function isAGeneralContractFunction(
  f: unknown
): f is ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, GeneralLocation>, UnknownFunction> {
  // Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot
  // freeze it, and not guaranteed in all engines.

  function testPrototype(f: Function, implementation: Function): boolean {
    if (!Object.prototype.hasOwnProperty.call(implementation, 'prototype')) {
      return !Object.prototype.hasOwnProperty.call(f, 'prototype')
    }

    if (!Object.prototype.hasOwnProperty.call(f, 'prototype')) {
      return false
    }

    if (
      (typeof implementation.prototype !== 'object' || implementation.prototype === null) &&
      typeof implementation.prototype !== 'function'
    ) {
      return (
        f.prototype === implementation.prototype ||
        (Number.isNaN(f.prototype) && Number.isNaN(implementation.prototype))
      )
    }

    if (Object.getPrototypeOf(f.prototype) !== implementation.prototype) {
      return false
    }

    if (hasProperty(implementation.prototype, 'constructor')) {
      if (implementation.prototype.constructor === implementation) {
        return f.prototype.constructor === f
      }

      return (
        f.prototype.constructor === implementation.prototype.constructor ||
        (Number.isNaN(f.prototype.constructor) && Number.isNaN(implementation.prototype.constructor))
      )
    }

    return true
  }

  return (
    typeof f === 'function' &&
    isFrozenOwnProperty(f, 'contract') &&
    f.contract instanceof BaseFunctionContract &&
    isFrozenOwnProperty(f, 'implementation') &&
    typeof f.implementation === 'function' &&
    isFrozenOwnProperty(f, 'location') &&
    !!f.location &&
    (f === f.implementation || f.name === conciseRepresentation(namePrefix, f.implementation)) &&
    isFrozenOwnProperty(f, 'bind') &&
    f.bind === contractFunctionBind &&
    testPrototype(f, f.implementation)
  )
}

/**
 * Helper function that transforms any function given as {@link contractFunctionToBe} into a {@link ContractFunction}
 * for the given parameters.
 *
 * If {@link implFunction.prototype} exists, the {@link contractFunctionToBe.prototype} is changed to an object that
 * refers to {@link contractFunctionToBe} as `contractFunctionToBe.prototype.constructor`, is otherwise empty, and
 * has {@link implFunction.prototype} as prototype.
 *
 * Note: this is not to be used by {@link abstract}, which has no `implementation`.
 *
 * @param contractFunctionToBe - the regular `function` to be transformed into a {@link ContractFunction}
 * @param contract - the {@link BaseFunctionContract} {@link contractFunctionToBe} is a realisation of
 * @param implFunction - the `function` that is used in {@link contractFunctionToBe} to realize the postconditions of
 *                       `this` under its preconditions
 * @param implementationLocation - the {@link isLocation location} outside this library that the resulting
 *                                 {@link ContractFunction} will carry, that says where it is defined
 * @returns {@link contractFunctionToBe}, as a {@link isAGeneralContractFunction}
 */
export function bless<
  ContractSignature extends UnknownFunction,
  BFC extends BaseFunctionContract<ContractSignature, GeneralLocation>,
  ImplementationSignature extends ContractSignature
>(
  contractFunctionToBe: ContractSignature, // MUDO will become a Proxy, should be at least ImplementationSignature
  contract: BFC,
  implFunction: ImplementationSignature,
  implementationLocation: string
): asserts contractFunctionToBe is ContractFunction<ContractSignature, BFC, ImplementationSignature> {
  assert.strictEqual(typeof contractFunctionToBe, 'function')
  assert.ok(!('contract' in contractFunctionToBe))
  assert.ok(!('implementation' in contractFunctionToBe))
  assert.ok(!('location' in contractFunctionToBe))
  assert.strictEqual(contractFunctionToBe.bind, Function.prototype.bind)
  assert(contract instanceof BaseFunctionContract, 'contract is a BaseFunctionContract')
  assert.strictEqual(typeof implFunction, 'function')
  assert.notStrictEqual(contractFunctionToBe, implFunction)
  assert(isLocation(implementationLocation), 'implementationLocation a location (not internal)')

  // intermediate contract instance, specifically for this contract function
  setAndFreeze(contractFunctionToBe, 'contract', Object.create(contract))
  setAndFreeze(contractFunctionToBe, 'implementation', implFunction)
  setAndFreeze(contractFunctionToBe, 'location', implementationLocation)
  setAndFreeze(
    contractFunctionToBe,
    'bind',
    contractFunctionBind // MUDO <BaseContractFunction<ContractSignature, ImplementationSignature, ImplementationLocation>>
  )
  // IDEA defend code against more complex circular structure
  /* NOTE: This test should be implFunction.hasOwnProperty('prototype'). However, in Safari on iOS, tests show that
           'most of the time' this prototype is not set in our tests, as it should be. It seems to depend on the
           complexity of the function, and to be set 'late' (because it is there in isAGeneralContractFunction). If a
           log command is added, the prototype is set early enough. To work around this, this test is replaced with
           `'prototype in implFunction'`. This defaults to the prototype set in Function.prototype, which is an
           `object`.
           This means we now replace the `contractFunction` prototype more often than needed, but that is not a
           functional problem. */
  if ('prototype' in implFunction && typeof implFunction.prototype === 'object') {
    /* The same prototype as `implFunction`, but with a clean intermediate. This makes the function work as a
       constructor, if `implFunction` was intended that way. */
    contractFunctionToBe.prototype = Object.create(implFunction.prototype)
    if (hasProperty(implFunction.prototype, 'constructor') && implFunction.prototype.constructor === implFunction) {
      setAndFreeze(contractFunctionToBe.prototype, 'constructor', contractFunctionToBe)
      // the following line is added to work around an issue in Safari on iOS. See 4ed9879c6b5544b174ae0825d7f7055fd5e147d8
      assert(
        Object.getPrototypeOf(contractFunctionToBe.prototype) === implFunction.prototype,
        'contractFunction prototype is set to extend `implFunction.prototype`'
      )
    }
  }
  // MUDO with proxies, this is no longer true. Verify
  /* The name of the contract function will always be 'contractFunction', because we need to define it in
    `Contract.implementation`, because we need to refer to the contract function internally. We would like the result
    of `Contract.implementation` to get a name inferred from its syntactic position, but cannot happen: before
    we reach the 'syntactic position' (a.k.a, we assign the contract function to a variable or property with
    a name), it will already have the name `contractFunction` we need internally. Therefore, we will explicitly set
    the name, based on the name of implementation function.
    The Firefox feature `displayName` will not be used.
    This is a real property, and not a derived property. Earlier, it was, but this was changed in response to
    https://github.com/sinonjs/sinon/issues/2203 */
  // IDEA we might also add a name property to a Contract, and combine it with that
  const implNamePropertyDescriptor = Object.getOwnPropertyDescriptor(implFunction, 'name')
  Object.defineProperty(contractFunctionToBe, 'name', {
    configurable: implNamePropertyDescriptor?.configurable ?? false,
    enumerable: implNamePropertyDescriptor?.enumerable ?? true,
    writable: implNamePropertyDescriptor?.writable ?? false,
    value: conciseRepresentation(namePrefix, implFunction)
  })
}

export interface ContractFunctionProperties<
  ContractSignature extends UnknownFunction,
  BFC extends BaseFunctionContract<ContractSignature, GeneralLocation>,
  ImplementationSignature extends ContractSignature
> extends BaseContractFunctionProperties<BFC> {
  implementation: ImplementationSignature
  location: string
}

export type ContractFunction<
  ContractSignature extends UnknownFunction,
  BFC extends BaseFunctionContract<ContractSignature, GeneralLocation>,
  ImplementationSignature extends ContractSignature
> = ContractSignature & ContractFunctionProperties<ContractSignature, BFC, ImplementationSignature>

type BoundSignature<Signature extends UnknownFunction, BoundArgs extends unknown[]> =
  Parameters<Signature> extends [...BoundArgs, ...infer _]
    ? (
        this: ThisParameterType<Signature>,
        ...remainingArgs: RestOfTuple<Parameters<Signature>, BoundArgs>
      ) => ReturnType<Signature>
    : never

export const boundPrefix = 'bound'

/**
 * bind(this: Function, thisArg: any, ...argArray: any[]): any;
 * This function is intended to be used as the {@link Function.bind} function of {@link ContractFunction}.
 *
 * It makes sure that, when applied to a {@link ContractFunction}, the result
 * {@linkplain BaseFunctionContract.isAContractFunction is also a contract function}.
 *
 * The bind aspect of the functionality is the same as {@link Function.prototype.bind}. The
 * {@link ContractFunctionProperties.implementation} of the resulting {@link ContractFunction} is also bound in the same
 * way as the resulting {@link ContractFunction} itself.
 */
export const contractFunctionBind = function bind<
  ContractSignature extends UnknownFunction,
  ContractLocation extends GeneralLocation,
  ImplementationSignature extends ContractSignature,
  CF extends ContractFunction<
    ContractSignature,
    BaseFunctionContract<ContractSignature, ContractLocation>,
    ImplementationSignature
  >,
  ArgsToBind extends unknown[]
>(
  this: CF,
  thisArgToBind?: ThisParameterType<ContractSignature>,
  ...argsArrayToBind: ArgsToBind
): ContractFunction<
  BoundSignature<ContractSignature, ArgsToBind>,
  BaseFunctionContract<BoundSignature<ContractSignature, ArgsToBind>, ContractLocation>, // MUDO well, actually … this is a new and separate contract, and where is that defined?
  BoundSignature<ImplementationSignature, ArgsToBind>
> {
  assert(isAGeneralContractFunction(this), 'this is a general contract function')

  const bound: BoundSignature<ContractSignature, ArgsToBind> = Function.prototype.bind.apply(this, [
    thisArgToBind,
    ...argsArrayToBind
  ])
  const boundImplementation: BoundSignature<ImplementationSignature, ArgsToBind> = Function.prototype.bind.apply(
    this.implementation,
    [thisArgToBind, ...argsArrayToBind]
  )
  frozenDerived(boundImplementation, 'name', () => conciseRepresentation(boundPrefix, this.implementation))

  /* MUDO TS complains about the contract here, and IS RIGHT! This contract has another signature
          `BoundSignature<ContractSignature, ArgsToBind>`, not `ContractSignature`. It means it will have less
          preconditions, and argument positions in pre and post conditions shift! Also, the contract of its `abstract`
          is wrong. We do need a new contract instance. */
  bless(
    bound,
    this.contract /* MUDO following as is a lie! */ as unknown as BaseFunctionContract<
      BoundSignature<ContractSignature, ArgsToBind>,
      ContractLocation
    >,
    boundImplementation,
    location(1)
  )

  return bound
}

export interface FunctionContractKwargs<Signature extends UnknownFunction> {
  post?: Postcondition<Signature>[]
}

/**
 * Base definition of a function contract.
 *
 * An BaseFunctionContract consists of an array of preconditions, an array of nominal postconditions,
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
 * condition is `BaseFunctionContract.mustNotHappen` (any exception is a violation).
 *
 * Furthermore, an instance contains a `location` property, which is a line of text
 * that refers to the source code where the contract was created. For internal contracts, this is
 * `BaseFunctionContract.internalLocation.
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
export class BaseFunctionContract<Signature extends UnknownFunction, Location extends GeneralLocation> {
  static {
    // MUDO
    // frozenReadOnlyArray(BaseFunctionContract.prototype, 'pre', '_pre')
    // frozenReadOnlyArray(BaseFunctionContract.prototype, 'post', '_post')
    // frozenReadOnlyArray(BaseFunctionContract.prototype, 'exception', '_exception')
    setAndFreeze(BaseFunctionContract.prototype, 'location', internalLocation)
    setAndFreeze(BaseFunctionContract.prototype, 'abstract', null)
  }

  static readonly namePrefix: typeof namePrefix = namePrefix

  /**
   * A {@link ContractFunction} is an implementation of a {@link BaseFunctionContract Contract}. This function verifies
   * whether a function given as a parameter is a {@link ContractFunction} of this subtype of
   * {@link BaseFunctionContract}.
   *
   * To be a {@link ContractFunction}, the subject must
   *
   *   * be a {@link isAGeneralContractFunction BaseContractFunction},
   *   * have a frozen `location` property, which is a string that represents a location in source code, outside this
   *     library.
   */
  static isAContractFunction(
    f: unknown
  ): f is ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction> {
    return isAGeneralContractFunction(f) && f.contract instanceof this && isLocation(f.location)
  }

  /**
   * Function that always returns <code>false</code>.
   */
  static falseCondition(): boolean {
    return false
  }

  /**
   * Singleton array of {@linkplain BaseFunctionContract#falseCondition}. Can be used the clearly signal
   * that a function should never throw exceptions, or never end nominally, or should never be called,
   * because the conditions will always fail.
   */
  static readonly mustNotHappen: readonly (typeof BaseFunctionContract.falseCondition)[] = Object.freeze([
    BaseFunctionContract.falseCondition
  ])

  /**
   * A reference to the line where the `…FunctionContract` is constructed. This representation contains the name of the
   * function inside which the constructor is called.
   *
   * When this result is used as a line on its own, it is clickable to navigate to the referred source code in most
   * consoles.
   */
  readonly location!: Location // initialized with setAndFreeze

  readonly abstract!: BaseContractFunction<Signature, this>

  verify: boolean = true
  verifyPostconditions: boolean = false

  constructor(kwargs: FunctionContractKwargs<Signature>, _location?: GeneralLocation) {
    ok(kwargs, 'kwargs is mandatory')
    strictEqual(typeof kwargs, 'object', 'kwargs must be an object')
    ok(
      kwargs.post === undefined || (Array.isArray(kwargs.post) && kwargs.post.every(p => typeof p === 'function')),
      'optional kwargs.post must be an array of functions as postconditions'
    )
    // assert(!kwargs.pre || Array.isArray(kwargs.pre), 'optional kwargs.pre is an array')
    // assert(!kwargs.exception || Array.isArray(kwargs.exception), 'optional kwargs.exception is an array')
    assert(
      !_location || _location === internalLocation || isLocation(_location),
      'optional private _location is internal, or a location'
    )

    const theLocation: GeneralLocation = _location || location(1)
    const self = this

    /* This cannot be defined in the prototype. The `self` is the contract, not the `this`. When this function is called
       as a method of a random object, that random object is the `this`, not this contract. */
    function abstract(): never {
      throw new AbstractError(self, rawStack())
    }
    // intermediate contract instance, specifically for this contract function
    setAndFreeze(abstract, 'contract', Object.create(this))
    // `abstract` now is a `BaseContractFunction`

    setAndFreeze(self, 'location', Object.freeze(theLocation))
    setAndFreeze(self, 'abstract', abstract)

    // MUDO
    // property.setAndFreeze(self, '_pre', Object.freeze(kwargs.pre ? kwargs.pre.slice() : []))
    // property.setAndFreeze(self, '_post', Object.freeze(kwargs.post ? kwargs.post.slice() : []))
    // property.setAndFreeze(
    //   self,
    //   '_exception',
    //   Object.freeze(kwargs.exception ? kwargs.exception.slice() : mustNotHappen)
    // )
  }
}

/**
 * The most general {@link BaseFunctionContract}. This has the most strict preconditions (nothing is allowed),
 * which can be weakened by specializations, and the most general nominal and exceptional postconditions (anything
 * goes), which can be strengthened by specializations.
 */
export const unknownFunctionContract: BaseFunctionContract<UnknownFunction, InternalLocation> =
  new BaseFunctionContract<UnknownFunction, InternalLocation>(
    {
      // MUDO
      // pre: BaseFunctionContract.mustNotHappen,
      // post: [],
      // exception: []
    },
    internalLocation
  )

//
// function isOrHasAsPrototype(obj, proto) {
//   return obj === proto || (obj !== Object.prototype && isOrHasAsPrototype(Object.getPrototypeOf(obj), proto))
// }
//
// BaseFunctionContract.prototype = {
//   constructor: BaseFunctionContract,
//   _pre: null,
//   _post: null,
//   _exception: null,
//   isImplementedBy: function (f) {
//     return BaseFunctionContract.isAGeneralContractFunction(f) && isOrHasAsPrototype(f.contract, this)
//   }
// }
// property.frozenReadOnlyArray(BaseFunctionContract.prototype, 'pre', '_pre')
// property.frozenReadOnlyArray(BaseFunctionContract.prototype, 'post', '_post')
// property.frozenReadOnlyArray(BaseFunctionContract.prototype, 'exception', '_exception')
// property.setAndFreeze(BaseFunctionContract.prototype, 'abstract', null)

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
// BaseFunctionContract.outcome = outcome
// // noinspection JSAnnotator
// BaseFunctionContract.callee = callee
