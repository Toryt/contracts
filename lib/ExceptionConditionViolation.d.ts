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

import type ArgumentsWithException from "./ArgumentsWithException";
import type AnyFunction from "./AnyFunction";
import type ContractFunction from "./ContractFunction";
import type ExceptionCondition from "./ExceptionCondition";
import ConditionViolation from "./ConditionViolation";

export as namespace contracts;

export = ExceptionConditionViolation;

declare class ExceptionConditionViolation<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined, EXC extends NonNullable<E | FE>> extends ConditionViolation<F, E, FE, ExceptionCondition<F, E, FE, EXC>, ArgumentsWithException<F, E, FE, EXC>> {
  constructor(contractFunction: ContractFunction<F, E, FE>, condition: ExceptionCondition<F, E, FE, EXC>, self: ThisParameterType<F>, args: ArgumentsWithException<F, E, FE, EXC>);

  readonly exception: Readonly<EXC>;
}
