/*
  Copyright 2020 - 2020 by Jan Dockx

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

// do not automatically export
import { AnyCallableFunction, AnyFunction, AnyNewableFunction } from '../lib/AnyFunction'
import { GeneralContractFunction } from '../lib/GeneralContractFunction'
import { StackLocation } from '../lib/_private/is'

export {}

export type ContractFunction<C extends AbstractContract<AnyFunction, unknown>> =
  GeneralContractFunction<ContractSignature<C>, ContractExceptions<C>> & {
    readonly contract: C
  }

export type booleany = undefined | null | unknown

/**
 * Booleany function (predicate): are `this` and the `args` valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type CallablePrecondition<F extends AnyCallableFunction> =
  (this: ThisParameterType<F>, ...args: Parameters<F>) => booleany

/**
 * Booleany function (predicate): are the `args` valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type NewablePrecondition<F extends AnyNewableFunction> =
  (...args: ConstructorParameters<F>) => booleany

/**
 * Booleany function (predicate): are `this` and the `args` valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type Precondition<F extends AnyFunction> =
  F extends AnyNewableFunction
    ? NewablePrecondition<F>
    : F extends AnyCallableFunction
      ? CallablePrecondition<F>
      : never

/**
 * Booleany function (predicate): are `this`, the `args`, and the `result` valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type CallablePostcondition<F extends AnyCallableFunction> =
  (
    this: ThisParameterType<F>,
    ...args: [...Parameters<F>, ReturnType<F>, GeneralContractFunction<OmitThisParameter<F>, unknown>]
  ) => booleany

/**
 * Booleany function (predicate): are the `args` and the created `result` valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type NewablePostcondition<F extends AnyNewableFunction> =
  (
    this: InstanceType<F>,
    ...args: [...ConstructorParameters<F>, undefined, GeneralContractFunction<OmitThisParameter<F>, unknown>]
  ) => booleany

/**
 * Booleany function (predicate): are `this`, the `args`, and the `result` valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type Postcondition<F extends AnyFunction> =
  F extends AnyNewableFunction
  ? NewablePostcondition<F>
  : F extends AnyCallableFunction
    ? CallablePostcondition<F>
    : never

/**
 * Booleany function (predicate): are `this`, `args`, and the thrown exception valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type CallableExceptionCondition<F extends AnyCallableFunction, Exceptions> =
  (
    this: ThisParameterType<F>,
    ...args: [...Parameters<F>, Exceptions, GeneralContractFunction<OmitThisParameter<F>, Exceptions>]
  ) => booleany

/**
 * Booleany function (predicate): are the `args`, and the thrown exception valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type NewableExceptionCondition<F extends AnyNewableFunction, Exceptions> =
  (
    this: InstanceType<F>,
    ...args: [...ConstructorParameters<F>, Exceptions, GeneralContractFunction<OmitThisParameter<F>, Exceptions>]
  ) => booleany

/**
 * Booleany function (predicate): are `this`, `args`, and the thrown exception valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type ExceptionCondition<F extends AnyFunction, Exceptions> =
  F extends AnyNewableFunction
  ? NewableExceptionCondition<F, Exceptions>
  : F extends AnyCallableFunction
    ? CallableExceptionCondition<F, Exceptions>
    : never

export interface CallableAbstractContractKwargs<F extends AnyCallableFunction, Exceptions> {
  pre?: ReadonlyArray<CallablePrecondition<F>>,
  post?: ReadonlyArray<CallablePostcondition<F>>,
  exception?: ReadonlyArray<CallableExceptionCondition<F, Exceptions>>
}

export interface NewableAbstractContractKwargs<F extends AnyNewableFunction, Exceptions> {
  pre?: ReadonlyArray<NewablePrecondition<F>>,
  post?: ReadonlyArray<NewablePostcondition<F>>,
  exception?: ReadonlyArray<NewableExceptionCondition<F, Exceptions>>
}

export type AbstractContractKwargs<F extends AnyFunction, Exceptions> =
  F extends AnyNewableFunction
  ? NewableAbstractContractKwargs<F, Exceptions>
  : F extends AnyCallableFunction
    ? CallableAbstractContractKwargs<F, Exceptions>
    : never

export interface InternalLocation {
  toString (): 'INTERNAL'
}

/* See https://fettblog.eu/typescript-interface-constructor-pattern/ for constructor interface pattern.
   See https://github.com/microsoft/TypeScript/issues/3841 for open issue.  */
