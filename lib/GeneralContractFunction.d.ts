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
  AbstractContract
} from '../types/index'
import { Location } from './_private/is'
import { NeverUnknownCallableFunction, NeverUnknownFunction, NeverUnknownNewableFunction } from './AnyFunction'

export type GeneralContractFunctionTwo<F extends NeverUnknownFunction, Exceptions> = F & {
  readonly contract: AbstractContract<F, Exceptions>
  readonly implementation: F
  readonly location: Location
  name: string // readonly in `lib.es2015.core.d.ts`
  bind: BindContractFunction<F, never>
  // tslint:disable-next-line:no-any
  prototype: F extends NeverUnknownNewableFunction ? InstanceType<F> : unknown

}

/* TODO: correct this workaround.

  This should be

export type CallableBind<F extends AnyCallableFunction, Exceptions> = <
  Bound extends readonly unknown[]
> (
  this: F,
  thisArg: ThisParameterType<F>,
  ...bound: Bound
) => F extends (...args: [...Bound, ... infer Unbound]) => any
  ? GeneralContractFunctionTwo<(...unbound: Unbound) => ReturnType<F>, Exceptions>
  : never

   but TS says:

   "
   Type (...unbound: Unbound) => ReturnType<F> does not satisfy the constraint AnyFunction.
   Type (...unbound: Unbound) => ReturnType<F> is not assignable to type AnyCallableFunction.
   …
   "

   (AnyCallableFunction = (this: never, ...args: readonly never[]) => unknown)

   "
   …
   Types of parameters unbound and args are incompatible.
   …
   "

   The parameter types must be contravariant, so to assign

   (...unbound: Unbound) => ReturnType<F>

   to

   (this: never, ...args: readonly never[]) => unknown

   we must be able to assign `readonly never[]` to `Unbound`, but TS continues:


   "
   …
   Type readonly never[] is not assignable to type Unbound.
   Unbound could be instantiated with an arbitrary type which could be unrelated to readonly never[].
   "

   No, it couldn't! Because it is a tuple, that is a part of Parameters<F>, which means it is a tuple
   where are the elements are at least `unknown`.

   Making clear with a conditional type that Unbound is an array does not help. Making it Readonly
   does not help. Removing readonly from `AnyCallableFunction` makes tsd go haywire.

   (and analogue for NewableBind)

   Giving up. Using any[] for now.
 */
export type CallableBind<F extends NeverUnknownCallableFunction, Exceptions> = <
  Bound extends readonly unknown[]
> (
  this: F,
  thisArg: ThisParameterType<F>,
  ...bound: Bound
) => GeneralContractFunctionTwo<(...unbound: any[]) => ReturnType<F>, Exceptions>

export type NewableBind<F extends NeverUnknownNewableFunction, Exceptions> = <
  Bound extends readonly unknown[],
> (
  this: F,
  thisArg: unknown,
  ...bound: Bound
) => GeneralContractFunctionTwo<new (...unbound: any[]) => InstanceType<F>, Exceptions>

export type BindContractFunction<F extends NeverUnknownFunction, Exceptions> =
  F extends NeverUnknownNewableFunction
    ? NewableBind<F, Exceptions>
    : F extends NeverUnknownCallableFunction
      ? CallableBind<F, Exceptions>
      : never

// noinspection JSClassNamingConvention
interface GeneralContractFunctionPropertiesBase<F extends NeverUnknownFunction, Exceptions> {
  readonly contract: AbstractContract<F, Exceptions>
  readonly implementation: F
  readonly location: Location
  name: string // readonly in `lib.es2015.core.d.ts`
}

// noinspection JSClassNamingConvention
interface CallableGeneralContractFunctionProperties<F extends NeverUnknownCallableFunction, Exceptions>
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
    this: F,
    thisArg: ThisParameterType<F>,
    ...bound: Bound
  ): CallableGeneralContractFunction<(...unbound: any[]) => ReturnType<F>, Exceptions>

  prototype: unknown
}

export type CallableGeneralContractFunction<F extends NeverUnknownCallableFunction, Exceptions> =
/* Without Omit<F, 'bind'> we overload, instead of override. But Omit<> also looses the signature of a function.
 There is no solution for this. */
  F & CallableGeneralContractFunctionProperties<F, Exceptions>

// noinspection JSClassNamingConvention
interface NewableGeneralContractFunctionProperties<F extends NeverUnknownNewableFunction, Exceptions>
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
  ): NewableGeneralContractFunction<new (...unbound: any[]) => InstanceType<F>, Exceptions>

  prototype: InstanceType<F>
}

export type NewableGeneralContractFunction<F extends NeverUnknownNewableFunction, Exceptions> =
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
 * `any`. This is inherited from {@link NeverUnknownCallableFunction}.
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
export type GeneralContractFunction<F extends NeverUnknownFunction, Exceptions> =
  F extends NeverUnknownNewableFunction
  ? NewableGeneralContractFunction<F, Exceptions>
  : F extends NeverUnknownCallableFunction
    ? CallableGeneralContractFunction<F, Exceptions>
    : undefined
