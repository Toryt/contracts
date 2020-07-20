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


import type {GeneralContractFunction} from "./GeneralContractFunction";
import type {AnyFunction} from "./AnyFunction";

export type ExtendedArguments<F extends AnyFunction, Exceptions, T extends ReturnType<F> | Exceptions> =
  [...Parameters<F>, T, GeneralContractFunction<F, Exceptions>];

export type ArgumentsWithResult<F extends AnyFunction, Exceptions> =
  ExtendedArguments<F, Exceptions, ReturnType<F>>;

export type ArgumentsWithException<F extends AnyFunction, Exceptions, Exc extends Exceptions> =
  ExtendedArguments<F, Exceptions, Exc>;

