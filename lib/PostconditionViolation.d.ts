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
import Postcondition from "./Postcondition";
import ArgumentsWithResult from "./ArgumentsWithResult";
import ContractFunction from "./ContractFunction";
import ConditionViolation from "./ConditionViolation";

export as namespace contracts;

export = PostconditionViolation;

declare class PostconditionViolation<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> extends ConditionViolation<F, E, FE, Postcondition<F, E, FE>, ArgumentsWithResult<F, E, FE>> {
  constructor(contractFunction: ContractFunction<F, E, FE>, condition: Postcondition<F, E, FE>, self: ThisParameterType<F>, args: ArgumentsWithResult<F, E, FE>);

  readonly result: Readonly<ReturnType<F>>;
}

