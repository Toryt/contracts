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

// tslint:disable-next-line:no-any
export type AnyFunction = (this: any, ...args: any[]) => any

export type StackLocation = string

export interface GeneralContractFunctionProps<C extends AbstractContract<AnyFunction, unknown>> extends Function {
  readonly contract: C;
  readonly implementation: ContractSignature<C>;
  readonly location: StackLocation;

  bind (thisArg: ThisParameterType<ContractThis<C>>, ...argArray: ContractParameters<C>): GeneralContractFunction<C>
}

export type GeneralContractFunction<C extends AbstractContract<AnyFunction, unknown>> =
  ContractSignature<C> & GeneralContractFunctionProps<C>;

export type booleany = undefined | null | unknown

/**
 * Boolean function: are `this` and the `args` valid?
 *
 * Returns a `boolean` in principle, but `any` in practice, which is interpreted as _truthy_.
 */
export type Precondition<C extends AbstractContract<AnyFunction, unknown>> =
  (this: ContractThis<C>, ...args: ContractParameters<C>) => booleany

/**
 * Boolean function: are `this`, the `args`, and the `result` valid?
 *
 * Returns a `boolean` in principle, but `any` in practice, which is interpreted as _truthy_.
 */
export type Postcondition<C extends AbstractContract<AnyFunction, unknown>> =
  (this: ContractThis<C>, ...args: [...ContractParameters<C>, ContractResult<C>, GeneralContractFunction<C>]) => booleany

/**
 * Boolean function: are `this`, `args`, and the thrown exception valid?
 *
 * Returns a `boolean` in principle, but `any` in practice, which is interpreted as _truthy_.
 */
export type ExceptionCondition<C extends AbstractContract<AnyFunction, unknown>> =
  (this: ContractThis<C>, ...args: [...ContractParameters<C>, ContractExceptions<C>, GeneralContractFunction<C>]) => booleany

export interface AbstractContractKwargs<F extends AnyFunction, Exceptions> {
  pre?: ReadonlyArray<Precondition<AbstractContract<F, Exceptions>>> | null,
  post?: ReadonlyArray<Postcondition<AbstractContract<F, Exceptions>>> | null,
  exception?: ReadonlyArray<ExceptionCondition<AbstractContract<F, Exceptions>>> | null
}

/* See https://fettblog.eu/typescript-interface-constructor-pattern/ for constructor interface pattern.
   See https://github.com/microsoft/TypeScript/issues/3841 for open issue.  */
export interface ContractConstructor<C extends AbstractContract<AnyFunction, unknown>> {
  readonly internalLocation: object
  readonly namePrefix: string

  new (
    kwargs: AbstractContractKwargs<ContractSignature<C>, ContractExceptions<C>>,
    _location?: StackLocation | typeof AbstractContract.internalLocation
  ): C

  isAContractFunction (f: unknown): f is GeneralContractFunction<C>
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
  static readonly internalLocation: object

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
    this: GeneralContractFunction<C>,
    thisArg?: ContractThis<C>,
    ...argArray: ContractParameters<C>
  ): GeneralContractFunction<C>

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
  static isAContractFunction<C extends AbstractContract<AnyFunction, unknown>> (
    this: ContractConstructor<C>,
    f: unknown
  ): f is GeneralContractFunction<C>

  readonly location: StackLocation | typeof AbstractContract.internalLocation
  readonly abstract: GeneralContractFunction<this>;

  verify: boolean;
  verifyPostconditions: boolean;

  /* See https://github.com/microsoft/TypeScript/issues/3841#issuecomment-502845949 */
  ['constructor']: ContractConstructor<this>;
  constructor (
    kwargs: AbstractContractKwargs<F, Exceptions>,
    _location?: StackLocation | typeof AbstractContract.internalLocation
  )

  isImplementedBy (f: unknown): f is GeneralContractFunction<AbstractContract<F, Exceptions>>

  get pre (): Array<Precondition<this>> // not ReadonlyArray: we have sliced

  get post (): Array<Postcondition<this>> // not ReadonlyArray: we have sliced

  get exception (): Array<ExceptionCondition<this>> // not ReadonlyArray: we have sliced
}

export type ContractSignature<C extends AbstractContract<AnyFunction, unknown>> =
  C extends AbstractContract<infer F, unknown> ? F : never
export type ContractThis<C extends AbstractContract<AnyFunction, unknown>> = ThisParameterType<ContractSignature<C>>
export type ContractParameters<C extends AbstractContract<AnyFunction, unknown>> = Parameters<ContractSignature<C>>
export type ContractResult<C extends AbstractContract<AnyFunction, unknown>> = ReturnType<ContractSignature<C>>
export type ContractExceptions<C extends AbstractContract<AnyFunction, unknown>> =
  C extends AbstractContract<AnyFunction, infer Exceptions> ? Exceptions : never
