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
import { NeverUnknownCallableFunction, NeverUnknownFunction, NeverUnknownNewableFunction } from '../lib/AnyFunction'
import { GeneralContractFunction } from '../lib/GeneralContractFunction'
import { Booleany } from '../lib/Condition'
import { InternalLocation, Location, StackLocation } from '../lib/Location'

export {}
//
// /**
//  * Booleany function (predicate): are `this` and the `args` valid?
//  *
//  * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
//  */
// export type CallablePrecondition<F extends NeverUnknownCallableFunction> =
//   (this: ThisParameterType<F>, ...args: Parameters<F>) => Booleany
//
// /**
//  * Booleany function (predicate): are the `args` valid?
//  *
//  * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
//  */
// export type NewablePrecondition<F extends NeverUnknownNewableFunction> =
//   (...args: ConstructorParameters<F>) => Booleany
//
// /**
//  * Booleany function (predicate): are `this` and the `args` valid?
//  *
//  * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
//  */
// export type Precondition<F extends NeverUnknownFunction> =
//   F extends NeverUnknownNewableFunction
//     ? NewablePrecondition<F>
//     : F extends NeverUnknownCallableFunction
//       ? CallablePrecondition<F>
//       : never
//
// /**
//  * Booleany function (predicate): are `this`, the `args`, and the `result` valid?
//  *
//  * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
//  */
// export type CallablePostcondition<F extends NeverUnknownCallableFunction> =
//   (
//     this: ThisParameterType<F>,
//     ...args: [...Parameters<F>, ReturnType<F>, GeneralContractFunction<AbstractContract<OmitThisParameter<F>, unknown>>]
//   ) => Booleany
//
// /**
//  * Booleany function (predicate): are the `args` and the created `result` valid?
//  *
//  * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
//  */
// export type NewablePostcondition<F extends NeverUnknownNewableFunction> =
//   (
//     this: InstanceType<F>,
//     ...args: [...ConstructorParameters<F>, undefined, GeneralContractFunction<AbstractContract<OmitThisParameter<F>, unknown>>]
//   ) => Booleany
//
// /**
//  * Booleany function (predicate): are `this`, the `args`, and the `result` valid?
//  *
//  * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
//  */
// export type Postcondition<F extends NeverUnknownFunction> =
//   F extends NeverUnknownNewableFunction
//   ? NewablePostcondition<F>
//   : F extends NeverUnknownCallableFunction
//     ? CallablePostcondition<F>
//     : never
//
// export interface CallableAbstractContractKwargs<F extends NeverUnknownCallableFunction, Exceptions> {
//   pre?: ReadonlyArray<CallablePrecondition<F>>,
//   post?: ReadonlyArray<CallablePostcondition<F>>,
//   exception?: ReadonlyArray<CallableExceptionCondition<F, Exceptions>>
// }
//
// export interface NewableAbstractContractKwargs<F extends NeverUnknownNewableFunction, Exceptions> {
//   pre?: ReadonlyArray<NewablePrecondition<F>>,
//   post?: ReadonlyArray<NewablePostcondition<F>>,
//   exception?: ReadonlyArray<NewableExceptionCondition<F, Exceptions>>
// }
//
// export type AbstractContractKwargs<F extends NeverUnknownFunction, Exceptions> =
//   F extends NeverUnknownNewableFunction
//   ? NewableAbstractContractKwargs<F, Exceptions>
//   : F extends NeverUnknownCallableFunction
//     ? CallableAbstractContractKwargs<F, Exceptions>
//     : never
//
// /* See https://fettblog.eu/typescript-interface-constructor-pattern/ for constructor interface pattern.
//    See https://github.com/microsoft/TypeScript/issues/3841 for open issue.  */
// export interface ContractConstructor<C extends BaseContract> {
//   readonly internalLocation: InternalLocation
//   readonly namePrefix: string
//
//   new (
//     kwargs: AbstractContractKwargs<ContractSignature<C>, ContractExceptions<C>>,
//     _location?: StackLocation | typeof AbstractContract.internalLocation
//   ): C
//
//   isAContractFunction (f: ContractSignature<C> | unknown): f is ContractFunction<C>
//
//   bless (
//     contractFunction: ContractSignature<C>,
//     contract: C,
//     implFunction: ContractSignature<C>,
//     location: Location
//   ): ContractFunction<C>
//
//   outcome (...args: [...ContractParameters<C>, ContractResult<C> | ContractExceptions<C>, unknown]):
//     ContractResult<C> | ContractExceptions<C>
//
//   callee (...args: [...ContractParameters<C>, unknown, ContractFunction<C>]): ContractFunction<C>
// }

export type FalseCondition = (this: unknown, ...args: unknown[]) => false
export type MustNotHappen = [FalseCondition]
