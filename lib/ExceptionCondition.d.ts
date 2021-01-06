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

import { Booleany } from './Condition'
import { GeneralContractFunction } from './GeneralContractFunction'
import { NeverUnknownCallableFunction, NeverUnknownFunction, NeverUnknownNewableFunction } from './AnyFunction'
import { AbstractContract } from './AbstractContract'

/**
 * Booleany function (predicate): are `this`, `args`, and the thrown exception valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type CallableExceptionCondition<F extends NeverUnknownCallableFunction, Exceptions> =
  (
    this: ThisParameterType<F>,
    ...args: [...Parameters<F>, Exceptions, GeneralContractFunction<AbstractContract<OmitThisParameter<F>, Exceptions>>]
  ) => Booleany

/**
 * Booleany function (predicate): are the `args`, and the thrown exception valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type NewableExceptionCondition<F extends NeverUnknownNewableFunction, Exceptions> =
  (
    this: InstanceType<F>,
    ...args: [...ConstructorParameters<F>, Exceptions, GeneralContractFunction<AbstractContract<OmitThisParameter<F>, Exceptions>>]
  ) => Booleany

/**
 * Booleany function (predicate): are `this`, `args`, and the thrown exception valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type ExceptionCondition<F extends NeverUnknownFunction, Exceptions> =
  F extends NeverUnknownNewableFunction
  ? NewableExceptionCondition<F, Exceptions>
  : F extends NeverUnknownCallableFunction
    ? CallableExceptionCondition<F, Exceptions>
    : never
