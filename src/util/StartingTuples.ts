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
 * Utility type to generate  the disjunction of all sub-tuples of a given tuple `T` that start `T`.
 *
 * This includes handling optional elements, ensuring that their inclusion and omission
 * are explicitly considered.
 *
 * ### How It Works
 * * **Base Case**: If `T` is an empty tuple (`[]`), the result is `[]`.
 * * **Recursive Case**:
 *   * Matches tuples with a definite last element (`[...start, last]`).
 *   * Matches tuples with an optional last element (`[...start, last?]`).
 *   * Includes the full tuple `T` and continues processing the starting sub-tuples (`start`).
 * * **Fallback**: If `T` doesn’t match any of the patterns, resolves to `never`.
 *
 * @example
 * ```typescript
 * type Example = [number, string, boolean]
 * type Subsets = StartingTuples<Example>
 * // Result: [number, string, boolean] | [number, string] | [number] | []
 * ```
 *
 * @example
 * ```typescript
 * // All starting tuples of [number, string?]
 * type Example1 = StartingTuples<[number, string?]>;
 * // Expected: [number, string?] | [number] | []
 * ```
 *
 * @example
 * ```typescript * // All starting tuples of [number, string, boolean?]
 * type Example2 = StartingTuples<[number, string, boolean?]>;
 * // Expected: [number, string, boolean?] | [number, string] | [number] | []
 * ```
 *
 * @example
 * ```typescript * // All starting tuples of an empty tuple
 * type Example4 = StartingTuples<[]>;
 * // Expected: []
 * ```
 *
 * @template T - The tuple to generate starting prefixes for.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StartingTuples<T extends unknown[]> = T extends []
  ? []
  : T extends
        | [...start: infer Start, last: unknown] //required single
        | [...start: infer Start, last?: unknown] // optional single
    ? T | StartingTuples<Start>
    : never
