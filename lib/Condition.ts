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

import type {Signature} from "./Signature";
import type {ArgumentsWithException, ArgumentsWithResult} from "./ExtendedArguments";

export type Precondition<S extends Signature> = (this: ThisParameterType<S>, ...args: Parameters<S>) => boolean;

export type Postcondition<S extends Signature, Exceptions> =
  (this: ThisParameterType<S>, ...args: ArgumentsWithResult<S, Exceptions>) => boolean;

export type ExceptionCondition<S extends Signature, Exceptions> =
  (this: ThisParameterType<S>, ...args: ArgumentsWithException<S, Exceptions, any>) => boolean;

export type Condition<S extends Signature, Exceptions> =
  Precondition<S> | Postcondition<S, Exceptions> | ExceptionCondition<S, Exceptions>;
