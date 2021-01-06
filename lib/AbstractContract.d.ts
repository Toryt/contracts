/*
  Copyright 2021 - 2021 by Jan Dockx

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

import { NeverUnknownCallableFunction, NeverUnknownFunction, NeverUnknownNewableFunction } from './AnyFunction'
import { EverythingGoes, FalseCondition, MustNotHappen } from './Condition'
import { InternalLocation, Location, StackLocation } from './Location'
import { Precondition } from './Precondition'

/**
 * Abstract definition of a function contract.
 *
 * An AbstractContract consists of an array of preconditions, an array of nominal postconditions,
 * and an array of exceptional postconditions.
 *
 * The conditions are functions whose result is interpreted as a Booleany value.
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
 * With well-tested code, the default settings should be used in production. When the code is extremely stable,
 * `verify` can be set to `false` to gain additional speed. In tests, `verify` should be truthy and
 * `verifyPostconditions` should be `true`, at least for the function under test.
 *
 * The `_location` argument is for internal use, and might be removed.
 */
export class AbstractContract<F extends NeverUnknownFunction, Exceptions> {
  /**
   * Object to be used as location for contracts and implementations that are generated inside this library.
   */
  static readonly internalLocation: InternalLocation

  static readonly namePrefix: string

  // /**
  //  * This function is intended to be used as the bind function of contract functions. It makes sure
  //  * that, when applied to a contract function, the result
  //  * [is also a contract function]{@linkplain AbstractContract#isAContractFunction}.
  //  * The bind aspect of the functionality is the same as {@link Function#prototype#bind}.
  //  * The implementation of the resulting contract function is also bound in the same
  //  * way as the resulting contract function itself.
  //  *
  //  * Note: in future versions this will no longer be a "static" function of AbstractContract.
  //  */
  // static bindContractFunction<C extends BaseContract> (
  //   this: GeneralContractFunction<C>,
  //   thisArg?: ContractThis<C>,
  //   ...argArray: ContractParameters<C>
  // ): GeneralContractFunction<C> // MUDO NOT CORRECT
  //
  // /**
  //  * A General Contract Function is an implementation of an AbstractContract. This function verifies whether a function
  //  * given as a parameter is a General Contract Function.
  //  *
  //  * To be a General Contract Function, the subject must
  //  * <ul>
  //  *   <li>be a function,</li>
  //  *   <li>have a frozen `contract` property that refers to a AbstractContract,</li>
  //  *   <li>have a frozen `implementation` property that refers to a function (which realizes the contract),</li>
  //  *   <li>have a frozen `location` property, that has a value,</li>
  //  *   <li>have a frozen `bind` property, which is {@link AbstractContract.bindContractFunction}, and</li>
  //  *   <li>have a `name`, which is a string that gives information for a programmer to understand which contract
  //  *     function this is, and</li>
  //  *   <li>if the `implementation` function has a `prototype`, have a `prototype` property,
  //  *     <ul>
  //  *       <li>that is an object,</li>
  //  *       <li>that has a `constructor` property that is the contract function, and</li>
  //  *       <li>that has `f.implementation.prototype` in its prototype chain, or is equal to it.
  //  *     </ul>
  //  *   </li>
  //  *
  //  * Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot freeze
  //  * it, and not guaranteed in all engines.
  //  */
  // static isAGeneralContractFunction<F extends NeverUnknownFunction> (
  //   f: F | unknown
  // ): f is GeneralContractFunction<AbstractContract<F, unknown>>
  //
  // /**
  //  * A Contract Function is an implementation of a Contract. This function verifies whether a function
  //  * given as a parameter is a Contract Function.
  //  *
  //  * To be a Contract Function, the subject must
  //  * <ul>
  //  *   <li>be a [general contract function]{@linkplain #isAGeneralContractFunctionProps()},</li>
  //  *   <li>have a frozen `location` property, which is a string that represents a location in source code,
  //  *     outside this library.</li>
  //  * </ul>
  //  */
  // static isAContractFunction<C extends BaseContract> (
  //   this: ContractConstructor<C>,
  //   f: ContractSignature<C> | unknown
  // ): f is ContractFunction<C>
  //
  // /**
  //  * Helper function that transforms any function given as <code>contractFunction</code>
  //  * into a [contract function]{@linkplain AbstractContract#isAContractFunction}
  //  * for the given parameters.
  //  *
  //  * If {@code implFunction.prototype} exists, the {@code contractFunction.prototype} is changed to
  //  * an object that refers to {@code contractFunction} as {@code contractFunction.prototype.constructor},
  //  * is otherwise empty, and has {@code implFunction.prototype} as prototype.
  //  *
  //  * @param contractFunction - the regular {Function} to be transformed into a contract function
  //  * @param contract - the contract <code>contractFunction</code> is a realisation of
  //  * @param implFunction - the function that is used in <code>contractFunction</code> to realize the postconditions of
  //  *                       <code>contract</code> under its preconditions
  //  * @param location - the location outside this library that the resulting [contract function]{@linkplain
  //  *                   AbstractContract#isAContractFunction} will carry, that says where it is defined.
  //  * @returns `contractFunction`
  //  */
  // static bless<C extends BaseContract> (
  //   contractFunction: ContractSignature<C>,
  //   contract: C,
  //   implFunction: ContractSignature<C>,
  //   location: StackLocation | typeof AbstractContract.internalLocation
  // ): ContractFunction<C>

