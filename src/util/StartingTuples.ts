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

/**
 * Utility type to generate all the disjunction of all sub-tuples of a given tuple `T`
 * that start `T`.
 *
 * For example:
 *
 * ```typescript
 * type Example = [number, string, boolean]
 * type Subsets = StartingTuples<Example>
 * // Result: [number, string, boolean] | [number, string] | [number] | []
 * ```
 *
 * @template T - A tuple type to compute starting sub-tuples from.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StartingTuples<T extends unknown[]> = T extends [...infer Rest, infer _Last] ? T | StartingTuples<Rest> : []