export interface ContractConstructor<C extends AbstractContract<AnyFunction, unknown>> {
  readonly internalLocation: InternalLocation
  readonly namePrefix: string

  new (
    kwargs: AbstractContractKwargs<ContractSignature<C>, ContractExceptions<C>>,
    _location?: StackLocation | typeof AbstractContract.internalLocation
  ): C

  isAContractFunction (f: ContractSignature<C> | unknown): f is ContractFunction<C>

  bless (
    contractFunction: ContractSignature<C>,
    contract: C,
    implFunction: ContractSignature<C>,
    location: StackLocation | InternalLocation
  ): ContractFunction<C>

  outcome (...args: [...ContractParameters<C>, ContractResult<C> | ContractExceptions<C>, unknown]):
    ContractResult<C> | ContractExceptions<C>

  callee (...args: [...ContractParameters<C>, unknown, ContractFunction<C>]): ContractFunction<C>
}

export type FalseCondition = (this: unknown, ...args: unknown[]) => false
export type MustNotHappen = [FalseCondition]

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
 * With well-tested code, the default settings should be used in production. When the code is extremely stable,
 * `verify` can be set to `false` to gain additional speed. In tests, `verify` should be truthy and
 * `verifyPostconditions` should be `true`, at least for the function under test.
 *
 * The `_location` argument is for internal use, and might be removed.
 */
export class AbstractContract<F extends AnyFunction, Exceptions> {
  /**
   * Object to be used as location for contracts and implementations that are generated inside this library.
   */
  static readonly internalLocation: InternalLocation

  static readonly namePrefix: string

  /**
   * This function is intended to be used as the bind function of contract functions. It makes sure
   * that, when applied to a contract function, the result
   * [is also a contract function]{@linkplain AbstractContract#isAContractFunction}.
   * The bind aspect of the functionality is the same as {@link Function#prototype#bind}.
   * The implementation of the resulting contract function is also bound in the same
   * way as the resulting contract function itself.
   *
   * Note: in future versions this will no longer be a "static" function of AbstractContract.
   */
  static bindContractFunction<C extends AbstractContract<AnyFunction, unknown>> (
    this: ContractFunction<C>,
    thisArg?: ContractThis<C>,
    ...argArray: ContractParameters<C>
  ): ContractFunction<C>

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
   *
   * Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot freeze
   * it, and not guaranteed in all engines.
   */
  static isAGeneralContractFunction<F extends AnyFunction> (
    f: F | unknown
  ): f is GeneralContractFunction<F, unknown>

  /**
   * A Contract Function is an implementation of a Contract. This function verifies whether a function
   * given as a parameter is a Contract Function.
   *
   * To be a Contract Function, the subject must
   * <ul>
   *   <li>be a [general contract function]{@linkplain #isAGeneralContractFunctionProps()},</li>
   *   <li>have a frozen `location` property, which is a string that represents a location in source code,
   *     outside this library.</li>
   * </ul>
   */
  static isAContractFunction<C extends AbstractContract<AnyFunction, unknown>> (
    this: ContractConstructor<C>,
    f: ContractSignature<C> | unknown
  ): f is ContractFunction<C>

  /**
   * Helper function that transforms any function given as <code>contractFunction</code>
   * into a [contract function]{@linkplain AbstractContract#isAContractFunction}
   * for the given parameters.
   *
   * If {@code implFunction.prototype} exists, the {@code contractFunction.prototype} is changed to
   * an object that refers to {@code contractFunction} as {@code contractFunction.prototype.constructor},
   * is otherwise empty, and has {@code implFunction.prototype} as prototype.
   *
   * @param contractFunction - the regular {Function} to be transformed into a contract function
   * @param contract - the contract <code>contractFunction</code> is a realisation of
   * @param implFunction - the function that is used in <code>contractFunction</code> to realize the postconditions of
   *                       <code>contract</code> under its preconditions
   * @param location - the location outside this library that the resulting [contract function]{@linkplain
   *                   AbstractContract#isAContractFunction} will carry, that says where it is defined.
   * @returns `contractFunction`
   */
  static bless<C extends AbstractContract<AnyFunction, unknown>> (
    contractFunction: ContractSignature<C>,
    contract: C,
    implFunction: ContractSignature<C>,
    location: StackLocation | typeof AbstractContract.internalLocation
  ): ContractFunction<C>

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