  /**
   * Function that always returns <code>false</code>.
   */
  static readonly falseCondition: FalseCondition

  /**
   * Singleton array of {@linkplain AbstractContract#falseCondition}. Can be used the clearly signal
   * that a function should never throw exceptions, or never end nominally, or should never be called,
   * because the conditions will always fail.
   */
  static readonly mustNotHappen: MustNotHappen

  // /**
  //  * Returns the second-to-last element of an Array-like argument. In post- and exception conditions,
  //  * this is the function call result, respectively, the thrown exception.
  //  *
  //  * TODO should be split in result and exceptions for TS
  //  */
  // static outcome<C extends BaseContract> (
  //   ...args: [...ContractParameters<C>, ContractResult<C> | ContractExceptions<C>, unknown]
  // ): ContractResult<C> | ContractExceptions<C>
  //
  // /**
  //  * Returns the last element of an Array-like argument. In post- and exception conditions,
  //  * this is the called contract function, bound to this. This can be used in recursive definitions.
  //  */
  // static callee<C extends BaseContract> (
  //   ...args: [...ContractParameters<C>, unknown, ContractFunction<C>]
  // ): ContractFunction<C>
  //
  // // tslint:disable-next-line:no-any
  // static root: AbstractContract<any, any> & {
  //   location: typeof AbstractContract.internalLocation
  //   pre: typeof AbstractContract.mustNotHappen
  //   post: []
  //   exception: []
  // }

  readonly location: StackLocation | InternalLocation
  // MUDO readonly abstract: ContractFunction<this>;

  verify: boolean;
  verifyPostconditions: boolean;

  // /* See https://github.com/microsoft/TypeScript/issues/3841#issuecomment-502845949 */
  // ['constructor']: ContractConstructor<this>;
  // noinspection ParameterNamingConventionJS
  constructor (
    kwargs: object, // MUDO AbstractContractKwargs<F, Exceptions>,
    _location?: Location
  )

  // isImplementedBy (f: unknown): f is ContractFunction<this>

  readonly pre: Array<Precondition<F>> // not ReadonlyArray: we have sliced

  //
  // get post (): Array<
  //   F extends NeverUnknownNewableFunction
  //     ? NewablePostcondition<F>
  //     : F extends NeverUnknownCallableFunction
  //       ? CallablePostcondition<F>
  //       : never
  //   > // not ReadonlyArray: we have sliced
  //
  // get exception ():
  //   Exceptions extends never
  //     ? MustNotHappen
  //     : Array<
  //       F extends NeverUnknownNewableFunction
  //         ? NewableExceptionCondition<F, Exceptions>
  //         : F extends NeverUnknownCallableFunction
  //           ? CallableExceptionCondition<F, Exceptions>
  //           : never
  //     > // not ReadonlyArray: we have sliced
}

