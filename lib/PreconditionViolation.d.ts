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
import Precondition from "./Precondition";
import ContractFunction from "./ContractFunction";
import ConditionViolation from "./ConditionViolation";

export as namespace contracts;

export = PreconditionViolation;

declare class PreconditionViolation<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> extends ConditionViolation<F, E, FE, Precondition<F>, Parameters<F>> {
  constructor(contractFunction: ContractFunction<F, E, FE>, condition: Precondition<F>, self: ThisParameterType<F>, args: Parameters<F>);
}

