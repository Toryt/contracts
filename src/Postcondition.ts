/*
  Copyright 2024 Jan Dockx

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

import type { StartingTuples } from './util/StartingTuples.ts'
import type { UnknownFunction } from './types/UnknownFunction.ts'

export type Postcondition<T extends UnknownFunction> =
  StartingTuples<Parameters<T>> extends infer U // infer the union of tuples
    ? U extends unknown[] // distribute over each tuple in the union
      ? (args: U, result: ReturnType<T>) => unknown // create a function type for each tuple
      : never // fallback for invalid tuples (not needed here, the extends is only used for distribution)
    : never // fallback for invalid StartingTuples
