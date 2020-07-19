/*
 Copyright 2016 - 2020 by Jan Dockx

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

import type {AnyFunction} from "./AnyFunction";
import type {ArgumentsWithException, ArgumentsWithResult} from "./ExtendedArguments";

export type Precondition<F extends AnyFunction> = (this: ThisParameterType<F>, ...args: Parameters<F>) => boolean;

export type Postcondition<F extends AnyFunction, Exceptions> =
  (this: ThisParameterType<F>, ...args: ArgumentsWithResult<F, Exceptions>) => boolean;

export type ExceptionCondition<F extends AnyFunction, Exceptions> =
  (this: ThisParameterType<F>, ...args: ArgumentsWithException<F, Exceptions, any>) => boolean;

export type Condition<F extends AnyFunction, Exceptions> =
  Precondition<F> | Postcondition<F, Exceptions> | ExceptionCondition<F, Exceptions>;
