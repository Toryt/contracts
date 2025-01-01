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
  DeconstructedTuple,
  OptionalTupleElement,
  RequiredTupleElement,
  RestTupleElement,
  TupleElement
} from '../../test-d/ts/DeconstructedTuple.ts'

/**
 * Utility type to generate the disjunction of all sub-tuples of a given tuple `T` that start `T`.
 *
 * @template T - The tuple to generate starting prefixes for.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ContravariantArgumentTuplesHelper<
  Deconstructed extends TupleElement<unknown>[],
  Last extends unknown[]
> = Deconstructed extends [first: RequiredTupleElement<infer Required>, ...last: infer TailAfterRequired]
  ? TailAfterRequired extends TupleElement<unknown>[]
    ? [...Last, Required] | ContravariantArgumentTuplesHelper<TailAfterRequired, [...Last, Required]>
    : 'error: `TailAfterRequired` is not a `TupleElement<unknown>[]`'
  : Deconstructed extends [first: OptionalTupleElement<infer Optional | undefined>, ...last: infer TailAfterOptional]
    ? TailAfterOptional extends TupleElement<unknown>[] // Explicitly constrain
      ? [...Last, Optional?] | ContravariantArgumentTuplesHelper<TailAfterOptional, [...Last, Optional?]>
      : 'error: `TailAfterOptional` is not a `TupleElement<unknown>[]`'
    : Deconstructed extends [first: RestTupleElement<infer Rest>, ...last: infer TailAfterRest]
      ? TailAfterRest extends TupleElement<unknown>[] // Explicitly constrain
        ? [...Last, ...Rest[]] | ContravariantArgumentTuplesHelper<TailAfterRest, [...Last, ...Rest[]]>
        : 'error: `TailAfterRest` is not a `TupleElement<unknown>[]`'
      : []

/**
 * Utility type to generate the disjunction of all sub-tuples of a given tuple `T` that start `T`.
 *
 * @template T - The tuple to generate starting prefixes for.
 */
export type ContravariantArgumentTuple<T extends unknown[]> = ContravariantArgumentTuplesHelper<
  DeconstructedTuple<T>,
  []
>
