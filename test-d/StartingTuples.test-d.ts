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

import { expectType } from 'tsd'
import { type StartingTuples } from '../src/StartingTuples.ts'

// Empty tuple
expectType<[]>([] as StartingTuples<[]>)

// Single-element tuple
type Single = [number]
expectType<[number] | []>([] as StartingTuples<Single>)

// Two-element tuple
type Pair = [string, number]
expectType<[string, number] | [string] | []>([] as StartingTuples<Pair>)

// Three-element tuple
type Triple = [boolean, string, number]
expectType<[boolean, string, number] | [boolean, string] | [boolean] | []>([] as StartingTuples<Triple>)

// Complex tuples
type Complex = [{ a: number }, string, boolean, null]
expectType<
  | [{ a: number }, string, boolean, null]
  | [{ a: number }, string, boolean]
  | [{ a: number }, string]
  | [{ a: number }]
  | []
>([] as StartingTuples<Complex>)

// Edge cases
type EdgeCase1 = [never]
expectType<[never] | []>([] as StartingTuples<EdgeCase1>)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EdgeCase2 = [any, unknown]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<[any, unknown] | [any] | []>([] as StartingTuples<EdgeCase2>)

type EdgeCase3 = [undefined, null, void]
expectType<[undefined, null, void] | [undefined, null] | [undefined] | []>([] as StartingTuples<EdgeCase3>)

// Very large tuple (to validate performance and correctness)
type Large = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
expectType<
  | [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  | [1, 2, 3, 4, 5, 6, 7, 8, 9]
  | [1, 2, 3, 4, 5, 6, 7, 8]
  | [1, 2, 3, 4, 5, 6, 7]
  | [1, 2, 3, 4, 5, 6]
  | [1, 2, 3, 4, 5]
  | [1, 2, 3, 4]
  | [1, 2, 3]
  | [1, 2]
  | [1]
  | []
>([] as StartingTuples<Large>)
