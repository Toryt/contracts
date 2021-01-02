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

import {
  AbstractContract,
  InternalLocation
} from '../types'
import { StackLocation } from './_private/is'
import { AnyCallableFunction, AnyFunction, AnyNewableFunction } from './AnyFunction'

// noinspection JSClassNamingConvention
interface GeneralContractFunctionPropertiesBase<F extends AnyFunction, Exceptions> {
  readonly contract: AbstractContract<F, Exceptions>
  readonly implementation: F
  readonly location: StackLocation | InternalLocation
  name: string // readonly in `lib.es2015.core.d.ts`
}

// noinspection JSClassNamingConvention
interface CallableGeneralContractFunctionProperties<F extends AnyCallableFunction, Exceptions>
  extends GeneralContractFunctionPropertiesBase<F, Exceptions> {
  /**
   * A 'correct' version of {@link #bind}, which should override the definition of {@link #bind}
   * for contract functions. This seems impossible however.
   *
   * - Just naming this `bind` adds an overload to the versions defined in {@link CallableFunction#bind}. Common usage
   *   selects one of the original overloads, and not this one.
   * - Defining this signature separately, and adding a regular property with that type to this interface has the same
   *   effect.
   * - Adding the original call signatures, with a changed return type (a {@link CallableGeneralContractFunction}) does
   *   not work either.
   * - Using {@link Omit} to remove the {@link CallableFunction#bind} overloads, only copies the properties of `F` as
   *   object. We loose the signature of `F` that way.
   *
   * Based on https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html
   */
  contractBind <Bound extends unknown[], Unbound extends unknown[]> (
    this: (this: ThisParameterType<F>, ...args: [...Bound, ...Unbound]) => ReturnType<F>,
    thisArg: ThisParameterType<F>,
    ...bound: Bound
  ): CallableGeneralContractFunction<(...unbound: Unbound) => ReturnType<F>, Exceptions>

  // tslint:disable-next-line:no-any
  prototype: any
}

export type CallableGeneralContractFunction<F extends AnyCallableFunction, Exceptions> =
/* Without Omit<F, 'bind'> we overload, instead of override. But Omit<> also looses the signature of a function.
 There is no solution for this. */
  F & CallableGeneralContractFunctionProperties<F, Exceptions>

// noinspection JSClassNamingConvention
interface NewableGeneralContractFunctionProperties<F extends AnyNewableFunction, Exceptions>
  extends GeneralContractFunctionPropertiesBase<F, Exceptions> {
  /**
   * A 'correct' version of {@link #bind}, which should override the definition of {@link #bind}
   * for contract functions. This seems impossible however.
   *
   * - Just naming this `bind` adds an overload to the versions defined in {@link CallableFunction#bind}. Common usage
   *   selects one of the original overloads, and not this one.
   * - Defining this signature separately, and adding a regular property with that type to this interface has the same
   *   effect.
   * - Adding the original call signatures, with a changed return type (a {@link CallableGeneralContractFunction}) does
   *   not work either.
   * - Using {@link Omit} to remove the {@link CallableFunction#bind} overloads, only copies the properties of `F` as
   *   object. We loose the signature of `F` that way.
   *
   * Based on https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html
   */
  contractBind <Bound extends unknown[], Unbound extends unknown[]> (
    this: new (...args: [...Bound, ...Unbound]) => InstanceType<F>,
    // tslint:disable-next-line:no-any
    thisArg: any,
    ...bound: Bound
  ): NewableGeneralContractFunction<new (...unbound: Unbound) => InstanceType<F>, Exceptions>

  prototype: InstanceType<F>
}

export type NewableGeneralContractFunction<F extends AnyNewableFunction, Exceptions> =
/* Without Omit<F, 'bind'> we overload, instead of override. But Omit<> also looses the signature of a function.
 There is no solution for this. */
  F & NewableGeneralContractFunctionProperties<F, Exceptions>

/**
 * A contract function has the same signature as its implementation `F`, but adds a `contract`, `implementation`, and
 * `location` property.
 *
 * The typing of `toString`, `length` (and not-standard `arguments` and `caller`) are inherited from `F`.
 *
 * The `name` of a contract function is a `string`, and is a modified version of the `name` of the
 * `implementation` function.
 *
 * The prototype of a ContractFunction is an instance of the prototype if the implementation, if any, with the
 * constructor changed to the contract function. This means a contract function that is a JavaScript constructor defines
 * a subclass of the "class" defined by the constructor implementation function. In TypeScript, types are structural
 * (duck typing), and the structure of the instances created by the constructor contract function and the constructor
 * implementation function is the same, so both create instances of the same TS type.
 *
 * In TypeScript, the prototype of a `CallableFunction` is `any`. If the function is an internal function, or an arrow
 * function, `prototype` is `undefined`. The prototype of a contract function for such a signature also is of type
 * `any`. This is inherited from {@link AnyCallableFunction}.
 *
 * This means the type of the prototype of the contract function is the same as the type of the prototype of the
 * implementation, and of the prototype of the contract signature.
 *
 * In TypeScript, the prototype of a `NewableFunction` is the type of the instances being constructed by the constructor
 * function. `NewableFunction`s in TypeScript are the result of using the `class` syntax, or an explicit type annotation
 * as a newable function `new (…) => …`. The type of `prototype.constructor` of a `NewableFunction` is always
 * the general {@link Function} in TypeScript however (this is not really type safe).
 *
 * This means the type of the prototype of the contract function is the same as the type of the prototype of the
 * implementation, and of the prototype of the contract signature.
 *
 * `call` and `apply` inherit their (generic) signatures from `F`, i.e., {@link CallableFunction} or
 * {@link NewableFunction} respectively. Since TypeScript itself cannot do better, we don't need to either.
 *
 * TypeScript offers a generic definition of `bind` that is type safe for a call with the `thisArg` and up to 4
 * additional typed parameters ( `A0` … `A1`). For a contract function, we do the same, but we add the extra properties.
 */
export type GeneralContractFunction<F extends AnyFunction, Exceptions> =
  F extends AnyNewableFunction
  ? NewableGeneralContractFunction<F, Exceptions>
  : F extends AnyCallableFunction
    ? CallableGeneralContractFunction<F, Exceptions>
    : undefined
