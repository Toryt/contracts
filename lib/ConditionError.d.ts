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

import AnyFunction from "./AnyFunction";
import Condition from "./Condition";
import ContractError from "./ContractError";
import ContractFunction from "./ContractFunction";

export as namespace contracts;

export = ConditionError;

declare class ConditionError<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined, C extends Condition<F, E, FE>> extends  ContractError {
  readonly contractFunction: ContractFunction<F, E, FE>;
  readonly condition: C;
  readonly self: Readonly<ThisParameterType<F>>;
  readonly args: Readonly<Parameters<F>>;

  constructor(contractFunction: ContractFunction<F, E, FE>, condition: C, self: ThisParameterType<F>, args: Parameters<F>, rawStack: string);

  getDetails(): string;
}

