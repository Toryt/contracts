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
import { Booleany } from './Condition'

/**
 * Booleany function (predicate): are `this` and the `args` valid?
 *
 * Returns a `boolean` in principle, but `unknown` in practice, which is interpreted as _truthy_ or _falsy_.
 */
export type Precondition<F extends NeverUnknownFunction> =
  F extends NeverUnknownNewableFunction
    ?  (this: ThisParameterType<F>, ...args: ConstructorParameters<F>) => Booleany
    : F extends NeverUnknownCallableFunction
      ? (...args: Parameters<F>) => Booleany
      : never