  /**
   * Returns the second-to-last element of an Array-like argument. In post- and exception conditions,
   * this is the function call result, respectively, the thrown exception.
   *
   * TODO should be split in result and exceptions for TS
   */
  static outcome<C extends AbstractContract<AnyFunction, unknown>> (
    ...args: [...ContractParameters<C>, ContractResult<C> | ContractExceptions<C>, unknown]
  ): ContractResult<C> | ContractExceptions<C>

  /**
   * Returns the last element of an Array-like argument. In post- and exception conditions,
   * this is the called contract function, bound to this. This can be used in recursive definitions.
   */
  static callee<C extends AbstractContract<AnyFunction, unknown>> (
    ...args: [...ContractParameters<C>, unknown, ContractFunction<C>]
  ): ContractFunction<C>

  // tslint:disable-next-line:no-any
  static root: AbstractContract<any, any> & {
    location: typeof AbstractContract.internalLocation
    pre: typeof AbstractContract.mustNotHappen
    post: []
    exception: []
  }

  readonly location: StackLocation | InternalLocation
  // MUDO readonly abstract: ContractFunction<this>;

  verify: boolean;
  verifyPostconditions: boolean;

  /* See https://github.com/microsoft/TypeScript/issues/3841#issuecomment-502845949 */
  ['constructor']: ContractConstructor<this>;
  constructor (
    kwargs: AbstractContractKwargs<F, Exceptions>,
    _location?: StackLocation | typeof AbstractContract.internalLocation
  )

  // MUDO should be ContractFunction<this>
  isImplementedBy (f: unknown): f is GeneralContractFunction<F, Exceptions>

  get pre (): Array<
    F extends AnyNewableFunction
      ? NewablePrecondition<F>
      : F extends AnyCallableFunction
        ? CallablePrecondition<F>
        : never
  > // not ReadonlyArray: we have sliced

  get post (): Array<
    F extends AnyNewableFunction
      ? NewablePostcondition<F>
      : F extends AnyCallableFunction
        ? CallablePostcondition<F>
        : never
    > // not ReadonlyArray: we have sliced

  get exception ():
    Exceptions extends never
      ? MustNotHappen
      : Array<
        F extends AnyNewableFunction
          ? NewableExceptionCondition<F, Exceptions>
          : F extends AnyCallableFunction
            ? CallableExceptionCondition<F, Exceptions>
            : never
      > // not ReadonlyArray: we have sliced
}

export type ContractSignature<C extends AbstractContract<AnyFunction, unknown>> =
  C extends AbstractContract<infer F, unknown> ? F : never
export type ContractThis<C extends AbstractContract<AnyFunction, unknown>> =
  ThisParameterType<ContractSignature<C>>
export type ContractParameters<C extends AbstractContract<AnyFunction, unknown>> =
  ContractSignature<C> extends AnyNewableFunction
    ? ConstructorParameters<ContractSignature<C>>
    : ContractSignature<C> extends AnyCallableFunction
      ? Parameters<ContractSignature<C>>
      : never
export type ContractResult<C extends AbstractContract<AnyFunction, unknown>> =
  ContractSignature<C> extends AnyCallableFunction
    ? ReturnType<ContractSignature<C>>
    : never
export type ContractInstanceType<C extends AbstractContract<AnyNewableFunction, unknown>> =
  InstanceType<ContractSignature<C>>
export type ContractExceptions<C extends AbstractContract<AnyFunction, unknown>> =
  C extends AbstractContract<AnyFunction, infer Exceptions> ? Exceptions : never
