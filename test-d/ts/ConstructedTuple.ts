/*
  Copyright 2024–2025 Jan Dockx

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

import type {
  OptionalTupleElement,
  RequiredTupleElement,
  RestTupleElement,
  TupleElement
} from './DeconstructedTuple.ts'

export type ConstructedTuple<T extends TupleElement<unknown>[]> = T extends []
  ? []
  : T extends [first: RequiredTupleElement<infer Required>, ...last: infer TailAfterRequired]
    ? TailAfterRequired extends TupleElement<unknown>[]
      ? [Required, ...ConstructedTuple<TailAfterRequired>]
      : 'error: `TailAfterRequired` is not a `TupleElement<unknown>[]`'
    : T extends [first: OptionalTupleElement<infer Optional | undefined>, ...last: infer TailAfterOptional]
      ? TailAfterOptional extends TupleElement<unknown>[] // Explicitly constrain
        ? [Optional?, ...ConstructedTuple<TailAfterOptional>]
        : 'error: `TailAfterOptional` is not a `TupleElement<unknown>[]`'
      : T extends [first: RestTupleElement<infer Rest>, ...last: infer TailAfterRest]
        ? TailAfterRest extends TupleElement<unknown>[] // Explicitly constrain
          ? [...Rest[], ...ConstructedTuple<TailAfterRest>]
          : 'error: `TailAfterRest` is not a `TupleElement<unknown>[]`'
        : []
