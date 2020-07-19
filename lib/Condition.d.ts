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

import type Precondition from "./Precondition";
import type Postcondition from "./Postcondition";
import type ExceptionCondition from "./ExceptionCondition";
import type AnyFunction from "./AnyFunction";

export as namespace contracts;

export = Condition;

declare type Condition<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> = Precondition<F> | Postcondition<F, E, FE> | ExceptionCondition<F, E, FE, NonNullable<E | FE>>;