/**
 * A variable `let rcf: ContractFunction<RootContract>` must be assignable by every contract function.
 *
 * ### Assignability of contract functions
 *
 * A variable `let cf: ContractFunction<C>`, with `C = AbstractContract<F, Exceptions>`, must be assignable by every
 * contract function that can safely be called with the knowledge we get from `C`. With that knowledge, we know that
 *
 * - we need to call `cf` with arguments assignable to the arguments of `F`, adhering to the preconditions of `C`
 * - the nominal result will be assignable to the return type of `F`, and adhere to the postconditions of `C`
 * - we need to deal with exceptions being thrown that are assignable to `Exceptions`, and adhere to the exception
 *   conditions of `C`
 *
 * So a function `F'` that
 *
 * - works when called with arguments assignable to the arguments of `F`, adhering to the preconditions of `C`,
 * - returns a nominal result that is assignable to the return type of `F`, and adheres to the postconditions of `C`,
 * - or throws exceptions that are assignable to `Exceptions`, and adhere to the exception conditions of `C`
 *
 * can be assigned to `cf`.
 *
 * `F'` can require less arguments, but not more (it can have more optional arguments), or require the arguments to be
 * of a super type of the respective argument required by `F`. In the limit, `F'` requires no arguments. The
 * preconditions that apply to the arguments of `F'` can return falsy in less cases than those of
 * `C`, but not in more cases. A form of this is to have less preconditions. In the limit, `F'` can has no
 * preconditions, or all its preconditions always return truthy.
 *
 * The limit for `F` is then to require infinite arguments, of a type all other argument types are super types of, i.e.,
 * `never`. This is expressed by the arguments tuple of type `never[]`. In the limit, in every situation, there is at
 * least 1 preconditions of `F` that returns falsy. This is something we cannot express in the type system. One special
 * case of this is where there is at least 1 precondition that always returns falsy.
 *
 * `F'` can return a subtype of the return type of `F`, excluding `undefined`, `null`, or `void`, if the
 * return type of `F` did not allow that. Notably, in the limit, it could return `never` (and never end nominally, i.e.,
 * never end, or always end exceptionally). The postconditions that apply to the result of `F'` can return falsy in
 * more cases than those of `C`, but not in less cases. A form of this is to have more postconditions. In the limit,
 * `F'` has at least 1 postcondition that always returns falsy.
 *
 * The limit for `F` is then to have a return type that is a super type of all other types, i.e., `unknown`. In the
 * limit `F` has no postconditions, or all its postconditions always return truthy.
 *
 * `F'` can throw subtypes of `Exceptions`, excluding `undefined`, or `null`, if the return type of `F` did not allow
 * that. Notably, in the limit, it could throw `never` (and never end exceptionally, i.e., never end, or always end
 * nominally). The exception conditions that apply to the exceptions that can be thrown by `F'` can return falsy in
 * more cases than those of `C`, but not in less cases. A form of this is to have more exception conditions. In the
 * limit, `F'` has at least 1 exception condition that always returns falsy.
 *
 * The limit for `F` is then to have an exception type that is a super type of all other types, i.e., `unknown`. In the
 * limit `F` has no exception conditions, or all its exception conditions always return truthy.
 *
 * ### implementation
 *
 * A function `I` offered as implementation to a contract `C = AbstractContract<F, Exceptions>` will be called with
 * arguments that are defined in `F`, and is expected to return a value of the result type of `F` when it ends
 * nominally.
 *
 * `I` can require less arguments, but not more (it can have more optional arguments), or require the arguments to be of
 * a super type of the respective argument required by `F`. In the limit, `I` requires no arguments.
 *
 * `I` can return a subtype of the return type of `F`, excluding `undefined`, `null`, or `void`, if the return type of
 * `F` did not allow that. Notably, in the limit, it could return `never` (and never end nominally, i.e., never end, or
 * always end exceptionally).
 *
 * In other words, `I` must be assignable to `F` to be acceptable as implementation function of `C`. In the limit, a
 * function of type `() => never & (new () => never)` can be used as implementation of any contract. On the other side,
 * `AbstractContact<NeverUnknownFunction, ->` accepts any function as implementation.
 *
 * Note that, when `I` is assignable to `F`, and `EI` is assignable to `Exceptions`, `AbstractContract<I, EI>` is
 * assignable to `AbstractContract<F, Exceptions>`, and in the limit, to
 * `AbstractContract<NeverUnknownFunction, unknown>`
 */
export type BaseContract = AbstractContract<NeverUnknownFunction, unknown> & {
  // cannot limit pre more, to allow for extensibility
  // post: EverythingGoes,
  // exception: EverythingGoes
}

export type RootContract = BaseContract & {
  pre: MustNotHappen
}

/**
 * Contract functions uphold every contract. Its contract functions can be called with any or no arguments, and never
 * end nominally, nor exceptionally, so they adhere to any postconditions, and any exception conditions.
 */
export type NeverContract = AbstractContract<() => never & (new () => never), never> & {
  pre: EverythingGoes,
  post: MustNotHappen,
  exception: MustNotHappen
}

export type ContractSignature<C extends BaseContract> =
  C extends AbstractContract<infer F, unknown> ? F : never
export type ContractThis<C extends BaseContract> =
  ThisParameterType<ContractSignature<C>>
export type ContractParameters<C extends BaseContract> =
  ContractSignature<C> extends NeverUnknownNewableFunction
  ? ConstructorParameters<ContractSignature<C>>
  : ContractSignature<C> extends NeverUnknownCallableFunction
    ? Parameters<ContractSignature<C>>
    : never
export type ContractResult<C extends BaseContract> =
  ContractSignature<C> extends NeverUnknownCallableFunction
  ? ReturnType<ContractSignature<C>>
  : never
export type ContractInstanceType<C extends AbstractContract<NeverUnknownNewableFunction, unknown>> =
  InstanceType<ContractSignature<C>>
export type ContractExceptions<C extends BaseContract> =
  C extends AbstractContract<NeverUnknownFunction, infer Exceptions> ? Exceptions : never
